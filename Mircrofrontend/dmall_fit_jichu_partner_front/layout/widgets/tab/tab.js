import '@/layout/widgets/tab/tab.tpl';
import '@/layout/widgets/tab/tab.css';
import useTips from '@/common/hooks/useTips';

let _fn;
let kDom;
let vueOption;
let isPaint = null;

const CFG = {
    CONTAINER_CLS: 'J_Partner_Tab',
    TAB_CONTAINER_CLS: 'J_Partner_Tab_Content',
    LEFT_MENU_CONTAINER_CLS: 'J_Partner_Menu',
};

const handle = {
    classname: 'partner-tab',
    jView: null,
    init() {
        // 初始化
        _fn.init();
        // 渲染
        _fn.render();
    },
};

_fn = {
    init() {
        kDom = kayak.dom;
        handle.jView = kDom.get(handle.classname, $(`.${CFG.CONTAINER_CLS}`));
    },
    // 渲染模块
    render() {
        const {
            jView,
        } = handle;
        if (isPaint) {
            $(`.${CFG.CONTAINER_CLS}`).html('');
        }
        jView.kInsert();
        _fn.paint();
    },
    paint() {
        isPaint = true;
        // 自定义hooks替代web自带的title
        useTips(Vue);
        // eslint-disable-next-line no-new
        new Vue(vueOption);
    },

    throttle(fn, delay) {
        let timer = null;
        return function () {
            const context = this;
            // eslint-disable-next-line prefer-rest-params
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, delay);
        };
    },
};

