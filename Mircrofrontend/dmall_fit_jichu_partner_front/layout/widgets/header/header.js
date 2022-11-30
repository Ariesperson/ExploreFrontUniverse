import "@/layout/widgets/header/header.tpl";
import "@/layout/widgets/header/header.css";
import { zIndexCreator } from "saber_ui/utils";
import Ajax from "@/common/http.js";
import apimix, { EVT, ENV } from "@/common/api/apimix";
import noticeCenter from "./components/noticeCenter/noticeCenter";
import MessMonitor from "./MessMonitor";
import { getUserLocal, setUserLocal, formatDate } from "@/common/utils";
import $modal from "@/common/componenets/modal/index";
import useJumpPublish from '@/common/hooks/useJumpPublish';

const COOKIE = require("cabincore/common/cookie/cookie");

let headerDom;

// eslint-disable-next-line import/no-mutable-exports
let handle;
let _fn;
let CFG;
let kDom;
let vueOption;
let isPaint = null;

// eslint-disable-next-line prefer-const
CFG = {
    CONTAINER_CLS: "J_Partner_Header",
};

// eslint-disable-next-line prefer-const
handle = {
    classname: "partner-header",
    jView: null,
    init() {
        _fn.init(); // 初始化
        _fn.render(); // 渲染
    },
};

