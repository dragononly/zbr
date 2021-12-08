const router = require('koa-router')();
const Koa = require('koa');
const app = new Koa();
const getup_user = require("../../mongodb/schema/getup/getup_user.js");
const getup_config = require("../../config/getup_config.js");
const qs = require('querystring');
const request = require('koa2-request');
const moment = require('moment');
const crypto = require('crypto');
// let test=moment().format('YYYY-MM-DD HH:mm:ss')
// console.log(typeof(test))

//20180730 xzb 优化内存读取。增加回调函数的速度
// ---------------------      华丽的分割线：以下为函数         ----------------------------------
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

/**
 * 从获取的微信信息构造完整版个人信息对象? 待续。。。
 * 网络请求放在独立的函数里面，没法调用await，如何保证同步？
 * @returns
 */
function getUserObject(userInfoResp) {
	  //user
};

function getJsApiTokenUrl() {
	let reqUrl = "https://api.weixin.qq.com/cgi-bin/token?";
	let params = {
		grant_type: 'client_credential',
	    appid: getup_config.appid,
		secret: getup_config.secret
	};
	
	let options = {
	    method: 'get',
	    url: reqUrl + qs.stringify(params)
	};
	//console.log("options.url: " + options.url);
	return options;
}

function getJsApiTicketUrl(accessToken) {
	let reqUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" 
		+ accessToken + "&type=jsapi";  
	
//	console.log("reqUrl " + reqUrl);
	return reqUrl;
}

//也可以不这么玩，指定一个固定的，比如定义nonceStr="sb"也可以的
function getNonceStr () {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < 10; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function getSign(jsApiTicket, noncestr, timestamp, url) {
  let data = {
    'jsapi_ticket': jsApiTicket,
    'noncestr': noncestr,
    'timestamp': timestamp,
    'url': 'http://wuyrsp3tma.proxy.qqbrowser.cc/auth'
  };
  var sortData = "jsapi_ticket=" + jsApiTicket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;
  return sha1(sortData);
}

function sha1(str) {
	  var shasum = crypto.createHash("sha1");
	  shasum.update(str);
	  str = shasum.digest("hex");
	  return str;
}

function getPraiseTemplateUrl(token, praiseOpenid, myOpenid, myNickname, todayStr) {
	//推送目标的微信官网接口url
	let reqUrl = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + token;
	//用户点击点赞提醒后跳转到的页面
	//let detailUrl = getWxAuthUrl().url;
	let detailUrl = getup_config.redirect_uri 
		+ "?praiseOpenid=" + praiseOpenid + "&friendOpenid=" + myOpenid + "&friendNickname=" + myNickname + "&todayStr=" + todayStr;
	console.log("detailUrl: " + detailUrl);
	let template = {
		"touser": praiseOpenid,
		"template_id": getup_config.praise_template_id,
		"url": detailUrl,
		"topcolor":"#FF0000",

	    "data":{
	    	"first": {
	    		"value": myNickname + "为你点赞了",
	            "color": "#fa3329"
	        },
	        "keyword1": {
	        	"value": "好友点赞提醒",
                "color": "#173177"
            },
            "keyword2": {
                "value": "你的早起鼓励到了好友哦~",
                "color": "#173177"
            },
            "keyword3": {
                "value": todayStr,
                "color": "#173177"
            }
	    }
	};
	
	let options = {
	    method: 'post',
	    url: reqUrl,
	    body: JSON.stringify(template)
	};
	return options;
}

//----------------   暂时放路由里吧，到时候规范下，放换哪里比较好  ------------------
//每天来一轮
let pushTime = setInterval(pushToUser, 24*60*60*1000);
let timeOutCounter = [];
pushToUser();

//向用户早上推送打卡通知的一天的处理逻辑
async function pushToUser() {
	let timeNow = moment();
	//console.log("init notice time: " + timeNow.format('YYYY-MM-DD HH:mm:ss'));
	
	//0. 实在不知道为何高考那条信息一直在推送，见鬼了。内存中每天初始化时应该不可能有计时器的，每天还是清空一次看看吧
	for (let i=0; i<timeOutCounter.length; i++) {
		clearTimeout(timeOutCounter[i]);
	}
	timeOutCounter = [];
	
	//1. 把数据库里所有的用户的推送时间全部find出来，遍历之
	let noticeTimeArray = await getup_user.find({"openid":{"$ne":""}, "push_morning_notice":true}, 'openid nickname notice_time');
	for(let i=0; i<noticeTimeArray.length; i++) {
		//console.log("i: " + i);
		let openid = noticeTimeArray[i].openid;
		let nickname = noticeTimeArray[i].nickname;
		let notice_time_ori = noticeTimeArray[i].notice_time;
		
		//2. 计算用户下一轮推送时间与当前时间的差值
		let notice_time = moment(notice_time_ori, "HH:mm");
		let diffTime = notice_time - timeNow;
		if (diffTime < 0)
			diffTime = diffTime + 24*60*60*1000;
		//console.log(nickname + ", " + notice_time_ori + ", diff hours to now: " + diffTime/(1000*60*60));
		
		//3. 准备工作已好，开始设置好玩的定时推送早起通知了，只管提前设置就好了，到时候它自己会异步触发一次
		let timeCounter = setTimeout(async function(){
			let tokenUrl = getJsApiTokenUrl();
			let tokenResp = await request(tokenUrl);
			let token = JSON.parse(tokenResp.body).access_token;
			if (!token) {
				console.log("可能是ip又换了，得添加ip白名单, tokenResp: " + JSON.stringify(tokenResp));
			}
			
			let templateUrl = getMorningTemplateUrl(token, openid, nickname, notice_time);
			let templateResp = await request(templateUrl);
			console.log("templateResp: " + JSON.stringify(templateResp));
			console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ": sending message to " + nickname);
		}, diffTime);	
		timeOutCounter.push(timeCounter);
	}
}

