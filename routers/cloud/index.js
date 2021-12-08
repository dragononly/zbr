const router = require('koa-router')();
var formidable = require('formidable');
const send = require('koa-send');
var User = require("../../mongodb/schema/user.js");
const Koa = require('koa');
const app = new Koa();

const fs = require('fs-extra')
const path = require('path')
const OSS = require('ali-oss');
const alikey = require("../../config/key.js");
const client = new OSS({
  region: alikey.region,
  accessKeyId: alikey.accessKeyId,
  accessKeySecret: alikey.accessKeySecret,
  bucket: alikey.bucket
});

router.get('/cloud/newfolder', async (ctx, next) => {
  //新建文件夹
  let foldername = ctx.query.foldername
  let user = ctx.query.user
  let result = await client.copy('cloud/' + foldername + '/', 'cloud/' + user + '/')
  ctx.body = result.res.statusMessage

})


router.get('/cloud/getlist', async (ctx, next) => {
  //获取文件夹和文件列表
  let user = ctx.query.url
  let dir = "cloud/" + user
  const result = await client.list({
    prefix: dir,
    delimiter: '/'
  });
  last = []

  try {
    for (const i of result.objects) {
      let ob = {}
      ob.name = i.name
      ob.size = i.size
      last.push(i)

    }
  } catch (error) {

  }

  ctx.body = { prefixes: result.prefixes, objects: last }

})
router.get('/cloud/cloudrename', async (ctx, next) => {
  //重命名文件和重命名文件夹
  let nowname = ctx.query.nowname
  let oldname = ctx.query.oldname
  if (nowname == oldname) {
    ctx.body = "同名"
    return
  }
  let result = await client.copy('cloud/' + nowname, 'cloud/' + oldname, { headers: { "x-oss-forbid-overwrite": true } })
  if (result.res.statusMessage == "OK") {
    try {
      let filename = "cloud/" + oldname
      let result = await client.delete(filename);
      ctx.body = "OK"
    } catch (e) {
      console.log(e);
    }
  } else {
    ctx.body = "no"
  }

})
router.get('/cloud/deletefile', async (ctx, next) => {
  //删除文件和删除文件夹
  let user = ctx.query.filename
  let filename = "cloud/" + user
  //删除之前先枚举长度判断是否是文件夹
  const result2 = await client.list({
    prefix: filename,
    delimiter: '/',
    "max-keys": 2
  });

  //1为什么有这么复杂但判断呢，因为，目录下有目录objects显示1，和空显示1，是一样的
  //1.1目录下有目录，不为空直接返回
  if (result2.prefixes != null) {
    ctx.body = "不能删"
    return
  }


  //2.1目录为空不代表文件为空，所以通过objects长度来判断
  let num = 0
  //2.2为来防止程序卡死在获取不到length，这里使用try无效所以
  if (!result2.objects) {
    ctx.body = "云bug"
    return
  }
  num = result2.objects.length

  if (num > 1) {
    ctx.body = "不能删"
    //目录至少有1个以上文件
    return
  }
  try {
    let result = await client.delete(filename);
    ctx.body = "OK"
  } catch (e) {
    console.log(e);
  }

})


module.exports = router;
