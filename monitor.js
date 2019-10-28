const axios = require('axios');
const cheerio = require('cheerio');

const Discord = require('discord.js');
const client = new Discord.Client();
const embed = new Discord.RichEmbed();
let token = "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U";
let ChannelID = "624879703207051277";
let fs = require('fs');
let intervals = [];


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

function CheckSite (shopName, url, shopurl, selectors, titleSelector, urlSelector, imgUrlSelector) {
    return axios.get(url, {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"})
        .then(response => {
            data = [];
            const $ = cheerio.load(response.data);
            $(selectors).each((i, elem) => {
                let title = titleSelector.attr === "innerText" ? $(elem).find(titleSelector.sel).text() : $(elem).find(titleSelector.sel).attr(titleSelector.attr);
                let url = urlSelector.attr === "innerText" ? $(elem).find(urlSelector.sel).text() : $(elem).find(urlSelector.sel).attr(urlSelector.attr);
                let imgUrl = imgUrlSelector.attr === "innerText" ? $(elem).find(imgUrlSelector.sel).text() : $(elem).find(imgUrlSelector.sel).attr(imgUrlSelector.attr);
                if(url.search(shopName) < 0){url = shopurl + url;}
                if(imgUrl.search(shopName) < 0){imgUrl = shopurl + imgUrl;}
                data.push({
                    "title": title,
                    "url": url,
                    "imgUrl": imgUrl
                });
            });
            return data;
        })
        .catch(err => {
            console.log(err);
        })
}

fs.watch('config.json', (eventType, filename)=>{
    intervals.forEach(elem => {
        clearInterval(elem);
    });
    main();
});

main();

function main(){
    let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    let i = 0;
    let minute = 1000;
    for(let conf in config) {
        setTimeout(() => {
            intervals.push(setInterval(() => {
                CheckSite(conf, config[conf].url,config[conf].shopurl, config[conf].selectors, config[conf].titleSelector, config[conf].urlSelector, config[conf].imgUrlSelector).then(result => {
                    let filtered = [];
                    let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
                    patterns.forEach(elem =>{
                        let reg = RegExp(elem + " [\\s\\S]+");
                        filtered = filtered.concat(result.filter(value => JSON.stringify(value).toLowerCase().match(reg)));
                    });
                    let notJSONname = "notified/" + conf + ".json";
                    let notified;
                    try{
                        notified = Array.from(JSON.parse(fs.readFileSync(notJSONname)));
                    }
                    catch (e){
                        notified = [];
                        fs.writeFileSync(notJSONname, JSON.stringify(notified));
                    }
                    let toNotify = intersection(filtered, notified);
                    let toSplice = intersection(notified, filtered);
                    if(toNotify.length !== 0){console.log("to Notify(" + conf + "): ", toNotify);}
                    if(toSplice.length !== 0){console.log("to Delete(" + conf + "):", toSplice);}

                    toNotify.forEach(elem => {
                        notified.push(elem);

                        embed.setTitle(elem["title"]);
                        if(elem["url"].match(/https?:\/\/(\w+\.)+\w\w\w?\/\w+/) !== null){embed.setDescription(elem["url"]);}
                        if(elem["imgUrl"].match(/https?:\/\/(\w+\.)+\w\w\w?\/\w+/) !== null){embed.setImage(elem["imgUrl"]);}

                        client.channels.get(ChannelID).send(embed);
                    });

                    toSplice.forEach(elem => {
                        notified.splice(notified.indexOf(elem), 1);
                    });

                    fs.writeFileSync(notJSONname, JSON.stringify(notified));
                }).catch(err => {
                    console.log(err);
                })
            }, config[conf].interval));
        }, i * minute);
        i++;
    }
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let generalChannel = client.channels.get(ChannelID);
    generalChannel.send("ruseller online!");
});

client.on('message', msg => {
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
});

client.login(token);