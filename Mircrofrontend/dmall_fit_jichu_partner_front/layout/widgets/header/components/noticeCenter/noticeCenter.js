import tpl from "./noticeCenter.tpl";
import "./noticeCenter.scss";
import Ajax from "@/common/http.js";

export default {
    name: "notice-center",
    template: tpl,
    props: {
        activeIcon: {
            type: String,
        },
    },
    data() {
        return {
            noticeTabs: [
                {
                    name: "消息",
                    id: "info",
                },
                {
                    name: "审批",
                    id: "auth",
                },
            ], // 消息pop中tab枚举值
            showNoticeLoading: false, // 任务表单里的加载动画是否展示
            activeNoticeTab: "info", // 当前选中的消息tab   枚举值有:info:消息, auth:审批
            bannerData: [], // 消息tab中轮播图的数据
            currentBanner: {}, // 当前选中的轮播图对象
            currentBannerIndex: 0, // 当前选中的轮播对象的下标
            infoList: [], // 消息tab数据源
            authList: [], // 审批tab数据源
            totalNotice: 0, // 总消息数
            currentIndex: 0,
        };
    },
    component: {},
    created() {},
    mounted() {
        this.getMsg();
        this.getMsgBanner();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    watch: {
    // 切换消息Pop中的tab后 刷新消息
        activeNoticeTab() {
            this.refreshNotice();
        },
        activeIcon: {
            handler(val) {
                if (val === 'notice') {
                    // 当消息tab数量未0,审批数量不为0的时候 默认展示审批tab
                    if (this.infoList.length === 0 && this.authList.length > 0) {
                        this.activeNoticeTab = 'auth';
                    }
                }
            },
            immediate: true,
        },
    },
    methods: {
    // 获取消息
        getMsg(positiveRefresh) {
            if (positiveRefresh) {
                this.showNoticeLoading = true;
            }
            Promise.all([
                Ajax.post("getMsg"),
                Ajax.post('getSimpleTask'),
            ]).then((res) => {
                if (res && res[0].code === '0000' && res[1].code === '0000') {
                    const [msgRes, authRes] = res;
                    const { ordinaryDatas, total: msgTotal } = msgRes.data;
                    const { records: approvalDatas, total: authTotal } = authRes.data;

                    if (ordinaryDatas) {
                        ordinaryDatas.forEach((item) => {
                            this.handleSummary(item);
                        });
                    }

                    this.infoList = ordinaryDatas;
                    this.authList = approvalDatas;

                    this.$emit("gettotalnotice", (authTotal - 0) + (msgTotal - 0));
                }
            }).finally((res) => {
                this.showNoticeLoading = false;
            });
        },

        // 当summaryType为2的时候处理数据类型
        handleSummary(item) {
            if (!item || item.summaryType !== 2) {
                return;
            }
            item.summary = JSON.parse(item.summary);
            item.summaryArr = Object.entries(item.summary);
        },
        jumpToDetail(url) {
            if (!url) {
                return;
            }
            this.$emit('hidenoticedrawer');
            CabinX.go(url);
        },
        chooseItem(index) {
            this.currentIndex = index;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = setInterval(() => {
                    // eslint-disable-next-line no-plusplus
                    this.currentIndex++;
                    if (this.currentIndex === this.bannerData.length) {
                        this.currentIndex = 0;
                    }
                }, 3000);
            }
            window.xPartner_clickTrack(
                "x_partner_header_changeNotice",
                "顶栏-多点公告切换",
            );
        },
        // 获取消息轮播图
        getMsgBanner() {
            Ajax.post("getNoticeInfo", {
                source: 1,
                type: 1,
            })
                .then((res) => {
                    if (res && res.code === "0000" && res.data) {
                        this.bannerData = res.data.map((item) => ({
                            msgId: item.id,
                            imgUrl: item.bannerImagePath,
                            url: item.actionUrl,
                            title: item.title,
                        }));
                        this.currentBanner = this.bannerData[this.currentBannerIndex];
                        this.bannerMove();
                    }
                })
                .finally((res) => {
                    this.bannerTimer = setTimeout(() => {
                        this.getMsgBanner();
                    }, 60 * 1000);
                });
        },
        // 让轮播图动起来
        // 让轮播图动起来
        bannerMove() {
            if (this.timer)clearTimeout(this.timer);
            this.timer = setInterval(() => {
                // eslint-disable-next-line no-plusplus
                this.currentIndex++;
                if (this.currentIndex === this.bannerData.length) {
                    this.currentIndex = 0;
                }
            }, 3000);
        },

        // 点击消息pop中的查看全部按钮触发
        checkAll() {
            const currentTab = this.activeNoticeTab;
            // 埋点任务查看全部

            // 埋点查看消息/审批
            if (currentTab === "auth") {
                window.xPartnerTabController.activeTab({
                    path: "#index/dmall_fit_gzl_web/taskWorkbench ",
                    name: "审批工作台",
                });
                window.xPartner_clickTrack(
                    "x_partner_header_authViewAll",
                    "顶栏-审批查看全部",
                );
            } else {
                window.xPartnerTabController.activeTab({
                    path: "#index/partner_logistics/messageList",
                    name: "消息通知",
                });
                window.xPartner_clickTrack(
                    "x_partner_header_infoViewAll",
                    "顶栏-消息查看全部",
                );
            }
            this.$emit('hidenoticedrawer');
        },
        // 读取消息
        readMsg(item) {
            // 如果已经满了30个页签了,直接不能打开
            const { tabList, maxTabCount } = window.xPartnerTabController || {};

            if (tabList && tabList.length >= maxTabCount) {
                CabinX.go(item.actionUrl);
                return;
            }

            this.readMsgRequest([item.msgRecordId - 0, '']).then((res) => {
                if (res && res.code !== "0000") {
                    return;
                }
                if (this.msgTimer) {
                    clearTimeout(this.msgTimer);
                }
                this.getMsg(true);
                this.$emit('hidenoticedrawer');
                window.xPartner_msIns && window.xPartner_msIns.msgChanged();
                CabinX.go(item.actionUrl);
            });
        },
        readMsgRequest(msgRecordIds) {
            return Ajax.post("markReadMsg", {
                msgRecordIds,
            });
        },

        // 去审批页面
        goAuth(item) {
            this.$emit('hidenoticedrawer');
            CabinX.go(item.pcActionUrl);
        },

        // 全部已读
        markAllRead() {
            if (!this.infoList.length) {
                return;
            }
            const msgRecordIds = [];
            this.showNoticeLoading = true;
            this.infoList.forEach((item) => {
                msgRecordIds.push(item.msgRecordId - 0);
                // this.$set(item, "isRead", true);
            });
            setTimeout(() => {
                this.readMsgRequest(msgRecordIds).then((res) => {
                    if (res && res.code !== "0000") {
                        return;
                    }
                    if (this.msgTimer) {
                        clearTimeout(this.msgTimer);
                    }
                    window.xPartner_msIns && window.xPartner_msIns.msgChanged();
                    this.getMsg(true);
                });
            }, 1000);
            // 埋点全部已读
            window.xPartner_clickTrack(
                "x_partner_header_markAllRead",
                "顶栏-消息全部已读",
            );
        },
        // 刷新消息
        refreshNotice() {
            if (this.activeNoticeTab === "task") {
                this.fetchTaskData("positiveFresh");
            } else {
                this.getMsg(true);
            }
        },
        // 消息栏下选择tab触发
        checkTabs(e) {
            const target = e.target.dataset.id;
            if (!target) {
                return;
            }
            if (target === "refresh") {
                this.refreshNotice();

                // 埋点消息刷新按钮
                window.xPartner_clickTrack(
                    "x_partner_header_noticeFresh",
                    "顶栏-消息刷新",
                );
            } else {
                this.activeNoticeTab = target;

                // 埋点消息/待办工单/任务tab
                switch (target) {
                    case "info":
                        window.xPartner_clickTrack(
                            "x_partner_header_infoTab",
                            "顶栏-消息tab",
                        );
                        break;
                    case "task":
                        window.xPartner_clickTrack(
                            "x_partner_header_authTab",
                            "顶栏-审批tab",
                        );

                        break;
                    case "todo":
                        window.xPartner_clickTrack(
                            "x_partner_header_toDoTab",
                            "顶栏-待办工单tab",
                        );
                        break;

                    default:
                        break;
                }
            }
        },
    },
};
