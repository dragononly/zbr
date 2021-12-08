const getup_config = require("../config/getup_config.js");


function wechat() {
	

async function wx_login(code) {
	//2.1.1 访问拼接出的微信url..., 微信重定向到我们服务器, 
	//2.1.2 用从当前url中取出的code获取access_token，openid
	let accessTokenUrl = getAccessTokenUrl(code);
	let accessTokenResp = await request(accessTokenUrl);
	accessTokenResp = JSON.parse(accessTokenResp.body);
	
	//2.1.3 用access_token获取用户信息
	let userInfoUrl = getUserinfoUrl(accessTokenResp['access_token'], accessTokenResp['openid']);
	let userInfoResp = await request(userInfoUrl);
	userInfoResp = JSON.parse(userInfoResp.body);
	openid = userInfoResp.openid;
//	console.log("userInfoResp " + userInfoResp);
//	console.log("openid " + openid);
	if (!openid || openid=="") {
		console.log(new Date() + ", fail to get openid from wx: " + JSON.stringify(userInfoResp));
		await ctx.render('getup/'+ where, {data: data});
		return 0;
	}
	
	return userInfoResp;
}

/**
 * 1. 微信授权登录，可直接从浏览器访问，为了方便测试自动拼接下url，暂时没用
 * @returns
 */
function getWxAuthUrl() {
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
};

/**
 * 2. 使用code去交换access_token
 * @param code
 * @returns
 */
function getAccessTokenUrl(code) {
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
};

/**
 * 3. 利用access_token去获取userInfo
 * @param AccessToken
 * @param openId
 * @returns
 */
function getUserinfoUrl(accessToken, openId) {
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
};
}
module.exports = wechat;
