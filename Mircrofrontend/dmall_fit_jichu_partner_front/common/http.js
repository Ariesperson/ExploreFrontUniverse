import API, {
    EVT,
} from "./api/apimix";
import apiList from "./api/apilist";

export default {

    post(url, param, hideNotice) {
        return this.ajax("post", url, param, hideNotice);
    },
    get(url, param, hideNotice) {
        return this.ajax("get", url, param, hideNotice);
    },
    postOpen(interfaceCode, params = {}, hideNotice) {
        const headers = {
            userAccountType: "0",
            appTypeEnum: "17",
        };
        headers.interfaceCode = apiList.IFC[interfaceCode];
        return this.ajax(
            "post",
            "openProxy",

            {
                param: JSON.stringify(params),
                headers: JSON.stringify(headers),
            },
            hideNotice,
            headers.interfaceCode,
        );
    },
    downFile(url, params = {}) {
        url = API[url].host + API[url].url;
        const form = document.createElement("form");
        form.action = url;
        form.method = "get";
        // form.target = "downLoadIframe";
        form.target = "_blank";
        form.acceptCharset = "UTF-8";
        form.enctype = "application/x-www-form-urlencoded";
        form.style.height = "0px";
        form.style.width = "0px";
        form.style.display = "none";
        for (const key in params) {
            const input = document.createElement("input");
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    },
    ajax(type = "get", url, param, hideNotice, interfaceCode) {
        return CabinX.ajax({
            baseUrl: API[url].host,
            url: API[url].url + (interfaceCode ? `/${interfaceCode}` : ""),
            params: param,
            withCredentials: true,
            contentType: 'application/x-www-form-urlencoded',
            method: type,
            stringifyOptions: {
                arrayFormat: 'comma',
            },
            reqFilter(data) {
                return data;
            },
            resFilter(res) {
                if (res.code !== "0000" && res.code !== "success") {
                    if (`${res.code}` == "9800") {
                        // 用户未登录
                        const returnUrl = window.location.href;
                        CabinX.go(
                            `${EVT
                            }partner.fit.dmall.com/login?redirectURL=${
                                encodeURIComponent(returnUrl)
                            }#full/dmall_fit_jichu_sso_front/ssologin`,
                        );
                        return;
                    }
                    if (hideNotice) {
                        return res;
                    }
                    // CabinX.notice({
                    //     text: `${res.code}-${res.result || res.message}` ||
                    //         "加载数据失败",
                    //     status: "error"
                    // });
                    return null;
                }
                return res;
            },
        }).catch((e) => {
            // CabinX.notice({
            //     text: "加载数据失败",
            //     status: "error"
            // });
            return null;
        });
    },
};