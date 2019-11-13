const Discord = require('discord.js');
const client = new Discord.Client();

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