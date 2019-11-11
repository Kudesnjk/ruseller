const Discord = require('discord.js');
const client = new Discord.Client();
const embed = new Discord.RichEmbed();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require("fs");

let token = "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U";
let ChannelID = "624879703207051277";

function intersection(A, B) {
    let result = [];
    for(let i = 0; i < A.length; i++){
        let f = false;
        for(let j = 0; j < B.length; j++){
            if(A[i]["title"] === B[j]["title"]){
                f = true;
                break;
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
    if(toNotify.length !== 0){console.log("to Notify(" + shopName + "): ", toNotify);}
    if(toSplice.length !== 0){console.log("to Delete(" + shopName + "):", toSplice);}

    toNotify.forEach(elem => {
        notified.push(elem);

        if(elem["title"] != undefined){embed.setTitle(elem["title"])}
        if(elem["status"] != undefined){embed.setDescription(elem["status"])}
        if(elem["imgUrl"] != undefined){embed.setImage(elem["imgUrl"])}

        client.channels.get(ChannelID).send(embed);
    });

    toSplice.forEach(elem => {
        notified.splice(notified.indexOf(elem), 1);
    });

    fs.writeFileSync(notJSONname, JSON.stringify(notified));
}

async function CheckNikeInStock(){
    let items = [];
    const {window} = await JSDOM.fromURL("https://www.nike.com/ru/launch/?s=in-stock", {
        userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
        pretendToBeVisual: true,
    });
    const $ = require("jquery")(window);

    for await (let elem of $(".pb2-sm.va-sm-t.ncss-col-sm-6.ncss-col-md-3.ncss-col-xl-2.prl1-sm")){
        let title = $(elem).find("[data-qa='product-card-link']").attr("aria-label").replace(" — дата релиза", "");
        let url = "https://www.nike.com" + $(elem).find("[data-qa='product-card-link']").attr("href");
        // let imgUrl = $(elem).find("[class = \"image-component.mod-image-component.u-full-width\"]").attr("src");
        items.push({
            "title": title,
            "status": url,
        });
    }
    Analyze(items, "nikeinstock");
    console.log(items)
}

setInterval(CheckNikeInStock, 2500);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let generalChannel = client.channels.get(ChannelID);
    generalChannel.send("Nike In Stock online!");
});

client.on('message', msg => {
    // let generalChannel = client.channels.get(ChannelID);
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
});

client.login(token);