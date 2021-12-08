const getup_config = require("../config/xf_config.js");
const qs = require('querystring');

let wechat={

/*
 * 1. 微信授权登录，可直接从浏览器访问，为了方便测试自动拼接下url，暂时没用
 * @returns
 */
getWxAuthUrl:function () {
	let reqUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?';
	let params = {
	    appid: getup_config.appid,
	    redirect_uri: getup_config.redirect_uri,
	    response_type: 'code',
	    scope: 'snsapi_userinfo',
	    state:'123'
	};
	reqUrl = reqUrl + qs.stringify(params) + '#wechat_redirect';
	//console.log("wx auth url: " + reqUrl);
	return reqUrl;
},

/*
 * 2. 使用code去交换access_token
 * @param code
 * @returns
 */
getAccessTokenUrl:function (code) {
	let reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
	let params = {
	    appid: getup_config.appid,
		secret: getup_config.secret,
		code: code,
		grant_type: 'authorization_code'
	};
	let options = {
	    method: 'get',
	    url: reqUrl + qs.stringify(params)
	};
	return options;
},

/*
 * 3. 利用access_token去获取userInfo
 * @param AccessToken
 * @param openId
 * @returns
 */
getUserinfoUrl:function (accessToken, openId) {
	  let reqUrl = 'https://api.weixin.qq.com/sns/userinfo?';
	  let params = {
	      access_token: accessToken,
	      openid: openId,
	      lang: 'zh_CN'
	  };
	  let options = {
		  method: 'get',
		  url: reqUrl + qs.stringify(params)
	  };
	  return options;
}
}
module.exports = wechat;
