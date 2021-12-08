const router = require('koa-router')();
const question_db = require("../../mongodb/schema/question/db.js");
const question_voucher = require("../../mongodb/schema/question/voucher.js");
const question_card_find= require("../../mongodb/schema/question/card_find.js");
const Koa = require('koa');
const app = new Koa();


router.get('/question/:id', async (ctx, next) => {

 let where=ctx.params.id,
 data=ctx.query.data;
        
 switch(where){

 case 'index':
           	
 await ctx.render('question/'+where,{
            	data:data,
    })

 break; 
            
            
 case 'depot':
           	
 await ctx.render('question/'+where)

 break; 
            
 case 'card':
           	
 await ctx.render('question/'+where,{
            	data:data,
            })
           	
           	
 break; 
            
 case 'admin':
           	
 await ctx.render('question/'+where)

 break; 
            
            
 case 'depot_add':
           	
 let store=ctx.query.store;
           	       
 let question_add = new question_db({
           	     	    store:store,
				        data:data,
				        logindate : new Date()                      
			      });
           	
 const question_save=await question_add.save()
           	     
 if(question_save){ctx.body=true}

 break; 
         
 case 'depot_get':
           
                {

                 let store=ctx.query.store    
           	     ctx.body = await question_db.find({store:store})
           	     
	            }
                
 break; 
            
            
 case 'starting':
           	
 await ctx.render('question/'+where,{
           	     	data:data,
           	     })

 break; 
            
 case 'voucher':
           	
 await ctx.render('question/'+where)

 break;            
            
 case 'voucher_add':
           	        
           	     data=data.split(',');
           	     {
	                    let store=ctx.query.store;
	                    let store_mark=ctx.query.store_mark;

	           	        let voucher_add = new question_voucher({
	           	        	store_mark:store_mark,
	           	        	store:store,
					        data:data,
					        logindate : new Date()                      
				         });
	           	       
	           	       const voucher_save=await voucher_add.save()
	           	       if(voucher_save){ctx.body=true}
                  }  
                  
 break; 
            
            
 case 'card_get':
                 
                 {
                 	let store = ctx.query.store;
                 
                 	ctx.body=await question_voucher.find({store:store})
                 	
                 
                 	
                 }
            
            
            
            
           	        
//                data=data.split(',')    
//                
//                console.log(data)
//                    
//         	      ctx.body =await question_voucher.find({"data": { "$in": data} })

 break; 
           
 case 'erwei':

               await ctx.render('question/'+where)
                 
 break; 
 
 case 'user_analysis':

               await ctx.render('question/'+where)
                 
 break; 
 
 
 


            
 case 'card_user_save':
                 
	            {   
	            	
	            	let data_card=ctx.query.data_card,
	            	    data_card_user=ctx.query.data_card_user,
	            	    store=ctx.query.store;
	            	    
	            	    data_card=data_card.split(',')
	            	    data_card_user=data_card_user.split(',')
	            	    
	            	let save = new question_card_find({
	           	        	store:store,
					        data_card:data_card,
					        data_card_user:data_card_user,
					        logindate : new Date()                      
				         });
				         
				    ctx.body=await save.save()     

	            }
            
 break; 
    
    
     case 'store_analysis':
              
              {
              	let store_name=ctx.query.store_name;

              	  ctx.body=await  question_card_find.find({store:store_name})

              	
              }
              
                 
     break;  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
           	
}//switch end!!
         
         











});//end!








module.exports = router;
