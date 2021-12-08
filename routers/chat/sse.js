const router = require('koa-router')();
const fs = require('fs-extra')
router.get('/sse', async (ctx, next) => {
   

  let  im=ctx.query.im

  let json=  fs.readJSONSync('./chatdb/chat.json')
      //json=JSON.stringify(json)
 ctx.set({"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"})

// 不加"\n\n"就有问题，前端接收不到
 ctx.body="data:" +json.chat[im]['state']+"-"+json.chat[im].user+"\n\n"


 //1.1state是客户端，默认值为false，如果有人发送消息给他，就把状态改成true
 //1.2并且署名，把自己的给他发消息的名字，push到user数组中。
 //1.3当前端sse 收到状态为true时候，根据user数组去拉去数据库中的消息记录。（返回给前端sse和user）
 //（user是可以重复的，需要去重），然后前端就有新的消息了。
 //1.4为了防止在时间维度上的冲突。数据库结束后，将检查user数组的长度，如果长度增长。
 //1.5用substr将获取新的长度数组，并且更新json中的user，再次去拉去数据库中的消息。重复1.3的动作
 //1.6如果最后user数组长度和原来的相同，那么就关闭state，并且使json中的user为空


 ctx.req.connection.addListener("close", function () {
	          console.log('他已经结束会话')
	    }, false);

	
	
	
	
	
	
	


})//router end1



module.exports = router