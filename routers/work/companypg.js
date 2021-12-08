const router = require('koa-router')();
const dbpg= require("../../mongodb/schema/companypg/pg.js");
const jwt = require('jsonwebtoken')
const util = require('util')
const verify = util.promisify(jwt.verify) // 解密

// const jwt = require('jsonwebtoken')
// const jwtKoa = require('koa-jwt')
// const util = require('util')
// const verify = util.promisify(jwt.verify) // 解密

//-----------------------------------分割线-------------------------------------
//正则搜索
router.get('/blankz', async (ctx, next) => {  


	// console.log(ctx.query.title)
	// ==>22
	//1.1前端拿到数据，然后去正则匹配数据库
    let val=ctx.query.title
	  const reg = new RegExp(val, 'i') //不区分大小写
      let record=await dbpg.find({'article.title':{$regex : reg}},{'article.title':1,'article.date':1}).limit(30)
    //console.log(record)
    //    console.log(record)  ===》
    //    { _id: 5beaae2f87958b198815b41a,
    //     menu: 'article',
    //     article:
    //      { title: '天健会计师事务所2019年校园招聘行程预告',
    //        date: '2018-09-13',
    //        content:
    //         '<p><span style="color: rgb(125, 125, 125);"><img src="http://www.pccpa.cn/uploadFiles/images/zhaopin/%E6%9C%AA%E6%A0%87%E9%A2%98-1(1).jpg">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>',
    //        type: [Object] },
    //     date: 2018-11-13T10:57:51.222Z,
    //     __v: 0 },
    //   { _id: 5beaae5e87958b198815b41b,
    //     menu: 'article',
    //     article:
    //      { title: '天健会计师事务所2019年应届毕业生招聘计划和程序',
    //        date: '2018-09-03',
    //        content:
    //         '<h1 class="ql-align-center"><strong>天健会计师事务所2019年应届毕业生招聘计划和程序</strong></h1><p><br></p><p><br></p><p><br></p><p><span style="color: rgb(125, 125, 125);"><img src="http://www.pccpa.cn/uploadFiles/images/zhaopin/19%E5%B9%B4%E6%A0%A1%E6%8B%9B%E5%BE%AE%E4%BF%A1.jpg">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>',
    //        type: [Object] },
	//record=JSON.stringify(record)
	 

    ctx.body=record

   
})






//-----------------------------------分割线-------------------------------------
//Home需要获取到5条新闻
router.post('/companypg/getHomeNews', async (ctx, next) => {  
    try {
        let cab =await dbpg.find({"article.type.menu":"天健资讯"}).sort({"article.date":-1}).limit(5)
       
        ctx.body=cab
    } catch (error) {
        console.error(error)
        ctx.body=error
    }

})



//去后台获取新闻详细内容
router.post('/companypg/getNewsContent', async (ctx, next) => {  
    let data=ctx.request.body
      //  console.log(data.title)
      //  标题

    try {
        let cab =await dbpg.findOne({"article.title":data.title})
        ctx.body=cab
    } catch (error) {
        console.error(error)
        ctx.body=error
    }

})








// //去后来获取新闻列表
// router.post('/companypg/getNewsList', async (ctx, next) => {  
//       let data=ctx.request.body
//         //  console.log(data.menu)
//         //  天健资讯
//       try {
//           let cab =await dbpg.find({"article.type.menu":data.menu})
//           ctx.body=cab
//       } catch (error) {
//           console.error(error)
//           ctx.body=error
//       }

// })


//去后来获取新闻列表
router.post("/companypg/getNewsList", async (ctx, next) => {
    let data = ctx.request.body;
    //  console.log(data.menu)
    //  天健资讯
   //console.log(data)
    try {
      let cab = await dbpg.find({ "article.type.menu": data.menu },{"article.title":1});
      console.log(cab)
      ctx.body = cab;
    } catch (error) {
      console.error(error);
      ctx.body = error;
    }
  });









//批量删除新闻
router.post('/companypg/deleteArticle', async (ctx, next) => {  
  let data=ctx.request.body
    //   console.log('data', data)
    //   data { arr:
    //     [ '美国EKS＆H会计师事务所主席一行访问天健', 
    //     '天健当选浙江省并购联合会第一届理事单位 胡少先当选联合会副会长' ] }

    let cab=false
    for (let i = 0; i < data.arr.length; i++) {
        try {
            cab = await dbpg.remove({"article.title":data.arr[i]})
        } catch (error) {
            console.error(error)
            ctx.body=error
            return
        }
    }
        console.log(cab)
     ctx.body=cab
   
   
    

 
})






//根据新闻标题来获取文章详情
router.post('/companypg/getArticleTitle', async (ctx, next) => {  
    let data=ctx.request.body
    //  console.log('data', data)
    //  data { index: '美国EKS＆H会计师事务所主席一行访问天健' }
    
    let cab=await dbpg.findOne({"article.title":data.index},{"article.date":1,"article.title":1,"article.content":1})
    console.log(cab)
    ctx.body=cab

})



//根据栏目菜单，来获取其子集合
router.post('/companypg/getArticle', async (ctx, next) => {  
        let data=ctx.request.body
        // console.log('data', data)
        // data { order: '天健资讯' }
        //根据order 去后台获取子集合的标签，为了性能着想，我们只获取标签名，和时间
        let cab=await dbpg.find({"article.type.menu":data.order},{"article.date":1,"article.title":1})
       // console.log(cab)
        ctx.body=cab

})



