const router = require('koa-router')();
var db = require("../../mongodb/schema/engine.js");
const axios = require("axios");
const Qs = require("qs");　　//qs是一个url参数转化（parse/stringify）的js库



router.get('/ai/nlp/save', async (ctx, next) => {

  //1.先去获取表的长度然后id+1
  let len = await db.where({}).count()
  len = len + 1
  // let pdata = { "string": "贾宝玉" }
  let name = encodeURI("贾宝玉")

  //2.去请求算力服务器插入这个id，和字符串
  let cab = await axios.get('http://127.0.0.1:8000/save?string=' + name + '&myid=' + len)
    .then(res => {
      console.log(res.data);
      return data = JSON.stringify(res.data);
    })
    .catch(error => {
      // console.log(error);
    });
  // console.log(response)
  try {
    if (cab.hello.length < 1) {
      ctx.body = "error"
      return
    }
  } catch (error) {

  }


  //3.保存到mongodb中

  // let cab = new db({
  //   User: data['User'],
  //   NewsName: data['NewsName'],
  //   Menu: data["Menu"],
  //   Type: data["Type"],
  //   Authority: data["Authority"],
  //   Content: data["Content"],
  //   myid: len
  // })

  // try {
  //   let cab2 = await cab.save()
  //   ctx.body = "ok"
  // } catch (error) {
  //   ctx.body = "no"
  // }


})



// // document.addEventListener('DOMContentLoaded', run);
// //jieba分词
// router.get('/ai/jieba', async (ctx, next) => {

//   var nodejieba = require("nodejieba");
//   var result = nodejieba.cut("我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。");

//   console.log(result);
//   ctx.body=result
// })

// //tensorflow
// const tf = require('@tensorflow/tfjs-node')
// const qna = require('@tensorflow-models/qna');

// const use = require('@tensorflow-models/universal-sentence-encoder');
// const sentences = [
//   'Hello.',
//   'How are you?'
// ];
// router.get('/ai/t', async (ctx, next) => {
// // Load the model.

// const model = await use.load();
// const embeddings = await model.embed(sentences);
// embeddings.print()
// // let last=embeddings
// // console.log(last)



//   ctx.body="last"
// });




























module.exports = router