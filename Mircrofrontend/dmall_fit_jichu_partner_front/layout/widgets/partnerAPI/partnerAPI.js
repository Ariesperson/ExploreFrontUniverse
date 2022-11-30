import Ajax from '@/common/http.js';
import { underlineToHump, addCookie, delCookie } from '@/common/utils.js';

const partnerAPIInstance = Symbol('partnerAPIInstance');

/**
 * PartnerAPI
 * 壳框架相关 API
 */
class PartnerAPI {
    constructor(tabController) {
        // type AuthListItem
        this.authList = null;
        this.menuList = this.getMenuList();
        // 依赖 TabController 实例
        this.tabController = tabController;

        // 初始化获取权限相关数据
        this.initAuthList();

        // 初始化菜单列表数据
        this.initMenuList();
    }

    /**
     * closeTab 关闭页签 tab
     * @param {String} path 包含#的 path 路径
     */
    closeTab(path) {
        this.tabController.closeTab(path);
    }

    /**
     * closeTab 关闭页签 tab
     */
    closeActivatedTab() {
        this.tabController.closeActivatedTab();
    }

    /**
     * refreshTab 刷新当前页签 tab
     */
    refreshTab() {
        const activatedTab = this.tabController.getActivatedTab();

        this.tabController.refreshTab(activatedTab.path);
    }

    /**
     * 获取权限列表相关
     * @return {Promise<AuthListItem[]>}
     */
    async getAuthList() {
        const result = await Ajax.get('getAuthList', {
            deviceType: 1,
        });

        if (result && result.code === '0000' && result.data) {
            return result.data;
        }

        return [];
    }

    /**
     * 获取菜单列表
     * @return {Promise<AuthListItem[]>}
     */
    async getMenuList() {
        const result = await Ajax.get('getMenuData');

        if (result && result.code === '0000' && result.data) {
            return result.data;
        }

        return [];
    }

    /**
     * 初始化权限
     */
    async initAuthList() {
        this.authList = await this.getAuthList();
    }

    async initMenuList() {
        this.menuList = await this.getMenuList();
    }

    /**
     * 权限校验 同步方法提供给 CabinX
     * @param {String} authCode
     * @return {AuthResult}
     */
    authPrivilegeSync(authCode) {
        const result = this.authList.find(({ code }) => code === authCode);
        const authResult = result === undefined
            ? {
                pass: false,
                hasAuth: false,
                result: {},
            }
            : {
                pass: true,
                hasAuth: result.hasAuth,
                result,
            };

        console.groupCollapsed(`🔍 [xPartnerAPI authPrivilege] ${authCode}`);
        console.info('%c result  ', 'color: #2196F3;', authResult);
        console.groupEnd();

        return authResult;
    }

    /**
     * 权限校验 异步守卫校验
     * @param {String} authCode
     * @return {Promise<AuthResult>}
     */
    async authPrivilege(authCode) {
        if (this.authList === null) {
            await this.initAuthList();
        }

        const result = this.authList.find(({ code }) => code === authCode);
        const authResult = result === undefined
            ? {
                pass: false,
                hasAuth: false,
                result: {},
            }
            : {
                pass: true,
                hasAuth: result.hasAuth,
                result,
            };

        console.groupCollapsed(`🔍 [xPartnerAPI authPrivilege] ${authCode}`);
        console.info('%c result  ', 'color: #2196F3;', authResult);
        console.groupEnd();

        return authResult;
    }

    /**
     * 通过 Url 查找 权限 PrivilegeData
     * @param {String} targetUrl
     * @returns {Promise<AuthResult>}
     */
    async getPrivilegeDataByUrl(targetUrl) {
        if (this.authList === null) {
            await this.initAuthList();
        }

        return this.authList.find(({ url }) => url === targetUrl);
    }

    /**
     * 获取全局系统设置
     */
    async getSystemConfig(systemScope = 'tenant_system') {
        const result = await Ajax.get('getSystemConfig');

        /**
         * convertKey
         * @param {String} targetKey
         * @returns {String} 转换后的 key
         */
        const convertKey = (targetKey) => {
            const configKeyMap = {
                [`${systemScope}_date_time_format`]: 'dateTime',
                [`${systemScope}_quantity_format`]: 'quantity',
                [`${systemScope}_cost_format`]: 'unitPrice',
                [`${systemScope}_cost_value_format`]: 'amount',
            };

            const configKey = configKeyMap[targetKey];

            if (configKey) {
                return configKey;
            }

            // 其他没指定的转换 key 去掉 systemScope 转换为 驼峰
            return underlineToHump(targetKey.split('_').slice(2).join('_'));
        };

        // 配置中心返回数据适配CabinX config数据
        const convertValue = (key, value) => {
            // eslint-disable-next-line default-case
            switch (key) {
                case 'dateTime':
                    return { format: value };
                case 'quantity':
                case 'unitPrice':
                case 'amount': {
                    const { accuracy, comma, ...rest } = value || {};

                    return {
                        accuracy,
                        comma,
                        separator: comma === -1 ? '' : ',', // 千分符
                        precision: accuracy, // 精度
                        ...rest,
                    };
                }
            }

            return value;
        };

        if (result && result.code === '0000' && result.data) {
            const systemConfig = Object.keys(result.data).reduce((all, key) => {
                const configKey = convertKey(key);
                const configValue = result.data[key];

                all[configKey] = convertValue(configKey, configValue);
                return all;
            }, {});

            return systemConfig;
        }

        return {};
    }

