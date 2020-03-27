// const Discord = require('discord.js');
// const client = new Discord.Client();
// const embed = new Discord.RichEmbed();
//
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
//
// const fs = require('fs');
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
//                 f = true;
//                 break;
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
//     return [{"shop": "nike"}];
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
//     if(toNotify.length !== 0){console.log("to Notify(" + shopName + "): ", toNotify);}
//     if(toSplice.length !== 0){console.log("to Delete(" + shopName + "):", toSplice);}
//
//
//     console.log(toNotify);
//     toNotify.forEach(elem => {
//         notified.push(elem);
//
//         if(elem["title"] != undefined){embed.setTitle(elem["title"])}
//         if(elem["status"] != undefined){embed.setDescription(elem["status"])}
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
// async function CheckNikeUpcoming(){
//     let items = [];
//     const {window} = await JSDOM.fromURL("https://www.nike.com/ru/launch/?s=upcoming", {
//         userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
//         pretendToBeVisual: true
//     });
//     const $ = require("jquery")(window);
//     $(".d-md-h.ncss-col-sm-12.va-sm-t.pb0-sm.prl0-sm").each((i, elem) => {
//         let title = "Upcoming:" + $(elem).find(".ncss-brand.u-uppercase.mb-1-sm.fs16-sm").text() +" \n" + $(elem).find(".available-date-component.ncss-brand.pb6-sm.u-uppercase.fs14-sm.fs16-md").text();
//         let url = "https://www.nike.com" + $(elem).find(".card-link.d-sm-b").attr("href");
//         //вот тут картинку хуй получишь
//         let imgUrl = $(elem).find(".card-link.d-sm-b > img").attr("src");
//         items.push({
//             "title": title,
//             "status": url,
//             "imgUrl": imgUrl,
//         });
//     });
//     Analyze(items, "nikeupcoming");
//     console.log(items)
// }
//
// setInterval(CheckNikeUpcoming, 5000);
//
// client.on('ready', () => {
//     console.log(`Logged in as ${client.user.tag}!`);
//     let generalChannel = client.channels.get(ChannelID);
//     generalChannel.send("Nike Upcoming online!");
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

//<--------------------------------------------------------------------------------------------------------------------->

const request = require("request-promise");
const cheerio = require("cheerio");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "nike-upcoming"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const options = {
    uri: "https://www.nike.com/ru/launch/?s=upcoming",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
};

mongoClient.connect((err, client)=>{
    setInterval(()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        request.get(options).then(async (response, error)=>{
                const $ = cheerio.load(response);
                let promises = [];
                $(".d-md-h.ncss-col-sm-12.va-sm-t.pb0-sm.prl0-sm").each((i, elem) => {
                    promises.push(new Promise((resolve, reject)=>{
                        let title = "Upcoming:" + $(elem).find(".ncss-brand.u-uppercase.mb-1-sm.fs16-sm").text() +" \n" + $(elem).find(".available-date-component.ncss-brand.pb6-sm.u-uppercase.fs14-sm.fs16-md").text();
                        let url = "https://www.nike.com" + $(elem).find(".card-link.d-sm-b").attr("href");
                        let imgURL = $(elem).find(".card-link.d-sm-b > img").attr("src");
                        let status = "В продаже";
                        let sizes = undefined;
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