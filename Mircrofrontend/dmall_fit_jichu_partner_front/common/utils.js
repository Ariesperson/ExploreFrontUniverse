/* eslint-disable */


export const formatDate = function (date, fmt) {
    if (!fmt) {
        fmt = 'yyyy-MM-dd HH:mm:ss';
    }

    if (typeof date === "string") {
        var mts = date.match(/(\/Date\((\d+)\)\/)/);
        if (mts && mts.length >= 3) {
            date = parseInt(mts[2]);
        }
    }
    date = new Date(date);
    if (!date || date.toUTCString() == "Invalid Date") {
        return "";
    }

    var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "H+": date.getHours(),                   //小时
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


export const getUserLocal = function(userId){
    if(!userId){
        console.error('userId不能为空')
        return 
    }

    let userLocal = JSON.parse(localStorage[`X_partner_${userId}`] || '{}');
    if(!userLocal.recentHistory){
        userLocal.recentHistory = []
    }
    if(!userLocal.searchHistory){
        userLocal.searchHistory = [];
    }
    return userLocal;
}

export const getLocal = function(key){
    return  JSON.parse(localStorage[key] || '{}');
}

export const setUserLocal = function(userId,newObj){
    if(!userId || !newObj){
        console.error('用户ID和newObj不能为空');
        return 
    }
    if(!(newObj instanceof Object)){
        console.error('setUserLocal,传入参数必须为对象')
        return 
    }
    localStorage[`X_partner_${userId}`] = JSON.stringify(newObj);
}

export const stringRepeat = function(str, times) {
    return (new Array(times + 1)).join(str);
} 

export const numberPad = function(num, maxLength){
    stringRepeat('0', maxLength - num.toString().length) + num;
}

export const formatTime = function(time) {
    return `${numberPad(time.getHours(), 2)}:${numberPad(time.getMinutes(), 2)}:${numberPad(time.getSeconds(), 2)}.${numberPad(time.getMilliseconds(), 3)}`;
}

export const underlineToHump = (str) => {
    // eslint-disable-next-line no-useless-escape
    const reg = /\_(\w)/g;
    return str.replace(reg, (all, letter) => {
        return letter.toUpperCase();
    });
};

export const humpToUnderline = (str) => {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};

 //写入
 export const addCookie = (sName, sValue, day, path, domain) =>{

  
    var expireDate = new Date(),
        defaultDay = 30;

    // 微信失效时间为30天，浏览器失效时间为1天
    day = day || defaultDay;
    expireDate.setDate(expireDate.getDate() + day);
    path = path || '/';

    domain = domain || 'fit.dmall.com';

    //设置失效时间
    
    document.cookie = escape(sName) + '=' + escape(sValue) + ';expires=' + expireDate.toGMTString() + ';path=' + path + ';domain=' + domain;
    //escape()汉字转成unicode编码,toGMTString() 把日期对象转成字符串
};


 //删除
 export const delCookie =(a, path, domain)=> {
    var date = new Date(),
        path = path || '/';

    // if (location.host.indexOf('.dmall.com.hk') > 0) {
    //     domain = 'dmall.com.hk';
    // } else if (location.host.indexOf('.dmall.com.cn') > 0) {
    //     domain = 'dmall.com.cn';
    // } else {
    //     domain = location.host.indexOf('.dmall.com') > 0 ? 'dmall.com' : document.domain;
    // }

    domain = domain || currentDomain;

    date.setTime(date.getTime() - 10000);
    document.cookie = a + "=; expires=" + date.toGMTString() + ';path=' + path + ';domain=' + domain;
};
