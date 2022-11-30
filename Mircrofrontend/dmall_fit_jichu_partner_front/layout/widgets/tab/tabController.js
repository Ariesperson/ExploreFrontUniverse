import generateMD5 from '@/common/md5.js';

/**
 * TabController
 * 来客 Tab 页签 controller
 */

const tabControllerInstance = Symbol('tabControllerInstance');

// interface Tab {
//     name: string // tab 标题
//     path: string
//     isActived: boolean
//     container: string
//     pathData: PathData
// }
class TabController {
    constructor() {
        this.containerWrapName = '.J_containers';
        this.presetContainerName = '.J_presetContainer';
        this.partnerIndexPath = '#index/dmall_fit_jichu_partner_front/homepage';
        this.partnerIndexContainer = '.J_partnerIndex';
        this.partnerHost = 'partner.dmall.com';
        this.tabList = [];
        this.defaultTabName = 'DMALL FIT';
        this.maxTabCount = 31;
        // 菜单页面相关 Map 主要用于获取 title
        this.pageMenuMap = new Map();
        this.tabListSessionKey = 'xPartnerOpenedTabList';
        this.menuDataSessionKey = 'xPartner_menuMap';
    }

    /**
     * 激活 tab - 打开新 tab 从菜单等打开
     * interface PageData {
     *      path: string // 包含 #
     *      name: string
     * }
     * @param {PageData} pageData
     * @memberof TabController
     */
    activeTab(pageData) {
        const { path, name = '' } = pageData;
        const currentUrl = window.location.href.split('#')[0];

        // path 不存在 return
        if (!path) {
            return;
        }

        // 判断 是否为 hash path，如果为整体 url 直接执行打开浏览器新页签
        if (path.slice(0, 1) !== '#') {
            window.open(path, '_blank');
            return;
        }

        // 路径为全屏无框架打开，则打开新浏览器 tab
        if (this.isFullPage(path)) {
            window.open(`${currentUrl}${path}`, '_blank');
            return;
        }

        // // 判断 是否为 path 带参数，先降级切换为 full 新页面打开
        // // #index/insightds/view:reportid=44140338-1ecb-4f78-8ee9-cc6fad8b3ff6
        // if (path.indexOf(':') !== -1) {
        //     const newPath = path.replace('index/', 'full/')
        //     window.open(`${window.kayak.EVT}partner.dmall.com/${newPath}`, '_blank');
        //     return;
        // }
        console.info('kayak.router.currentActions', kayak.router.currentActions);
        // 新打开 tab 时，超出 30 个，不为首页，拦截
        const targetTab = this.getTab(path);
        if (!targetTab && this.tabList.length >= this.maxTabCount && path !== this.partnerIndexPath) {
            console.info('kayak.router.currentActions', kayak.router.currentActions);
            this.alertTabCountTips();
            return;
        }

        // 触发 hash change 执行 index.html kayak router preJump->parseActions... 完整生命周期
        kayak.router.go(path);

        // 移除部分特殊异常破坏性页面
        this.removeUniqueExceptionLayer();
    }

    /**
     * 激活 tab - 已存在 tab 切换激活状态
     *
     * @param {string} hashPath
     * @param {ActiveOptions} options
     * @memberof TabController
     */
    pureActiveTab(hashPath, options = {}) {
        const currentTab = this.getActivatedTab() || {};
        const targetTab = this.getTab(hashPath);

        // 阻断重复激活当前 tab
        if (currentTab.path === targetTab.path) {
            return;
        }

        this.hideAllContainers();
        this.showContainer(targetTab);

        console.groupCollapsed(`🔃 [PartnerTab] pureActiveTab @ ${new Date().toLocaleTimeString()}.${new Date().getMilliseconds()}`);
        console.info('%c currentTab  ', 'color: #2196F3;', currentTab.name, currentTab.path, currentTab);
        console.info('%c targetTab   ', 'color: #2196F3;', targetTab.name, targetTab.path, targetTab);
        console.groupEnd();

        // CabinX Page deactivated 当前 tab，适配双线程 @罗东
        currentTab.pathData
            && currentTab.pathData.action
            && typeof currentTab.pathData.action.deactivated === 'function'
            && currentTab.pathData.action.deactivated({
                actionOrigin: options.actionOrigin || 'router',
            });

        // 触发 hash change 执行 index.html kayak router preJump->parseActions... 完整生命周期
        // 修改 hash 是为了对齐 url 显示方式，方便用户复制当前页面
        // parseActions 内部会拦截已经存在的tab 容器重复执行，保证纯粹的样式切换
        window.location.hash = hashPath;

        // 重新计算 tab visibleList from widgets/tab/tab.js
        window.xPartnerTabReShuntTabVisibleList(hashPath);

        // CabinX Page activated 目标 tab，适配双线程 @罗东
        targetTab.pathData
            && targetTab.pathData.action
            && typeof targetTab.pathData.action.activated === 'function'
            && targetTab.pathData.action.activated({
                actionOrigin: options.actionOrigin || 'router',
            });

        // 移除部分特殊异常破坏性页面
        this.removeUniqueExceptionLayer();
    }