    /**
     * 获取页面 title
     *
     * @param {string} path 包含 # 的path 如 #index/xware_shelve/publishconfig
     * @return {string}
     * @memberof TabController
     */
    async getPageMenuTitle(path) {
        let pageMenuMap = new Map();

        const getMenuData = async (pagePath) => {
            const menuDataSessionKey = 'xPartner_menuMap';
            // 存储 sessionMenuData 只转换一次
            if (pageMenuMap.size === 0) {
                const sessionMenuData = await CabinX.storageGet({ key: menuDataSessionKey }, 'session');

                pageMenuMap = sessionMenuData !== null
                    ? new Map(Object.entries(JSON.parse(sessionMenuData)))
                    : new Map();
            }

            return pageMenuMap.get(pagePath) ? pageMenuMap.get(pagePath) : null;
        };

        const result = await getMenuData(path);

        console.groupCollapsed(`🔍 [xPartnerAPI getMenuPageTitle] ${path}`);
        console.info('%c menuMap  ', 'color: #2196F3;', pageMenuMap);
        console.info('%c result  ', 'color: #2196F3;', result);
        console.groupEnd();

        return result ? result.name : null;
    }

    /**
     *
     *
     * @param {string} hash  能在左侧菜单里找到的末级hash
     * @memberof PartnerAPI
     */
    async setTrackModules(hash) {
        // 清除原来的异常cookie
        delCookie('track_log_data', '', 'dmall.com');
        try {
            // 获取菜单数据源
            const list = await this.menuList;
            // 校验地址是否是有效
            const validUrl = (url) => {
                if (typeof url !== "string") {
                    return;
                }
                const reg = /^#\w+(\/[\w-]+){2}/;
                return reg.test(url.trim());
            };

            // 递归形成module的内部函数
            const findMenu = (list, hash) => {
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    const { router } = item;

                    if (item.children && item.children.length) {
                        const find = findMenu(item.children, hash);

                        if (find) {
                            find.unshift(item);
                            return find;
                        }
                    } else if (validUrl(router) && router.trim() == hash) {
                        return [item];
                    }
                }
            };

            const findTargetMenu = (targetObj) => {
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

                recurFunc(list);

                return resultObj;
            };

            let moduleDataArr = null;
            let module = null;
            const findResult = findMenu(list, hash);

            // 在菜单中能直接找到该hash的关系树
            if (findResult) {
                moduleDataArr = [...findResult];
            } else {
            // 在菜单中没有直接找到关系树,先去权限树里匹配该hash在菜单中对应的末级hash,再找关系树
                if (hash.indexOf(':') > -1) {
                    hash = hash.split(':')[0];
                }

                const targetObj = await this.getPrivilegeDataByUrl(hash);
                const resultMenu = findTargetMenu(targetObj);
                if (resultMenu) {
                // 如果在权限树中找到了对应末级菜单,用该菜单的hash去查关系树
                    moduleDataArr = findMenu(list, resultMenu.router);
                } else {
                    // 如果在权限树里也没找到,用前一个页面的hash再去找
                    const preHash = `#${kayak.router.prevPath}`;
                    const FindPreResult = findMenu(list, preHash);

                    // 如果在前一个hash匹配到末级菜单了
                    if (FindPreResult) {
                        moduleDataArr = [...FindPreResult];
                    }
                }
            }

            if (!moduleDataArr) {
            // 如果两种方法都没找到对应埋点数据，就给默认值
                module = [{
                    k: -1,
                    n: '飞拓商户平台-pc',
                    p: -1,
                    l: -1,
                    r: -1,
                }];
            } else {
                module = moduleDataArr.map((item, index) => {
                    return {
                        k: item.id,
                        n: item.name,
                        p: item.pid || -1,
                        l: index + 1,
                    };
                });
            }

            addCookie('track_log_data', JSON.stringify({ module }));
        } catch (error) {
            console.log('setTrackModules'.error);
        }
    }

    /**
     * 返回 PartnerAPI 单例
     *
     * @static
     * @return {PartnerAPI}
     * @memberof PartnerAPI
     */
    static getInstance(tabController) {
        if (!this[partnerAPIInstance]) {
            this[partnerAPIInstance] = new PartnerAPI(tabController);
        }
        return this[partnerAPIInstance];
    }
}

export default PartnerAPI;
