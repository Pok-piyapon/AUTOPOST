
const puppeteer = require('puppeteer');
const { readFileSync } = require('fs');
const path = require('path');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (data, headless, images, content) => {
    let SwapAccountPosition = 0;
    let countingPost = 1
    const token = (await readFileSync(path.join(__dirname, "token.json"))).toString()
    while (data.length != 0) {
        for (let i = 0; i < data.length; i++) {
            const browser = await puppeteer.launch({ headless: headless });
            try {

                const page = await browser.newPage();
                const cookies = (await JSON.parse(token))[SwapAccountPosition]
                await page.setCookie(...cookies);
                await page.goto(data[i].link, { waitUntil: "networkidle2" })

                // Click Add Post
                const post = await page.waitForSelector('.x6s0dn4.x78zum5.x1l90r2v.x1pi30zi.x1swvt13.xz9dl7a')
                await post.click()
                const isShow = await page.waitForSelector('._1mf._1mj')
                await page.keyboard.type(content, { delay: 20 })
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Enter');

                // const image = await page.$$(".x6s0dn4.x78zum5.xl56j7k.x1n2onr6.x5yr21d.xh8yej3")
                // await image[3].click({ delay:200 }) // new location
                // await page.keyboard.press('Enter',{ delay:1000 });

                const btnPost = await page.$$(".x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xn6708d.x1ye3gou.xtvsq51.x1r1pt67")
                const [fileChooser] = await Promise.all([
                    page.waitForFileChooser(),
                    page.keyboard.press('Enter')
                ]);
                let filePath = [];
                for (let item of images) {
                    filePath.push(`./post/images/${item}`)
                }
                await fileChooser.accept(filePath);

                await btnPost[2].click({ delay: 3000 })
                
                data.splice(i, 1);
                countingPost = countingPost + 1;
                if (countingPost == 4) {
                    countingPost = 1
                    SwapAccountPosition = SwapAccountPosition + 1
                }
                console.log("TOTAL GROUPS : ",data.length)
                console.log(countingPost)
                await delay(10000)
                await browser.close()
            } catch (_) {
                console.log(_)
                if (_.message == "cookies is not iterable (cannot read property undefined)") {
                    return
                }
            }
        }
    }

}


// [
//     {
//         "name": "c_user",
//         "value": "61568541270254",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "xs",
//         "value": "30%3A5pb8iJbLF-VUKg%3A2%3A1731253665%3A-1%3A-1",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "fr",
//         "value": "0vQIEbG45dvYADCoZ.AWX4HgY7pQ3PPcwqgsniHJUlZaY.BnMNWT..AAA.0.0.BnMNW3.AWV1ef5h4tA",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "datr",
//         "value": "k9UwZ45TK-M2csKql_9XgGub",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": false,
//         "secure": true,
//         "sameSite": "None"
//     }
// ],
// [
//     {
//         "name": "c_user",
//         "value": "61568153175056",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "xs",
//         "value": "44%3AJAG1CVH4Kbwv6w%3A2%3A1731251506%3A-1%3A-1",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "fr",
//         "value": "0CDHuWuA8oEuEEEVn.AWVWMpVVv3BBZOMu06OUoCSom_M.BnMMyW..AAA.0.0.BnMM00.AWWivD0PX2c",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": true,
//         "secure": true,
//         "sameSite": "None"
//     },
//     {
//         "name": "datr",
//         "value": "lswwZ7whi8oV3WLAdpNquJp0",
//         "domain": ".facebook.com",
//         "path": "/",
//         "httpOnly": false,
//         "secure": true,
//         "sameSite": "None"
//     }
// ],