    /**
     * 通过解析 pathData 来获取挂载 container
     * @param {} pathData
     * @returns
     */
    getContainer(pathData) {
        // 因 parseAction 会将 #index/x_partner/homepage 每一级解析一次，这里只执行最后一次创建 Container
        // 目前发现还有会 4 级，#index/wms_bofc/outbound/list
        if (pathData.path !== pathData.fullPath) {
            return;
        }

        console.groupCollapsed(`⏹ [PartnerTab] getContainer @ ${new Date().toLocaleTimeString()}.${new Date().getMilliseconds()}`);
        console.info('%c pathData  ', 'color: #2196F3;', pathData);
        console.groupEnd();

        // container 外部包裹容器元素
        const containerWrapEle = document.querySelector(this.containerWrapName);

        // 根据 container 组容器是否存在判断，是否为页面首次进入
        if (!containerWrapEle) {
            this.setPresetContainer(pathData);
            // 首次进入返回预设 container
            return this.presetContainerName;
        }

        let targetTab = this.getTab(`#${pathData.path}`);
        console.info('kayak.router.currentActions', kayak.router.currentActions);

        // 不存在则创建 tab 和 container
        if (!targetTab) {
            // 创建 tab 时 走 hash change 时 绕过 activeTab 超过 30个，不为首页的也进行拦截
            if (this.tabList.length >= this.maxTabCount && `#${pathData.path}` !== this.partnerIndexPath) {
                // 如果打开失败，把路由还原到前一个，解决打开失败后，路由变化，导致再次打开不成功
                window.location.href = window.kayak.router.prevUrl;
                console.info('kayak.router.currentActions没打开', kayak.router.currentActions);
                this.alertTabCountTips();
                return;
            }
            // 创建 tab 并返回 tab 对应 containerName
            targetTab = this.createTab(pathData);
        } else {
            // tab 存在时 确保下 PathData 存在
            this.ensurePathDataExist(targetTab, pathData);
        }

        // 切换显示为 对应 container
        this.hideAllContainers();
        this.showContainer(targetTab);

        // 重新计算 tab visibleList from widgets/tab/tab.js
        window.xPartnerTabReShuntTabVisibleList(`#${pathData.path}`);

        return targetTab.container;
    }

    /**
     *
     *
     * @param {*} path
     * @memberof TabController
     */
    createTab(pathData) {
        const { path } = pathData;
        const tabContainerName = this.createContainer(pathData);

        const tab = {
            name: this.getPageTitle(`#${path}`),
            path: `#${path}`,
            isActived: true,
            container: tabContainerName,
            pathData,
        };
        this.setTabTitleChange(tab, pathData);
        this.tabList.push(tab);

        return tab;
    }

    /**
     * 刷新 Tab
     *
     * @param {string} path
     * @memberof TabController
     */
    refreshTab(path) {
        if (!path) {
            return;
        }

        const targetTab = this.getTab(path);
        console.info('🔧 [PartnerTab] refreshTab', targetTab);

        // 刷新时重置 tab 内无权限遮罩
        this.removeTabNoPermission(path);
        // kayak.router.replace(path);
        targetTab.pathData && targetTab.pathData.action && targetTab.pathData.action.exit();
        // debugger
        targetTab.pathData && targetTab.pathData.action && targetTab.pathData.action.enter();
    }

