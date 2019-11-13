const Discord = require('discord.js');
const client = new Discord.Client();
const embed = new Discord.RichEmbed();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require('fs');

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
    console.log(toNotify);
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

async function CheckTraektoria(){
    const {window} = await JSDOM.fromURL("https://www.traektoria.ru/wear/sneakers/", {
        userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
        pretendToBeVisual: true
    });
    const $ = require("jquery")(window);
    let items = [];
    let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
    let reg = RegExp(patterns.join("|"));
    for await (let elem of $("div[itemprop = \"itemListElement\"]")){
        let title = $(elem).find("[itemprop='image']").attr("title");
        if (title.toLowerCase().search(reg) !== -1) {
            let url = "https://www.traektoria.ru" + $(elem).find("[itemprop='url']").attr("href");
            let imgUrl = "https:" + $(elem).find("[itemprop='image']").attr("src");
            let sizes = new Set();
            const dom = await JSDOM.fromURL(url, {
                userAgent: "Mozilla/5.0 (X11; HasCodingOs 1.0; Linux x64) AppleWebKit/637.36 (KHTML, like Gecko) Chrome/70.0.3112.101 Safari/637.36 HasBrowser/5.0",
                pretendToBeVisual: true
            });

            for (let el of dom.window.document.querySelectorAll(".choose_size_column")){
                if($(el).find("[itemprop='availability']").attr("href") == "http://schema.org/InStock"){
                    let tmp = $(el).find(".choose_size").attr("data-size");
                    sizes.add(tmp);
                }
            }
            items.push({
                "title": title,
                "status": url,
                "imgUrl": imgUrl,
                "sizes": Array.from(sizes)
            });
        }
    }
    Analyze(items, "traektoria")
}

setInterval(CheckTraektoria, 5000);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let generalChannel = client.channels.get(ChannelID);
    generalChannel.send("Traektoria online!");
});

client.login(token);