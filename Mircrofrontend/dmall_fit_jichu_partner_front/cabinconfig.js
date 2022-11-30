module.exports = {
    devServer: {
        port: 80,
        httpsPort: 443,
    },
    buildConfig: {
        target: ['cabinx'],
        mobileAppDest: null,
        entryHtml: 'https://testlocal.fit.dmall.com/kayak-project/dmall_fit_jichu_partner_front/html/index.html',
        routerHashTemplate: 'index/{project}/{page}',
    },
};
