var db = require("../../mongodb/schema/skynote/index.js");
var db2 = require("../../mongodb/schema/news.js");
var db3 = require("../../mongodb/schema/engine.js");
var sky = require("../../mongodb/schema/sky/sky.js");
var dbuser = require("../../mongodb/schema/user.js");
const router = require('koa-router')();
const axios = require("axios");
let OSS = require('ali-oss')
const conf = require("../../config/pubconf.js");
const alikey = require("../../config/key.js");
let pyurl = conf.pyurl
let clientoss = new OSS({
	region: alikey.region,
	accessKeyId: alikey.accessKeyId,
	accessKeySecret: alikey.accessKeySecret,
	bucket: alikey.bucket
});




//请求一级目录
router.get('/sky/reqNoteMenu', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab = await db.find({
		"User": data["User"],
		"NoteNameC": null
	})
	ctx.body = cab
})

//搜索引擎
router.get('/sky/ai/search', async (ctx, next) => {

//1.通过字符串去查询出id
let q = ctx.query.q
q=encodeURI(q)
// console.log(q)
// let data = {
// 	"tab":"tab1",
// 	"top":"top1",
// 	"name":q
//    }

let data = {"name":q,"tab":"tab1","top":"100"};

let cab = await axios.post(pyurl + 'api/nlp/search',data,{
    headers: {
        'Access-Control-Allow-Origin':'*',  //解决cors头问题
        'Access-Control-Allow-Credentials':'true', //解决session问题
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' //将表单数据传递转化为form-data类型
    },
    // withCredentials : true
})
	.then(function(res) {
	
	return res
})
	.catch(error => {
		console.log(error);
	});

// console.log(cab.cab.QueryResultList)
// [
// 	{
// 	  Ids: [ 1615544729656160000, 1615540370302019000, 1615612022627813000 ],
// 	  Distances: [ 211.33754, 211.33754, 217.60773 ]
// 	}
//   ]

return
let need = cab.QueryResultList[0].Ids

	let last = []
	for (const i of need) {
		let cab = await db3.findOne({ "myid": i }, { NewsName: 1 })
		last.push(cab)
	}

	ctx.body = last
})


//检查文章有没有被用户收藏
router.get('/sky/cms/check/collect', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	
	let cab = await dbuser.findOne({ "user": data.user, "collect._id": data._id }, { _id: 1 });
	ctx.body = cab
})
//删除收藏文章
router.get('/sky/cms/collect/delete', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	const cab = await dbuser.aggregate([
		{ $unwind: "$user" },
		{ $match: { "user": data.user } },
		{ $project: { "collect": 1 } },
	])
	let newcollect = []
	for (const iterator of cab[0].collect) {
		if (iterator._id == data.id) {

		} else {
			newcollect.push(iterator)
		}

	}
	let cab2 = await dbuser.update({ "user": data.user }, { "$set": { "collect": newcollect } });

	ctx.body = cab2
})
//遍历收藏文章
router.get('/sky/cms/getcollect', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	let cab = await dbuser.findOne({ "user": data.user }, { collect: 1 });
	ctx.body = cab
})

//点击星星收藏文章
router.get('/sky/collect', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}

	let cab = await dbuser.update({ "user": data.user }, { "$push": { "collect": data } });
	ctx.body = cab
})

//提问评论功能
router.get('/sky/comment', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	let cab = await db3.update({ "_id": data._id }, { "$push": { "comment": data } });
	ctx.body = cab
})
//电脑借用借用功能
router.get('/sky/itman/add', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	let cab = {
		department: data["department"],
		name: data["name"],
		phone: data["phone"],
		manager: data["manager"],
		brand: data["brand"],
		model: data["model"],
		number: data["number"],
		admin: data["admin"],
		type: "1",
		time: Date.now()
	}
	//看下仓库中是不是已经有了
	let c1 = await sky.findOne({ "number": data["number"] })
	if (c1) {
		let c2 = await sky.findOneAndUpdate({ "number": data.number }, cab)
		ctx.body = c2
	} else {
		let cab3 = new sky({
			department: data["department"],
			name: data["name"],
			phone: data["phone"],
			manager: data["manager"],
			brand: data["brand"],
			model: data["model"],
			number: data["number"],
			admin: data["admin"],
			type: "1",
		})
		let c4 = await cab3.save()
		ctx.body = c4
	}

})

//电脑在系统的仓库存储
router.get('/sky/itman/findall', async (ctx, next) => {

	let cab2 = await sky.find({ "type": "0" })
	ctx.body = cab2
})
//电脑在借出记录
router.get('/sky/itman/findall2', async (ctx, next) => {

	let cab2 = await sky.find({ "type": "1" })
	ctx.body = cab2
})

