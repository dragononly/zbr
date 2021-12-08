'use strict';

const router = require('koa-router')();
const Koa = require('koa');
const app = new Koa();
const jd_user = require("../../mongodb/schema/user.js");
const commodity = require("../../mongodb/schema/jd/commodity_list.js");
const ce=require("../../mongodb/schema/jd/commodity_each.js");
const store = require("../../mongodb/schema/jd/store_list.js");
const qs = require('querystring');
const fs = require('fs-extra')
const QcloudSms = require("qcloudsms_js");
const wxdb = require("../../mongodb/schema/wx.js");
const inspect = require('util').inspect
const path = require('path')
const Busboy = require('busboy')
//const uuidV1 = require('uuid/v1');

router.get('/jd_index/', async (ctx, next) => {
	
	let order=ctx.query.order,
		data=ctx.query.data;
		if(data){
			try{
				data=JSON.parse(data)
			}catch(error){
				console.log(data+error)
				return
			}
		}
	    
	
switch(order){


	case 'store_message':
	{  //根据前端传过来的data.user 去获取后台的一系列信息，比如店铺名
            
		ctx.body=await store.findOne({'user':data.user})
	  //console.log(cab)
       // 
	}
	break;

	case 'delete_address':
    {   let address={}
		address.sheng=data.sheng
		address.dizhi=data.dizhi
		address.youbian=data.youbian
		address.xingming=data.xingming
		address.phone=data.phone
		ctx.body= await wxdb.update({'wx.openid':data.id},{'$pull':{'xf.address':address}})
	}
	break;
	


	case 'get_address':
	{
		ctx.body=await wxdb.find({'wx.openid':data.id},{'xf.address':1})	
	}
	break;

	case 'save_address':
	{    let address={}
			 address.sheng=data.sheng
			 address.dizhi=data.dizhi
			 address.youbian=data.youbian
			 address.xingming=data.xingming
			 address.phone=data.phone
             ctx.body= await wxdb.update({'wx.openid':data.id},{'$push':{'xf.address':address}})
	}
	break;



	case 'collect_store':
	{  

		const cab=await wxdb.findOne({'xf.collect_store':data.store})

		if(cab==null){
			try{
				ctx.body=await wxdb.update({'wx.openid':data.openid},{'$push':{'xf.collect_store':data.store}})
				}catch(error){
					console.log(error)
				}
		}else{
			ctx.body=true
		}


	}
	break;
	
	case 'collect_baby':
    {   
		const cab=await wxdb.findOne({'xf.collect_baby':data.id})
		if(cab!=null){return ctx.body=true}
		try{
		ctx.body=await wxdb.update({'wx.openid':data.openid},{'$push':{'xf.collect_baby':data.id}})
		}catch(error){
			console.log(error)
		}
	}
	break;

	case 'store_page':
	{   const store_name=ctx.query.store_name;
		const user= await store.findOne({'message.store_name':store_name},{'user':1})
		
		// console.log("user"+user)

		await ctx.render('jd/seller/user_store',{
			user:user.user
		})
		
	}
	break;


	case 'hangzhouqiwan':
	{
		const cab=await jd_user.find({user:data.user,password:data.password})

		if(cab!=""){
			ctx.session.user=data.user
		

			ctx.body=data.user
			// await ctx.render('jd/index',{
			// 	user:ctx.session.user
			// })
			
		}else{ctx.body=false}
		
	}
	break;
	
	 case 'get_store_name':
	 {  
		ctx.body=await store.findOne({'user':data.user},{'message.store_name':1})
	 }
	 break;
     



	case 'proving_store_name':
	{
	  ctx.body=await store.findOne({'message.store_name':data.name})
	
	}
	break;

	case 'search_ware':
	{
	
	  let val=data.val;
	  const reg = new RegExp(val, 'i') //不区分大小写
	  let record=await ce.find({'information.name':{$regex : reg}}).limit(30)
	  record=JSON.stringify(record)
	  await ctx.render('jd/seller/list',{
			record:record,
			user:data.user
	  })
	
	}
	break;


	case 'gain_store_message':
	   {
	   	 try{
	   	  ctx.body=await store.findOne({'user':data.user})
	   	 }catch(error){
	   	 	console.log(error)
	   	 }
	   	
	   }
	break;

	case 'open_store':
	
	    			{   
	              let save=null	   
	              let message={}         
	                  message.store_name=data.store_name;
	              console.log(message)
		          let me = new store ({
				        user : data.user,                 
				        name: data.name,                     
				        phone:data.phone,
				        message:message,
				        exist:'0',
				   });
				   
				 let cab= await store.findOne({user:data.user})
				
				    if(cab!=null){
				    	let message='已经是商家账户或者被暂停的用户，请联系管理员'
				    	message=JSON.stringify(message)
				    	ctx.body=message
				    	return
				    }
				    try {
	                   save= await me.save()		   
	                  } catch (error) {
					   console.log(error)

					   return
				      }

				   if(save){

                        ctx.body=true
				   }else{ctx.body=false}

			}
	
	
	break;
	
	
	case 'work_admin':
   
			if(ctx.session.jd_admin=="jd_admin"){
				await ctx.render('jd/admin/'+order)
			}
	break;
	
	
	
	case 'get_all_store':
	
	      let cab= await store.find({})
	      ctx.body=cab
	break;
	
	
	case 'pass_store':
	     
	      
	    {  
	    	let user=data.user
		    try { await  store.update({'user':user}, {'$set':{'exist':1} } )
		    }catch(error){
		     	console.log(error)
		     	return
		    }
	      
	        ctx.body=true
	    }
	     
	
	break;
	
	
	case 'off_store':
	     
	      
	    {  
	    	let user=data.user
		    try { await  store.update({'user':user}, {'$set':{'exist':0} } )
		    }catch(error){
		     	console.log(error)
		     	return
		    }
	      
	        ctx.body=true
	    }
	     
	
	break;
	
	
		
	case 'is_store':
		{
			let user=data.user
			let cab;
			try{
		         cab=await store.findOne({'user':user})
			}catch (error){
				console.log(error)
				return
			}
			if(cab){
				ctx.body=cab.exist
			}else{
				ctx.body=0
			}
		}
		      
		
	break;
	
	
	case 'release_true':
			{
				let user=ctx.query.user;
				//查询店铺名
				

				let mongo=new ce({
					user:user,
					information:data
				})
			  try{
			  	await mongo.save()
			  }catch(error){
			  	console.log(error)
			  	ctx.body=false
			  	return
			  }
			    ctx.body=true 
			}
	break;
	
	
	case 'get_release':
			{
			  let cab;
			  console.log(data)
			  try{
			     cab=	await ce.find({'user':data.user})
			  }catch(error){
			  	console.log(error)
			  	ctx.body=false
			  	return
			  }
			   
			    
			    ctx.body=cab
			}
	break;
	
	
	case 'update_price':
	   {
	
		   	try{
		   		
		   	let  me =	await	ce.update({'_id':data.id},{$set: {'information.price':data.new_price}})
		    //let  me =	await	ce.findByIdAndUpdate(data.id,{$set: {'information.price':data.new_price}})
            if(me){ctx.body=true}
          
            
		   	}catch(error){
		   		console.log(error)
		   		
		   	}
	   }
	
	
	break;
	
	
	case 'update_number':
	   {
	
		   	try{
		   		
		   	let  me =	await ce.update({'_id':data.id},{$set: {'information.size_number.0':data.new_number}})
			//let  me =	await	ce.findByIdAndUpdate(data.id,{$set: {'information.price':data.new_price}})
			console.log(me)
            if(me){ctx.body=true}
          
            
		   	}catch(error){
		   		console.log(error)
		   		
		   	}
	   }
	
	
	break;
	
	
	case 'seller_delete_baby':

	      try{
	      	
	      	let id=data.id
	        ctx.body=await  ce.remove({'_id':id})
	      	
	      }catch(error){
	      	console.log(error)
	      }

	break;
	
	
	case 'watch_store_name':
	      {
	      	let name=data.store_name
	      	try{
	      		ctx.body =await  store.findOne({'message.store_name':name})
	      	}catch(error){
	      		console.log(error)
	      	}
	      	
	      }

	break;
	
	case 'want_ware_message':
	    {
	    	let ware_id=data.ware_id;
	    	
	    	try{
	    		
	    		ctx.body =await  ce.findOne({'_id':ware_id})
	    		
	    	}catch(error){
	    		console.log(error)
	    		ctx.body=false
	    	}
	    	
	    	
	    	
	    }
	break;
	
	
	
	
	
	
	
	
	
	
}	
	
})















































