// const Discord = require('discord.js');
// const client = new Discord.Client();
// const embed = new Discord.RichEmbed();
//
// const fs = require('fs');
//
// const request = require('request-promise');
// const cheerio = require("cheerio");
//
// let token = "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U";
// let ChannelID = "624879703207051277";
//
// const options = {
//     method: 'GET',
//     uri: "https://street-beat.ru/cat/man/krossovki/",
//     headers: {
//         "Host": "street-beat.ru",
//         "Connection": "keep-alive",
//         // "Cache-Control": "max-age=0",
//         // // "sec-ch-ua": "Google Chrome 78",
//         "Upgrade-Insecure-Requests": "1",
//         // "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
//         "Sec-Fetch-Dest": "document",
//         "Sec-Fetch-User": "?1",
//         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
//         "Sec-Origin-Policy": "0",
//         "Sec-Fetch-Site": "same-origin",
//         "Sec-Fetch-Mode": "navigate",
//         "Referer":  "https://street-beat.ru/cat/man/",
//         "Accept-Encoding": "",
//         "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
//         // "Cookie": "BITRIX_SM_SALE_UID=415932526; ipp_uid2=UqbBSG9KsGPj6KmA/xtN1BdHPhjeFKzR694HklQ==; ipp_uid1=1572469743390; ipp_uid=1572469743390/UqbBSG9KsGPj6KmA/xtN1BdHPhjeFKzR694HklQ==; __cfduid=dcaa3d5241caf6bf90f6dced24fbbf6cd1572469744; dd__persistedKeys=[%22user.anonymousId%22]; dd_user.anonymousId=835aae10-fb59-11e9-b54d-0b58330ad002; _ga=GA1.2.1291811314.1572469749; __exponea_etc__=83ac6ebe-fb59-11e9-bd85-b6d555acfc32; _ym_uid=15724697531037383957; _ym_d=1572469753; cto_lwid=cddbdf4b-45c1-482f-8dfb-2d85ec7b7e62; _fbp=fb.1.1572469753872.1068690817; adspire_uid=AS.1072458731.1572469755; ipp_sign=002d18ca7e217b56d88aaa206f5e1c00_243743636_f044952beaa24a6077dc676e3e48b808; user_usee=a%3A2%3A%7Bi%3A0%3Bs%3A7%3A%221527428%22%3Bi%3A1%3Bs%3A7%3A%221528104%22%3B%7D; _gcl_au=1.1.284751464.1574976711; mainpagetype=man; PHPSESSID=rZ81bRuIvhm2qNL25xJ5Ch7WLooHpKat; rerf=AAAAAF3laTxJ5FTFAymgAg==; user_city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0; _gid=GA1.2.331245860.1575315775; __exponea_time2__=-0.14142274856567383; _ym_isad=2; ads_adware=true; ipp_key=v1575317424119/v3394bdc4e331d444fa7335163aeca6afa04ab3/G7qTKTa6N39d4ir+2VbwKA==; _gat_ddl=1; __tld__=null; tmr_detect=0%7C1575317429105"
//     }
// };
//
// function intersection(A, B) {
//     let result = [];
//     for (let i = 0; i < A.length; i++) {
//         let f = false;
//         for (let j = 0; j < B.length; j++) {
//             if (A[i]["title"] === B[j]["title"]) {
//                 if (A[i]["sizes"].length === B[j]["sizes"].length) {
//                     f = true;
//                     break;
//                 }
//             }
//         }
//         if (!f) {
//             result.push(A[i]);
//         }
//     }
//     return result;
// }
//
// function Analyze(items, shopName) {
//     let notJSONname = "notified/" + shopName + ".json";
//     let notified;
//     try {
//         notified = Array.from(JSON.parse(fs.readFileSync(notJSONname)));
//     } catch (e) {
//         notified = [];
//         fs.writeFileSync(notJSONname, JSON.stringify(notified));
//     }
//     let toNotify = intersection(items, notified);
//     let toSplice = intersection(notified, items);
//
//     toNotify.forEach(Nelem => {
//         toSplice.forEach(Selem => {
//             if (Nelem["title"] === Selem["title"]) {
//                 if (Nelem["sizes"].length < Selem["sizes"].length) {
//                     notified.push(Nelem);
//                     toNotify.splice(toNotify.indexOf(Nelem), 1);
//                 }
//             }
//         })
//     });
//
//     if (toNotify.length !== 0) {
//         console.log("to Notify(" + shopName + "): ", toNotify);
//     }
//     if (toSplice.length !== 0) {
//         console.log("to Delete(" + shopName + "):", toSplice);
//     }
//
//
//     // console.log(toNotify);
//     toNotify.forEach(elem => {
//         notified.push(elem);
//
//         // if (elem["title"] !== undefined) {
//         //     embed.setTitle(elem["title"])
//         // }
//         // if (elem["status"] !== undefined && elem["sizes"].length > 0) {
//         //     embed.setDescription(elem["status"] + "\nДоступные размеры: " + elem["sizes"])
//         // } else if (elem["status"] !== undefined) {
//         //     embed.setDescription(elem["status"])
//         // }
//         // if (elem["imgUrl"] !== undefined) {
//         //     embed.setImage(elem["imgUrl"])
//         // }
//         // let title = "Мужские кроссовки New Balance 997H";
//         // let status = "Перейти к товару";
//         // let url = "https://street-beat.ru/d/krossovki-new-balance-cm997hcx-d/";
//         // let imgUrl = "https://static.street-beat.ru/upload/resize_cache/iblock/590/350_350_175511db9cefbc414a902a46f1b8fae16/59051bb0dd7d3e1793a4a209e3b70f67.jpg";
//         // embed
//         //     .setColor("#0a520d")
//         //     .setAuthor("StreetBeat", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRorjkcdN_Qkq5O2-RXsgN7d4ONjX-i0xZAnBf0DEkkgQE0HsB7&s", "https://street-beat.ru/man/")
//         //     .setTitle(title)
//         //     .setDescription(`[${status}](${url})`)
//         // client.channels.get(ChannelID).send(embed);
//     });
//
//     toSplice.forEach(elem => {
//         notified.splice(notified.indexOf(elem), 1);
//     });
//
//     fs.writeFileSync(notJSONname, JSON.stringify(notified));
// }
//
// async function CheckStreetbeat() {
//     let items = [];
//     let response  = await request(options);
//     let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//     let reg = RegExp(patterns.join("|"));
//     const $ = cheerio.load(response);
//     $("body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div.col-xl-3.col-md-4.col-xs-6.view-type_ > div").each((i, elem) => {
//         let title = $(elem).find("a.link.link--no-color.catalog-item__title.ddl_product_link > span").text();
//         if (true){//title.toLowerCase().search(reg) !== -1) {
//             let url = "https://street-beat.ru" + $(elem).find("a.link.link--no-color.catalog-item__title.ddl_product_link").attr("href");
//             let imgUrl = $(elem).find("a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img").attr("src");
//             let status = url;
//             let sizes = [];
//             $(elem).find("div.catalog-item__block--hover > div > noindex > form > div > div > label.radio > span > a").each((i, el) => {
//                 sizes.push($(el).text().trim());
//             });
//             items.push({
//                     "title": title,
//                     "status": status,
//                     "imgUrl": imgUrl,
//                     "sizes": sizes
//             });
//         }
//     });
//     Analyze(items, "streetbeat");
// }
//
//     // const {window} = await JSDOM.fromURL("https://brandshop.ru/muzhskoe/obuv/krossovki/", {
//     //     userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
//     //     pretendToBeVisual: true
//     // });
//     // const $ = require("jquery")(window);
//     // let items = [];
//     // let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//     // let reg = RegExp(patterns.join("|"));
//     // for await (let elem of $("#mfilter-content-container > div > div.products-grid.row > div > div.row.category-products > div.product-container > div.product")) {
//     //     let title = $(elem).find("h2 > span:nth-child(2)").text();
//     //     if (title.toLowerCase().search(reg) !== -1) {
//     //         let url = $(elem).find("a.product-image").attr("href");
//     //         let imgUrl = $(elem).find("a.product-image > img").attr("src");
//     //         let status;
//     //         let res = await $.getJSON("https://brandshop.ru/getproductsize/" + $(elem).attr("data-product-id") + "/");
//     //         let sizes = res.map((elem) => {
//     //             return elem.name
//     //         });
//     //         if ($(elem).find("div.special > div").text() === "Нет в наличии") {
//     //             status = "Нет в наличии";
//     //         } else if ($(elem).find("div.special > div").text() === "Подробности скоро") {
//     //             status = "Подробности скоро"
//     //         } else if ($(elem).find("div.salestart").length) {
//     //             status = "Скоро в продаже!"
//     //         } else {
//     //             status = url;
//     //         }
//     //         items.push({
//     //                 "title": title,
//     //                 "status": status,
//     //                 "imgUrl": imgUrl,
//     //                 "sizes": sizes
//     //             }
//     //         );
//     //     }
//     // }
//     // console.log(items);
//     // Analyze(items, "streetbeat");
// // }
//
//
//
//
//
//
// // const cloudscraper = require("cloudscraper");
// //
// // cloudscraper.get(options).then((resp, err) => {
// //     console.log(resp);
// // });
//
//
//
//
//
//
//
// // setInterval(CheckStreetbeat, 1000);
//
//
//
// // request(options, function(error, response, body){
// //     console.log(body);
// // });
//
// client.on('ready', () => {
//     console.log(`Logged in as ${client.user.tag}!`);
//     let generalChannel = client.channels.get(ChannelID);
//     // generalChannel.send("Streetbeat online!");
//
//     let title = "Мужские кроссовки New Balance 997H";
//     let status = "Перейти к товару";
//     let url = "https://street-beat.ru/d/krossovki-new-balance-cm997hcx-d/";
//     let imgUrl = "https://static.street-beat.ru/upload/resize_cache/iblock/590/350_350_175511db9cefbc414a902a46f1b8fae16/59051bb0dd7d3e1793a4a209e3b70f67.jpg";
//     let sizes = ["40", "41", "42"];
//     embed
//         .setColor("#04300d")
//         .setAuthor("StreetBeat", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrV2xm8gYS4SXgbrAXguuml9KDzFxyz85E0-eS9lK9qAszoe1y&s", "https://street-beat.ru/man/")
//         .setTitle(title)
//         .setDescription(`[${status}](${url})`)
//         .setImage(imgUrl)
//         .addField("Доступные размеры:", "41    42    43")
//     client.channels.get(ChannelID).send(embed);
//
// });
//
// // client.on('message', msg => {
// //     if (msg.channel.id === ChannelID) {
// //         let generalChannel = client.channels.get(ChannelID);
// //         let regforadd = /!add [\s\S]+/;
// //         let regfordel = /!delete [\s\S]+/;
// //         if (msg.content === "!help") {
// //             generalChannel.send("\"!add + название фильтра\" - добавляет заданный фильтр\n" +
// //                 "\"!delete + название фильтра\" - удаляет заданный фильтр\n" +
// //                 "!\"show\" - отображает текущие фильтров");
// //         } else if (msg.content.search(regforadd) !== -1 && !msg.author.bot) {
// //             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
// //             let tmp = msg.content.substr(5);
// //             let regval = "[\\s\\S]*";
// //             let pushval = regval;
// //             tmp = tmp.split(" ");
// //             tmp.forEach(elem => {
// //                 pushval += elem.toLowerCase();
// //                 pushval += regval;
// //             });
// //             if (!patterns.includes(pushval)) {
// //                 patterns.push(pushval);
// //                 fs.writeFileSync("patterns.json", JSON.stringify(patterns));
// //                 generalChannel.send("Паттерн добавлен!");
// //             } else {
// //                 generalChannel.send("Паттерн существует!");
// //             }
// //         } else if (msg.content.search(regfordel) !== -1 && !msg.author.bot) {
// //             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
// //             let tmp = msg.content.substr(8);
// //             let regval = "[\\s\\S]*";
// //             let pushval = regval;
// //             tmp = tmp.split(" ");
// //             tmp.forEach(elem => {
// //                 pushval += elem;
// //                 pushval += regval;
// //             });
// //             if (patterns.includes(pushval)) {
// //                 patterns.splice(patterns.indexOf(pushval), 1);
// //                 fs.writeFileSync("patterns.json", JSON.stringify(patterns));
// //                 generalChannel.send("Паттерн удален!");
// //             } else {
// //                 generalChannel.send("Паттерн не существует!");
// //             }
// //         } else if (msg.content === "!show") {
// //             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
// //             if (patterns.length === 0) {
// //                 generalChannel.send("Не существует ни одного фильтра");
// //             } else {
// //                 let output = "Существующие фильтры:\n";
// //                 patterns.forEach(elem => {
// //                     output += elem.replace(/\[\\s\\S]\*/g, " ") + "\n";
// //                 });
// //                 generalChannel.send(output);
// //             }
// //         } else if (msg.content.substr[0] === "!") {
// //             generalChannel.send("Неверная комманда");
// //         }
// //     }
// // });
//
// // client.login(token);


