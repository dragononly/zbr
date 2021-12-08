const router = require('koa-router')();
const puppeteer = require('puppeteer');



//修改企业邮箱登陆密码
router.get('/163mail', async (ctx, next) => {
	let name = ctx.query.name
	if (!name) {
		ctx.body = "名字不能为空"
		return
	}
	const browser = await puppeteer.launch({
		// executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
		// 是否显示浏览器界面(或者说是否无头)。
		// headless: false,
		slowMo: 50,
		
		// devtools: true,
		
		// defaultViewport: null,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage();
	let arrcookies = [{
			"domain": ".163.com",
			"expirationDate": 1617966709,
			"hostOnly": false,
			"httpOnly": false,
			"name": "hb_MA-A88A-7405BF9D68DD_source",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "qiye.163.com",
			"id": 1
		},
		{
			"domain": ".163.com",
			"expirationDate": 1617246582,
			"hostOnly": false,
			"httpOnly": false,
			"name": "hb_MA-B701-2FC93ACD9328_source",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "qiye.163.com",
			"id": 2
		},
		{
			"domain": ".163.com",
			"expirationDate": 1617966679,
			"hostOnly": false,
			"httpOnly": false,
			"name": "hb_MA-BE1B-B326EA1BA2C0_source",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "127.0.0.1%3A2000",
			"id": 3
		},
		{
			"domain": ".163.com",
			"expirationDate": 1617246664,
			"hostOnly": false,
			"httpOnly": false,
			"name": "hb_MA-BFB6-AC673A756684_source",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "mailhz.qiye.163.com",
			"id": 4
		},
		{
			"domain": ".163.com",
			"expirationDate": 2245043236,
			"hostOnly": false,
			"httpOnly": false,
			"name": "mail_psc_fingerprint",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "a7cd68613899b6fd6e96d03b83394397",
			"id": 5
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "cm_last_info",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "rhPSokXInRDCpQTBmAX.q4bxq42ImQSAn1PCr5fK7hb_7h747h74pk3Dp0TKmQbKmgTxpwiMfADTaMiMfAPvokSIoBbK7hb4qQzy7hb2nx_xekb_gi3Sck2SghnneBbJjMDTpOyOclDKn5nzqACAqNPAa4b_mO37eluTmhv7bzz0qQXl8BzJgheTsB_yrAjMownCdkPvokKIq4bxq42ImQSArNPHmkzG9B_xmR_v9AbI7AKXa0nTdh.",
			"id": 6
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "Coremail",
			"path": "/",
			"sameSite": "no_restriction",
			"secure": true,
			"session": true,
			"storeId": "0",
			"value": "TULZ0qnx3*YBqofoPJFRQc7JRRRP25aOOHagESxbka-9VWXqmBkB6nfEN1*ZiuJLjb5Xkaxk7t01ONY9dow-EUYUVtJTy-GcYLkTun3*lkLfHGtVaB971DFBulmaOCvPtMT3jNedaKkT-LD*cXnB2XMBVA1BxXJwjkPlXfueXR8|%wm-12.hzqyhmail.163.com",
			"id": 7
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "Hm_lpvt_220312f3cfcd6a3838109b26fe7872dd",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "1614654664",
			"id": 8
		},
		{
			"domain": ".qiye.163.com",
			"expirationDate": 1646190664,
			"hostOnly": false,
			"httpOnly": false,
			"name": "Hm_lvt_220312f3cfcd6a3838109b26fe7872dd",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "1614652770",
			"id": 9
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "mail_host",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "mailhz.qiye.163.com",
			"id": 10
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "mail_idc",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "mimghz.qiye.163.com",
			"id": 11
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "mail_style",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "js6",
			"id": 12
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "mail_uid",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "xiongzhongbo@pccpa.cn",
			"id": 13
		},
		{
			"domain": ".qiye.163.com",
			"expirationDate": 1620097644.227543,
			"hostOnly": false,
			"httpOnly": false,
			"name": "pass_2fa",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "sfXOUstVuPOKxsbJCYdpZxrbcK15LaEtMe1FX572F29r0RXCJ7rXQvW60aST4MKa",
			"id": 14
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "qiye_mail_upx",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "uphz1.qiye.163.com",
			"id": 15
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "QIYE_SESS",
			"path": "/",
			"sameSite": "no_restriction",
			"secure": true,
			"session": true,
			"storeId": "0",
			"value": "lb3CNpQCsLuh5l6jsOMk4TffwP.UsAh3uPoXIRr8JA.0WCSeBx2ndGYY3rHARmCjhFE3wOh3qP2p_knYLxZEmh1n.jJYomhbMWao0APCf0oignOM0Ii2z3XYYWtuelxR5l3w_Uhkbvqt88IwF1TWU2wlPKXRqXFKI8YcLRXd.WW",
			"id": 16
		},
		{
			"domain": ".qiye.163.com",
			"hostOnly": false,
			"httpOnly": false,
			"name": "qiye_uid",
			"path": "/",
			"sameSite": "no_restriction",
			"secure": true,
			"session": true,
			"storeId": "0",
			"value": "\"xiongzhongbo@pccpa.cn\"",
			"id": 17
		},
		{
			"domain": "mailhz.qiye.163.com",
			"hostOnly": true,
			"httpOnly": true,
			"name": "JSESSIONID",
			"path": "/admin",
			"sameSite": "unspecified",
			"secure": false,
			"session": true,
			"storeId": "0",
			"value": "4719287BC0CAD55CE337EBD023C3E463",
			"id": 18
		},
		{
			"domain": "mailhz.qiye.163.com",
			"expirationDate": 1615376530,
			"hostOnly": true,
			"httpOnly": false,
			"name": "yx_stat_seesionId",
			"path": "/",
			"sameSite": "unspecified",
			"secure": false,
			"session": false,
			"storeId": "0",
			"value": "a7cd68613899b6fd6e96d03b833943971615374710311",
			"id": 19
		}
	]

	let html =
		`
		              <div>
		                  名字不存在或者其它故障
		              </div>
		              <div>
		                  马上跳转到网易
		              </div>
		              
		  <script>
		  function set() {
		   
		    window.location.href='https://qiye.163.com/login/?p=admin' 
		}
		setTimeout(function(){
			set()
		},2000)
		
		</script>
		  `
	for (const i of arrcookies) {
		await page.setCookie(i)
	}
	try {
		await page.goto('https://qiye.163.com/login/?p=admin', {
			timeout: 3000
		});
	} catch (e) {
		console.log("爬虫超时")
	}

	let username = await page.$('#adminname');
	let password = await page.$('#adminpwd');
	await username.type("xiongzhongbo@pccpa.cn");
	await password.type("Mm9202127@");
	const loginbtn = await page.$('.w-button-admin');
	await loginbtn.click()
	await page.waitForNavigation({
		waitUntil: 'networkidle2'
	})

	try {
		await page.goto("https://mailhz.qiye.163.com/admin/index.html#/account/list", {
			timeout: 3000
		});
	} catch (e) {
		console.log("爬虫超时，名字不存在")
		ctx.body = html

		return
	}
	let inputval
	try {
		inputval = await page.waitForSelector('.search-form-wrap .f-position-relative input');
	} catch (e) {
		console.log("爬虫超时，名字不存在")
		ctx.body = html
	}

	await inputval.type(name, {
		delay: 100
	});
	await inputval.click()
	await page.keyboard.press('Enter');

	//不for一下获取不到，不知为什么
	//这里是查看是否禁用
	let searchValue = await page.$$eval('td.ng-binding', e => {
		var dd = {};
		for (var i = 0; i < e.length; i++) {
			dd[i] = e[i].innerText
		}
		return dd;
	});

	//如果禁用就点击启用
	if (searchValue['1'] == '禁用 ' || searchValue['1'] == '禁用') {
		const jinyong = await page.waitForSelector('.icon-play');
		await jinyong.click()
	}
	// let tbody = await page.waitForSelection('tbody[ng-repeat="ctrl.itemList.length > 0"][aria-hidden="false"]')
	// tbody.selectorAll("tr")
	//跳转到内容页面
	try {
		let td2 = await page.waitForSelector('.list-wrap tbody:nth-child(3) tr td:nth-child(3) button', {
			timeout: 3000
		});
		await td2.click()
	} catch (e) {
		console.log("爬虫超时，名字不存在")
		ctx.body = html

		return
	}


	//重置密码找寻
	try {
		let repwd = await page.waitForSelector('#part1 .form-group-sm:nth-child(5) .a-primary', {
			timeout: 3000
		})
		await repwd.click()
	} catch (e) {
		console.log("爬虫重置超时")
		ctx.body = "重置超时"
		return
	}



	//填充账号密码因为只有两个input
	let pwd1 = await page.waitForSelector('.modal input[password-check]:nth-child(1)')
	let pwd2 = await page.waitForSelector('input[name="repeatPassword"]')
	// let ran = String(Math.random()).substr(3, 4)
	await pwd1.type("Panchina1", {
		delay: 100
	});
	await pwd2.type("Panchina1", {
		delay: 100
	});

	//确定修改
	let success = await page.waitForSelector('.modal-footer button:nth-child(1)')
	await success.click()

	ctx.body = "邮箱密码已经重置为，Panchina1"
})



router.get('/me', async (ctx, next) => {
	//这是爬虫框架
	const browser = await puppeteer.launch({
		executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
		headless: false,
		slowMo: 50,
		devtools: false,
		defaultViewport: null,
	});
	const page = await browser.newPage();
	await page.goto('https://oa.pccpa.cn', {
		timeout: 3000
	});
	let username = await page.$('#username');
	let password = await page.$('#password');
	await username.type("xiongzhongbo");
	await password.type("xiao9202127");
	const login_btn = await page.$('.ant-btn-primary');
	await login_btn.click()
	await page.waitForNavigation({
		waitUntil: 'networkidle2'
	})
	await page.goto("https://oa.pccpa.cn/pc/employee/contact", {
		timeout: 3000
	});

	let mobile = await page.waitForSelector('#mobilePhone');
	await mobile.type("9");
	let search = await page.waitForSelector(
		'.antd-pro-pages-emp-contact-components-inquire-box-searchConditionButton');
	await search.click()
	let test
	page
		.waitForSelector('.ant-descriptions-item-content')
		.then(async () => {
			searchValue = await page.$$eval('.ant-descriptions-item-content', e => {
				var dd = {};
				for (var i = 0; i < e.length; i++) {
					dd[i] = e[i].innerText
				}
				return dd;
			});
			console.log(searchValue)
			// reply.send(searchValue)
		});
	let next_btn = await page.waitForSelector('.ant-pagination-next');
	await next_btn.click()
	page
		.waitForSelector('.ant-descriptions-item-content')
		.then(async () => {
			searchValue = await page.$$eval('.ant-descriptions-item-content', e => {
				var dd = {};
				for (var i = 0; i < e.length; i++) {
					dd[i] = e[i].innerText
				}
				return dd;
			});
			console.log(searchValue)
			reply.send(searchValue)
		});
})


module.exports = router
