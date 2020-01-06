const Discord = require('discord.js');
const client = new Discord.Client();
const discordOptions = {
    token: "NjI0ODc2OTUwMjkyMjY3MDE4.XbFaYA.cHE9R_P_1f-Uk74Tzvp9G2UAqe" + "U",
    ChannelID: "624879703207051277"
};
let generalChannel;

const MongoClient = require("mongodb").MongoClient;
const mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionsNames: ["brandshop", "sneakerhead", "traektoria", "belief", "streetbeat"]
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const fs = require("fs");

let shops = {
    brandshop: {
        color: "#f9fbff",
        name: "Brandshop",
        icon: "https://pbs.twimg.com/profile_images/1121791129916100610/g4cfJXMY_400x400.jpg",
        url: "https://brandshop.ru/"
    },
    sneakerhead: {
        color: "#b53d52",
        name: "Sneakerhead",
        icon: "http://sun9-16.userapi.com/c633129/v633129565/32d95/m2gHdSIumok.jpg?ava=1",
        url: "https://sneakerhead.ru/"
    },
    traektoria: {
        color: "#00afef",
        name: "Traektoria",
        icon: "https://www.traektoria.ru/local/templates/traektoria/img/Logo-up.png",
        url: "https://www.traektoria.ru/"
    },
    belief: {
        color: "#c9bd10",
        name: "Belief",
        icon: "https://pbs.twimg.com/profile_images/1453316745/belief_orig_inv_hi.jpg",
        url: "https://store.beliefmoscow.com/"
    },
    streetbeat: {
        color: "#143943",
        name: "StreetBeat",
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrV2xm8gYS4SXgbrAXguuml9KDzFxyz85E0-eS9lK9qAszoe1y&s",
        url: "https://street-beat.ru/"
    }
};

function intersection(A, B) {
    let result = [];
    for (let i = 0; i < A.length; i++) {
        let f = false;
        for (let j = 0; j < B.length; j++) {
            if (A[i]["title"] === B[j]["title"]) {
                if (A[i]["sizes"].length === B[j]["sizes"].length) {
                    f = true;
                    break;
                }
            }
        }
        if (!f) {
            result.push(A[i]);
        }
    }
    return result;
}

function Analyze(items, notified, shop) {
    let toNotify = intersection(items, notified);
    let toSplice = intersection(notified, items);

    toNotify.forEach(Nelem => {
        toSplice.forEach(Selem => {
            if (Nelem["title"] === Selem["title"]) {
                if (Nelem["sizes"].length < Selem["sizes"].length) {
                    notified.push(Nelem);
                    toNotify.splice(toNotify.indexOf(Nelem), 1);
                }
            }
        })
    });

    if (toNotify.length !== 0) {
        console.log("to Notify(" + shop.name + "): ", toNotify);
    }
    if (toSplice.length !== 0) {
        console.log("to Delete(" + shop.name + "):", toSplice);
    }

    toNotify.forEach(item => {
        notified.push(item);

        let status;
        if(item.status === "В продаже")
            status = `Подробности: Товар достпуен по [ссылке](${item.url})`;
        else
            status = `Подробности: ${item.status}`;

        let sizes;
        if(!item.sizes || !item.sizes.length)
            sizes = "Нет размеров";
        else
            sizes = item.sizes.join("\t");

        let embed = new Discord.RichEmbed()
            .setColor(shop.color)
            .setAuthor(shop.name, shop.icon, shop.url)
            .setTitle(item.title)
            .setDescription(status)
            .setImage(item.imgURL)
            .addField("Доступные размеры:", sizes);
        generalChannel.send(embed);
    });

    toSplice.forEach(elem => {
        notified.splice(notified.indexOf(elem), 1);
    });

    return notified;
}


client.on('message', msg => {
    if(msg.channel !== generalChannel) return;
    let regforadd = /!add [\s\S]+/;
    let regfordel = /!delete [\s\S]+/;
    if(msg.content === "!help"){
        let embed = new Discord.RichEmbed()
            .setTitle("HELP")
            .setDescription("Для взаимодействия с ботом доступны следующие команды:")
            .setColor("#00a3d8")
            .addField("!add [фильтр]", "Добавляет заданный фильтр")
            .addField("!delete [фильтр]", "Удаляет заданный фильтр")
            .addField("!show", "выводит список текущих фильтров");
        generalChannel.send(embed);
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
            let embed = new Discord.RichEmbed()
                .setTitle("FILTERS")
                .setColor("#00a3d8")
                .setDescription("Не существует ни одного фильтра");
            generalChannel.send(embed);
        }
        else{
            let output = "Бот осуществляет поиск на сайтах по следующим фильтрам:\n\n";
            patterns.forEach(elem => {
                // embed.addField(elem.replace(/\[\\s\\S]\*/g, "") + "\n", "\u200b");
                output += elem.replace(/\[\\s\\S]\*/g, " ") + "\n";
            });
            let embed = new Discord.RichEmbed()
                .setTitle("FILTERS")
                .setColor("#00a3d8")
                .setDescription(output);
            generalChannel.send(embed);
        }
    }
    else if(msg.content.substr[0] === "!"){
        generalChannel.send("Неверная комманда");
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    generalChannel = client.channels.get(discordOptions.ChannelID);
    generalChannel.send("ruseller is here...");
    mongoClient.connect((err, client)=>{
        setInterval(()=>{
            const db = client.db(mongoOptions.dbName);
            let notifiedCollection = db.collection("notified");
            let patterns = JSON.parse(fs.readFileSync('patterns.json', 'utf8'));
            let reg = RegExp(patterns.join("|"));
            mongoOptions.collectionsNames.forEach(collectionName=>{
                let collection = db.collection(collectionName);
                collection.find({title: {$regex: reg, $options: "$i"}}, {_id: false}).toArray((err, items)=>{
                    notifiedCollection.find({shop: collectionName}, {_id: false}).toArray((err, notified)=>{
                        let res = Analyze(items, notified[0].data, shops[`${collectionName}`]);
                        notifiedCollection.deleteOne({shop: collectionName});
                        notifiedCollection.insertOne({
                            shop: collectionName,
                            data: res
                        });
                    });
                });
            });
            console.log("Tick");
        }, 10000);
    });
});

client.login(discordOptions.token);
