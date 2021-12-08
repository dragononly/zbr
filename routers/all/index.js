const router = require('koa-router')();
const love = require("../../mongodb/schema/love.js");
//主页
router.get('/want', async (ctx, next) => {
   const want =ctx.query.want,
         data=ctx.query.data
            
   if(want){
            await ctx.render(want,{
                user:ctx.session.user,
                data:data
            })

        return
   }


   switch(want){


       
		case 'jd/mobile/item':
		{
			await ctx.render(want,{
				user:ctx.session.jd_user,
			})
		}
		break;

       
       //跳转到手机店铺
       case 'jd/mobile/store_list/index':
       { 
           await ctx.render(want,{
                'user':ctx.session.user,
                'data':data
           })
       }
       break;

       case '':
       {
           await ctx.render(want,{
            'user':ctx.session.user
           })
       }
       break;
   }


})



router.get('/love', async (ctx, next) => {
   const want=ctx.query.want
   let me=new love({love:want})
   await me.save()

})
router.get('/h5pay_get', async (ctx, next) => {

    await ctx.render('pay/h5pay')
 
 })

module.exports = router