import "./menu.scss";
import "./menu.tpl";
import { zIndexCreator } from 'saber_ui/utils';
import Ajax from "@/common/http.js";
import { getUserLocal, setUserLocal, addCookie } from "@/common/utils";
import menuItem from "./menuItem.js";

let MenuDom; // 用于保存菜单节点

let kDom = kayak.dom;
let isPaint = null;
let vueOption = null;
const CFG = {
    CONTAINER_CLS: "J_Partner_Menu",
};
const handle = {
    classname: "partner-menu",
    jView: null,
    init(data) {
    // eslint-disable-next-line no-use-before-define
        _fn.init();
        // eslint-disable-next-line no-use-before-define
        _fn.render();
    },
};
const _fn = {
    init() {
        kDom = kayak.dom;
        handle.jView = kDom.get(handle.classname, $(`.${CFG.CONTAINER_CLS}`));
    },
    // 渲染模块
    render() {
        const { jView } = handle;
        if (isPaint) {
            $(".J_Partner_Menu").html("");
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
Vue.component("menu-item", menuItem);

let sto = null;

vueOption = {
    el: "#partner-menu",
    provide() {
        return {
            rootMenu: this,
        };
    },
    data: {
        menuList: [], // 左侧菜单源数据,从后端接口获取
        activeFirstMenu: {}, // 激活的一级菜单
        hoveredFirstMenu: {}, // hover的1级菜单
        firstHoveredId: "", // hover的1级菜单的id
        isHovered: false, // 判断当前是否有处于hover状态的1级菜单
        activedMenu: "", // 当前处于激活的非1级菜单, menu-item递归组件中通过 $root使用
        showMenu: {}, // 右侧展示的菜单数据
        userInfo: {}, // 用户信息
        showMyNav: false, // 是否展示我的导航模块
        recentUseList: [], // 最近使用的数据
        collectionList: [], // 我的收藏数据
        collectionMap: new Map(), // 我的收藏map对象
        showToast: false, // 是否展示全局toast
        showToastText: "", // 全局toast文字
        parentMenu: {}, // 传递给menu-item组件作为1级菜单数据源
        showClearBtn: false, // 是否展示清空失效菜单的按钮
        isCollectFresh: false, // 该用户是否为收藏功能的新用户
        collectionCols: [], // 用于渲染瀑布流的二维数组,里面装的每一列的数据
        currentRemoveId: null, // 鼠标hover到的 删除icon
        menuToastText: null, // 全局toast文案
        specialList: [
            "#index/dmall_fit_jichu_partner_front/homepage",
            "#index/dmall_fit_jichu_partner_front/center",
        ], // 首页和个人中心作为特殊菜单
        hasInitial: false, // 页面是否已经初始化
    },
    computed: {},
    mounted() {
        this.initBind();
        this.getUserInfo();
        // Biz.setTrackModules(window.location.hash);
    },
    watch: {

        isHovered(val) {
            if (val) {
                this.changeHeaderZindex();
            }
        },
    },
    methods: {
        initBind() {
            // 页面已经初始化完成
            this.hasInitial = true;
            this.isCollectFresh = false;
            // 监听菜单点击事件
            this.$on("item-click", (res) => {
                // 未完成收藏新人引导,不能触发2级菜单点击事件
                if (this.isCollectFresh) {
                    return;
                }

                this.activedMenu = res;
                this.activeFirstMenu = this.hoveredFirstMenu;
                if (res.router) {
                    this.showMenu = {};
                    this.go(res.router, res, "recent");
                    this.isHovered = false;
                    // 埋点末级菜单跳转
                    window.xPartner_clickTrack(
                        "x_partner_menu_goBusiPage",
                        "菜单-跳转业务页面",
                    );
                }
            });

            // 监听子孙组件触发添加收藏的事件
            this.$on("addToCollection", (res) => {
                this.addToCollection(res);
            });

            // 监听子孙组件触发取消收藏的事件
            this.$on("deleteCollection", (res) => {
                this.deleteCollection(res);
            });

            window.addEventListener("hashchange", () => {
                // 根据路由匹配选中的菜单
                this.filterMenu();
                // Biz.setTrackModules(window.location.hash);
            });

            // document.addEventListener("visibilitychange", () => {
            //     if (document.visibilityState === 'visible') {
            //         // Biz.setTrackModules(window.location.hash);
            //     }
            // });

            MenuDom = document.querySelector('#J_Partner_Menu');

            // 在window上绑定事件与外界通信方法
            window.xPartnerMenu = this.communicate;
        },

        /**
     *与外界通信的函数
     *
     * @param {*} type
     * @param {*} param
     */
        communicate(type, param) {
            switch (type) {
                case "openMyNav":
                    // 来自homepage我的导航点击更多
                    this.showMyNav = true;
                    break;

                case "closeMyNav":
                    // 来自header点击body时候收起我的导航
                    this.showMyNav = false;
                    break;

                case "fetchCollection":
                    // 来自homepage我的导航删除菜单后同步数据
                    this.fetchCollection();
                    break;

                    // 来自首页我的导航跳转
                case "goDetail":
                    this.go(param.url, param, "recent");
                    break;
                default:
                    break;
            }
        },

        /**
     *
     *判断新人引导进度
     * @param {*} type   collect:收藏新人引导
     * @return {*}
     *
     */
        judgeFresh(type) {
            switch (type) {
                case "collect":
                    this.startCollectFresh();
                    break;
                default:
                    break;
            }
        },
        changeHeaderZindex() {
            MenuDom.style.zIndex = zIndexCreator.create('pop');
        },
        /**
     *
     *开始收藏新人引导
     * @return {*}
     */
        startCollectFresh() {
            const freshStatusStr = localStorage[`xPartnerFresh_${this.userInfo.userId}`];
            // 如果本地储存没有新人状态的话,新建一个并且直接开始第一步
            if (!freshStatusStr) {
                localStorage[`xPartnerFresh_${this.userInfo.userId}`] = '{"main":false,"collect":false}';
                this.isCollectFresh = true;

                return;
            }
            // 如果已经完成了收藏引导,不进行新人教程
            if (
                JSON.parse(localStorage[`xPartnerFresh_${this.userInfo.userId}`]).collect
            ) {
                return;
            }

            this.isCollectFresh = true;
        },
        // 完成收藏新人引导
        finishCollectFresh() {
            const userFresh = JSON.parse(
                localStorage[`xPartnerFresh_${this.userInfo.userId}`],
            );
            userFresh.collect = true;
            localStorage[`xPartnerFresh_${this.userInfo.userId}`] = JSON.stringify(userFresh);
            this.isCollectFresh = false;
        },

        getUserInfo() {
            Ajax.get("getUserInfo").then((res) => {
                if (res && res.data) {
                    this.userInfo = res.data;
                    this.getRecentUse();
                    this.getMenu();
                }
            });
            DmallTracker
      && DmallTracker.setAttr({
          tenant_id: this.userInfo.tenantId,
      });
        },
        // 备用1级菜单hover
        firstMenuMouseMove(item) {
            sto && window.clearTimeout(sto);
            sto = window.setTimeout(() => {
                sto = null;

                if (item === this.hoveredFirstMenu) return;

                if (item.id === -1) {
                    if (this.isCollectFresh) return;

                    this.firstHoveredId = item.id;
                    this.hoveredFirstMenu = item;
                    this.showMyNav = true;
                    this.getRecentUse();

                    window.xPartner_clickTrack("x_partner_menu_showMyNav", "菜单-展现我的导航");
                    return;
                }

                this.isHovered = true;
                this.firstHoveredId = item.id;
                this.hoveredFirstMenu = item;
                this.showMenu = item;
                this.parentMenu = item;
            }, 100);
        },

        // 一级菜单鼠标移动事件
        firstMenuOver(item) {
            clearTimeout(this.childrenLeaveTimer);
            clearTimeout(this.firstMenuLeaveTimer);
            this.firstHoverTimer = setTimeout(() => {
                this.isHovered = true;
            }, 200);

            // 如果hover到的是我的导航
            if (item.id === -1) {
                // 如果还未完成收藏功能新人引导
                if (this.isCollectFresh) {
                    return;
                }

                this.firstMenuOverTimer = setTimeout(() => {
                    this.firstHoveredId = item.id;
                    this.hoveredFirstMenu = item;
                    this.showMyNav = true;
                    this.getRecentUse();
                }, 200);

                // 埋点我的导航hover
                window.xPartner_clickTrack(
                    "x_partner_menu_showMyNav",
                    "菜单-展现我的导航",
                );

                return;
            }

            this.showMyNav = false;
            if (this.firstMenuOverTimer) {
                clearTimeout(this.firstMenuOverTimer);
                this.firstMenuOverTimer = null;
            }
            this.firstMenuOverTimer = setTimeout(() => {
                this.firstHoveredId = item.id;
                this.hoveredFirstMenu = item;
                this.showMenu = item;

                // 用于传递给子菜单用于收藏的pData数据源
                this.parentMenu = item;
            }, 300);
        },

        // 一级菜单移出事件
        firstMenuLeave(item) {
            this.firstMenuOverTimer && clearTimeout(this.firstMenuOverTimer);
            if (this.firstHoverTimer) {
                clearTimeout(this.firstHoverTimer);
            }
            // 收藏新人引导未完成的情况下,不触发
            if (this.isCollectFresh) {
                return;
            }
            // 解决我的导航hover出后 样式丢失
            if (this.hoveredFirstMenu.id != -1) {
                this.hoveredFirstMenu = {};
            }

            this.navTimer = setTimeout(() => {
                this.showMyNav = false;
            }, 200);

            this.firstMenuLeaveTimer = setTimeout(() => {
                this.isHovered = false;
            }, 200);
        },

        // 子菜单鼠标移动事件
        childrenOver(item) {
            if (this.firstMenuOverTimer) {
                clearTimeout(this.firstMenuOverTimer);
                clearTimeout(this.navTimer);
                this.firstMenuOverTimer = null;
                this.isHovered = true;
            }
            clearTimeout(this.firstMenuLeaveTimer);

            this.hoveredFirstMenu = this.showMenu;
        },

        // 子菜单移出事件
        childrenLeave() {
            // 如果没有过收藏新手引导的 leave 菜单不会消失
            if (this.isCollectFresh) {
                return;
            }
            this.childrenLeaveTimer = setTimeout(() => {
                this.hoveredFirstMenu = {};
                this.showMenu = {};
                this.isHovered = false;
            }, 200);
        },
        // 我的导航模块移入事件
        myNavOver() {
            this.showMyNav = true;

            if (typeof window.xPartnerMyNav == "function") {
                window.xPartnerMyNav("changeSubTitle", "收起");
            }
            clearTimeout(this.navTimer);
        },
        // 我的导航模块移出事件
        myNavLeave() {
            // 加延时器解决鼠标滑动过快,over和leave事件冲突
            setTimeout(() => {
                this.hoveredFirstMenu = {};
                this.showMenu = {};
                this.showMyNav = false;
            }, 200);
            if (typeof window.xPartnerMyNav == "function") {
                window.xPartnerMyNav("changeSubTitle", "更多");
            }
        },
        // 移进/移出删除收藏icon触发
        toggleRemoveNotice(id) {
            if (!id) {
                this.currentRemoveId = null;
                return;
            }
            this.currentRemoveId = id;
        },

        go(url, res, type) {
            // type用于区分是否最近使用跳转,还是收藏跳转
            if (type !== "recent" && !res.valid) {
                return;
            }

            this.saveRecent(res);
            // 如果开头不是#index 跳出去自己打开
            if (url) {
                if (!url.startsWith("#index")) {
                    window.open(url);
                } else {
                    CabinX.go(url);
                }
            }
        },

        // 根据hash匹配菜单
        async filterMenu() {
            const { hash } = window.location;

            // 根据hash在左侧权限菜单找到对应菜单
            const findResult = this.findMenu(this.menuList, hash);

            if (findResult) {
                // 如果在左侧菜单能匹配到对应末级菜单

                // 给选中菜单加上对应样式
                this.activeFirstMenu = findResult[0];
                // this.showMenu = this.activeFirstMenu;
                this.activedMenu = findResult.slice().pop();

                // 将聚焦点移动到匹配 到的菜单位置
                this.$nextTick(() => {
                    document
                        .querySelector(`#first-menu-id_${this.activeFirstMenu.id}`)
                        .scrollIntoView({
                            block: "center",
                        });
                });
            } else {
                // 如果没匹配上清除对应样式
                this.activeFirstMenu = {};
                this.activedMenu = {};
                this.hoveredFirstMenu = {};
            }

            console.info("findResult", findResult);
        },

        /**
     * 根据一个下钻页面的id和pid在左侧菜单中获取到对应末级菜单
     * interface {
         *      pid:number,
         *      id:number,
         * }
     *
     * @param {Object} targetObj
     * @return {*}
     */
        findTargetMenu(targetObj) {
            if (!targetObj) {
                return;
            }
            let resultObj = null;
            const { pid, id } = targetObj;
            const recurFunc = (menu) => {
                menu.forEach((item) => {
                    if (item.privilegeId === pid || item.privilegeId === id) {
                        resultObj = item;
                    }
                    if (item.children && item.children.length > 0) {
                        recurFunc(item.children);
                    }
                });
            };

            recurFunc(this.menuList);

            return resultObj;
        },

        /**
     *
     * 判断当前页面的hash属不属于特殊页面 (首页/个人中心)
     * @return {*}
     */
        isSpecialList() {
            const { hash } = window.location;
            // 如果是首页的话,收起菜单
            if (this.specialList.includes(hash)) {
                return true;
            }
            return false;
        },

        // 在menu中递归查找当前hash匹配到的最末级菜单以及它的每一层上级菜单放到数组中返回
        findMenu(list, hash) {
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const { router } = item;
                if (item.children && item.children.length) {
                    const find = this.findMenu(item.children, hash);

                    // 如果在子中匹配上了, 把该子中所有父item都一层一层加到数组中
                    if (find) {
                        find.unshift(item);
                        return find;
                    }
                } else if (this.validUrl(router) && router.trim() == hash) {
                    return [item];
                }
            }
        },

        // 校验地址是否是有效
        validUrl(url) {
            if (typeof url !== "string") {
                return;
            }
            const reg = /^#\w+(\/[\w-]+){2}/;
            return reg.test(url.trim());
        },
        // 获取菜单接口
        getMenu() {
            Ajax.get("getMenuData").then((res) => {
                if (!res || !res.data) {
                    return;
                }
                // 本地存一个菜单源数据
                sessionStorage.setItem(
                    "xPartner_menu",
                    encodeURIComponent(JSON.stringify(res.data || [])),
                );

                // 将后端接口数据浅克隆一份,用于展平构造map结构
                const menuTree = [...res.data];

                // 展平菜单,只保留末级, key为router , value为属性
                const menuMap = this.menuTreeToMap([...menuTree]);

                // 给每一个末级菜单加上面包屑数据
                for (const key in menuMap) {
                    if (Object.hasOwnProperty.call(menuMap, key)) {
                        const element = menuMap[key];
                        element.breadPath = this.menuAddNodes(menuTree, element.id);
                    }
                }

                // 本地存一个菜单平铺后的数据
                sessionStorage.setItem(
                    "xPartner_menuMap",
                    JSON.stringify(menuMap || {}),
                );
                this.menuList = res.data;

                // 给没有icon的1级菜单设置默认icon
                this.menuList.forEach((item) => {
                    if (!item.icon) {
                        item.icon = "x-icon-universally-a-1zhanweifu";
                    }
                });

                // 根据当前hash值,判断菜单中的选中状态
                this.fetchCollection();
                this.filterMenu();
            });
        },

        /**
     *
     * 用目标id在树中找到对应item,并且将它的父级,爷级等name逐级合并返回一个面包屑string
     * @param {*Array} menuTree
     * @param {*Number} targetId
     * @return {*String}
     */
        menuAddNodes(menuTree, targetId) {
            // 定义面包屑字符串数组
            const breadArr = [];

            if (!(menuTree instanceof Array)) {
                return;
            }
            // eslint-disable-next-line default-param-last
            const recurFunc = (list = [], tid) => {
                list.forEach((item) => {
                    if (item.id === tid) {
                        breadArr.unshift(item.name);
                        if (item.pid) {
                            recurFunc(menuTree, item.pid);
                        }
                    }
                    if (item.children && item.children.length > 0) {
                        recurFunc(item.children, tid);
                    }
                });
            };
            recurFunc(menuTree, targetId);
            return breadArr.join("/");
        },

        /**
     *
     * 把树状数组平铺为map对象
     * @param {*Array} menuTree 源数据
     * @return {*Object}
     */
        menuTreeToMap(menuTree) {
            const menuMap = {};
            if (!(menuTree instanceof Array)) {
                return;
            }
            // 递归处理函数
            const handleFunc = (list) => {
                list.forEach((item) => {
                    if (item.router) {
                        menuMap[item.router] = item;
                    }
                    if (item.children && item.children.length > 0) {
                        handleFunc(item.children);
                    }
                });
            };
            handleFunc(menuTree);
            return menuMap;
        },
        // 获取最近使用
        getRecentUse() {
            if (!this.userInfo) {
                return;
            }
            this.recentUseList = getUserLocal(this.userInfo.userId).recentHistory;
        },
        // 获取我的收藏数据
        fetchCollection() {
            Ajax.get("fetchCollection", {
                venderId: this.userInfo.venderId,
            }).then((res) => {
                if (res && res.code === "0000") {
                    // collectionMap用于后续收藏删除,新增等
                    this.collectionMap = this.collectionToFlat([
                        ...JSON.parse(res.data || "[]"),
                    ]);
                    // collectionList用于渲染
                    this.collectionList = this.collectionToTree(this.collectionMap);

                    // 瀑布流布局将collectionList分三列数据
                    let collectionCol1 = [];
                    let collectionCol2 = [];
                    let collectionCol3 = [];
                    let i = 0;
                    while (i < this.collectionList.length) {
                        collectionCol1.push(this.collectionList[i++]);
                        collectionCol2.push(this.collectionList[i++]);
                        collectionCol3.push(this.collectionList[i++]);
                    }

                    // 去除空数据
                    collectionCol1 = collectionCol1.filter((item) => item);
                    collectionCol2 = collectionCol2.filter((item) => item);
                    collectionCol3 = collectionCol3.filter((item) => item);
                    this.collectionCols = [
                        collectionCol1,
                        collectionCol2,
                        collectionCol3,
                    ];

                    // 判断是否展示清除失效按钮
                    this.showClearBtn = false;
                    this.collectionList.forEach((item) => {
                        item.children.forEach((item1) => {
                            if (!item1.valid) {
                                this.showClearBtn = true;
                            }
                        });
                    });
                }
            });
        },
        // 将收藏数据平层化为map对象
        collectionToFlat(list) {
            const obj = new Map();
            list.forEach((item) => {
                item.children.forEach((item1) => {
                    item1.valid = false;
                    this.collectionJudge(item1.id, this.menuList, item1);
                    obj.set(item1.id, {
                        ...item1,
                        pData: {
                            icon: item.icon,
                            name: item.name,
                            url: item.router,
                            id: item.id,
                            level: 0,
                        },
                        pid: item.id,
                    });
                });
            });
            return obj;
        },
        // 判断是否为无效菜单
        collectionJudge(id, menuList, target) {
            menuList.forEach((item) => {
                if (item.id == id) {
                    // 如果在菜单中找到了这个id,则判断为有效的
                    target.valid = true;

                    // 对比菜单中该id的name和url和 collectionMap中是否有差异,有差异的话以菜单的为准
                    if (item.name != target.name) {
                        target.name = item.name;
                    }
                    if (item.router != target.url) {
                        target.url = item.router;
                    }
                } else if (item.children && item.children.length > 0) {
                    this.collectionJudge(id, item.children, target);
                }
            });
        },
        // 清空失效菜单
        async clearInvalid() {
            const { collectionMap } = this;
            for (const item of collectionMap.values()) {
                console.log(item);
                if (!item.valid) {
                    collectionMap.delete(item.id);
                }
            }
            this.collectionList = this.collectionToTree(collectionMap);
            const flag = await this.saveCollection(this.collectionList);
            if (flag) {
                this.menuToast("失效菜单已清除");
            } else {
                CabinX.notice({
                    text: "失效菜单清除失败",
                    status: "error",
                });
            }
        },
        // 将对象map数据树状化为数组
        collectionToTree(mapObj) {
            const finalMenu = [];
            [...mapObj.entries()].forEach(([k, v]) => {
                const currentParent = finalMenu.find((m) => m.id === v.pData.id);
                if (currentParent) {
                    currentParent.children.push(v);
                } else {
                    finalMenu.push({
                        ...v.pData,
                        children: [v],
                    });
                }
            });
            return finalMenu;
        },
        /**
     *
     * collectionItem:{
     *    children: null
          id: 27622
          level: 1
          name: "磅秤管理"
          pData: {icon: 'x-icon-universally-a-1zhanweifu', name: '磅秤系统', url: '', id: 1113, level: 0}
          pid: 1113
          url: "#index/steelyard_page/steelyardManager"
     * }
     * @param {*collectionItem} item
     */
        async addToCollection(item) {
            this.collectionMap.set(item.id, item);
            const collectionList = this.collectionToTree(this.collectionMap);

            // 是新人的时候 触发收藏,结束新人引导
            if (this.isCollectFresh) {
                this.finishCollectFresh();
            }

            const flag = await this.saveCollection(collectionList);
            if (flag) {
                this.menuToast('已添加至"收藏菜单"');
                return true;
            }
            CabinX.toast("添加失败!");
        },
        // 取消收藏
        async deleteCollection(item) {
            this.collectionMap.delete(item.id);
            const collectionList = this.collectionToTree(this.collectionMap);

            // 是新人的时候 触发收藏,结束新人引导
            if (this.isCollectFresh) {
                this.finishCollectFresh();
            }

            const flag = await this.saveCollection(collectionList);
            if (flag) {
                this.menuToast("已取消收藏");
                return true;
            }

            // 埋点菜单取消收藏
            window.xPartner_clickTrack(
                "x_partner_menu_delCollection",
                "菜单-取消收藏",
            );
        },
        // 保存我的收藏到后端
        saveCollection(collectionList) {
            // collectionList.push({id:983,name:'多点大学',children:[{id:9299123,pid: 983,name:'测试失效1'}]})
            // collectionList.push({id:983,name:'多点大学',children:[{id:12312313,pid: 983,name:'测试失效2'}]})
            // collectionList.push({id:983,name:'多点大学',children:[{id:9221321399123,pid: 983,name:'测试失效3'}]})
            // collectionList.push({id:983,name:'多点大学',children:[{id:922132199123,pid: 983,name:'测试失效4'}]})
            // collectionList.push({id:983,name:'多点大学',children:[{id:9222299123,pid: 983,name:'测试失效5'}]})
            // collectionList.push({id:983,name:'多点大学',children:[{id:921212199123,pid: 983,name:'测试失效6'}]})

            return new Promise((resolve, reject) => {
                Ajax.post("saveCollection", {
                    venderId: this.userInfo.venderId,
                    json: JSON.stringify(collectionList),
                }).then((res) => {
                    if (res && res.code === "0000") {
                        if (res.success) {
                            if (window.xPartnerMyNav) {
                                window.xPartnerMyNav("fetchData");
                            }
                            this.fetchCollection();
                            resolve(true);
                        }
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject("保存失败");
                    }
                });
            });
        },
        // menu全局toast
        menuToast(text) {
            this.menuToastText = text;
            if (this.menuToastTimer) {
                clearTimeout(this.menuToastTimer);
            }
            this.menuToastTimer = setTimeout(() => {
                this.menuToastText = null;
            }, 3000);
        },
        // 将跳转页面加入到最近使用中
        saveRecent(item) {
            // 将跳转的页面保存到最近使用中
            const userHistory = getUserLocal(this.userInfo.userId);
            const { recentHistory } = userHistory;
            const recentItem = {
                name: item.name,
                url: item.router || item.url,
                id: item.id,
            };
            // 重复部分删除
            if (recentHistory.map((recentDto) => recentDto.id).includes(recentItem.id)) {
                const index = recentHistory
                    .map((recentDto1) => recentDto1.id)
                    .indexOf(recentItem.id);
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
    },
};

export default handle;
