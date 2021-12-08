const router = require('koa-router')();
const Koa = require('koa');
const app = new Koa();
const fs = require('fs-extra')
const request = require('koa2-request');
const tenpay = require('tenpay');
const store_list = require("../../mongodb/schema/jd/store_list.js");
var pay = require("./pay.js");
var cfg = require("../../config/key.js");



// http://www.moono.vip:2000/wxpay?many=1&user=test
router.get('/wxpay', async ctx => {
	let many = ctx.query.many
	let user = ctx.query.user

	var params = {
		'mchid': cfg.payjsmchid,     //商户号
		'total_fee': many,              //金额。单位：分
		'out_trade_no': '123456789', //用户端自主生成的订单号
		'body': '订单标题',           //订单标题
		'attach': user,       //用户自定义数据，在notify的时候会原样返回
		'notify_url': 'http://www.moono.vip/payok/'             //接收微信支付异步通知的回调地址。必须为可直接访问的URL，不能带参数、session验证、csrf验证。留空则不通知
	};
	function timelater(params) {
		const promise = new Promise(function (resolve, reject) {
			pay.native(params, function (msg) {
				resolve(msg)
			})
			//  reject('加载失败的部分')
		})
		return promise
	}
	const msg = await timelater(params)
	ctx.body = msg
})

//pay.notifyCheck()返回bool类型，校验成功返回true，否则返回false
//这个是官方的格式，返回success后可能就不用再次通知我们了，意味着我们收到了通知
router.post('/payok', async (ctx, next) => {
	var params = ctx.request.body; //获取post的参数 

	if (pay.notifyCheck(params) == true) {
		//执行业务逻辑，成功后返回200
		console.log("支付成功")
		// console.log(params)


		//
		//  <-- POST /payok/
		// 0|app  | 支付成功
		// 0|app  | { attach: '自定义数据',
		// 0|app  |   mchid: '1528856781',
		// 0|app  |   openid: 'o7LFAwaNqGuSYPM68ZVP_NvPmf1g',
		// 0|app  |   out_trade_no: '123456789',
		// 0|app  |   payjs_order_id: '2019112022444400965195108',
		// 0|app  |   return_code: '1',
		// 0|app  |   time_end: '2019-11-20 22:44:57',
		// 0|app  |   total_fee: '1',
		// 0|app  |   transaction_id: '4200000461201911200921136445',
		// 0|app  |   sign: '1AB3FDC2D1F32B6AFA7EFEDEE2ED7EBF' }
		// 0|app  |   --> POST /payok/ 200 6ms 7b
		//res.send('success'); //注意要业务逻辑成功后返回
		ctx.body = "success"
	} else {
		//校验失败
		ctx.status = 404
	}

})


//订单查询
router.get('/paysearch', async ctx => {
	let orderid = ctx.query.orderid
	var params = {
		'payjs_order_id': orderid    //PAYJS 平台订单号
	};

	function timelater(params) {
		const promise = new Promise(function (resolve, reject) {
			pay.check(params, function (msg) {
				resolve(msg);
				/**TODO 这里处理业务逻辑 */
			});
			//  reject('加载失败的部分')
		})
		return promise
	}
	const msg = await timelater(params)
	//没有支付前
	// {
	// 	"attach": "自定义数据",
	// 	"bank": null,
	// 	"mchid": "1528856781",
	// 	"openid": "0",
	// 	"out_trade_no": "123456789",
	// 	"paid": 0,
	// 	"paid_time": "0",
	// 	"payjs_order_id": "2020110615021800105385807",
	// 	"return_code": 1,
	// 	"status": 0,
	// 	"total_fee": 1,
	// 	"transaction_id": "0",
	// 	"sign": "300DD18E543726C131ABC96026520446"
	// }


	//支付完成后
	// {
	// 	"attach": "自定义数据",
	// 	"bank": "OTHERS",
	// 	"mchid": "1528856781",
	// 	"openid": "o7LFAwaNqGuSYPM68ZVP_NvPmf1g",
	// 	"out_trade_no": "123456789",
	// 	"paid": 1,
	// 	"paid_time": "2020-11-06 15:44:01",
	// 	"payjs_order_id": "2020110615021800105385807",
	// 	"return_code": 1,
	// 	"status": 1,
	// 	"total_fee": 1,
	// 	"transaction_id": "4200000823202011060871182839",
	// 	"sign": "85C8F878C10F962673333C6177550C7D"
	// }


	ctx.body = msg
})








module.exports = router



