// 跳转官网
export default function getPublishLink() {
    const host = window.location.host;

    if (host.includes('test') || host.includes('rd')) {
        window.open('https://testapppublish.fit.dmall.com/');
        return;
    }
    window.open('https://apppublish.fit.dmall.com/');
}