//电脑验证归还人是否在数据库中
router.get('/sky/itman/revertFind', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	let cab2 = await sky.findOne({ "number": data.number })
	ctx.body = cab2
})
//电脑验证归还人是否在数据库中
router.get('/sky/itman/revertChange', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {
		console.log(error)
	}
	let cab2 = await sky.findOneAndUpdate({ "_id": data._id }, { type: "0", admin: data.admin, time: Date.now() })
	ctx.body = cab2
})


//请求一级目录
router.get('/sky/reqNoteMenu', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab = await db.find({
		"User": data["User"],
		"NoteNameC": null
	})
	ctx.body = cab
})


//请求记事本的二级目录
router.get('/sky/reqNoteMenuC', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC2": null
	})
	ctx.body = cab
})
//请求记事本的三级级目录
router.get('/sky/reqNoteMenuC2', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC": data["NoteNameC"]
	})
	ctx.body = cab
})


//删除单篇文章
router.post('/sky/searchDeleteNews', async (ctx, next) => {

	let data = ctx.request.body
	// //1通过id去查询nlp数据库的id
	// const myid = await db3.findOne({"_id": data["_id"]},{myid:1})
	
	// let nlpid=myid.myid
	// //2拿到myid后去删除
	// let status = await axios.get(pyurl + 'api/nlp/delete?id=' + nlpid)
	// .then(res => {
	// 	return data2 = res.data
	// })
	// .catch(error => {
	// 	// console.log(error);
	// });
	// console.log(status.cab)
	
		const cab = await db3.findOneAndDelete({ "_id": data._id })
		if(cab){
			ctx.body = "ok"
		}else{
			ctx.body = "no"
		}
		
	
	
	
})
//CMS get news list home
router.get('/sky/cms/getNews', async (ctx, next) => {
	let data = ctx.query.data
	try {
		data = JSON.parse(data)
	} catch (error) {

	}

	const cab = await db3.find({ "Menu": data.Menu1 }, { Content: 0 }).sort({ "date": -1 })
	ctx.body = cab
})


//天擎引擎搜索
router.get('/sky/searchGainNews', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)

	const cab = await db3.findOne({
		"_id": data["_id"]
	})
	ctx.body = cab
})
//请求根据三级目录获取内容
router.post('/sky/gainNews', async (ctx, next) => {
	let data = ctx.request.body
	const cab = await db2.findOne({
		"User": data["User"],
		"NewsName": data["NewsName"],
		"Menu1": data["Menu1"],
		"Menu2": data["Menu2"]
	})
	if (cab) {
		ctx.body = cab
	} else {
		ctx.body = {
			Authority: "私有"
			, Content: ""
			, Menu1: "入口"
			, Menu2: "微信"
			, NewsName: "公众号登录"
			, Type: "笔记"
			, User: "root"
			, date: "2020-11-24T09:31:32.585Z"
		}
	}

})

//添加内容进来
router.post('/sky/cms/addNews', async (ctx, next) => {
	let data = ctx.request.body

	//保存到mongodb中

	let cab = new db3({
		User: data['User'],
		NewsName: data['NewsName'],
		Menu: data["Menu"],
		Type: data["Type"],
		Authority: data["Authority"],
		Content: data["Content"],
		myid: data['myid']
	})

	try {
		let cab2 = await cab.save()
		ctx.body = "ok"
	} catch (error) {
		ctx.body = "no"
	}
})




// //修改提问的帖子
// router.post('/sky/question/change', async (ctx, next) => {
// 	let data = ctx.request.body
// 	let str = encodeURI(data["NewsName"])
// 	//1通过id去查询nlp数据库的id
// 	const myid = await db3.findOne({"_id": data["_id"]},{myid:1})
// 	let nlpid=myid.myid
// 	//2拿到myid后去删除
// 	let status = await axios.get(pyurl + 'api/nlp/delete?id=' + nlpid)
// 	.then(res => {
// 		return data2 = res.data
// 	})
// 	.catch(error => {
// 		// console.log(error);
// 	});

// 	if(status.cab=="success"){
// 		//更新mongodb的数据
// 		try {
// 			let cab3 = await db3.updateOne({ "_id": data["_id"] }, {myid:data["myid"], Content: data["Content"], NewsName: data["NewsName"], Menu: data["Menu"], })
// 		} catch (error) {
// 			return
// 		}
// 		ctx.body = "ok"
// 	}



	


// })