router.get('/jd/:id', async (ctx, next) => {
	let where = ctx.params.id,
	data = ctx.query.data;

	switch(where){
		
		
		case 'admin': {

			if(ctx.session.jd_admin=="jd_admin"){
				await ctx.render('jd/admin/'+where)
			}else{
				await ctx.render('jd/admin/admin_login')
			}
			
			break; 
		}
		
		case 'login_admin': {

			  data=JSON.parse(data)
		     {
		     	const cab=await jd_user.find({user:data.user,password:data.password})
                  

		     	if(cab!=""){
		     		ctx.session.jd_admin=data.user
		     		
		     		await ctx.render('jd/admin/admin')
		     		
		     	}else{ctx.body=false}
		     	
		     }
			
			break; 
		}
		
		
			
		case 'admin_pc':

			
			if(ctx.session.jd_admin=="jd_admin"){
				await ctx.render('jd/admin/'+where)
			}
			break;
			
		case 'login':
	
			await ctx.render('jd/new/'+where)
			break;	
			
		case 'reg':
	
			await ctx.render('jd/new/'+where)
		break;		
		
		case 'reg_user':
		
		   		
			{   
			      try{data=JSON.parse(data)}catch(error){
					  console.log(error)
					  return
				  }

				  let user_save=null
		          let me = new jd_user ({
				        user : data.user,                 
				        password: data.password,                     
						phone:data.phone,
					
				   });
				    try {
	                   user_save= await me.save()		   
	                  } catch (error) {
					   console.log(error)

					   if(error.errmsg.split(':')[2]==" user_1 dup key"){

					        ctx.body=3;
                          return
					   }else if(error.errmsg.split(':')[2]==" phone_1 dup key"){
					   
					     	ctx.body=4
					      return
					   }
					   
					   
				      }

				   if(user_save){
				   	
				    	let file ='public/cloud/'+data.user
				    	let user_dir=  await  fs.ensureDirSync(file)
                        ctx.body=true
				   }else{ctx.body=false}

			}	
		
		
		break;
		
		
		
		case 'reg_code':
		{
		  data=JSON.parse(data)
          let uu=Math.floor(Math.random()*1000000).toString().substr(1,4);
          console.log(data)
		  // 短信应用SDK AppID
		  var appid = 1400088425;  // SDK AppID是1400开头
			
		  // 短信应用SDK AppKey
		  var appkey = "9109efacccba075a040b2746afd502a5";
			
		  // 需要发送短信的手机号码
		  var phoneNumbers = ["17625402448"];
			  phoneNumbers[0]=data.phone
			// 短信模板ID，需要在短信应用中申请
		  var templateId = 114631;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
			
			// 签名
			var smsSign = "广东雄风房产物业发展";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`
			
			// 实例化QcloudSms
			var qcloudsms = QcloudSms(appid, appkey);
			
			// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
			function callback(err, res, resData) {
			    if (err)
			        console.log("err: ", err);
			    else
			        console.log("response data: ", resData);
			}
			
			var smsType = 0; // Enum{0: 普通短信, 1: 营销短信}
			var ssender = qcloudsms.SmsSingleSender();

			    ssender.send(smsType, 86, phoneNumbers[0],
			    uu+"为您的登录验证码，请于1分钟内填写。如非本人操作，请忽略本短信。", "222", "222", callback);
			
			
			console.log(uu)
			ctx.body=uu
        }
		break;	
			
		case 'login_user':	

		     data=JSON.parse(data)
		     {
		     	const cab=await jd_user.find({user:data.user,password:data.password})

		     	if(cab!=""){
		     		
		     		ctx.session.user=data.user
		     		await ctx.render('jd/index',{
						 user:ctx.session.user,
						 session:true
		     		})
		     		
		     	}else{ctx.body=false}
		     	
		     }
		break;
		
		
		
		case 'login_phone':	

		     data=JSON.parse(data)
		     {
		     	const cab=await jd_user.find({phone:data.phone,password:data.password})

		     	if(cab!=""){
		     		ctx.session.user=cab[0].user
		     		await ctx.render('jd/index',{
		     			user:ctx.session.user
		     		})
		     		
		     	}else{ctx.body=false}
		     	
		     }
		break;
		
		
		case 'ucenter':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){
		    
		    	await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}
		    else{
		         await ctx.render('jd/err/must_login')
		    }
		    
			
			
		break;
		
		case 'collect':

		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}
		    
			
			
		break;
		
		case 'shop':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}  
		    else{
		         await ctx.render('jd/err/must_login')
		    }
		    
			
			
		break;
		
		case 'favourable':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}
		    
			
			
		break;
		
		case 'retreat':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}
		    
			
			
		break;
		
		case 'evaluate':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}

		break;
		
		
		case 'detail':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}

		break;
		
		
		case 'account':
	             
	           //  console.log('ctx.session.user:'+ctx.session.user)
		    if(ctx.session.user){await ctx.render('jd/center/'+where,{
		    		user:ctx.session.user
		    	})}

		break;
		
		
		case 'open_store':
		      
		      if(ctx.session.user){
		      	await ctx.render('jd/seller/'+where,{
		      	user:ctx.session.user
		        })
		      	}
		
		break;
		
		case 'my_store':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		
		case 'sell_out':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		case 'sell_in':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		
		case 'user_store':
		{   
		
	
		       
			let order=ctx.query.order,
			    user=ctx.query.user
            if(order){
				await ctx.render('jd/seller/'+where,{
		    		user:user
		    	})
			}else{
				if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}else{
		      	 await ctx.render('jd/err/must_login')
		        }
			}
		      
		      
		}
		break;
		
		
		case 'cloud':
		      
		      if(ctx.session.user){await ctx.render('jd/new/'+where,{
		      	user:ctx.session.user
		      })}
		
		break;

		case 'jumpFile':
	    {   
			let userc=ctx.query.user;
			if(ctx.session.user){await ctx.render('jd/new/cloud',{
				user:userc,
			})}	 
        } 

                
		break;
		
		case 'publish':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		case 'commodity':
		
		    {
		      data=JSON.parse(data)
		      if(data.menu=="一级目录"){
		     	  let me = new commodity ({
				       grade1:data.val                
				  });
	              let user_save=null	               
	              try {
	                   user_save= await me.save()		   
	                  } catch (error) {
					   console.log(error)
				      }
	             
				   if(user_save){ctx.body=true}else{ctx.body=false}
		     	
		     }else if(data.menu=="二级目录"){
		     	let user_save=null	               
		     	let obj={}
		     	    obj.grade2=data.val
	              try {
	                   user_save= await commodity.update({'grade1':data.grade1},{$addToSet:{'child':obj}})		   
	                  } catch (error) {
					   console.log(error)
				      }
	             
				   if(user_save){ctx.body=true}else{ctx.body=false}

		     }else if(data.menu=="三级目录"){
		     	
		     	let user_save=null	     
		     	
	              try {	   
	                user_save=await commodity.update({"grade1": data.grade1, "child.grade2":data.grade2}, {$addToSet:{"child.$.grade3":data.val}})
	             
	              } catch (error) {
					   console.log(error)
				      }
	             
				   if(user_save){ctx.body=true}else{ctx.body=false}

		     }
		    }//edge 1
		
		break;
		
		case 'commodity_get_grade1':
		     {
		       let res=await commodity.find({})
		       ctx.body=res
		     }
		break;
		
		
		case 'commodity_get_grade2':
		     {
		     	  try {
		     	  	 let res=await commodity.find({'grade1':data})
		       ctx.body=res[0].child
		     	  }catch (error){
		     	  	console.log(error)
		     	  }

		     }
		break;
		
		case 'commodity_get_grade3':
		     { data=JSON.parse(data)
		     	
		       let res=await commodity.find({'grade1':data.grade1,"child.grade2":data.grade2},'child.$')
		       ctx.body=res[0].child[0].grade3

		     }
		break;
		
		case 'release_baby':
		                                                           
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		
		case 'release_baby_on':
		                                                           
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		
		case 'list':
		      
              await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})
		
		break;
		
		case 'evaluate_seller':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		    		user:ctx.session.user
		    	})}
		
		break;
		
		
		case 'item':
		      
		      if(ctx.session.user){await ctx.render('jd/seller/'+where,{
		      	user:ctx.session.user,
		      })}
		
		break;
		
		
		case 'index3':
		        
		      await ctx.render('jd/'+where,{
		      	user:0,
		      })
		
		break;
		
		
	
		
		

		
		
		
		
		
		
			
   }//switch end!!!!
});


















































router.post('/jd_upload', async (ctx, next) => {      
 let res=ctx.res,req=ctx.req;
 let busboy = new Busboy({ headers: req.headers });
 let all={},unify_time;
 
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    	
         unify_time=uuidV1()
    	 file.pipe(fs.createWriteStream(unify_time))	
    	 all.name_time+=','+unify_time
        
    	all.name+=','+filename
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

    console.log(val)
    
    all.name_time=all.name_time.split(',');
    all.name_time.splice(0,1)
    all.name=all.name.split(',');
    all.name.splice(0,1)
    
    
    let user=val.split('-')[0],
        user_id_name=val.split('-')[1]

     for (let i= 0; i < all.name_time.length; i++) {
     	  
     	  time()
	     	 function time () {
	
	       	  fs.move(all.name_time[i], 'public/cloud/'+user+'/'+user_id_name+'.'+all.name[i].split('.')[1], function(err) {
				  if (err) {
				  	//console.error(err)
                    user_id_name+="(2)"
//				  	all.name[i]=all.name[i].split('.')[0]+'(1).'+all.name[i].split('.')[1]
				  	time()
				  	}
				  
			  })
	       	  
	       	  } 
     }

    });
    busboy.on('finish', function() {
     // console.log('Done parsing form!');
     // res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);




  })




module.exports = router