    /**
     * 关闭 Tab
     * @param {boolean} shouldActivePrev //是否激活前一个tab
     * @param {string} path
     * @memberof TabController
     */
    closeTab(path, shouldActivePrev = true) {
        const targetTab = this.getTab(path);

        if (!targetTab) {
            console.info(`🔧 [PartnerTab] closeTab: path not found in TabList -> ${path} `);
            return;
        }

        console.info('🔧 [PartnerTab] closeTab', targetTab);

        // 移除 tab
        const tabIndex = this.tabList.findIndex((tab) => tab.path === targetTab.path);
        this.tabList.splice(tabIndex, 1);

        this.removeContainer(targetTab.container);
        targetTab.pathData && targetTab.pathData.action && targetTab.pathData.action.exit();

        if (targetTab.isActived && shouldActivePrev) {
            // 激活前一个 tab
            this.pureActiveTab(this.tabList[tabIndex - 1].path);
        }

        // 移除部分特殊异常破坏性页面
        this.removeUniqueExceptionLayer();
    }

    /**
     *
     * 替换对应tab
     *
     * @param {string} path
     * @param {string} options 通过cabinx透传 https://testcabinx.dmall.com/cross.html#index/cabinxcli_doc/api/details/go , options为arg2
     * @memberof TabController
     */
    replaceTab(path, options) {
        const currentTab = this.getActivatedTab() || {};

        if (!path || path === currentTab.path) {
            return;
        }

        this.closeTab(currentTab.path, false);
        CabinX.go(path, options);
    }

    /**
     * 关闭其它tab
     * @param {*} path
     * @memberof TabController
     */
    closeOther(path) {
        const targetTabs = this.tabList.filter((tab) => tab.path !== path && tab.path !== this.partnerIndexPath);
        targetTabs.forEach((tab) => {
            this.closeTab(tab.path, false);
        });
    }

    /**
     *
     *  关闭所有tab
     * @memberof TabController
     */
    closeAll() {
        const targetTabs = this.tabList.filter((tab) => tab.path !== this.partnerIndexPath);
        targetTabs.forEach((tab) => {
            this.closeTab(tab.path);
        });
    }

    /**
     * 关闭 当前激活 Tab
     *
     * @memberof TabController
     */
    closeActivatedTab() {
        const activatedTab = this.getActivatedTab();

        if (!activatedTab || activatedTab.path === this.partnerIndexPath) {
            return;
        }
        this.closeTab(activatedTab.path);
    }

    /**
     * 根据 path 获取 tab
     *
     * @param {string} path #
     * @return {Tab}
     * @memberof TabController
     */
    getTab(path) {
        return this.tabList.find((tab) => tab.path === path);
    }

    /**
     * 获取当前 激活 Activated 的 tab
     *
     * @return {Tab}
     * @memberof TabController
     */
    getActivatedTab() {
        return this.tabList.find((tab) => tab.isActived === true);
    }

    /**
     *
     * @param {*} path
     */
    // getTabFromTabList(path) {}

    setPresetContainer(pathData) {
        const { path } = pathData;

        // 首次加载页面如果非首页 添加首页
        if (`#${path}` !== this.partnerIndexPath) {
            // 添加的 首页 tab 占位并非真正加载，缺少 pathData 需要加载时通过 ensurePathDataExist 来确保 pathData 存在
            this.tabList.push({
                name: '首页',
                path: this.partnerIndexPath,
                isActived: false,
                container: this.partnerIndexContainer,
            });
        }

        const presetTab = {
            name: this.getPageTitle(`#${path}`),
            path: `#${path}`,
            isActived: true,
            container: this.presetContainerName,
            pathData,
        };

        this.setTabTitleChange(presetTab, pathData);
        this.tabList.push(presetTab);
    }

