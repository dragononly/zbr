var User = require("../../mongodb/schema/user.js");
const router = require('koa-router')();
const OSS = require('ali-oss');
const alikey = require("../../config/key.js");
const client = new OSS({
	region: alikey.region,
	accessKeyId: alikey.accessKeyId,
	accessKeySecret: alikey.accessKeySecret,
	bucket: alikey.bucket
});

router.get('/api/login', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log("不足以JSON parse")
		console.log(error)
	}
	const user_one = await User.findOne({ "user": data['user'], "pwd": data['pwd'] })
	ctx.body = user_one

})

router.get('/api/reg', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const user_one = await User.find({ "user": data['user'] })
	if (user_one != "") {
		ctx.body = "false"
	} else {
		let cab = new User({
			user: data["user"],
			pwd: data["pwd"],
			logindate: new Date()
		});
		await cab.save()
		//在云盘新建一个文件夹开户
		//新建文件夹
		let result = await client.copy('cloud/' + data.user + '/', 'cloud/')
		ctx.body = "ok"
	}

})

module.exports = router