//添加新闻
router.post('/sky/addNews', async (ctx, next) => {
	let data = ctx.request.body
	let cab = new db2({
		User: data['User'],
		NewsName: data['NewsName'],
		Menu2: data["Menu2"],
		Menu1: data["Menu1"],
		Type: data["Type"],
		Authority: data["Authority"],
		Content: data["Content"],
	})
	//先去查找看数据库中有没有
	let cab2 = await db2.findOne({
		User: data['User'],
		NewsName: data['NewsName'],
		Menu2: data["Menu2"],
		Menu1: data["Menu1"],
		Type: data["Type"],
		Authority: data["Authority"],

	})
	if (cab2 == null) {
		try {
			cab.save()
		} catch (error) {
			ctx.body = error
			return
		}
		ctx.body = "ok"
	} else {
		// //先删除原来的，再插入新的
		// let cab3 = await db2.remove({
		// 	User: data['User'],
		// 	NewsName: data['NewsName'],
		// 	Menu2: data["Menu2"],
		// 	Menu1: data["Menu1"],
		// 	Type: data["Type"],
		// 	Authority: data["Authority"],
		// })
		// if(cab3.ok=="1"){
		// 	cab.save()
		// }

		let cab3 = await db2.update({
			User: data['User'],
			NewsName: data['NewsName'],
			Menu2: data["Menu2"],
			Menu1: data["Menu1"],
			Type: data["Type"],
			Authority: data["Authority"],
		}, { Content: data["Content"] })
		// if(cab3.ok=="1"){
		// 	cab.save()
		// }

		ctx.body = "ok"
	}



})


//添加分区功能
router.get('/sky/subNoteNameC', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab2 = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC": data["NoteNameC"]
	})
	if (cab2 != "") {
		ctx.body = "no"
		return
	}
	let cab = new db({
		User: data['User'],
		NoteName: data["NoteName"],
		NoteNameC: data["NoteNameC"],
	})
	try {
		cab.save()
	} catch (error) {
		ctx.body = error
	}
	ctx.body = "ok"
})

//删除分区功能
router.get('/sky/rmNoteMenuC', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)

	//当子集不为空的时候才能进行删除
	const cab2 = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC": data["NoteNameC"]
	})
	if (cab2.length <= 1) {
		const cab = await db.remove({
			"User": data["User"],
			"NoteName": data["NoteName"],
			"NoteNameC": data["NoteNameC"]
		})
		if (cab.ok == "1") {
			ctx.body = "ok"
		}
	} else {
		ctx.body = "no"
	}

})

//删除页面功能
router.get('/sky/rmNoteMenuC2', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab = await db.deleteOne({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC": data["NoteNameC"],
		"NoteNameC2": data["NoteNameC2"]
	})

	if (cab.ok == "1") {
		//查找下看news表里面有没有新闻
		const cab2 = await db2.findOne({
			"User": data["User"],
			"Menu1": data["NoteName"],
			"Menu2": data["NoteNameC"],
			"NewsName": data["NoteNameC2"]
		})

		if (cab2 == "") {
			ctx.body = "ok"
		} else {
			deleteoss(cab2)
			const cab3 = await db2.deleteOne({
				"User": data["User"],
				"Menu1": data["NoteName"],
				"Menu2": data["NoteNameC"],
				"NewsName": data["NoteNameC2"]
			})
			if (cab3.ok == "1") {
				ctx.body = "ok"
			}
		}
	}

	//删除阿里云oss的数据
	async function deleteoss(cab2) {
		let arr = []
		
		try {
			let last = cab2.Content
			last = cab2.Content.split(`http://bsuir.oss-cn-hangzhou.aliyuncs.com/myImg/any/`)
			//删除第一个无用数组元素
			last.shift()

			for (const i of last) {
				let x
				x = i.split(`" style="max-width`)
				arr.push(x[0])
			}
		} catch (error) {

		}
		for (const a of arr) {
			try {
				let result = await clientoss.delete('myImg/any/' + a);
				
			} catch (e) {
				console.log(e);
			}
		}
	}
})

//添加页面功能
router.get('/sky/subNoteNameC2', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab2 = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"],
		"NoteNameC": data["NoteNameC"],
		"NoteNameC2": data["NoteNameC2"]
	})
	if (cab2 != "") {
		ctx.body = "no"
		return
	}
	let cab = new db({
		User: data['User'],
		NoteName: data["NoteName"],
		NoteNameC: data["NoteNameC"],
		NoteNameC2: data["NoteNameC2"],
	})
	try {
		cab.save()
	} catch (error) {
		ctx.body = error
	}
	ctx.body = "ok"
})

//删除记事本
router.get('/sky/rmNoteMenu', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	//先去看下笔记本下面有没有子目录
	let cab2len = await db.find({ "User": data["User"], "NoteName": data["name"] })
	if (cab2len.length <= 2) {
		const cab = await db.remove({
			"User": data["User"],
			"NoteName": data["name"]
		})
		if (cab.ok == "1") {
			ctx.body = "ok"
		}
	} else {
		ctx.body = "no"
	}



})
//新建记事本
router.get('/sky/subNoteName', async (ctx, next) => {
	let data = ctx.query.data
	data = JSON.parse(data)
	const cab2 = await db.find({
		"User": data["User"],
		"NoteName": data["NoteName"]
	})
	if (cab2 != "") {
		ctx.body = "false"
		return
	}

	let cab = new db({
		User: data['User'],
		NoteName: data["NoteName"],
		Imgicon: data["Imgicon"],
	})
	try {
		cab.save()
	} catch (error) {
		ctx.body = error
	}
	ctx.body = "true"

})



module.exports = router
