const Discord = require('discord.js');
const client = new Discord.Client();
const embed = new Discord.RichEmbed();

const fs = require('fs');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let token = "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U";
let ChannelID = "624879703207051277";

function intersection(A, B) {
    let result = [];
    for(let i = 0; i < A.length; i++){
        let f = false;
        for(let j = 0; j < B.length; j++){
            if(A[i]["title"] === B[j]["title"]){
                if(A[i]["sizes"].length === B[j]["sizes"].length){
                    f = true;
                    break;
                }
            }
        }
        if(!f){
            result.push(A[i]);
        }
    }
    return result;
}

function Analyze(items, shopName){
    let notJSONname = "notified/" + shopName + ".json";
    let notified;
    try{
        notified = Array.from(JSON.parse(fs.readFileSync(notJSONname)));
    }
    catch (e){
        notified = [];
        fs.writeFileSync(notJSONname, JSON.stringify(notified));
    }
    let toNotify = intersection(items, notified);
    let toSplice = intersection(notified, items);

    toNotify.forEach(Nelem=>{
        toSplice.forEach(Selem=>{
            if(Nelem["title"] === Selem["title"]){
                if(Nelem["sizes"].length < Selem["sizes"].length){
                    notified.push(Nelem);
                    toNotify.splice(toNotify.indexOf(Nelem), 1);
                }
            }
        })
    })

    if(toNotify.length !== 0){console.log("to Notify(" + shopName + "): ", toNotify);}
    if(toSplice.length !== 0){console.log("to Delete(" + shopName + "):", toSplice);}


    console.log(toNotify);
    toNotify.forEach(elem => {
        notified.push(elem);

        if(elem["title"] != undefined){embed.setTitle(elem["title"])}
        if(elem["status"] != undefined && elem["sizes"].length > 0){embed.setDescription(elem["status"] +"\nДоступные размеры: " +elem["sizes"])}
        else if(elem["status"] != undefined){embed.setDescription(elem["status"])}
        if(elem["imgUrl"] != undefined){embed.setImage(elem["imgUrl"])}

        client.channels.get(ChannelID).send(embed);
    });

    toSplice.forEach(elem => {
        notified.splice(notified.indexOf(elem), 1);
    });

    fs.writeFileSync(notJSONname, JSON.stringify(notified));
}

async function CheckBrandshop() {
    const {window} = await JSDOM.fromURL("https://brandshop.ru/muzhskoe/obuv/krossovki/", {
        userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
        pretendToBeVisual: true
    });
    const $ = require("jquery")(window);
    let items = [];
    let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
    let reg = RegExp(patterns.join("|"));
    for await (let elem of $("#mfilter-content-container > div > div.products-grid.row > div > div.row.category-products > div.product-container > div.product")){
        let title = $(elem).find("h2 > span:nth-child(2)").text();
        if (title.toLowerCase().search(reg) !== -1) {
            let url = $(elem).find("a.product-image").attr("href");
            let imgUrl = $(elem).find("a.product-image > img").attr("src");
            let status;
            let res = await $.getJSON("https://brandshop.ru/getproductsize/" + $(elem).attr("data-product-id") + "/");
            let sizes = res.map((elem) => {
                return elem.name
            });
            if ($(elem).find("div.special > div").text() === "Нет в наличии") {
                status = "Нет в наличии";
            } else if ($(elem).find("div.special > div").text() === "Подробности скоро") {
                status = "Подробности скоро"
            } else if ($(elem).find("div.salestart").length) {
                status = "Скоро в продаже!"
            } else {
                status = url;
            }
            items.push({
                    "title": title,
                    "status": status,
                    "imgUrl": imgUrl,
                    "sizes": sizes
                }
            );
        }
    }
    Analyze(items, "brandshop");
}

setInterval(CheckBrandshop, 5000);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let generalChannel = client.channels.get(ChannelID);
    generalChannel.send("Brandshop online!");
});

client.on('message', msg => {
    if(msg.channel.id === ChannelID){
        let generalChannel = client.channels.get(ChannelID);
        let regforadd = /!add [\s\S]+/;
        let regfordel = /!delete [\s\S]+/;
        if(msg.content === "!help"){
            generalChannel.send("\"!add + название фильтра\" - добавляет заданный фильтр\n" +
                "\"!delete + название фильтра\" - удаляет заданный фильтр\n" +
                "!\"show\" - отображает текущие фильтров");
        }
        else if(msg.content.search(regforadd) !== -1 && !msg.author.bot){
            let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
            let tmp = msg.content.substr(5);
            let regval = "[\\s\\S]*";
            let pushval = regval;
            tmp = tmp.split(" ");
            tmp.forEach(elem =>{
                pushval += elem.toLowerCase();
                pushval += regval;
            });
            if(!patterns.includes(pushval)){
                patterns.push(pushval);
                fs.writeFileSync("patterns.json", JSON.stringify(patterns));
                generalChannel.send("Паттерн добавлен!");
            }else{
                generalChannel.send("Паттерн существует!");
            }
        }
        else if(msg.content.search(regfordel) !== -1 && !msg.author.bot){
            let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
            let tmp = msg.content.substr(8);
            let regval = "[\\s\\S]*";
            let pushval = regval;
            tmp = tmp.split(" ");
            tmp.forEach(elem =>{
                pushval += elem;
                pushval += regval;
            });
            if(patterns.includes(pushval)){
                patterns.splice(patterns.indexOf(pushval), 1);
                fs.writeFileSync("patterns.json", JSON.stringify(patterns));
                generalChannel.send("Паттерн удален!");
            }else{
                generalChannel.send("Паттерн не существует!");
            }
        }
        else if(msg.content === "!show"){
            let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
            if(patterns.length === 0){
                generalChannel.send("Не существует ни одного фильтра");
            }
            else{
                let output = "Существующие фильтры:\n";
                patterns.forEach(elem => {
                    output += elem.replace(/\[\\s\\S]\*/g, " ") + "\n";
                });
                generalChannel.send(output);
            }
        }
        else if(msg.content.substr[0] === "!"){
            generalChannel.send("Неверная комманда");
        }
    }
});

client.login(token);