vueOption = {
    el: '#partner-tab',
    data: {
        tabList: window.xPartnerTabController ? window.xPartnerTabController.tabList : [],
        tabVisibleList: [],
        tabOverflowList: [],
        tabWrapWidth: 1800,
        tabMinWidth: 120,
        maxTabVisibleCount: 15,
        isOverflowListShow: false,
        partnerIndexPath: '#index/dmall_fit_jichu_partner_front/homepage',
        overflowListMaxHeight: '800px',
        isSessionRestored: false,
        contextMenuFuncs: [
            { name: '刷新', func: 'refreshTab' },
            { name: '关闭当前', func: 'closeTab' },
            { name: '关闭其它', func: 'closeOther' },
            { name: '关闭所有', func: 'closeAll' },
        ],
        curContextMenu: null,
    },
    mounted() {
        // 恢复 session 中存在的页签
        this.restoreSessionTabList();

        this.shuntTabVisibleList();
        this.globalCloseOverflowList();
        this.resizeOverflowList();
        this.syncTabListToOverflowList(this.tabList);

        this.setWindowResize();

        // 暴露给 其他地方激活 tab 时重新计算 VisibleList
        window.xPartnerTabReShuntTabVisibleList = this.reShuntTabVisibleList;

        // mounted 执行一次时 设置当前激活页签在可视范围，session 保持之前 tabList 时使用
        this.$nextTick(() => {
            this.reShuntTabVisibleList(this.getActiveTab.path);
        });

        window.addEventListener('click', () => {
            this.curContextMenu = null;
        });
    },
    watch: {
        tabList(tabList) {
            this.resizeTabWrap();
            this.shuntTabVisibleList();
            this.syncTabListToOverflowList(tabList);

            window.xPartnerTabController.saveTabListToSession();
        },
    },
    computed: {
        /**
         * Tab 是否超出视口区域，需要显隐藏菜单
         */
        isTabOverFlow() {
            return this.tabList.length > this.maxTabVisibleCount;
        },

        getActiveTab() {
            return this.tabList.find((tab) => tab.isActived === true);
        },
    },
    methods: {
        /**
         * Tab 页签激活点击
         *
         * @param {*} tabPath
         */
        activeTab(tabPath) {
            console.log('Tab UI activeTab', tabPath);
            // 已经在 pureActiveTab 中触发 this.reShuntTabVisibleList(tabPath);
            window.xPartnerTabController.pureActiveTab(tabPath, {
                actionOrigin: 'tab',
            });

            if (tabPath === this.partnerIndexPath) {
                // 埋点点击首页图标
                window.xPartner_clickTrack('x_partner_tab_backToHome', '页签-回到首页');
            }
            // tab_change埋点
            this.trackTabChange(tabPath);

            kayak.router.go(tabPath);

            window.xPartnerTabController.saveTabListToSession();
        },

        /**
         *
         * tab切换时候触发埋点
         * @param {string} path
         */
        trackTabChange(path) {
            try {
                const page_url = path; // 跳转后页面hash
                const ref = kayak.router.currentUrl && `#${kayak.router.currentUrl.split('#')[1]}`; // 跳转前页面hash
                const page_title = this.getTitleByPath(page_url); // 跳转后页面标题
                const ref_source = this.getTitleByPath(ref); // 跳转前页面标题

                window.DmallTracker.track('tab_change', {
                    page_url,
                    page_title,
                    ref,
                    ref_source,
                    module: {
                        p: '-1',
                        r: '-1',
                        k: '-1',
                        i: '-1',
                        n: '飞拓商户平台-pc',
                    },
                });
            } catch (error) {
                console.error(`${error}bindTabChange`);
            }
        },

        /**
         *
         *  根据hash去取对应的tab标题
         * @param {string} path
         * @return {string} title
         */
        getTitleByPath(path) {
            if (!path) {
                return;
            }
            const dom = document.querySelector(`[tab-path='${path}']`);
            const title = dom && dom.innerText;

            return title;
        },

        /**
         * Tab 页签刷新
         *
         * @param {*} path
         */
        refreshTab(path) {
            window.xPartnerTabController.refreshTab(path);
        },

        /**
         * Tab 页签关闭
         *
         * @param {*} path
         */
        closeTab(path) {
            window.xPartnerTabController.closeTab(path);
        },

        /**
         * Tab 容器调整时调整 Tab 超出隐藏容器
         *
         */
        resizeTabWrap() {
            const tabWrapEle = $(`.${CFG.CONTAINER_CLS}`);
            // tab 容器 减去入口页占位
            this.tabWrapWidth = tabWrapEle.width() - 48;

            const maxTabVisibleCount = this.getMaxTabVisibleCount(this.tabMinWidth, this.tabWrapWidth);
            if (maxTabVisibleCount > 0) {
                this.maxTabVisibleCount = maxTabVisibleCount;
            }
        },

        /**
         * Tab 超出 List 容器高度自适应
         *
         */
        resizeOverflowList() {
            const leftMenuEle = $(`.${CFG.LEFT_MENU_CONTAINER_CLS}`);
            this.overflowListMaxHeight = `${leftMenuEle.height() - 50}px`;
        },
        /**
         * 获取最大 Tab 显示数量
         *
         * @param {Number} tabWidth
         * @param {Number} tabWrapWidth
         * @return {Number} maxTabVisibleCount
         */
        getMaxTabVisibleCount(tabWidth, tabWrapWidth) {
            // -1 去除 首页tab 不参与计算
            return Math.floor(tabWrapWidth / tabWidth) - 1;
        },

        /**
         * tabList 根据最大显示宽度控制显示 tab
         *
         */
        shuntTabVisibleList() {
            if (this.tabList.length > this.maxTabVisibleCount) {
                this.tabVisibleList = this.tabList.slice(this.tabList.length - this.maxTabVisibleCount);
            } else {
                this.tabVisibleList = [...this.tabList];
            }
        },

        /**
         * 根据激活的 tab 是否在最大显示范围内来调整 VisibleList
         *
         * @param {*} tabPath
         */
        reShuntTabVisibleList(tabPath) {
            // 在显示列表中时 和 首页都不再重新调整显示范围
            if (this.isInVisibleList(tabPath) || tabPath === this.partnerIndexPath) {
                return;
            }

            const curTabIndex = this.tabList.findIndex((tab) => tab.path === tabPath);

            // 判断激活的 tab index 是否在最大范围内
            if (this.tabList.length - curTabIndex < this.maxTabVisibleCount) {
                this.tabVisibleList = this.tabList.slice(this.tabList.length - this.maxTabVisibleCount);
            } else {
                this.tabVisibleList = this.tabList.slice(curTabIndex, curTabIndex + this.maxTabVisibleCount);
            }
        },

        /**
         * 同步 tabList 内容到超出浮动菜单
         *
         * @param {Tab[]} tabList
         */
        syncTabListToOverflowList(tabList) {
            // if (this.isTabOverFlow) {
            this.tabOverflowList = [...tabList];
            // }
        },

        /**
         * 切换 超出浮动菜单显示隐藏
         *
         */
        toggleOverflowList() {
            this.isOverflowListShow = !this.isOverflowListShow;
        },

        /**
         * 全局点击是关闭隐藏浮动菜单
         *
         */
        globalCloseOverflowList() {
            document.body.addEventListener('click', (e) => {
                if (this.$refs.overflowCloseButton && e.target.className === this.$refs.overflowCloseButton[0].className) {
                    return;
                }

                this.isOverflowListShow = false;
            });
        },

        /**
         * path 是否在 VisibleList
         *
         * @param {String} tabPath
         * @return {Boolean}
         */
        isInVisibleList(tabPath) {
            const targetTab = this.tabVisibleList.find((tab) => tab.path === tabPath);
            // eslint-disable-next-line no-unneeded-ternary
            return targetTab ? true : false;
        },

        /**
         * 获取 tab 在 tabList 中 index
         *
         * @param {String} tabPath
         * @return {Boolean}
         */
        getIndexFromTabList(tabPath) {
            return this.tabList.findIndex((tab) => tab.path === tabPath);
        },

        /**
         * 视口变化时 重新计算tab最大数量
         */
        setWindowResize() {
            const resizeFn = () => {
                this.resizeTabWrap();
                // 重新切割tab可视范围
                this.shuntTabVisibleList();
                // 设置当前激活页签在可视范围
                this.reShuntTabVisibleList(this.getActiveTab.path);
                this.resizeOverflowList();
            };

            window.onresize = _fn.throttle(resizeFn, 20);
            // 挂载到 window 供左侧菜单展开式 重新计算 tab 位置
            window.xPartnerTabResizeTrigger = resizeFn;
        },

        /**
         * 如果 session 中存在上次浏览 tab 则恢复
         */
        restoreSessionTabList() {
            if (!this.isSessionRestored) {
                window.xPartnerTabController.restoreSessionTabList();
                this.isSessionRestored = true;
            }
        },
        /**
         *
         *  关闭path外的其它tab
         * @param {*} path
         */
        closeOther(path) {
            window.location.href = path;
            window.xPartnerTabController.closeOther(path);
        },
        /**
         *
         *关闭全部tab
         */
        closeAll() {
            window.xPartnerTabController.closeAll();
        },
        /**
         *
         * 右键tab对象时触发,设置当前的右键tab对象
         * @param {object tab} item
         * @param {object event} event
         */
        setContextMenu(item, event) {
            const { clientX, clientY } = event;
            item.left = `${clientX}px`;
            item.top = `${clientY}px`;
            this.curContextMenu = item;
        },
        /**
         * 点击右键自定义tab功能后触发的代理函数
         * @param {object contextmenu} item
         *
         */
        handleContextMenu(item) {
            if (!item || !this.curContextMenu) {
                return;
            }
            const { func } = item;
            const { path } = this.curContextMenu;

            typeof this[func] === 'function' && this[func](path);
        },
    },
};
export default handle;