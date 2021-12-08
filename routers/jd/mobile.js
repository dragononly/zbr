'use strict';
const router = require('koa-router')();
const Koa = require('koa');
const app = new Koa();
const commodity = require("../../mongodb/schema/jd/commodity_list.js");
const ce=require("../../mongodb/schema/jd/commodity_each.js");
const qs = require('querystring');
const jd_user = require("../../mongodb/schema/user.js");
const wxdb = require("../../mongodb/schema/wx.js");
const QcloudSms = require("qcloudsms_js");
const zp = require("../../mongodb/schema/jd/zp.js");
const getup_user = require("../../mongodb/schema/jd/wx_user.js");
const getup_config = require("../../config/getup_config.js");
const request = require('koa2-request');
const moment = require('moment'); 
const crypto = require('crypto');
const store_list = require("../../mongodb/schema/jd/store_list.js");

let test;
router.get('/jd_mobile/', async (ctx, next) => {

    let     data = ctx.query.data,
            order=ctx.query.order;
    switch(order){


		case 'wxapp_phone_save':
		{
			let openid=ctx.query.openid,phone_number=ctx.query.phone_number;
			//above all ,query mongodb is exist phone number
			let result_phone_number=await wxdb.findOne({'phone_number':phone_number})
			
				if(result_phone_number==null){
					const userSchema = new wxdb({'wxapp':openid});
					try {
						const result2= await userSchema.save();

						if(result2){
							let result3= await	wxdb.update({'wxapp':openid},{'phone_number':phone_number})
							console.log(result3)
							ctx.body=result3
						}
					
					} catch (error) {
						console.log(error)
						
					}
				}else{
					//but however this phone is to be,we want rely on this phone number as condition to save this userinfo
					ctx.body= await	wxdb.update({'phone_number':phone_number},{'wxapp':openid})
					//come here ,our wx public number login is end!!! 
					//thank you , xiongzhongbo !!
				}
			
		}
		break;

		case 'wxkf_userinfo_login':
		{   
			//1.1 is here have only openid for app longin
			try {
			 data=JSON.parse(data)
				} catch (error) {
					console.log(error)
					return
				}
			//console.log(data)
			//获取到了xfapp的openid
			// console.log(data.userinfo.target.authResult)==>
			// useful only openid

			//console.log(data.userinfo.target.userinfo)==>undefined
            let openid=data.userinfo.target.authResult.openid
			//app await our herf url  so we give it to him,it is is_phone_app.ejs
			await ctx.render('jd/mobile/store_list/is_phone_app',{openid:openid})

		}
		break;
		case 'phone_save':
		{  
		   //already gain some infomation
		   let openid=ctx.query.openid,phone_number=ctx.query.phone_number;
		   let userinfo=ctx.query.userinfo
			   try {
				userinfo=JSON.parse(userinfo)
			   } catch (error) {
				   console.log(error)
				   return
			   } 
		     //to mongodb query  phone number is exist
			 let result=await wxdb.findOne({'phone_number':phone_number})
			 //if result is null，so it no have phone number ，then we want try save this userinfo
			 //because the phone is no exist,meanwhile we want save this phone number 
			 if(result==null){
				const userSchema = new wxdb({'wx':userinfo});
				try {
					const result2= await userSchema.save();

					//console.log(userinfo.openid)

					if(result2){
						let result3= await	wxdb.update({'wx.openid':userinfo.openid},{'phone_number':phone_number})
						ctx.body=result3
					}
				} catch (error) {
					console.log(error)
					
				}
			 }else{
				//but however this phone is to be,we want rely on this phone number as condition to save this userinfo
				ctx.body= await	wxdb.update({'phone_number':phone_number},{'wx':userinfo})
				//come here ,our wx public number login is end!!! 
				//thank you , xiongzhongbo !!
			 }

         
		}
		break;
		

		case 'wxapp_query_phone_exist':
		 {  
		  let openid=ctx.query.openid;
		     
			const result= await	wxdb.findOne({'wxapp':openid},{phone_number:1})
			try {
				if(result==null){
					ctx.body=null
					return
					
				}
				ctx.body=result.phone_number
			} catch (error) {
				console.log(error)
			}
			
		}
		break;
		
		case 'query_phone_exist':
		 {  
		  let openid=ctx.query.openid;

		  
			const result= await	wxdb.findOne({'wx.openid':openid},{phone_number:1})
			try {
				if(result==null){
					ctx.body=null
					return
					
				}
				ctx.body=result.phone_number
			} catch (error) {
				console.log(error)
			}
		}
		break;


		case 'gain_store_ware':
		{
		  //根据商家名去遍历出它所有的列表，因为所有商品列表里面，可能没有是通过商家名索引的
		  //所以我们决定，把它转换为通过商家user去索引，先从数据库中获得user
		  let 	store_name=ctx.query.store_name;
		  let   callback_user
		  try{

			callback_user=await store_list.findOne({'message.store_name':store_name},{user:1})
		  // callback_user.user==>is user val
		  }catch(e){
			  console.log('数据库findOne失败'+e)
			  return
		  }
		  if(callback_user){
			ctx.body=await ce.find({'user':callback_user.user})
		  }else{
			console.log("callback_user=undefind")
			return
		  }
		  

		}
		break;

		case 'store_page_mobile':
		{  //跳转到商家店铺ware展览
			let store_name=ctx.query.store_name
			await ctx.render('jd/mobile/store_list/index',{
                'data':store_name,   
           })
		}
		break;

		case 'store_list_set_information':
		{data=JSON.parse(data)
		   console.log(data)
		   ctx.body =	await store_list.update({user:data.user},
			{'$set':{'message.loft':data.loft,'message.genre':data.genre,'message.child_genre':data.child_genre}});
		}	
		break;
		
		case 'save_store_logo':
		{data=JSON.parse(data)		
			ctx.body =	await store_list.update({user:data.user},{'$set':{'message.logo':data.logo_src}});		
		}
		break;

		case 'gain_store_name_list':
		{//去后台获取商家列表，给前端展示
			ctx.body =	await store_list.find({})
		}
		break;

	   
		case 'get_end_store':
		{
			//通过店家名去获取后台的已经完成的订单
			data=JSON.parse(data)
								
			try{
				ctx.body=await store_list.aggregate([
				{ $unwind : "$pay"},
				{ $match : {"user":data.user,'pay.pay':'评价完毕'}},
				{ $project : {"pay":1}},
				])
			}catch(error){
				console.log(error)
			}
		}
		break;

		case 'get_pingjia_store':
		{
			//通过店家名去获取后台的等待评价的订单。
			data=JSON.parse(data)
					
			try{
				ctx.body=await store_list.aggregate([
				{ $unwind : "$pay"},
				{ $match : {"user":data.user,'pay.pay':'等待评价'}},
				{ $project : {"pay":1}},
				])
			}catch(error){
				console.log(error)
			}
		}
		break;
	   
		case 'ware_end':
		{   
			try {
				data=JSON.parse(data)
			} catch (error) {
				console.log(error)
				return
			}
				let result_await;
				//如果是app的方式
				if(data.way=="app"){
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wxapp":data.openid,'xf.pay.pay':'评价完毕'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}else{
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wx.openid":data.openid,'xf.pay.pay':'评价完毕'}},
						{ $project : {"xf.pay":1,"_id":0}},
					   ])
				}
                ctx.body=result_await


		}
		break;

		case 'pingjia_user':
        {   
			data=JSON.parse(data)
			 //1.1检索出这条结果
			 let result
			  
			 if(data.way=="app"){

				try{
					result=await wxdb.aggregate([
					{ $unwind : "$xf.pay"},
					{ $match : {"wxapp":data.openid,'xf.pay.out_trade_no':data.out_trade_no}},
					{ $project : {"xf.pay":1}},
				   ])
			 }catch(error){
				 console.log(error)
				 return
			 }
			 if(result==""){
				 console.log("没有这条数据")
				 return}
			
			let new_pay=result[0].xf.pay
			//用户给的星级1-5
			new_pay.pay="评价完毕"
			new_pay.pingjia=data.pingjia
            new_pay.pingjia_content=data.pingjia_content
			//1.2这里得到了一个新的更新过的数据，现在根据out_trade_nopull掉原来的数据，然后再push这条进去
			try{
				const result_pull=await wxdb.update({"wxapp":data.openid},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
			}catch(error){
				console.log(error+"data.openid:"+data.openid)
				return
			}
			try{
			   const result_pull=await store_list.update({"user":new_pay.store_user},{"$pull":{"pay":{"out_trade_no":data.out_trade_no}}})
			 }catch(error){
				 console.log(error+"data.openid:"+data.openid)
				 return
			 }
   
   
		   //1.3 然后再push进这条数据,买家和商家
		   try{
			   const result_push=await wxdb.update({"wxapp":data.openid},{"$push":{"xf.pay":new_pay}})
			   
			 }catch(error){
				 console.log(error)
				 return
		   }
		   try{
			   const result_push=await store_list.update({"user":new_pay.store_user},{"$push":{"pay":new_pay}})
			   
			 }catch(error){
				 console.log(error)
				 return
		       }

			 }else{
                try{
					result=await wxdb.aggregate([
					{ $unwind : "$xf.pay"},
					{ $match : {"wx.openid":data.openid,'xf.pay.out_trade_no':data.out_trade_no}},
					{ $project : {"xf.pay":1}},
				   ])
			 }catch(error){
				 console.log(error)
				 return
			 }
			 if(result==""){
				 console.log("没有这条数据")
				 return}
			
			let new_pay=result[0].xf.pay
			//用户给的星级1-5
			new_pay.pay="评价完毕"
			new_pay.pingjia=data.pingjia
            new_pay.pingjia_content=data.pingjia_content
			//1.2这里得到了一个新的更新过的数据，现在根据out_trade_nopull掉原来的数据，然后再push这条进去
			try{
				const result_pull=await wxdb.update({"wx.openid":data.openid},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
			}catch(error){
				console.log(error+"data.openid:"+data.openid)
				return
			}
			try{
			   const result_pull=await store_list.update({"user":new_pay.store_user},{"$pull":{"pay":{"out_trade_no":data.out_trade_no}}})
			 }catch(error){
				 console.log(error+"data.openid:"+data.openid)
				 return
			 }
   
   
		   //1.3 然后再push进这条数据,买家和商家
		   try{
			   const result_push=await wxdb.update({"wx.openid":data.openid},{"$push":{"xf.pay":new_pay}})
			   
			 }catch(error){
				 console.log(error)
				 return
		   }
		   try{
			   const result_push=await store_list.update({"user":new_pay.store_user},{"$push":{"pay":new_pay}})
			   
			 }catch(error){
				 console.log(error)
				 return
		   }
			 }
			 
		   
		   ctx.body="true"


		}
		break;
      


		case 'pingjia':
        {   
			try {
				data=JSON.parse(data)
			} catch (error) {
				console.log(error)
				return
			}
				let result_await;
				//如果是app的方式
				if(data.way=="app"){
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wxapp":data.openid,'xf.pay.pay':'等待评价'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}else{
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wx.openid":data.openid,'xf.pay.pay':'等待评价'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}
		  
		   ctx.body=result_await
			
		}
		break;
		
		case 'delivery':
		{  data=JSON.parse(data)
		  //商家发货，根据买家phone 和out_trade_no 去update 状态和新增，快递公司和订单编号
		   //要改商家，也要改买家的
		//  console.log(data)
		//  { address_company: '韵达',
		// address_id: '2222',
		// out_trade_no: '9454153595421954679719',
		// openid: 'oBO4y1i8XzZn-2LuGsO3uZfWBrRE' }
      
		//由于前端即使获取到phone，也可能是一个不可信赖的用户检索phone
		//所以我们将根据，wx，或者wxapp openid，去获取到绑定的用户手机号，以求得，真正的数据。
		//.find({"$or" : [ {’age’:18} , {’name’:’xueyou’} ] });

		let result_phone=await wxdb.findOne({"$or":[{'wx.openid':data.openid},{'wxapp':data.openid}]})
	
		//result_phone.phone_number==>手机号

		 //1.1检索出这条结果
		 let result
		 try{
			    result=await wxdb.aggregate([
				{ $unwind : "$xf.pay"},
				{ $match : {"phone_number":result_phone.phone_number,'xf.pay.out_trade_no':data.out_trade_no}},
				{ $project : {"xf.pay":1}},
			   ])
		 }catch(error){
			 console.log(error)
			 return
		 }
		
		 if(result==""){
			 console.log("没有这条数据")
			 return}
		//    console.log(result[0].xf.pay)
        let new_pay=result[0].xf.pay
		//    { price: '0.01',
		// 	size: 'pro',
		// 	color: '白色',
		// 	openid: 'ogwUO1qiKl-1wlvs-NWsja5ij1js',
		// 	nickname: '叫我东方叔叔',
		// 	store_user: 'test',
		// 	ware_name: '华为p20手机华为p20手机华为p20手机华为p20手机手机',
		// 	ems: '0.01',
		// 	logo: '../cloud/test/568e2b72N46418c55.jpg',
		// 	user: '熊猫的',
		// 	address: '江苏省无锡市',
		// 	phone: '17625402448',
		// 	out_trade_no: '6d45152965228896964784',
		// 	pay: '支付成功' }
		new_pay.address_company=data.address_company
		new_pay.address_id=data.address_id
		new_pay.pay="已经发货"

		//1.2这里得到了一个新的更新过的数据，现在根据out_trade_nopull掉原来的数据，然后再push这条进去
         try{
		     const result_pull=await wxdb.update({"phone_number":result_phone.phone_number},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
	     }catch(error){
			 console.log(error+"data.openid:"+data.openid)
			 return
		 }
		 try{
			const result_pull=await store_list.update({"user":new_pay.store_user},{"$pull":{"pay":{"out_trade_no":data.out_trade_no}}})
		  }catch(error){
			  console.log(error+"data.openid:"+data.openid)
			  return
		  }


		//1.3 然后再push进这条数据,买家和商家
		try{
			const result_push=await wxdb.update({"wx.openid":data.openid},{"$push":{"xf.pay":new_pay}})
			
		  }catch(error){
			  console.log(error)
			  return
		}
		try{
			const result_push=await store_list.update({"user":new_pay.store_user},{"$push":{"pay":new_pay}})
			
		  }catch(error){
			  console.log(error)
			  return
		}
		
        ctx.body="true"

		}
		break;

		case 'get_shouhuo_true':
		{//通过店家名去获取后台的已经付款的订单
			data=JSON.parse(data)
		
          try{
			  ctx.body=await store_list.aggregate([
				{ $unwind : "$pay"},
				{ $match : {"user":data.user,'pay.pay':'已经发货'}},
				{ $project : {"pay":1}},
			   ])
		  }catch(error){
                console.log(error)
		  }
		}
		break;

		case 'get_pay_true':
		{//通过店家名去获取后台的已经付款的订单
			data=JSON.parse(data)
          try{
			  ctx.body=await store_list.aggregate([
				{ $unwind : "$pay"},
				{ $match : {"user":data.user,'pay.pay':'支付成功'}},
				{ $project : {"pay":1}},
			   ])
		  }catch(error){
                console.log(error)
		  }
		}
		break;

		case 'pay_off':
		{//用户取消订单
			
		   //1.1前端传过来的 data是订单号 17f1152955919544425119
		   //2.1然后,通过这个订单号，pull掉这个数组
		  data=JSON.parse(data)
		  
			try{
				ctx.body=await wxdb.update({"wx.openid":data.openid},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
			}catch(error){
				console.log(error)
				return
			}

		}
		break;

		case 'pay_true':
        {         
			try {
				data=JSON.parse(data)
			} catch (error) {
				console.log(error)
				return
			}
				let result_await;
				//如果是app的方式
				if(data.way=="app"){
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wxapp":data.openid,'xf.pay.pay':'支付成功'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}else{
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wx.openid":data.openid,'xf.pay.pay':'支付成功'}},
						{ $project : {"xf.pay":1,"_id":0}},
					   ])
				}
                ctx.body=result_await
		}
		break;
		
		case 'shouhuo_true':
		{
			data=JSON.parse(data)
			//1.1我们只需要改边状态就行，把pay.pay改成等待评价，这里可能要改两个地方，还有商家那里也需要更加一下
			//先去寻找到这条唯一的记录out_trade_no
            console.log(data)
			//看是来自于app的请求，还是wx的请求
			let result_await;
			if(data.way=="app"){
				result_await=await wxdb.aggregate([
					{ $unwind : "$xf.pay"},
					{ $match : {"wxapp":data.openid,'xf.pay.out_trade_no':data.out_trade_no}},
					{ $project : {"xf.pay":1,"_id":0}},
				   ])
			}else{
                result_await=await wxdb.aggregate([
					{ $unwind : "$xf.pay"},
					{ $match : {"wx.openid":data.openid,'xf.pay.out_trade_no':data.out_trade_no}},
					{ $project : {"xf.pay":1,"_id":0}},
				   ])
			}
				 
			//获取到了，需要更新的数据
			if(result_await=="" || result_await==undefined){
				console.log('数据库获取失败，数据存在不一致')
				return}
			const change_date=result_await[0].xf.pay
			change_date.pay="等待评价"

			//现在去更新，买家和卖家的这条数据，更新为等待评价
			//1.2这里得到了一个新的更新过的数据，现在根据out_trade_nopull掉原来的数据，然后再push这条进去
			
            if(data.way=="app"){

				try{
					const result_pull=await wxdb.update({"wxapp":data.openid},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
				}catch(error){
					console.log(error+"data.openid:"+data.openid)
					return
				}
				try{
				
				   const result_pull=await store_list.update({"user":change_date.store_user},{"$pull":{"pay":{"out_trade_no":data.out_trade_no}}})
				 }catch(error){
					 console.log(error+"data.openid:"+data.openid)
					 return
				 }
	   
				
			   //1.3 然后再push进这条数据,买家和商家
			   try{
				   const result_push=await wxdb.update({"wxapp":data.openid},{"$push":{"xf.pay":change_date}})
				 }catch(error){
					 console.log(error)
					 return
			   }
			   try{
				   const result_push=await store_list.update({"user":change_date.store_user},{"$push":{"pay":change_date}})
				   
				 }catch(error){
					 console.log(error)
					 return
			   }

			}else{

			

			try{
				const result_pull=await wxdb.update({"wx.openid":data.openid},{"$pull":{"xf.pay":{"out_trade_no":data.out_trade_no}}})
			}catch(error){
				console.log(error+"data.openid:"+data.openid)
				return
			}
			try{
			
			   const result_pull=await store_list.update({"user":change_date.store_user},{"$pull":{"pay":{"out_trade_no":data.out_trade_no}}})
			 }catch(error){
				 console.log(error+"data.openid:"+data.openid)
				 return
			 }
   
            
		   //1.3 然后再push进这条数据,买家和商家
		   try{
			   const result_push=await wxdb.update({"wx.openid":data.openid},{"$push":{"xf.pay":change_date}})
			 }catch(error){
				 console.log(error)
				 return
		   }
		   try{
			   const result_push=await store_list.update({"user":change_date.store_user},{"$push":{"pay":change_date}})
			   
			 }catch(error){
				 console.log(error)
				 return
		   }
		}

				  ctx.body='true'
		}
		break;

		case 'shouhuo':
		{   

            try {
				data=JSON.parse(data)
			} catch (error) {
				console.log(error)
				return
			}
				let result_await;
				//如果是app的方式
				if(data.way=="app"){
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wxapp":data.openid,'xf.pay.pay':'已经发货'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}else{
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wx.openid":data.openid,'xf.pay.pay':'已经发货'}},
						{ $project : {"xf.pay":1,"_id":0}},
						
					])
				}
		  
		   ctx.body=result_await


		}
		break;
		case 'await_pay':
        {          try {
						data=JSON.parse(data)
						
					} catch (error) {
						console.log(error)
						return
					}
				let result_await;
				 //如果是app的方式
				 if(data.way=="app"){
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wxapp":data.openid,'xf.pay.pay':'await'}},
						{ $project : {"xf.pay":1,"_id":0}},
						 
					   ])
				 }else{
					result_await=await wxdb.aggregate([
						{ $unwind : "$xf.pay"},
						{ $match : {"wx.openid":data.openid,'xf.pay.pay':'await'}},
						{ $project : {"xf.pay":1,"_id":0}},
						 
					   ])
				 }
				  
				   ctx.body=result_await
		}
		break;

		
		
		case 'shop_cart_delete':
		{//购物车删除动作
			data=JSON.parse(data)
			console.log(data)
			ctx.body=await wxdb.update({"wx.openid":data.openid},{"$pull":{"xf.shop_cart":{"id":data.id}}})
         
		}
		break;
        

		//获取买家收货地址
		case 'get_address':
		{   console.log(data)
			data=JSON.parse(data)
			ctx.body= await wxdb.find({'phone_number':data.phone},{'xf.address':1})
		}
		break;

		case 'get_ware_of_id':
		{   data=JSON.parse(data)
			//一键对应多个值
			let id=[]
		    for (const i of data.id) {
				id.push(i.id)
			}
	
			ctx.body =await	ce.find({"_id":{"$in":id}},{'information.imga1':1,'information.name':1,'information.price':1,'information.ems':1,'information.pack.store_name':1})
			
			
		}
        break;
		case 'get_shop_cart':
		{    data=JSON.parse(data)
             ctx.body= await  wxdb.findOne({'wx.openid':data.openid},{'xf.shop_cart':1})
		}
		break;
		
        //my shop_cart
		case 'jd/mobile/ucenter':
        {
			if(ctx.session.user){
		    	await ctx.render(order,{
		    		user:ctx.session.user
		    	})}
		    else{
		         await ctx.render('jd/mobile/ucenter',{
					user:ctx.session.user
				 })
		    }	    
		}
		break

		case 'save_shop_cart':
		{  data=JSON.parse(data)
			
		   ctx.body=await wxdb.update({'wx.openid':data.openid},{'$push':{'xf.shop_cart':data}})
		}
		break;

		case 'login_phone':	
		data=JSON.parse(data)
		{
			const cab=await jd_user.find({phone:data.phone,password:data.password})
			if(cab!=""){
				ctx.session.user=cab[0].user
				ctx.body=ctx.session.user
			}else{ctx.body=false}
			
		}
         break;

		case "login_user":
			data=JSON.parse(data)
			{
				const cab=await jd_user.find({user:data.user,password:data.password})
				if(cab!=""){
					 
					ctx.session.user=data.user
					console.log(ctx.session.user)
					ctx.body=ctx.session.user
					
				}else{ctx.body=false}
				
			}
		
		break;

		case 'login_phone2':	
		data=JSON.parse(data)
		{
			const cab=await jd_user.find({phone:data.phone,password:data.password})
			if(cab!=""){
				ctx.session.user=cab[0].user
				ctx.body=ctx.session.user
				await ctx.render('jd/mobile/ucenter',{
		    		user:ctx.session.user
		    	})
			}else{ctx.body=false}
			
		}
         break;

		case "login_user2":
			data=JSON.parse(data)
			{
				const cab=await jd_user.find({user:data.user,password:data.password})
				if(cab!=""){
					 
					ctx.session.user=data.user
					await ctx.render('jd/mobile/ucenter',{
						user:ctx.session.user
					})
					
				}else{ctx.body=false}
				
			}
		
		break;
		 case 'get_ware_of_storename':
		 { //通过商家名，进去检索出属于他的商品
		 	const store_name=ctx.query.store_name
			ctx.body=await ce.find({'user':store_name},{_id:1,'information.imga1':1,'information.name':1,'information.price':1})
		 }
		 break;

		case 'zp_user_promise_clear':
        {
			let id=ctx.query.id
			ctx.body=await getup_user.update({'_id':id},{'$pop':{'cake':-1}})
		}
		break;

		case 'zp_user_promise':
		{
		 const nickname=ctx.query.nickname;
		 ctx.body=await	getup_user.find({'nickname':nickname},{'cake':1})
         
		}
		break;

		case 'jd/mobile/zhuanpan/promise':
		{
			await ctx.render(order,{
			
		    })
		}
		break;
		
		case 'zp_find_cake':
        {
				  ctx.body=await getup_user.find({},{'cake':1,'zp_one':1})
				 
		}
		break;

		case 'zp_one_click':{

		
	     	let	openid = ctx.query.openid;
				   ctx.body=await getup_user.update({'openid':openid},{'$push':{'zp_one':1}})
				
		}
		break;



		case 'zp_user_one':
		{let	openid = ctx.query.openid;
			ctx.body =await getup_user.findOne({'openid':openid},{'zp_one':1,'cake':1})
				 
					 
				 
		}
		break;

		case 'zp_save_cake':
		{ let	openid = ctx.query.openid,
				cake=ctx.query.cake;
				try{

				
		  let uu=await getup_user.update({'openid':openid},{'$push':{'cake':cake}})}catch(error){
		  }
		  
                
		}
		break;

		case 'xf_zp_minus':
        {   let	uu = ctx.query.uu;
			let cab= await zp.findOne({})
			if(uu=='mu1'){
              let n_mu1=cab.xf.data.mu1-1
			  ctx.body =  await	zp.update({'_id':cab._id},{'xf.data.mu1':n_mu1})

			}else if(uu=='mu2'){
				let n_mu2=cab.xf.data.mu2-1
			    ctx.body =  await	zp.update({'_id':cab._id},{'xf.data.mu2':n_mu2})
			}else if(uu=='mu3'){
				let n_mu3=cab.xf.data.mu3-1
				ctx.body =  await	zp.update({'_id':cab._id},{'xf.data.mu3':n_mu3})
			}else if(uu=='mu4'){
				let n_mu4=cab.xf.data.mu4-1
				ctx.body =  await	zp.update({'_id':cab._id},{'xf.data.mu4':n_mu4})
			}else if(uu=='mu5'){
                let n_mu5=cab.xf.data.mu5-1
				ctx.body =  await	zp.update({'_id':cab._id},{'xf.data.mu5':n_mu5})
			}

		}
		break;
		
		case 'get_xf_zp':
		{
		   
           ctx.body= await zp.findOne({})
		}
		break;

		case 'xf_zp':
        {  
		  data=JSON.parse(data)
		  let cab_find=await zp.findOne({})
		  let xf={data}
		  if(cab_find!=null){
            ctx.body =  await  zp.update({'_id':cab_find._id},{'xf':xf})
		  }else{
			let save=new zp({"xf":xf})
			ctx.body=await save.save()
		  }
		}    
		break;
		
		case 'jd/mobile/zhuanpan/zp_admin':
        {
			await ctx.render(order,{
		    })
		}
		break;

		case 'jd/mobile/zhuanpan/zhuanpan':
		{

// 			await ctx.render('jd/mobile/zhuanpan/zhuanpan',{
// 				"openid": openid,
// 				//如果我还没打卡，在usersInfo中就不会有我了，所以需要currentUserInDB
// 				"nickname": currentUserInDB[0].nickname, 
	    		
// 			});
	     	}
		break;


		case 'car_pass':
		{   let time=moment().format('MMMM Do YYYY, h:mm:ss a'); 
			
			await ctx.render('jd/jump_his_admin',{
                   time:time
			})
		}
		break;
		
		case 'test':
		{
			await ctx.render('jd/jump_his',{

			})
		}
       
		case 'sb': 
		{   
            // // console.log(ctx.query)==》
			// // { order: 'sb',
			// // code: '061q5e2t0vR2zd1dfv4t0t6c2t0q5e23',
			// // state: '123' }
			const code=ctx.query.code
			const wx = require('../../utils/wechat2.js'); 
			let accessTokenUrl,accessTokenResp
			try{
				accessTokenUrl = await wx.getAccessTokenUrl(code);
			}catch(e){
				console.log('getAccessTokenUrl error'+e)
			}

			try{
				accessTokenResp = await request(accessTokenUrl);
			}catch(e){
				console.log('accessTokenResp error'+e)
			}

			try{
				accessTokenResp = JSON.parse(accessTokenResp.body);
			}catch(error){
				console.log('with wechat service message error')
                return 
			}				
			//2.1.3 use access_token get user message
				let userInfoUrl =await wx.getUserinfoUrl(accessTokenResp['access_token'], accessTokenResp['openid']);
				let userInfoResp = await request(userInfoUrl);
				try{
					userInfoResp = JSON.parse(userInfoResp.body);
				}catch(error){
					console.log('with wechat service message error')
                    return 
				}
			//2.4if this null,target error page
				if(!userInfoResp.openid){
					const error=new Date() + ", fail to get openid from wx: " + JSON.stringify(userInfoResp)
					console.log(error);
					await ctx.render('error', {error: error});
				}
			//3.1when this user first login
				const callback=await wxdb.findOne({'wx.openid':userInfoResp.openid})
				if(callback==null){
					//如果是第一次登陆，那么应该去询问，数据库中的手机号是否存在。因为可能app已经抢注过
					// console.log(1111)
                    
					// const userSchema = new wxdb({wx:userInfoResp});
					// await userSchema.save();
				}else{
			//3.2this db is not save() update this user img
			      try{await wxdb.update({'wx.openid':userInfoResp.openid},{'wx.headimgurl':userInfoResp.headimgurl})
				  }catch(error){
					  console.log('数据库更新一条失败'+error)
					  return
				  }
				}

			//4.1 微信登陆成功，可以送往前端，个人信息参数是userInfoResp
			userInfoResp=JSON.stringify(userInfoResp)
			await ctx.render('jd/mobile/store_list/is_phone',{id:userInfoResp.openid,userinfo:userInfoResp})
                //await ctx.render('jd/mobile/tishen',{id:userInfoResp.openid,nickname:userInfoResp.nickname})
		    	
		}
		break;
		

		case 'reg' :
		     await ctx.render('jd/mobile/reg')
		break;
		
		case 'admin_ac' :
            ctx.session.jd_user="ac"
		     await ctx.render('jd/mobile/admin_ac',{
		     	user:"ac",
		     })
		break;
		
		case 'login' :
		     await ctx.render('jd/mobile/login')
		break;
		
		case 'activ' :
		     data=JSON.parse(data)
		       {
		     	const cab=await jd_user.find({user:data.user,password:data.password})

		     	if(cab!=""){

		     		  ctx.session.jd_user=data.user     
		     		  await ctx.render('jd/mobile/activ',{
					     	user:data.user
					     })
		     		
		     	}else{ctx.body=false}
		     	
		     }
		 

		break;
		
		case 'take_agio':
		    {  
		    	data=JSON.parse(data)
		         
		     let user_save=null,user=data.user;               
                 delete data.user;
		         
		         let me = new jd_user ({
				        user : data.user,                 
				        agio:data                 
				   });
				   console.log(data)
				    try {
				    	user_save= await jd_user.update({'user':user},{$addToSet:{'agio':data}},{multi:true})
	                  		   
	                  } catch (error) {
					   console.log(error)
					   ctx.body=false
					   return
				      }

				   if(user_save){
				   
                        ctx.body=true
				   }else{ctx.body=false}
		    }
		break;
		
		
		case 'find_agio':
		    {  
		    	
		    	
		    	
		    	
		    	 let res=await commodity.find({'grade1':data.grade1,"child.grade2":data.grade2},'child.$')
//		    	data=JSON.parse(data)
//		         
//		     let user_save=null,user=data.user;               
//               delete data.user;
//		         
//		         let me = new jd_user ({
//				        user : data.user,                 
//				        agio:data                 
//				   });
//				    try {
//				    	user_save= await jd_user.update({'user':user},{$addToSet:{'agio':data}})
//	                  		   
//	                  } catch (error) {
//					   console.log(error)
//					   ctx.body=false
//					   return
//				      }
//
//				   if(user_save){
//				   
//                      ctx.body=true
//				   }else{ctx.body=false}
		    }
		break;
		
		case 'phone_login':
            data=JSON.parse(data)
              let uu=Math.floor(Math.random()*1000000).toString().substr(1,4);

			// 短信应用SDK AppID
			var appid = 1400088425;  // SDK AppID是1400开头
			
			// 短信应用SDK AppKey
			var appkey = "9109efacccba075a040b2746afd502a5";
			
			// 需要发送短信的手机号码
			var phoneNumbers = ["17625402448"];
			    phoneNumbers[0]=data.user
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
			
			
			
			 
			
			///console.log('data'+data)
			
			 if(data.list=='0'){
		       
		     //	const cab=await jd_user.find({user:data.user,password:data.password})
//          console.log("222"+ctx.session.yan)
            
		     	//if(data.password==test){

		     		  ctx.session.jd_user=data.user     
		     		  await ctx.render('jd/mobile/activ',{
					     	user:data.user
					     })
		     		
		     //	}
		     	
		     }else if(data.list=='1'){
//		     	test=uu
//		     	console.log("111"+ctx.session.yan)

		     	ctx.body=uu
		     	
		     }
			
			
	    break;



        case 'page1':
          
          await ctx.render('jd/mobile/page1',{
			user:ctx.session.user	
					     })
        
        break;
        
        case 'page2':
          
          await ctx.render('jd/mobile/page2',{
			user:ctx.session.user     	
					     })
        
        break;
        
        case 'page3':
          
          await ctx.render('jd/mobile/page3',{
			user:ctx.session.user    	
					     })
        
        break;
        
        case 'page4':
          
          await ctx.render('jd/mobile/page4',{
			user:ctx.session.user   	
					     })
        
        break;
        
        case 'page5':
          
          await ctx.render('jd/mobile/page5',{
			user:ctx.session.user	     	
					     })
        
        break;


















		    

}//switch end!!!!
          
          //require('./way/way.js')
});











module.exports = router