//<-------------------------------------------------------------------------------------------------------------------->



// let scrape = async () => {
//     const browser = await puppeteer.launch({headless: true});
//     const page = await browser.newPage();
//
//     await page.goto('https://street-beat.ru/cat/man/krossovki/');
//
//     const result = await page.evaluate(() => {
//         let data = []; // Создаём пустой массив для хранения данных
//         let elements = document.querySelectorAll('body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div'); // Выбираем все товары
//
//
//         for (let element of elements){ // Проходимся в цикле по каждому товару
//             let title = element.children[0].children[3]; // Выбираем название
//             if(title !== undefined){
//                 title = title.children[0].innerText;
//             }
//             // let price = element.childNodes[7].children[0].innerText; // Выбираем цену
//             data.push({title}); // Помещаем объект с данными в массив
//         }
//
//         return data; // Возвращаем массив
//     });
//
//     browser.close();
//     return result; // Возвращаем данные
// };
//
//
//
//
// setInterval(()=>{
//     scrape().then(
//         (value) => {
//             console.log(value); // Получилось!
//     });
// }, 10000);


const puppeteer = require("puppeteer-extra");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "streetbeat"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoClient.connect((err, client)=>{
    setInterval(async ()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        const browser = await puppeteer.launch({});
        let page = await browser.newPage();
        await page.goto("https://street-beat.ru/cat/man/krossovki/");
        // console.log(await page.content());
        let items = await page.evaluate(()=>{
            let items = [];
            let elements = document.querySelectorAll("body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div.col-xl-3.col-md-4.col-xs-6.view-type_ > div");
            // let sizes = [];

            for(let element of elements){
                let title = element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link > span").innerText;
                let status = "В продаже";
                let url;
                let imgURL;
                if(element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link")){
                    url = "https://street-beat.ru" + element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link").getAttribute("href");
                }
                if(element.querySelector("a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img")){
                    imgURL = element.querySelector("a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img").getAttribute("src");
                }
                let sizes = [];
                let els = document.querySelectorAll("body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div:nth-child(1) > div > div.catalog-item__block--hover > div > noindex > form > div > div > label");
                for(let el of els){
                    sizes.push(el.querySelector("span > a").innerHTML.trim());
                }
                items.push({
                    title: title,
                    status: status,
                    url: url,
                    imgURL: imgURL,
                    sizes: sizes
                });
            }
            return items;
        });
        browser.close();
        // console.log(items);

        collection.deleteMany({title: {$nin: items.map((elem)=>{return elem.title})}});
        items.forEach(item=>{
            collection.updateOne({title: item.title}, {$set: {sizes: item.sizes, imgURL: item.imgURL, url: item.url, status: item.status}}, {upsert: true})
        });
        console.log(`Writed ${items.length} items to ${mongoOptions.collectionName} collection`);
    }, 10000);
});