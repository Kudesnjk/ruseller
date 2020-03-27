// const Discord = require('discord.js');
// const client = new Discord.Client();
// const embed = new Discord.RichEmbed();
//
// const fs = require('fs');
//
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
//
// let token = "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U";
// let ChannelID = "624879703207051277";
//
// function intersection(A, B) {
//     let result = [];
//     for(let i = 0; i < A.length; i++){
//         let f = false;
//         for(let j = 0; j < B.length; j++){
//             if(A[i]["title"] === B[j]["title"]){
//                 if(A[i]["sizes"].length === B[j]["sizes"].length){
//                     f = true;
//                     break;
//                 }
//             }
//         }
//         if(!f){
//             result.push(A[i]);
//         }
//     }
//     return result;
// }
//
// function Analyze(items, shopName){
//     let notJSONname = "notified/" + shopName + ".json";
//     let notified;
//     try{
//         notified = Array.from(JSON.parse(fs.readFileSync(notJSONname)));
//     }
//     catch (e){
//         notified = [];
//         fs.writeFileSync(notJSONname, JSON.stringify(notified));
//     }
//     let toNotify = intersection(items, notified);
//     let toSplice = intersection(notified, items);
//
//     toNotify.forEach(Nelem=>{
//         toSplice.forEach(Selem=>{
//             if(Nelem["title"] === Selem["title"]){
//                 if(Nelem["sizes"].length < Selem["sizes"].length){
//                     notified.push(Nelem);
//                     toNotify.splice(toNotify.indexOf(Nelem), 1);
//                 }
//             }
//         })
//     })
//
//     if(toNotify.length !== 0){console.log("to Notify(" + shopName + "): ", toNotify);}
//     if(toSplice.length !== 0){console.log("to Delete(" + shopName + "):", toSplice);}
//
//
//     console.log(toNotify);
//     toNotify.forEach(elem => {
//         notified.push(elem);
//
//         if(elem["title"] != undefined){embed.setTitle(elem["title"])}
//         if(elem["status"] != undefined && elem["sizes"].length > 0){embed.setDescription(elem["status"] +"\nДоступные размеры: " +elem["sizes"])}
//         else if(elem["status"] != undefined){embed.setDescription(elem["status"])}
//         if(elem["imgUrl"] != undefined){embed.setImage(elem["imgUrl"])}
//
//         client.channels.get(ChannelID).send(embed);
//     });
//
//     toSplice.forEach(elem => {
//         notified.splice(notified.indexOf(elem), 1);
//     });
//
//     fs.writeFileSync(notJSONname, JSON.stringify(notified));
// }
//
// async function CheckBELIEF() {
//     const {window} = await JSDOM.fromURL("https://store.beliefmoscow.com/", {
//         userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
//         pretendToBeVisual: true
//     });
//     const $ = require("jquery")(window);
//     let items = [];
//     let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//     let reg = RegExp(patterns.join("|"));
//     for await (let elem of $("body > section > div > div > div > div.index_collection-product_list.grid-row-inner.grid-inline > div.lg-grid-3.sm-grid-4.xs-grid-6.mc-grid-6.padded-inner-sides > div")){
//         let title = $(elem).find("div.product_preview-title > a > strong").text() + " " +
//             $(elem).find("div.product_preview-title > a").attr("title");
//         if (title.toLowerCase().search(reg) !== -1) {
//             let url = "https://store.beliefmoscow.com/" + $(elem).find("div.product_preview-title > a").attr("href");
//             let imgUrl = $(elem).find("div.product_preview-preview > a > img").attr("src");
//             let sizes = $(elem).find("div.product_preview-preview > form > a").text().match(/\d+ US \/ \d+cm/g);
//             items.push({
//                     "title": title,
//                     "status": url,
//                     "imgUrl": imgUrl,
//                     "sizes": sizes
//                 }
//             );
//         }
//     }
//     Analyze(items, "BELIEF");
// }
//
// setInterval(CheckBELIEF, 2000);
//
// client.on('ready', () => {
//     console.log(`Logged in as ${client.user.tag}!`);
//     let generalChannel = client.channels.get(ChannelID);
//     generalChannel.send("BELIEF online!");
// });
//
// client.on('message', msg => {
//     if(msg.channel.id === ChannelID){
//         let generalChannel = client.channels.get(ChannelID);
//         let regforadd = /!add [\s\S]+/;
//         let regfordel = /!delete [\s\S]+/;
//         if(msg.content === "!help"){
//             generalChannel.send("\"!add + название фильтра\" - добавляет заданный фильтр\n" +
//                 "\"!delete + название фильтра\" - удаляет заданный фильтр\n" +
//                 "!\"show\" - отображает текущие фильтров");
//         }
//         else if(msg.content.search(regforadd) !== -1 && !msg.author.bot){
//             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//             let tmp = msg.content.substr(5);
//             let regval = "[\\s\\S]*";
//             let pushval = regval;
//             tmp = tmp.split(" ");
//             tmp.forEach(elem =>{
//                 pushval += elem.toLowerCase();
//                 pushval += regval;
//             });
//             if(!patterns.includes(pushval)){
//                 patterns.push(pushval);
//                 fs.writeFileSync("patterns.json", JSON.stringify(patterns));
//                 generalChannel.send("Паттерн добавлен!");
//             }else{
//                 generalChannel.send("Паттерн существует!");
//             }
//         }
//         else if(msg.content.search(regfordel) !== -1 && !msg.author.bot){
//             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//             let tmp = msg.content.substr(8);
//             let regval = "[\\s\\S]*";
//             let pushval = regval;
//             tmp = tmp.split(" ");
//             tmp.forEach(elem =>{
//                 pushval += elem;
//                 pushval += regval;
//             });
//             if(patterns.includes(pushval)){
//                 patterns.splice(patterns.indexOf(pushval), 1);
//                 fs.writeFileSync("patterns.json", JSON.stringify(patterns));
//                 generalChannel.send("Паттерн удален!");
//             }else{
//                 generalChannel.send("Паттерн не существует!");
//             }
//         }
//         else if(msg.content === "!show"){
//             let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
//             if(patterns.length === 0){
//                 generalChannel.send("Не существует ни одного фильтра");
//             }
//             else{
//                 let output = "Существующие фильтры:\n";
//                 patterns.forEach(elem => {
//                     output += elem.replace(/\[\\s\\S]\*/g, " ") + "\n";
//                 });
//                 generalChannel.send(output);
//             }
//         }
//         else if(msg.content.substr[0] === "!"){
//             generalChannel.send("Неверная комманда");
//         }
//     }
// });
//
// client.login(token);


