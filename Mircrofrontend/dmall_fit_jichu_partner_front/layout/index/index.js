import Layout from 'cabincore/layout/layout';

// 本地
import menu from '../widgets/flatMenu/menu';
// import menu from '../widgets/menu/menu';

import header from '@/layout/widgets/header/header';
import tab from '@/layout/widgets/tab/tab';
import '@/layout/index/index.scss';

// 来客(注意访问需要使用80端口(修改cabinconfig.js中devServer.port)，否则要报跨域错误)
// import menu from 'partner/modules/menu/menu';
// import header from 'partner/modules/header/header';

export default Layout({
    name: 'cabinindex',
    tpl: 'dmall_fit_jichu_partner_front/layout/index/index.tpl',
    widgets: {
        menu,
        header,
        tab,
    },
});