//设置早起推送消息的模板
function getMorningTemplateUrl(token, openid, nickname, notice_time) {
	//推送目标的微信官网接口url
	let reqUrl = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + token;
	//用户点击早起的url
	//let detailUrl = getup_config.redirect_uri;  //我本地测试用
	let detailUrl = getWxAuthUrl();
	//console.log("really detailUrl: " + detailUrl);
	let getupMessageArray = getup_config.getupMessageArray;
	let randomIndex = Math.floor(Math.random()*getupMessageArray.length);
	//console.log("message: " + getupMessageArray[randomIndex]);
	let template = {
		"touser": openid,
		"template_id": getup_config.morning_template_id,
		"url": detailUrl,
		"topcolor":"#FF0000",

	    "data":{
	    	"first": {
	    		"value": "亲，美好的一天又开始啦  ~",
	            "color": "#173177"
	        },
	        "keyword1": {
	        	"value": "早起打卡提醒",
                "color": "#173177"
            },
            "keyword2": {
                "value": nickname,
                "color": "#173177"
            },
            "keyword3": {
                "value": "21天早起计划",
                "color": "#173177"
            },
            "remark": {
            	"value": getupMessageArray[randomIndex],
            	"color": "#fa3329"
            }
	    }
	};
	
	let options = {
	    method: 'post',
	    url: reqUrl,
	    body: JSON.stringify(template)
	};
	//console.log("template options: " + options);
	return options;
}