//文章提交的地方。
router.post('/companypg/article', async (ctx, next) => {  

    let data=ctx.request.body
    // console.log('data', data)
    // con: { title: '美国EKS＆H会计师事务所主席一行访问天健', date: '2018-04-14' },
    // content:dom
    // type:"天健资讯"

    //1.1先去数据库查找看有没有，如果没有就直接插入，如果有就，进行更新。
    let cabG
    try {
        cabG = await dbpg.findOne({"article.title":data.con.title},{_id:1})
       
    } catch (error) {
        console.log(error)
    }
    
    //如果有就直接更新
    if(cabG!=null){
       try {
        let recab=await dbpg.update({"article.title":data.con.title},{"$set":{"article.content":data.content,"article.date":data.con.date}})   
        ctx.body=recab
     } catch (error) {
           console.error(error)
           ctx.body=error
       }
        



    }else{
    //如果没有就直接插入
        let article={}
        article.title=data.con.title
        article.date=data.con.date
        article.content=data.content
        article.type={}
        article.type.menu=data.type
        
        let news = new dbpg({
            menu :"article",    
            article:article,
            logindate : new Date()                      
        });
        try {
            const news_save= await news.save()	
            ctx.body=true
        } catch (error) {
            console.error(error)
            ctx.body=false
        }

    }

   

   
    	
   


})





//admin get column title
router.post('/companypg/getColumn', async (ctx, next) => {  

    try {
        let cab=await dbpg.findOne({"menu":"column"})
        // console.log('cab', cab)
        ctx.body=cab.column
    } catch (error) {
        console.error('error',error)
        ctx.body=error
    }



})

router.post('/companypg/column', async (ctx, next) => {   
   let data=ctx.request.body
    // console.log('data',data)
    // data { order: '增加栏目', data: '测试' }
    //1.0判断器，筛选增加栏目，修改栏目，删除栏目
    switch(data.order){
        case "增加栏目":
        {
            try {
                ctx.body=await  dbpg.update({"menu":"column"}, {"$push":{"column":data.data} } )
            } catch (error) {
                console.error(error)
                ctx.body=error
            }   
        }
        break;
        case "修改栏目":
        {

            //先pull掉，再push进去
            try {
                ctx.body=await  dbpg.update({"menu":"column"}, {"$pull":{"column":data.data1} } )
             } catch (error) {
                 console.error(error)
                 ctx.body=error
             }   

            try {
                ctx.body=await  dbpg.update({"menu":"column"}, {"$push":{"column":data.data2} } )
            } catch (error) {
                console.error(error)
                ctx.body=error
            }   
            
        }
        break;
        case "删除栏目":
        {
            try {
                ctx.body=await  dbpg.update({"menu":"column"}, {"$pull":{"column":data.data} } )
             } catch (error) {
                 console.error(error)
                 ctx.body=error
             }   
        }
        break;

    }

})


router.post('/companypg', async (ctx, next) => {
    let data=ctx.request.body
    // console.log('tag', data)
    return
        let news = new dbpg({
            newszx :data,                 
            logindate : new Date()                      
        });
    const news_save= await news.save()		
    ctx.body=news_save
})



//获得新闻标题和内容，有token认证。
router.post('/companypg/getbannner', async (ctx, next) => {

    let token=ctx.request.body.token
    if (token) {
        try {
            payload = await verify(token, global.secret)  // // 解密，获取payload
            //next update this data
        } catch (error) {
            console.error('jwt',error)
            ctx.body = {
                message:"请重新登录，授权超时"
            }
            return
        }       
    }
    
    try {
        let cab=await dbpg.findOne({"menu":"banner"})
        ctx.body=cab
    } catch (error) {
        console.error('error',error)
    }
  
})
router.post('/companypg/getbannner_clien', async (ctx, next) => {   
    
    try {
        let cab=await dbpg.findOne({"menu":"banner"})
        ctx.body=cab
    } catch (error) {
        console.error('error',error)
    }
  
})



router.post('/companypg/bannner', async (ctx, next) => {
    let token=ctx.request.body.token
    let data=ctx.request.body.data
   // console.log('data', data)
        if (token) {
            try {
                payload = await verify(token, global.secret)  // // 解密，获取payload
                //next update this data
            } catch (error) {
                console.error('jwt',error)
                ctx.body = {
                    message:"请重新登录，授权超时"
                }
                return
            }       
        }
        try {
            console.log('data', data)
            let recab=await dbpg.update({"menu":"banner"},{"$set":{"banner":data}})
            ctx.body=recab
        } catch (error) {
            console.error(error)
            
        }


})


router.post('/companypg/login', async (ctx, next) => {
     const user=ctx.request.body.user
     const pwd=ctx.request.body.pwd
     if(user=="root" && pwd=="2wsx3edc"){
        let userToken = {
            name: user
        }
        const token = jwt.sign(userToken,global.secret, {expiresIn: '1h'})  //token签名 有效期为1小时
        ctx.body = {
            message: '获取token成功',
            code: 1,
            token
        }

     }else{
         ctx.body=false
     }
      //ctx.body=news_save
      
})




module.exports = router