import apiList from "./apilist";

function getEvt(withoutProto = false) {
    const href = CabinX.router.currentUrl || location.href;
    const ssl = href.indexOf("https://") > -1;
    let env = "dev";
    if (href.includes("//test") && !href.includes("//test.")) {
        env = "test";
    } else if (href.includes("//dev") && !href.includes("//dev.")) {
        env = "dev";
    } else if (href.includes("//rd-") && !href.includes("//rd-.")) {
        env = "rd-";
    } else {
        env = "";
    }

    if (withoutProto) {
        return env;
    }

    return (ssl ? "https://" : "http://") + env;
}

export const EVT = getEvt();
export const ENV = getEvt(true);

const HostMap = {
    apiTenant: `${EVT}api-tenant.fit.dmall.com`,
};

const _fn = {
    mixUrl(host, url) {
        if (!host || !url || _fn.isEmptyObject(url)) {
            return;
        }
        url.EVT = EVT;
        for (const p in url) {
            if (url[p].indexOf("http") == -1) {
                url[p] = {
                    host,
                    url: url[p],
                };
            }
        }
        return url;
    },
    // 判断是否空对象
    isEmptyObject(obj) {
        // 判断空对象
        if (typeof obj === "object" && !(obj instanceof Array)) {
            let hasProp = false;
            // eslint-disable-next-line no-unreachable-loop
            for (const prop in obj) {
                hasProp = true;
                break;
            }
            if (hasProp) {
                return false;
            }
            return true;
        }
    },
};

// eslint-disable-next-line import/no-mutable-exports
let handle = { EVT, ENV };
// eslint-disable-next-line guard-for-in
// eslint-disable-next-line no-restricted-syntax
for (const i in HostMap) {
    // eslint-disable-next-line no-const-assign
    handle = Object.assign(handle, _fn.mixUrl(HostMap[i], apiList[i]));
}

export default handle;