router.get('/getup/:id', async (ctx, next) => {
	let where = ctx.params.id,
	data = ctx.query.data;
    
	switch(where){
		/**
		 * 这个路由做了两件事情：
		 * 1. 第一次登录打卡，需要走微信授权去获取识别当前登录用户的信息
		 * 	  url示例：http://130937f5.nat123.cc:58775/getup/sb?code=001mFsBl0QTxRl1jGFCl0FVeBl0mFsBX&state=123
		 * 2. 被用户点赞接收到消息推送了，要进去瞅瞅，无需再去微信授权，直接查数据库就可以
		 *    url示例：http://192.168.1.4/getup/sb?friendOpenid=oMM4a0458UDA3jGTVIgbifhXv3m0
		 */
		case 'sb': {
			//1. 获取入参
			console.log(moment().format('YYYY-MM-DD HH:mm') + ': reach sb, 打卡或查看点赞...');
			let code = ctx.query.code;
			let state = ctx.query.state;
			let friendOpenid = ctx.query.friendOpenid;
			let friendNickname = ctx.query.friendNickname;
			let openid = ctx.query.praiseOpenid;
			let todayStr = ctx.query.todayStr;
			let currentUserInDB;
			
			//3  获取当天5点之后的打卡记录，也可以是从历史点赞记录中进来的
			if (!todayStr) 
				todayStr = moment().format('YYYY-MM-DD');
            //todayStr = "2018-06-06";
			let startTime = moment(todayStr + " 05:00");
			let endTime = moment(todayStr + " 23:59");
			//如果不转成utc，直接用"2018-4-8 05:00", 不能找出前一天但是在八个小时之类的时间段："2018-4-7 22:00"
			startTime = startTime.utc().format();
			endTime = endTime.utc().format();
			
			//2. 根据不同的入参走不同的路
			//2.1 微信授权登录，获取用户信息
			console.log("1. " + code + ", " + state);
			if (code && state) {
				//2.1.1 拼接微信url..., 重定向到当前路由
				//2.1.2 用从当前url中取出的code获取access_token，openid
				let accessTokenUrl = await getAccessTokenUrl(code);
				let accessTokenResp;
				try{
					accessTokenResp = await request(accessTokenUrl);
					accessTokenResp = JSON.parse(accessTokenResp.body);
				}catch(e){
					console.log('accessTokenResp error' + e);
					console.log(new Date() + ", fail to get accessTokenResp from wx: " + JSON.stringify(accessTokenResp));
					await ctx.render('getup/'+ where, {data: data});
					break;
				}
				try {
					openid = accessTokenResp['openid'];
				}catch(e){
					console.log('openid = accessTokenResp["openid"]' + e);
					return
				}
				
				let access_token = accessTokenResp['access_token'];
				if (!openid || !access_token) {
					console.log(new Date() + ", fail to get openid or access_token from wx: " + JSON.stringify(accessTokenResp));
					await ctx.render('getup/'+ where, {data: data});
					break;
				}
				
				//2.1.3 用access_token获取用户信息
				let userInfoUrl = getUserinfoUrl(access_token, openid);
				let userInfoResp = await request(userInfoUrl);
				userInfoResp = JSON.parse(userInfoResp.body);
//				openid = userInfoResp.openid;
//				console.log("userInfoResp " + userInfoResp);
//				console.log("openid " + openid);
//				if (!openid || openid=="") {
//					console.log(new Date() + ", fail to get openid from wx: " + JSON.stringify(userInfoResp));
//					await ctx.render('getup/'+ where, {data: data});
//					break;
//				}
				let nickname = userInfoResp.nickname;
				console.log(nickname + '在打卡');
				//问题：如何让查找数据库中的已有的信息 和 获取微信授权同时异步执行，同时又能保证两个都完成了才进行接下来的操作呢？  
				
				//2.1.4  处理数据库，判断当前用户是否是第一次登录; 
				//获取我的所有sign_record只是为了得到sign_record.length, 以便显示当前是第几天打卡了, 是否可以优化sql直接查询出length
				//currentUserInDB = await getup_user.find({"openid": openid, "sign_record.sign_time":{"$lte":endTime}}, 'openid nickname headimgurl follow_users sign_record notice_time');	
				currentUserInDB = await getup_user.find({"openid": openid}, 'openid nickname headimgurl follow_users sign_record notice_time push_morning_notice keep_days');	
				//数据库中没有这个用户则插入用户数据
		    	if (currentUserInDB.length == 0) {
		    		let userSchema = new getup_user(userInfoResp);
		    		let saveObj = await userSchema.save();
		    		currentUserInDB.push(saveObj);
		    		console.log("first register: " + currentUserInDB);
		    	//数据库中已经存在这个用户了更新头像和昵称
		    	} else {
		    		 var conditions = {"openid": openid};
		    		 var updates = {"nickname":userInfoResp.nickname, "headimgurl":userInfoResp.headimgurl};
		    		 const getup_update = await getup_user.update(conditions, updates);
		    		 //console.log(currentUserInDB);
		    		 //不单要更新数据库，还得保证当前页面展示的是最新的头像和昵称
		    		 currentUserInDB[0].nickname = userInfoResp.nickname;
		    		 currentUserInDB[0].headimgurl = userInfoResp.headimgurl;
		    	}
		    	
		    //2.2  点击推送的用户点赞通知，直接根据openid从数据库里找数据
			} else if (openid && friendOpenid && friendNickname) {
				console.log("222");
				//这里有bug，回返回所有的sign_record，并没有根据endTime进行筛选
				currentUserInDB = await getup_user.find({"openid": openid}, 'openid nickname headimgurl follow_users sign_record notice_time push_morning_notice keep_days');
				console.log(currentUserInDB[0].nickname + '在查看' + friendNickname + "给Ta的点赞");
			//2.3 sb的非法路由请求
			} else {
				console.log("333");
				
				//内部调试使用，实际发布可以注释掉
				openid = "oMM4a0458UDA3jGTVIgbifhXv3m0";  //bobo公众号对应的数据库，shujun
//				openid = "oMM4a0458UDA3jGTVIgbifhXv3m0";  //测试公众号中对应的数据库，shujun
				currentUserInDB = await getup_user.find({"openid": openid}, 'openid nickname headimgurl follow_users sign_record notice_time push_morning_notice keep_days');
				
				console.log("currentDb: " + currentUserInDB);
//				console.log("invalid request parameters to sb...");
//				await ctx.render('getup/'+ where, {data: data});
//				break;
			}
	    	
			//放在这里再取，就可以获取当前用户头像和昵称
			let usersInDb = await getup_user.find({"sign_record.sign_time":{"$gte":startTime, "$lte":endTime}}, 'openid nickname headimgurl follow_users sign_record.$').sort("sign_record.sign_time");
			//这个对数组内部元素(sign_record.sign_time)排序的方式貌似无效哦，算了放弃了，还是先js内部排序把
			usersInDb.sort(function(a, b){
				if(a.sign_record[0].sign_time <= b.sign_record[0].sign_time)
					return -1;
				else
					return 1;
			})
			
//	    	console.log("usersInDb: " + usersInDb);
			await ctx.render('getup/list',{
				"openid": openid,
				//如果我还没打卡，在usersInfo中就不会有我了，所以需要把currentUserInDB传过去
				"currentUserInDB": currentUserInDB[0], 
	    		"usersInfo": usersInDb,
	    		"friendOpenid": friendOpenid,
	    		"friendNickname": friendNickname,
	    		"todayStr": todayStr, //为了能从历史点赞消息中查看那时的记录
	    		"timeNow": new Date()	//前端打卡时间放来后台了，不给前端操控时间的机会
			});
			break;
		}
		
		//获取微信定位
		case 'wxLocation': {
			console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ': wxLocation..., 配置地理位置签名。');
			
			//1. 获取token
			let tokenUrl = getJsApiTokenUrl();
			let tokenResp = await request(tokenUrl);
			let token = JSON.parse(tokenResp.body).access_token;
			if (!token) {
				console.log("地理位置获取失败，可能是ip又换了，得添加ip白名单, tokenResp: " + JSON.stringify(tokenResp));
			}
			
			//2. 获取JsApiTicket
			let ticketUrl = getJsApiTicketUrl(token);
			let ticketResp = await request(ticketUrl);
			//console.log(JSON.stringify(ticketResp));
			let ticket = JSON.parse(ticketResp.body).ticket;
			//console.log("ticket: " + ticket);
			
			//3. 获取签名
			//不知为何，有时候会一次定位进来这里两次？
			let nonceStr = getNonceStr();
			let timeStamp = Date.parse(new Date())/1000;
			let authUrl = ctx.query.requestUrl;
			let signStr = "jsapi_ticket=" + ticket +
	            "&noncestr=" + nonceStr +
	            "&timestamp=" + timeStamp +
	            "&url=" + authUrl;
			signStr = sha1(signStr);
			
			ctx.body = { timeStamp: timeStamp,
						 nonceStr: nonceStr,
						 signature: signStr,
						 appId: getup_config.appid
						}
			break;
		}
		
		//加关注，路人转粉
		case 'addFollowUser': {
			console.log('addFollowUser...');
			let openid = ctx.query.openid;
			let follow_user_id = ctx.query.follow_user_id;
		    const getup_update = await getup_user.update({"openid": openid}, {'$push':{"follow_users":follow_user_id}});
			ctx.body = getup_update;
			break;	
		}
		//取消关注，掉粉
		case 'deleteFollowUser': {
			console.log('deleteFollowUser...');
			let openid = ctx.query.openid;
			let follow_user_id = ctx.query.follow_user_id;
		    const getup_update = await getup_user.update({"openid": openid}, {'$pull':{"follow_users":follow_user_id}});
			ctx.body = getup_update;
			break;	
		}
		
		//打卡
		case 'sign': {
			let openid = ctx.query.openid;
			let time=new Date()
			console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ' reach sign...' + openid);
			let keep_days = ctx.query.keep_days;
			let signStr = ctx.query.signObj;
			let signObj = JSON.parse(signStr);
			// console.log("从微信返回给我们的signStr:"+signStr)
			//从微信返回给我们的signStr:{"sign_time":null,"sign_position":"杭州市 江干区 四季青街道","praise_fans":[]}
			//插入打卡记录：
			//signObj.sign_time=moment().format('YYYY-MM-DD HH:mm');
			const getup_update = await getup_user.update({"openid": openid}, {'$push':{"sign_record":signObj}, 'keep_days':keep_days});
		    console.log('save sign record to db: ' + JSON.stringify(getup_update));
			ctx.body = getup_update;
			break;	
		}
		
		//点赞
		case 'praiseSign': {
			//1. 获取请求参数
			let praiseOpenid = ctx.query.praiseOpenid;
			let sign_time = ctx.query.sign_time;
			console.log('sign_time: ' + sign_time);
			let myOpenid = ctx.query.myOpenid;
			let myNickname = ctx.query.myNickname;
			let todayStr = ctx.query.todayStr;
			console.log(moment().format('YYYY-MM-DD HH:mm') + ' reach praiseSign...');
			console.log(myNickname + " praise " + praiseOpenid);
			
			//2. 更新被点赞用户的点赞情况：
			const getup_update = await getup_user.update({"openid": praiseOpenid, "sign_record.sign_time":sign_time}, 
					{'$push':{"sign_record.$.praise_fans":myOpenid}});
		    //console.log('update array result: ' + JSON.stringify(getup_update));
		    
		    //3. 向好友神奇的推送信息哦，告诉她我为她点赞了
		    //3.1  获取token
			let tokenUrl = getJsApiTokenUrl();
			let tokenResp = await request(tokenUrl);
			let token = JSON.parse(tokenResp.body).access_token;
			//console.log("access_token: " + token);
			//3.2 像被点赞的用户推送模板消息
			let templateUrl = getPraiseTemplateUrl(token, praiseOpenid, myOpenid, myNickname, todayStr);
			let templateResp = await request(templateUrl);
			//console.log("templateResp: " + JSON.stringify(templateResp));
			
			ctx.body = getup_update;
			break;	
		}
		
		//修改通知时间
		case 'modifyNoticeTime': {
			let openid = ctx.query.openid;
			let notice_time = ctx.query.notice_time;
			//console.log('notice_time: ' + notice_time);
			
	   		const noticeTime_update = await getup_user.update({"openid": openid}, {"notice_time": notice_time});
			ctx.body = noticeTime_update;
			break;	
		}
		
		//早上是否推送打卡提醒，放权给用户说了算
		case 'changeMorningNotice': {
			let openid = ctx.query.openid;
			let push_morning_notice = ctx.query.status;
			console.log('status: ' + push_morning_notice);
			
	   		const noticeTime_update = await getup_user.update({"openid": openid}, {"push_morning_notice": push_morning_notice});
			ctx.body = noticeTime_update;
			break;	
		}
		
		//没用，测试页面
		case 'mobile': {
			console.log('mobile.........');
			await ctx.render('getup/' + where, 
			    {data: data
				});
			break;
		}	
		//现在没有用，配置自定义菜单服务器，可能以后配置自定义菜单有用的
		case 'checkWx': {
			console.log("------------  checkWx    -----------")
			signature = ctx.query.signature;
			timestamp = ctx.query.timestamp;
			nonce = ctx.query.nonce;
			echostr = ctx.query.echostr;
			
			console.log("signature: " + signature);
			console.log("timestamp: " + timestamp);
			console.log("nonce: " + nonce);
			console.log("echostr: " + echostr);
			
			ctx.body = echostr;
			break;
		}	
		
		default: {
			console.log(where + " url is wrong...");
			await ctx.render('getup/sb', {data: data});
			break; 
	    }
	}
});

module.exports = router
