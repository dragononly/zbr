const router = require('koa-router')();
var build = require("../../mongodb/schema/build/index.js");
var build2 = require("../../mongodb/schema/build/index2.js");
var build3 = require("../../mongodb/schema/build/index3.js");



//获取新闻总数
router.post('/build/countnews', async (ctx, next) => {
    const cab = await build.find({}).count()
    ctx.body = cab
})
//获取项目总数
router.post('/build/countpro', async (ctx, next) => {
    const cab = await build3.find({}).count()
    ctx.body = cab
})
//通过项目名查询到id接口
router.post('/build/getprojec3tid', async (ctx, next) => {
    let data = ctx.request.body
    let db = {
        news: data["name"],
    }

    const cab = await build3.findOne(db, { _id: 1 })

    ctx.body = cab
})


//通过nowhover拿id
router.post('/build/getproid', async (ctx, next) => {
    let data = ctx.request.body
    let db = {
        menu2: data["menu2"],
    }
    const cab = await build2.findOne(db)

    ctx.body = cab
})

//项目menu2名字更改
router.post('/build/changepromenu', async (ctx, next) => {
    let data = ctx.request.body
    let db = {
        menu2: data["menu2"],
    }
    let id = { _id: data.id }

    const cab = await build2.updateMany(id, db)

    ctx.body = cab
})

//查询一条新闻
router.get('/build/getonenews', async (ctx, next) => {
    let data = ctx.query.data
    data = JSON.parse(data)
    const cab = await build.findOne({ '_id': data.id })
    ctx.body = cab
})
//查询一条新闻项目版
router.get('/build/getonenews2', async (ctx, next) => {
    let data = ctx.query.data
    data = JSON.parse(data)

    const cab = await build3.findOne({ '_id': data.id })

    ctx.body = cab
})

//更新新闻项目
router.post('/build/upnews2', async (ctx, next) => {
    let data = ctx.request.body
    let db = {
        news: data["news"],
        newscontent: data["newscontent"],
        newsimg: data["newsimg"],
        weizhi: data["weizhi"],
        zhaiyao: data["zhaiyao"],
        "leixing": data.leixing,
        paixu: data.paixu
    }
    const cab = await build3.findByIdAndUpdate({ _id: data.id }, db)
    ctx.body = cab
})
//更新新闻
router.post('/build/upnews', async (ctx, next) => {
    let data = ctx.request.body

    let db = {
        news: data["news"],
        newscontent: data["newscontent"],
        newstype: data["newstype"],
        newsimg: data["newsimg"],
        zhaiyao: data["zhaiyao"],
        paixu: data.paixu
    }
    const cab = await build.findByIdAndUpdate({ _id: data.id }, db)
    ctx.body = cab
})

//获取首页mainwork数据
router.get('/build/getmainwork', async (ctx, next) => {
    const cab = await build2.find({ "isshow": 1 }, { menu: 1, menu2: 1, srcarr: 1 })

    ctx.body = cab
})

//获取首页delegate数据
router.get('/build/delegate', async (ctx, next) => {
    const cab = await build3.find({ "weizhi": { $regex: '代表项目' } }, { newsimg: 1 })

    ctx.body = cab
})
//获取目录下的具体内容
router.get('/build/getproject', async (ctx, next) => {
    let data = ctx.query.data
    data = JSON.parse(data)
    const cab = await build2.findOne({
        "menu2": data["menu2"]
    }, { _id: 0, __v: 0, menu: 0, menu2: 0 })
    ctx.body = cab
})
//获取目录下的瀑布流内容
router.post('/build/getproject2', async (ctx, next) => {
    let data = ctx.request.body

    const cab = await build3.find({ "leixing": data["leixing"] }, { newscontent: 0 }).sort({ "paixu": 1 })
    let cab2 = []
    for (const i of cab) {
        if (/主要项目/.exec(i.weizhi)) {

        } else {
            cab2.push(i)
        }

    }

    ctx.body = cab2
})
//删除悬浮目录
router.get('/build/rmNoteMenu', async (ctx, next) => {
    let data = ctx.query.data
    data = JSON.parse(data)
    const cab = await build2.findOneAndDelete({
        "menu2": data["name"]
    })
    if (cab) {
        ctx.body = "ok"
    } else {
        ctx.body = "no"
    }
})
//获取目录列表
router.get('/build/reqNoteMenu', async (ctx, next) => {
    let cab = await build2.find({})
    if (cab) {
        ctx.body = cab
    }
})
//项目管理添加目录
router.get('/build/addmenu', async (ctx, next) => {
    let data = ctx.query.data;
    try {
        data = JSON.parse(data)
    } catch (error) {
        console.log("json parse 失败")
        ctx.body = "server json parse error"
        return
    }
    let db = new build2({
        menu: data["menu"],
        menu2: data["menu2"],
    })

    let cab = await db.save()
    if (cab) {
        ctx.body = "ok"
    }
})

//删除新闻
router.get('/build/deletenew2', async (ctx, next) => {
    let self = ctx.query.data;
    try {
        self = JSON.parse(self)
    } catch (error) {
        console.log("json parse 失败")
        ctx.body = "server json parse error"
        return
    }

    let cab = await build3.findByIdAndRemove({ _id: self.id })
    if (cab) {
        ctx.body = "ok"
    }
})