_fn = {
    init() {
        kDom = kayak.dom;
        handle.jView = kDom.get(handle.classname, $(`.${CFG.CONTAINER_CLS}`));
    },
    // 渲染模块
    render() {
        const { jView } = handle;
        if (isPaint) {
            $(".J_Partner_Header").html("");
        }
        jView.kInsert();
        _fn.paint();
    },
    paint() {
        isPaint = true;

        // eslint-disable-next-line no-new
        new Vue(vueOption);
    },
};
vueOption = {
    el: "#partner-header",
    data: {
        userInfo: {}, // 登录用户数据
        activedIcon: "", // 顶栏目前选中的模块
        searchMenuValue: "", // 搜索关键词
        searchList: [], // 搜索框查询数据
        msgList: [], // 消息和待办的数据
        helpCenterAuth: [], // 帮助中心权限
        showInfoReminder: false, // 是否展示新消息提醒框
        noticeMsg: "", // 用于新消息弹窗的提示信息
        isShowSearchHistory: false, // 是否展示搜索历史
        searchHistory: [], // 搜索历史数据
        totalNotice: 0, // 消息总数量
        infoList: [], // 消息tab数据源
        authList: [], // 审批tab数据源
        msIns: null, // 消息池对象实例
        newMsg: null, // ws推送的新消息对象
    },
    components: {
        "notice-center": noticeCenter,
    },
    mounted() {
        this.getUserInfo();
        this.bind();
        this.verifyInitStatus();
        headerDom = document.querySelector("#J_Partner_Header");
    },
    beforeDestroy() {
        this.msIns?.ws.close();
    },
    watch: {
    // 当新消息出现后, 2秒不点击自动关闭弹窗
        newMsg(val) {
            if (val) {
                setTimeout(() => {
                    this.newMsg = null;
                }, 2000);
            }
        },
        activedIcon(val) {
            if (val) {
                headerDom
          && headerDom.style
          && (headerDom.style.zIndex = zIndexCreator.create("pop") + 1);
            }
        },
    },

    methods: {
    // 校验当前用户是否完成了基础配置，没完成的话跳转基础配置页面
        verifyInitStatus() {
            Ajax.post("getInitConfig")
                .then((res) => {
                    if (res && res.code === "0000") {
                        const { tenant_system_tenant_init } = res.data;
                        if (!tenant_system_tenant_init) {
                            this.showNetError();
                        }
                        if (tenant_system_tenant_init === "-1") {
                            // ToDo 需要改为跳转对应基础配置页面
                            CabinX.go(`${EVT}partner.fit.dmall.com/config`);
                        } else {
                            console.log("已完成基础配置！");
                        }
                    } else {
                        this.showNetError();
                    }
                })
                .catch((error) => {
                    console.error(error);
                    this.showNetError();
                });
        },

        /**
     *
     * 弹窗网络异常阻塞操作
     */
        showNetError() {
            $modal({
                content: "系统开小差了,请稍后重试",
                confirmBtnText: "重试",
                showClose: false,
                showCancel: false,
                confirmCb: () => {
                    window.location.reload();
                },
            });
        },

        // 从子组件消息中心获取最新的消息数量给铃铛处展示
        getTotalNotice(val) {
            if (val > 99) {
                this.totalNotice = "99+";
                return;
            }
            this.totalNotice = val;
        },

        // 清除搜索关键值
        clearSearchValue() {
            this.searchMenuValue = "";
        },

        // 搜索历史跳到对应业务页面
        searchGoDetail(e) {
            let { item } = e.target.dataset;
            item = JSON.parse(item || "{}");
            if (!item.router) {
                return;
            }

            this.saveRecent(item);

            window.xPartnerTabController.activeTab({
                path: item.router,
                name: item.name,
            });
        },
        bind() {
            document.body.addEventListener(
                "click",
                () => {
                    this.activedIcon = "";
                },
                false,
            );
            // 浏览器页签退出登录后通信给其它页签
            window.addEventListener("storage", ({ key }) => {
                if (key === "xpartner-log-out") {
                    window.location.reload();
                }
            });
        },

        bindWebsocket() {
            const messIns = window.xPartner_msIns;

            messIns.subscribeMsg((msgPool = {}) => {
                this.playVoiceMsg(msgPool.audioMsgPool);
                this.playTextMsg(msgPool.textMsgPool);
                this.$refs.notice.getMsg();
            });

            this.msIns = messIns;
            window.xPartner_msIns = messIns;
        },

        // 确认新消息弹窗提醒
        checkNewMsg() {
            const { actionUrl } = this.newMsg;

            if (actionUrl === "multiMsg") {
                this.activedIcon = "notice";
                return;
            }

            if (actionUrl && actionUrl.trim().startsWith('#index')) {
                CabinX.go(actionUrl);
                return;
            }

            window.open(actionUrl);
            this.newMsg = null;
        },

        // 关闭消息抽屉
        hideNoticeDrawer() {
            this.activedIcon = "";
        },
        // 获取搜索历史数据
        fetchSearchHistory() {
            const { searchHistory } = getUserLocal(this.userInfo.userId);
            this.searchHistory = searchHistory;
        },

        // 跳转到我的文件页面
        goMyFile() {
            CabinX.go("#index/dmall_fit_sc_front/data_list");
            // 埋点跳转我的文件
            window.xPartner_clickTrack("x_partner_header_goMyfile", "顶栏-我的文件");
        },

        // 获取帮助中心权限
        fetchHelpCenterAuth() {
            Ajax.post("helpCenter").then((res) => {
                if (res && res.code === "0000") {
                    this.helpCenterAuth = res.data.filter((item) => item.hasPermission);

                    this.helpCenterAuth.forEach((item) => {
                        if (item.privilegeName === "帮助中心") {
                            item.logoClass = "x-icon-notice-help1";
                        } else if (item.privilegeName === "问题反馈") {
                            item.logoClass = "x-icon-system-contract";
                        }
                    });
                }
            });
        },

        // 搜索框聚焦触发
        SearchInputFocus() {
            this.activedIcon = "search";
            this.fetchSearchHistory();

            // 埋点搜索框激活
            window.xPartner_clickTrack(
                "x_partner_header_inputFocus",
                "顶栏-搜索框激活",
            );
        },

        // 搜索框搜索
        search() {
            this.activedComRouter = {};
            this.activedIcon = "search";
            let menuList = [];
            if (!this.searchMenuValue.trim()) {
                this.searchList = [];
                return;
            }
            try {
                menuList = JSON.parse(
                    decodeURIComponent(sessionStorage.getItem("xPartner_menu")),
                );
            } catch (error) {
                console.log(error);
            }
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }
            this.searchList = [];

            this.searchInput(
                this.searchMenuValue.toLowerCase(),
                menuList,
                this.searchList,
            );
        },
        searchInput(searchMenuValue, menuList, searchList, parents = []) {
            menuList.forEach((item) => {
                const parentNodes = parents.slice();
                parentNodes.push({
                    name: this.repalceHighlight(item.name, searchMenuValue),
                    router: item.router,
                    id: item.id,
                    pathName: item.name,
                });
                if (item.name.toLowerCase().includes(searchMenuValue)) {
                    searchList.push({
                        nodes: parentNodes,
                        router: item.router,
                    });
                }
                if (item.children && item.children.length) {
                    this.searchInput(
                        searchMenuValue,
                        item.children,
                        searchList,
                        parentNodes,
                    );
                }
            });
        },

        // header icon点击事件
        headerIconClick(e, type) {
            e.stopPropagation();
            if (this.activedIcon === type && type != "search") {
                this.activedIcon = "";
                return;
            }

            this.activedIcon = type;

            switch (type) {
                case "search":
                    this.$refs.searchInput.focus();
                    break;
                case "help":
                    this.handleHelpClick();
                    // 埋点帮助icon
                    window.xPartner_clickTrack(
                        "x_partner_header_helpIcon",
                        "顶栏-帮助Icon",
                    );
                    break;
                case "notice":
                    this.activedIcon = "notice";
                    // 埋点消息icon
                    window.xPartner_clickTrack(
                        "x_partner_header_noticeIcon",
                        "顶栏-消息Icon",
                    );
                    break;
                case "user":
                    // 埋点个人中心icon
                    window.xPartner_clickTrack(
                        "x_partner_header_userCenterIcon",
                        "顶栏-用户中心icon",
                    );
                    break;
                default:
                    break;
            }
        },
        // 点击顶栏help icon触发
        handleHelpClick() {
            if (this.helpCenterAuth.length === 1) {
                this.activedIcon = "";
                this.go(this.helpCenterAuth[0].privilegeUrl);
            } else {
                this.activedIcon = "help";
            }
        },

        // 搜索出来的结果高亮搜索关键词
        repalceHighlight(string, value) {
            return string.replace(
                new RegExp(value, "ig"),
                (word) => `<i class='highlight'>${word}</i>`,
            );
        },
        // 将高亮后的dom和原dom重组实现高亮搜索关键词
        joinHtml(list) {
            return list.nodes.map((item) => item.name).join("-");
        },

        // 处理因为高亮关键词而做拼接的富文本数据
        htmlToString(htmlStr) {
            htmlStr = htmlStr.replace(/<i class='highlight'>/g, "");
            htmlStr = htmlStr.replace(/<\/i>/g, "");
            return htmlStr;
        },

        // 搜索菜单点击事件
        menuClick(item) {
            if (item) {
                // eslint-disable-next-line prefer-const
                let { id, name } = item.nodes[item.nodes.length - 1];

                // 处理name,原本为html富文本,处理为普通字符串
                if (name) {
                    name = this.htmlToString(name);
                }

                // 跳转后在最近使用计入记录
                item.id = id;
                item.name = name;
                this.saveRecent(item);
                const tabName = this.htmlToString(
                    item.nodes[item.nodes.length - 1].name,
                );
                this.go(item.router, "", tabName);
            }
        },
        // 将跳转后的页面加入到最近使用
        saveRecent(item) {
            // 取出搜索历史
            const userHistory = getUserLocal(this.userInfo.userId);
            // 分别取出最近使用和搜索历史数据
            const { recentHistory, searchHistory } = userHistory;
            // 将这条处理的数据处理为对象
            const searchItem = {
                name: item.name,
                router: item.router,
                id: item.id,
                nodes: item.nodes,
                nodesStr:
          item.nodes
          && this.htmlToString(
              item.nodes.reduce((pre, next) => {
                  return `${pre}/${next.name}`;
              }, ""),
          ).replace("/", ""),
            };
            const recentItem = {
                name: item.name,
                url: item.router,
                id: item.id,
            };
            // 处理搜索历史
            // 删除原来重复的地方
            if (searchHistory.map((item1) => item1.id).includes(searchItem.id)) {
                const index = searchHistory
                    .map((item1) => item1.id)
                    .indexOf(searchItem.id);
                searchHistory.splice(index, 1);
            }
            searchHistory.unshift(searchItem);

            // 最长不超过6个数据
            if (searchHistory.length === 7) {
                searchHistory.pop();
            }
            userHistory.searchHistory = searchHistory;
            // 处理最近使用
            // 删除原有重复
            if (recentHistory.map((item1) => item1.id).includes(searchItem.id)) {
                const index = recentHistory
                    .map((item1) => item1.id)
                    .indexOf(searchItem.id);
                recentHistory.splice(index, 1);
            }
            recentHistory.unshift(recentItem);

            // 最长不超过9个数据
            if (recentHistory.length === 10) {
                recentHistory.pop();
            }
            userHistory.recentHistory = recentHistory;
            setUserLocal(this.userInfo.userId, userHistory);
        },

        // 获取用户信息
        getUserInfo() {
            Ajax.get("getUserInfo").then((res) => {
                if (res && res.code === "0000" && res.data) {
                    this.userInfo = {
                        ...res.data,
                        cryptoPhone: res.data.mobile.replace(
                            /(\d{3})(\d+)(\d{4})/,
                            (a, b, c, d) => b + c.replace(/\d/g, "*") + d,
                        ),
                    };
                    this.bindWebsocket();
                }
            });
        },

        /**
     *
     *  播放语音消息
     * @param {Array} urls
     * @return {}
     */
        playVoiceMsg(urls = []) {
            const partner_voice_close_status = +COOKIE.get("partner_voice_close_status") || 0;

            if (partner_voice_close_status || !urls.length) {
                return;
            }

            const audioUrl = urls.shift();

            const audioPlayer = new Audio(audioUrl);

            audioPlayer.play().catch((err) => {
                console.log("在设置中查看声音相关设置，错误信息：", err);
            });
            audioPlayer.addEventListener(
                "ended",
                () => {
                    console.log("播放完一条语音消息");
                    this.playVoiceMsg(urls);
                },
                false,
            );
        },

        playTextMsg(texts) {
            if (!texts) {
                return;
            }
            switch (texts.length) {
                case 0:
                    return;
                case 1:
                    const { title, actionUrl, importantStatus } = texts[0];
                    this.newMsg = {
                        title,
                        actionUrl,
                        importantStatus,
                    };
                    break;
                default:
                    this.newMsg = {
                        title: "您有多条未读消息",
                        actionUrl: "multiMsg",
                    };
                    break;
            }
        },
        // 格式化时间
        formatDate(val) {
            return formatDate(val);
        },
        // 回首页
        goHome() {
            this.go("#index/dmall_fit_jichu_partner_front/homepage");
            // 埋点回到首页
            window.xPartner_clickTrack("x_partner_header_goHome", "顶栏-回到首页");
        },
        // 去个人中心
        goCenter() {
            this.go(
                "#index/dmall_fit_jichu_partner_front/center",
                "normal",
                "个人中心",
            );
            // 埋点去设置
            window.xPartner_clickTrack(
                "x_partner_header_goCenter",
                "顶栏-个人中心设置",
            );
        },
        // 去帮助中心
        goHelpCenter(type, url) {
            this.showHelpText = false;
            switch (type) {
                case "helpCenter":
                    this.go(url, "", "帮助中心");
                    // 埋点帮助中心
                    window.xPartner_clickTrack(
                        "x_partner_header_helpCenter",
                        "顶栏-帮助中心",
                    );
                    break;

                default:
                    break;
            }
        },
        // 跳转指定页面
        go(url, type, name) {
            // 从help pop中跳转后 自动关闭pop
            this.activedIcon = "";

            if (type === "newTab") {
                window.open(url);
            } else {
                url
          && window.xPartnerTabController.activeTab({
              path: url,
              name: name || "页签",
          });
            }
        },
        // 去下载中心
        goDownLoad() {
            useJumpPublish();
            // 埋点点击下载
            window.xPartner_clickTrack(
                "x_partner_header_goDownload",
                "顶栏-下载OS应用",
            );
        },
        // 退出登录
        backOut() {
            // 埋点退出登录
            window.xPartner_clickTrack("x_partner_header_backOut", "顶栏-退出登录");

            const returnUrl = window.location.href;

            const url = `${EVT}api-tenant.fit.dmall.com/jichu/ryqx/sso/logout?redirectURL=${returnUrl}`;

            // 退出登录时 清空 已打开 tabList session
            window.xPartnerTabController.clearSessionTabList
        && window.xPartnerTabController.clearSessionTabList();

            localStorage.setItem("xpartner-log-out", Date.now());
            // 跳转登录页
            window.location.href = url;
        },

        //

        searchVenderFocus() {
            // 埋点商家搜索框激活
            window.xPartner_clickTrack(
                "x_partner_header_searchVenderFilter",
                "顶栏-激活切换商家搜索框",
            );
        },
    },
};
export default handle;
