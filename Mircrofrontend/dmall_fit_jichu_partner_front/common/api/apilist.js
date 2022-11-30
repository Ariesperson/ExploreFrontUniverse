export default {
    apiTenant: {
        getUserInfo: "/jichu/ryqx/sso/get/user", // 获取用户信息
        getMenuData: '/jichu/ryqx/perm/portal/getLoginUserMenu', // 获取菜单数据
        getNoticeInfo: '/jichu/xiaoxi/msg/notification/getWebList', // 获取公告中心数据
        getMsg: '/jichu/xiaoxi/msg/web/getMsg', // 消息中心列表数据
        updatePassword: '/jichu/ryqx/sso/update/password', // 个人中心修改密码
        fetchCollection: '/app/nessau/partner/v2/listBookMark', // 查看我的收藏接口
        saveCollection: '/app/nessau/partner/v2/saveBookMark', // 收藏接口
        markReadMsg: '/jichu/xiaoxi/msg/web/markReadMsg', // 批量读消息
        getAuthList: 'jichu/ryqx/perm/component/getLoginUserPermissionList', // 获取人员权限信息
        getInitConfig: '/jichu/xtpz/common/getInitConfig', // 获取商家基础配置情况
        getSystemConfig: '/jichu/xtpz/common/getInitConfig', // 获取系统基础配置
        getSimpleTask: '/jichu/gzl/cardworkbeach/getSimpleTask', // 获取通知中心任务列表数据
    },
};