    /**
     * 创建 container
     *
     * @param {*} pathData
     * @return {*}
     * @memberof TabController
     */
    createContainer(pathData) {
        // path 不包含 #
        const { path, action } = pathData;
        const containerName = `J_${generateMD5(path)}`;
        this.appendContainerDom(containerName);

        return `.${containerName}`;
    }

    /**
     * append container DOM 节点
     *
     * @param {String} containerName
     * @memberof TabController
     */
    appendContainerDom(containerName) {
        // container 外部包裹容器元素
        const containerWrapEle = document.querySelector(this.containerWrapName);
        const containerEle = document.createElement('div');

        containerEle.setAttribute('class', `${containerName} tab-container`);
        containerWrapEle.appendChild(containerEle);
    }

    removeContainer(containerName) {
        document.querySelector(containerName).remove();
    }

    /**
     * 显示 Container
     *
     * @param {string} name
     * @memberof TabController
     */
    showContainer(tab) {
        tab.isActived = true;
        document.querySelector(tab.container).style.display = '';
    }

    /**
     * 隐藏全部 Containers
     *
     * @memberof TabController
     */
    hideAllContainers() {
        this.tabList.forEach((tab) => {
            tab.isActived = false;
            document.querySelector(tab.container).setAttribute('style', 'display:none');
        });
        document.querySelector(this.partnerIndexContainer).setAttribute('style', 'display:none');
    }

    /**
     * 从 session 恢复 TabList
     *
     * @memberof TabController
     */
    restoreSessionTabList() {
        const sessionTabListData = sessionStorage.getItem(this.tabListSessionKey);
        const sessionTabList = sessionTabListData !== null ? JSON.parse(sessionTabListData) : [];

        if (sessionTabList && sessionTabList.length > 0) {
            // 重新刷新页面时 Tab 已经存在 index 和 当前 Hash 的 preset Tab
            const presetTab = this.tabList.length > 1 ? this.tabList[1] : this.tabList[0];

            sessionTabList.forEach((tab) => {
                // sessionTabList 中 tab 激活样式重置
                tab.isActived = false;

                // 首页 Tab 使用预设，忽略 session
                if (tab.path === this.partnerIndexPath) {
                    return;
                }
                // session 中 当前Hash 忽略，移动当前 Hash Preset Tab 到该处
                if (tab.path === presetTab.path) {
                    this.tabList.splice(1, 1);
                    this.tabList.push(presetTab);
                    // 激活刷新页面后 当前 Hash 对应 preset tab
                    tab.isActived = true;
                    return;
                }
                // 修复任何使用 preset Class 的 container 为创建 ClassName
                if (tab.container === '.J_presetContainer') {
                    const tabPath = tab.path.split('#')[1];
                    tab.container = `.J_${generateMD5(tabPath)}`;
                }
                // Name 去掉 .
                const containerName = tab.container.split('.')[1];
                this.tabList.push(tab);
                this.appendContainerDom(containerName);
            });
        }
    }

    /**
     * 保存当前 this.tabList 到 sessionStorage
     *
     * @memberof TabController
     */
    saveTabListToSession() {
        const sessionTabList = this.tabList.reduce((all, cur) => {
            const tab = {
                name: cur.name,
                path: cur.path,
                isActived: cur.isActived,
                container: cur.container,
            };
            all.push(tab);

            return all;
        }, []);

        if (typeof sessionStorage !== 'undefined') {
            const sessionTabListData = JSON.stringify(sessionTabList);

            sessionStorage.setItem(this.tabListSessionKey, sessionTabListData);
            console.info(`🔧 [PartnerTab] save tabList to session`);
        }
    }

    /**
     * 清除 sessionStorage 中 tabList
     *
     * @memberof TabController
     */
    clearSessionTabList() {
        sessionStorage.removeItem(this.tabListSessionKey);
    }

    /**
     * 确保 Tab 实例上对应的 pathData 存在
     * 主要用于检查 preset 的首页和其他预设 tab
     *
     * @param {*} tab
     * @memberof TabController
     */
    ensurePathDataExist(tab, pathData) {
        if (!tab.pathData) {
            tab.pathData = pathData;
        }
    }

