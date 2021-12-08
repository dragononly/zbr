const router = require('koa-router')();
var chat_mongo = require("../../mongodb/schema/chat/chat_index.js");


//
router.get('/chat/free/', async (ctx, next) => {

          let order=ctx.query.order
          let name=ctx.query.name,toname=ctx.query.toname
if(!order){
	
  if(ctx.session.jd_user==name){await ctx.render('chat/index',{
 	            name:name,
 	            toname:toname,
 })}else{
 	ctx.body="非法入侵，将屏蔽ip"
 }



}else{
	
	switch(order){
//		
//		case 'test':
//                               
//                               let uu=new chat_mongo({
//                               	usera:'test'
//                               })
//                               
//                               await uu.save()
//                               
//		ctx.body='2222'
//		break;
		
	}
	
	
	
	
	
	
	
	
	
	
}//else end2

})//router end1
















module.exports = router