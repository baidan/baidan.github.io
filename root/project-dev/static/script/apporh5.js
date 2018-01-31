var domain = window.location.protocol + '//' + window.location.hostname;
var search = window.location.search;
var useragent = navigator.userAgent;
window.isAPP = false;

if (useragent.indexOf('ios_h5_zjcap') > -1 || search.indexOf('ios_h5_zjcap') > -1) {
    window.isIOS = true;
    window.isAPP = true;

    // true IOS8+ false IOS7
    window.WKWebView = getQueryString('WKWebView');
} else {
    window.isIOS = false;
}

if (useragent.indexOf('android_h5_zjcap') > -1 || search.indexOf('android_h5_zjcap') > -1 || useragent.indexOf('android') > -1 || search.indexOf('android') > -1) {
    window.isAndroid = true;
    window.isAPP = true;
} else {
    window.isAndroid = false;
}
//window.isIOS = true;
//window.isAPP = true;
// C.degLog('domain', domain);
// C.degLog('search', search);
// C.degLog('useragent', useragent);
// C.degLog('isAPP', window.isAPP);
// C.degLog('WKWebView', window.WKWebView);
// C.degLog('isIOS', window.isIOS);
// C.degLog('isAndroid', window.isAndroid);


if (search.indexOf('accessToken') != -1) {
    var at = search.match(/^\?(?:[\w&=]*)(accessToken=([0-9a-zA-Z]+))/);
    window.accessToken = at && at[2];
    if (isAPP && accessToken) {
        localStorage.isAccessToken = accessToken;
        loginH5(accessToken);
    }
}

//APP回调H5
/**
 * type 交互事件，1请求登录 2购买产品 3个人中心 4我的奖励 5跳APP首页 6APP打开H5页面 7产品列表 8APP分享 9获取accessToken 10调用系统拨号
 * parameter = {
 *   url: url, //当前url
 *   data: data //没有数据传null
 * }
 */
function APPCallH5(type, parameter) {
    if (typeof parameter == 'string') {
        parameter = JSON.parse(parameter);
    }

    if (type == 1) {
        localStorage.isAccessToken = parameter.accessToken;
        loginH5(parameter.accessToken, true);
    } else if (type == 9) {
        if (parameter && parameter.accessToken) {
            localStorage.isAccessToken = parameter.accessToken;
            loginH5(parameter.accessToken);
        } else {
            logoutH5();
        }
    }
}

//H5调APP
//type类型和parameter，parameter必须包含url
//H5CallAPP(type, parameter);

/**
 * H5CallAPP 封装H5调APP函数
 * @param  type 交互事件类型，目前[1-10]，参考上面
 * @param  data json格式
 * @param  url  微站相关页面url

 WKwebView
 */
function CallH5ToAPP(type, data, url, callback) {
    if (isAPP) {
        //调APP方法，事件类型
        var parameter = {};
        parameter.url = window.location.href;
        parameter.data = null;

        if (data) {
            parameter.data = data;
        }

        if (isIOS) {
            if (window.WKWebView == '1') {
                // ios8+
                window.webkit.messageHandlers.H5CallAPP.postMessage(JSON.stringify({
                    'type': type,
                    'parameter': parameter
                }));
            } else {
                // ios7
                native.H5CallAPP(type, JSON.stringify(parameter));
            }
        } else if (isAndroid) {
            AppTool.H5CallAPP(type, JSON.stringify(parameter));
        }
    } else {
        //有回调优先
        if (callback) {
            return callback();
        }

        if (!url) {
            return;
        }

        //调微站相关页面
        window.location.href = domain + url;
    }
}

/**
 * 调用示例1 请求登录
 *
 *  CallH5ToAPP(1, '', '/wechat/login.html');
 */

/**
 * 调用示例2 购买产品，跳转项目详情页
 *
 *  CallH5ToAPP(2, {productSn: sn}, '/wechat/product_detail.html?productSn=sn');
 */

/**
 * 调用示例3 跳转个人中心
 *
 *  CallH5ToAPP(3, '', '/wechat/account.html');
 */

/**
 * 调用示例4 跳转我的奖励
 *
 *  CallH5ToAPP(4, '', '/wechat/award.html?platform=wechat');
 */

/**
 * 调用示例5 跳转首页
 *
 *  CallH5ToAPP(5, '', '/wechat/home.html?platform=wechat');
 */

/**
 * 调用示例6 APP打开H5页面
 *
 *  CallH5ToAPP(6, {url: url}, url);
 *
 */

/**
 * 调用示例7 跳转产品列表
 *
 *  CallH5ToAPP(7, '', '/wechat/home.html?platform=wechat');
 *
 */

/**
 * 调用示例8 调用APP分享
 *
 *  CallH5ToAPP(8, {title: 'title', desc: 'desc', url: 'url', icon: 'img url'});
 *
 */

/**
 * 调用示例9 获取accessToken
 *
 *  CallH5ToAPP(9, '');
 *
 */

/**
 * 调用示例10 调用系统拨号
 *
 *  CallH5ToAPP(10, {phone: '40009508888'});
 *
 */

/**
 * 调用示例11 开启app下拉事件拦截
 *
 *  CallH5ToAPP(11, '');
 *
 */

/**
 * 调用示例12 关闭app下拉事件拦截
 *
 *  CallH5ToAPP(12, '');
 *
 */

/**
 * 调用示例13 风险评估失败调用安卓处理
 *
 *  CallH5ToAPP(13, '');
 *
 */

/**
 * APP已登录，H5登记登录状态
 * @param token //accessToken，APP携带或返回
 */
function loginH5(token, isjump) {
    $.ajax({
        url: domain + '/web/loginforwebapp',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {
            accessToken: token,
            platform: 'wechat'
        },
        success: function (response) {
            if (response.retCode == '0000') {
                window.isLogin = true;
                localStorage.isLogin = true;

                //优先跳转给定的地址
                if (sessionStorage.apptoh5url) {
                    window.location.href = sessionStorage.apptoh5url;
                    return;
                }

                //APP登录界面是盖在上面的，要手动刷新
                if (isjump) {
                    window.location.href = window.location.href;
                }
            }
        },
        error: function (response) {
            alert('loginforwebapp error');
            //CallH5ToAPP(1, '', '/wechat/login.html');
        }
    })
}

/**
 * [logoutH5 退出登录]
 */
function logoutH5() {
    $.ajax({
        url: domain + '/web/quickloginout',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {
            platform: 'wechat'
        },
        success: function (response) {
            if (response.retCode == '0000') {
                window.isLogin = false;
                localStorage.isLogin = false;
            }
        },
        error: function (response) {
            alert('quickloginout error');
        }
    })
}

/**
 * 获取URL参数
 * @param name //要获取的参数名
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        if (r[2].indexOf("%u") < 0) {
            r[2] = decodeURIComponent(r[2]).replace(/\\/g, "%");
        }
        return xssEscape(unescape(r[2]));
    }
    return null;
}

function xssEscape(content) {
    return typeof content === 'string' ?
        content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
            return {
                "<": "&#60;",
                ">": "&#62;",
                '"': "&#34;",
                "'": "&#39;",
                "&": "&#38;"
            }[s];
        }) :
        content;
}