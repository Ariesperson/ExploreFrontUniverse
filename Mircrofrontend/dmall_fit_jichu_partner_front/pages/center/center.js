import settingComp from "./components/settingComp/settingComp";

const COOKIE = require("cabincore/common/cookie/cookie");

const partner_style_size = COOKIE.get("partner_style_size") || "normal";

export default XPage({
    components: { "setting-comp": settingComp },
    data: {
    },
    show() {
        this.setTitle('设置');
    },
    confirm() {
        const data = this.getComponent("setting").getData();
        for (const key in data) {
            COOKIE.add(key, data[key]);
        }
        this.back();
        if (partner_style_size !== data.partner_style_size) {
            location.reload();
        }
        CabinX.notice({
            text: "设置成功",
            status: "success",
        });
    },
    back() {
        kayak.router.go(-1);
    },
});
