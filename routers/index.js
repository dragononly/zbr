const router = require('koa-router')();
const Busboy = require('busboy')
//const uuidV1 = require('uuid/v1');
const fs = require('fs-extra')
var db = require("../mongodb/schema/love.js");

// const exec = require('child_process').execSync

// // 执行，删除./dist目录下所有的文件夹
// exec('calc')

// // 获取返回值
// var last = exec('echo 123');
// last = last && JSON.stringify(last.toString().trim()).slice(1, -1)


//用户注册
router.get('/hollow/user', async (ctx, next) => {
    let user = ctx.query.user
    let newuser = new db({
		user: user
	})
    //检测用户是否存在
let cab=await  db.findOne({user:user})

  if(cab){
     ctx.body="用户名已经存在"
      return
    }
    let cab2=await newuser.save()
    ctx.body="success"
  
  
   
})
//新建表
router.get('/hollow/NewTable', async (ctx, next) => {

    let TableName = ctx.query.name
    let user = ctx.query.user
    let obj={
        [TableName]:[],
        "good":"good"
    }
  
  let cab=await  db.updateOne({'user':user}, {'$push':{medata:obj} } )
    
    ctx.body=cab
})
//增加
router.post('/hollow/add', async (ctx, next) => {
    let req = ctx.request.body
    let tab=req.tab
    let user=req.user
    let data=req.data
    try {
        data=JSON.parse(data)
    } catch (error) {
        console.log(error)
        ctx.body="意外的data传惨"
        return
    }
    let obj={
        [tab]:[data]
    }
  
     let str="medata.$."+`${tab}`
    let cab=await  db.updateMany({'user':user,"medata.good":"good"},{'$push':{[str]:data}})
    ctx.body=cab
})


router.get('/jump', async (ctx, next) => {

          let jump=ctx.query.jump
         
           await ctx.render(jump)

})



router.get('/lakala20180806', async (ctx, next) => {
    await ctx.render('assemble/lakala2018/index')
})


router.get('/lakala2018', async (ctx, next) => {
    const order=ctx.query.order
    //now load mongodb 
    let assembled = require("../mongodb/schema/assembled.js");

    switch(order){

        case 'test':
        {
          data=ctx.query.data
          
        }
        break;
        
        case 'user_gain_data':
        {
            ctx.body= await assembled.find({'lakala.off':1})
        }
        break;
        case 'delete':
        {
            let data=ctx.query.data
            ctx.body= await assembled.update({'_id':data},{'$set':{'lakala.off':1}})
        }
        break;

        case 'admin_gain_data':
        {
          ctx.body= await assembled.find({'lakala.off':0})
        }
        break;
        case 'admin':
        {
            await ctx.render('assemble/lakala2018/admin',{
                'token':'mm000000'
            })
        }
        break;

        case 'upload':
        {
            await ctx.render('assemble/lakala2018/upload')
        }
        break;
        case 'upload_db':
        {    let data=ctx.query.data
           // sessionStorage.url

                 try {
                     data=JSON.parse(data)
                 } catch (error) {
                     console.log(error)
                     return
                 }
                       
                try {
                   data.off=0
                   data.url=global.lakala2018

               

               // test=  await assembled.update({'test':1},{'$push':{'lakala':data}})
               let sa=new assembled({
                   'lakala':data
               })
                    try {
                        ctx.body=  await sa.save()
                    } catch (error) {
                        console.log(error)
                    }
               
            
                } catch (error) {
                    console.log(error)
                }
                
           
        }
        break;
    }
   

})


router.post('/lakala_upload', async (ctx, next) => {      
    let res=ctx.res,req=ctx.req;
    let busboy = new Busboy({ headers: req.headers });
    let all={},unify_time;
    
       busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
           
            unify_time=uuidV1()
            file.pipe(fs.createWriteStream(unify_time))	
            all.name_time=unify_time
            all.name=filename
            



        // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
   
         file.on('data', function(data) {
        //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
         });
         file.on('end', function() {
      //   console.log('File [' + fieldname + '] Finished');
         });
       });
       busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
     //   console.log('Field [' + fieldname + ']: value: ' + inspect(val));
   
      // console.log(val,"------",all.name_time,"------",all.name)
       
    //    all.name_time=all.name_time.split(',');
    //    all.name_time.splice(0,1)
    //    all.name=all.name.split(',');
    //    all.name.splice(0,1)
       
       unify_time=uuidV1()
       let user=val.split('-')[0];
           //user_id_name=val.split('-')[1]
   
       let u='cloud/'+user+'/'+all.name_time+'.'+all.name.split('.')[1]
        console.log(u)
       // ==>cloud/lakala2018/fa3785a0-9956-11e8-b791-13727875077b.png
       
       global.lakala2018=u
      

              
              time()
                 function time () {
       
                    fs.move(all.name_time, 'public/cloud/'+user+'/'+all.name_time+'.'+all.name.split('.')[1], function(err) {
                     if (err) {
                         //console.error(err)
                         unify_time+="(2)"
   //				  	all.name[i]=all.name[i].split('.')[0]+'(1).'+all.name[i].split('.')[1]
                         time()
                         }
                     
                 })
                    
                    } 
       // }
   
       });
       busboy.on('finish', function() {
        // console.log('Done parsing form!');
        // res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
       });
       req.pipe(busboy);
   
   
   
   
     })



module.exports = router