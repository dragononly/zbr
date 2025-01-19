const http = require('http');
const logger = require('koa-logger')
const Koa = require('koa');
const path = require('path')
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const static = require('koa-static')
const cors = require('koa2-cors');
const app = new Koa()
const WebSocket = require('ws');
global.secret = 'jwt xzb'
app.keys = ['some secret hurr'];


app.use(bodyparser({
  jsonLimit: 1000000000,
  formLimit: 1000000000,
  textLimit: 1000000000,
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
    text: ['text/xml', 'application/xml']
  }
}));


const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 864000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};


app.use(session(CONFIG, app));
const port = 2000
const server = http.createServer(app.callback()).listen(port);
global.wss = new WebSocket.Server({ server });
wss = global.wss
console.log(`端口号${port}`)
app.use(cors({
  origin: function (ctx) {
    // if (ctx.url === '/test') {
    //     return "*"; // 允许来自所有域名请求
    // }
    return "*";
    // //return 'http://localhost:8080'; / 这样就能只允许 http://localhost:8080 这个域名的请求了
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 6500000,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
})
)
//jwt 这个是授权地址，其它的所有地址都需要授权，才能，不然会被直接拦截这里先关掉这个
//强大的功能
// app
//     .use(jwtKoa({secret}).unless({
//         path: [/^\/companypg\/login/,/^\/companypg\/bannner/] //数组中的路径不需要通过jwt验证

//     }))

// //使用中间件验证token合法性
// app.use(jwtKoa ({
//   secret:  secret 
// }).unless({
//   path: ['/companypg', '/getUserInfo',"/jump"]  //除了这些地址，其他的URL都需要验证
// }));

//拦截器
// app.use(function (err, req, res, next) {
//   //当token验证失败时会抛出如下错误
//   if (err.name === 'UnauthorizedError') {   
//       //这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
//       res.status(401).send('invalid token...');
//   }
// });

// //定义一个接口，返回token给客户端
// app.get('/getUserInfo', function(req, res) {
//   res.json({
//       token: token
//   })
// })


app.use(logger())
//mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://101.132.35.248/user');


// needed for cookie-signing
// app.keys = ['some secret key']; 

//app.use(session({
//  store: mongooseStore.create({
//      expires: 1000*5
//  })
//}));




//app.use(koaNunjucks({
//ext: 'html',
//path: path.join(__dirname, 'views'),
//nunjucksConfig: {
//  trimBlocks: true
//}
//}));

//app.use(cors());


//app.use( fMiddleware );
app.use(static(path.join(__dirname, '/public')));





//以下这部分应该殿后，以免影响上面加载件的运行。
let index = require('./routers/index');//首页

//公共部分








let build = require('./routers/build/index');

app.use(index.routes(), index.allowedMethods());

app.use(build.routes(), build.allowedMethods());
//app.use(session());


//require("./routers/chat/socket")


//post 中间件
// app.use(bodyparser())



//// middlewares
//app.use(bodyparser({
//enableTypes:['json', 'form', 'text']
//}))

app.on('error', function (err, ctx) {
  console.error('server error', err);
});

//server.listen(8080, function listening() {
//console.log('Listening on %d', server.address().port);
//});

//app.listen(80)












// 	  // 允许来自所有域名请求
//  ctx.set("Access-Control-Allow-Origin", "*");
//  // 这样就能只允许 http://localhost:8080 这个域名的请求了
//  // ctx.set("Access-Control-Allow-Origin", "http://localhost:8080"); 
//
//  // 设置所允许的HTTP请求方法
//  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
//
//  // 字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段.
//  ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");
//
//  // 服务器收到请求以后，检查了Origin、Access-Control-Request-Method和Access-Control-Request-Headers字段以后，确认允许跨源请求，就可以做出回应。
//
//  // Content-Type表示具体请求中的媒体类型信息
//  ctx.set("Content-Type", "application/json;charset=utf-8");
//
//  // 该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。
//  // 当设置成允许请求携带cookie时，需要保证"Access-Control-Allow-Origin"是服务器有的域名，而不能是"*";
//  ctx.set("Access-Control-Allow-Credentials", true);
//
//  // 该字段可选，用来指定本次预检请求的有效期，单位为秒。
//  // 当请求方法是PUT或DELETE等特殊方法或者Content-Type字段的类型是application/json时，服务器会提前发送一次请求进行验证
//  // 下面的的设置只本次验证的有效时间，即在该时间段内服务端可以不用进行验证
//  ctx.set("Access-Control-Max-Age", 300);
//
//  /*
//  CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：
//      Cache-Control、
//      Content-Language、
//      Content-Type、
//      Expires、
//      Last-Modified、
//      Pragma。
//  */
//  // 需要获取其他字段时，使用Access-Control-Expose-Headers，
//  // getResponseHeader('myData')可以返回我们所需的值
//  ctx.set("Access-Control-Expose-Headers", "myData");