//删除新闻
router.get('/build/deletenew', async (ctx, next) => {
    let self = ctx.query.data;
    try {
        self = JSON.parse(self)
    } catch (error) {
        console.log("json parse 失败")
        ctx.body = "server json parse error"
        return
    }

    let cab = await build.findByIdAndRemove({ _id: self.id })
    if (cab) {
        ctx.body = "ok"
    }
})

//通过id获取新闻
router.get('/build/showsearch2', async (ctx, next) => {
    let id = ctx.query.id;
    let cab = await build.findOne({ '_id': id })
    if (!cab) {
        cab = await build3.findOne({ '_id': id })
    }
    ctx.body = cab
})
//通过id获取新闻
router.get('/build/showsearch', async (ctx, next) => {
    let self = ctx.query.data;
    try {
        self = JSON.parse(self)
    } catch (error) {
        console.log("json parse 失败")
        ctx.body = "server json parse error"
        return
    }

    let cab = await build.findOne({ '_id': self.id })
    ctx.body = cab
})

//获取项目列表8个
router.get('/build/getnews4', async (ctx, next) => {
    let cab = await build3.find({}, { newscontent: 0, }).limit(8).sort({ "date": -1 })
    ctx.body = cab
})

//获取项目列表素有
router.post('/build/getnews3', async (ctx, next) => {
    let data = ctx.request.body
    let cab = await build3.find({ "weizhi": { $regex: data.name } }, { newscontent: 0, }).sort({ "date": -1 })
    ctx.body = cab
})

//查询主目录
router.post('/build/searchmenu', async (ctx, next) => {
    let data = ctx.request.body
    let cab = await build2.findOne({ "menu2": data.leixing }, { menu: 1 })
    ctx.body = cab
})

//获取项目列表素有,这里查询的是leixing
router.post('/build/getnews32', async (ctx, next) => {
    let data = ctx.request.body
    let cab = await build3.find({ "leixing": { $regex: data.name } }, { newscontent: 0, }).sort({ "paixu": 1 })

    ctx.body = cab
})
//获取项目列表素有,这里查询的是leixing，并且只查询一个
router.post('/build/getnews322', async (ctx, next) => {
    let data = ctx.request.body
    let cab = await build3.findOne({ "_id": data.id }, { leixing: 1, })

    ctx.body = cab
})

//获取新闻列表不要内容的
router.get('/build/getnews', async (ctx, next) => {
    let cab = await build.find({ '_id': { $ne: '600ad5c49be282dee86bc925' } }, { newscontent: 0, }).sort({ "paixu": 1 })
    ctx.body = cab
})

//获取新闻列表要内容但是只需要4条就够了
router.get('/build/getnews2', async (ctx, next) => {
    let cab = await build.find({ '_id': { $ne: '600ad5c49be282dee86bc925' } }).sort({ "paixu": 1 }).limit(4)
    ctx.body = cab
})



//添加项目内容
router.post('/build/addproject', async (ctx, next) => {
    let data = ctx.request.body


    let db = {
        'content': data.content,
        'srcarr': data.srcarr,
        'namearr': data.namearr,
        'isshow': data.isshow
    }

    let cab = await build2.findOneAndUpdate({ 'menu2': data.menu2 }, db)

    if (cab) {
        ctx.body = "ok"
    }

})




//添加新闻
router.post('/build/addnew2', async (ctx, next) => {
    let data = ctx.request.body

    let db = new build3({
        news: data["NewsName"],
        newscontent: data["Content"],
        newsimg: data["newsimg"],
        "weizhi": data["weizhi"],
        zhaiyao: data["zhaiyao"],
        "leixing": data.leixing,
        paixu: data.paixu

    })

    let cab = await db.save()
    if (cab) {
        ctx.body = "ok"
    }
})

//添加新闻
router.post('/build/addnew', async (ctx, next) => {
    let data = ctx.request.body

    let db = new build({
        news: data["NewsName"],
        newscontent: data["Content"],
        newstype: data["newstype"],
        newsimg: data["newsimg"],
        zhaiyao: data["zhaiyao"],
        paixu: data.paixu
    })

    let cab = await db.save()

    if (cab) {
        ctx.body = "ok"
    }
})

//获取基础信息
router.get('/build/getbasics', async (ctx, next) => {
    let cab = await build.findOne({ '_id': '600ad5c49be282dee86bc925' })
    ctx.body = cab
})
router.get('/build/basics', async (ctx, next) => {
    //基础信息设置
    let self = ctx.query.data;
    try {
        self = JSON.parse(self)
    } catch (error) {
        console.log("json parse 失败")
        ctx.body = "server json parse error"
        return
    }

    let db = {
        abouttitle: self.abouttitle,
        aboutcontent1: self.aboutcontent1,
        aboutcontent2: self.aboutcontent2,
        cpaddr: self.cpaddr,
        cpphone: self.cpphone,
        cpemail: self.cpemail,
        cpbus: self.cpbus,
        cpcar: self.cpcar,
        cttitle: self.cttitle,
        ctkouhao: self.ctkouhao,
        ctbowuguan: self.ctbowuguan,
        ctcpaddr: self.ctcpaddr,
        ctcpphone: self.ctcpphone,
        ctcpemail: self.ctcpemail,
        bqcpname: self.bqcpname,
        ctcpphoneme: self.ctcpphoneme,
        icp: self.icp
    }
    let cab = await build.findByIdAndUpdate({ '_id': '600ad5c49be282dee86bc925' }, db)
    if (cab) {
        ctx.body = "ok"
    }

})




module.exports = router