    /**
     * 获取页面 title
     *
     * @param {string} path 包含 # 的path 如 #index/xware_shelve/publishconfig
     * @return {string}
     * @memberof TabController
     */
    getPageTitle(path) {
        if (path === this.partnerIndexPath) {
            return '首页';
        }

        return this.getMenuData(path) ? this.getMenuData(path).name : this.defaultTabName;
    }

    /**
     * 移除 #index/biz_supervisor_frontend/abnormallist 等页面造成的异常破坏性 404 浮层
     *
     * @memberof TabController
     */
    removeUniqueExceptionLayer() {
        const uniqueExceptionLayerEle = document.querySelector('div[data-id=partner404]');
        if (uniqueExceptionLayerEle) {
            uniqueExceptionLayerEle.remove();
        }
    }

    /**
     * 设置 tab 无权限遮罩
     * @param {string} path 包含 # 的path 如 #index/xware_shelve/publishconfig
     */
    setTabNoPermission(path) {
        const tab = this.getTab(path);
        document.querySelector(tab.container).innerHTML = '<div class="J_tabAuthWrapper tab-container__auth-wrapper"><div class="tab-container__auth-wrapper__box"><div class="tab-container__auth-wrapper__box__text">对不起 , 您还没有权限 !</div></div></div>';
    }

    /**
     * 移除 tab 无权限遮罩
     * @param {string} path 包含 # 的path 如 #index/xware_shelve/publishconfig
     */
    removeTabNoPermission(path) {
        const tab = this.getTab(path);

        const tabAuthWrapperEle = document.querySelector(`${tab.container} .J_tabAuthWrapper`);
        if (tabAuthWrapperEle) {
            tabAuthWrapperEle.remove();
        }
    }

    /**
     * 是否为 无框架页面 #full/xxxx/xxxx
     *
     * @param {String} path
     * @return {Boolean}
     * @memberof TabController
     */
    isFullPage(path) {
        return path.indexOf('full/') !== -1;
    }

    /**
     * 超出最大 tab 后提示
     *
     * @memberof TabController
     */
    alertTabCountTips() {
        CabinX.alert({
            title: '提示',
            text: `您打开的菜单已超过${this.maxTabCount - 1}个，请先关闭部分模块后再打开新菜单。`,
            wrapperClosable: false,
        }, () => {});
    }

    /**
     * 设置 容器实例 action 内 setTitle 时触发事件监听
     *
     * @param {Tab} tab
     * @param {Action} pathData
     * @memberof TabController
     */
    setTabTitleChange(tab, pathData) {
        pathData.actionOptions.onBeforeTitleChange = (title) => {
            console.info('🔧 [PartnerTab] beforePageTitleChange ', title);
            if (typeof title !== 'undefined' && title !== null) {
                // tab name 是预设时才使用页面 setTitle
                tab.name = title;
            }
            return false;
        };
    }

    /**
     * 从全局 Menu Session Data 中获取 Menu 数据
     * @param {String} path 包含 #号 path
     * @returns {Record<String, MenuDataItem>}
     */
    // Type MenuDataItem = {
    //     children: array,
    //     icon: string,
    //     id: number,
    //     name: string,
    //     orderNum: number,
    //     parent: boolean,
    //     pid: number,
    //     privilegeId: number,
    //     // 路径 "#index/steelyard_page/steelyardManager"
    //     router: string,
    //     sysPrefixSource: string,
    //     // 面包屑路径
    //     breadPath: string,
    // }
    getMenuData(path) {
        // 存储 sessionMenuData 只转换一次
        if (this.pageMenuMap.size === 0) {
            const sessionMenuData = sessionStorage.getItem(this.menuDataSessionKey);

            this.pageMenuMap = sessionMenuData !== null
                ? new Map(Object.entries(JSON.parse(sessionMenuData)))
                : new Map();
        }

        return this.pageMenuMap.get(path) ? this.pageMenuMap.get(path) : null;
    }

    /**
     * 返回 TabController 单例
     *
     * @static
     * @return {TabController}
     * @memberof TabController
     */
    static getInstance() {
        if (!this[tabControllerInstance]) {
            this[tabControllerInstance] = new TabController();
        }
        return this[tabControllerInstance];
    }
}

export default TabController;