//<-------------------------------------------------------------------------------------------------------------------->

const request = require("request-promise");
const cheerio = require("cheerio");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "belief"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const options = {
    uri: "https://store.beliefmoscow.com/",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
};

mongoClient.connect((err, client)=>{
    setInterval(()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        request.get(options).then(async (response, error)=>{
                const $ = cheerio.load(response);
                let promises = [];
                $("body > section > div > div > div > div.index_collection-product_list.grid-row-inner.grid-inline > div.lg-grid-3.sm-grid-4.xs-grid-6.mc-grid-6.padded-inner-sides > div").each((i, elem) => {
                    promises.push(new Promise((resolve, reject)=>{
                        let title = [$(elem).find("div.product_preview-title > a > strong").text(), $(elem).find("div.product_preview-title > a").attr("title")].join(' ');
                        let url = "https://store.beliefmoscow.com/" + $(elem).find("div.product_preview-title > a").attr("href");
                        let imgURL = $(elem).find("div.product_preview-preview > a > img").attr("src");
                        let status = "В продаже";
                        let sizes = $(elem).find("div.product_preview-preview > form > a").text().match(/\d+ US \/ \d+cm/g);
                        resolve({
                            title: title,
                            status: status,
                            url: url,
                            imgURL: imgURL,
                            sizes: sizes
                        });
                    }));
                });
                return Promise.all(promises).then(items=>{
                    collection.deleteMany({title: {$nin: items.map((elem)=>{return elem.title})}});
                    items.forEach(item=>{
                        collection.updateOne({title: item.title}, {$set: {sizes: item.sizes, imgURL: item.imgURL, url: item.url, status: item.status}}, {upsert: true})
                    });
                    console.log(`Writed ${items.length} items to ${mongoOptions.collectionName} collection`);
                });
            }
        )}, 10000);
});