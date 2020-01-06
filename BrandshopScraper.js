const cloudscraper = require("cloudscraper");
const cheerio = require("cheerio");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "brandshop"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
});

const options = {
    uri: "https://brandshop.ru/muzhskoe/obuv/krossovki/",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
};

function getSizes(url){
    return cloudscraper.get({
        uri: url,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
        referrer: "https://brandshop.ru/muzhskoe/obuv/krossovki/"
    }).then((res, err)=>{
        return JSON.parse(res).map(el => {
            return el.name
        });
    });
}

mongoClient.connect((err, client)=>{
    setInterval(()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        cloudscraper.get(options).then(async (response, error)=>{
            const $ = cheerio.load(response);
            let promises = [];
            $("#mfilter-content-container > div > div.products-grid.row > div > div.row.category-products > div.product-container > div.product").each((i, elem) => {
                promises.push(new Promise((resolve, reject)=>{
                    let children = $(elem).find("a > h2").children();
                    let title = children['0'].prev.data + children['1'].children[0].data;
                    let url = $(elem).find("a.product-image").attr("href");
                    let imgURL = $(elem).find("a.product-image > img").attr("src");
                    let status;
                    if ($(elem).find("div.special > div").text() === "Нет в наличии") {
                        status = "Нет в наличии";
                    } else if ($(elem).find("div.special > div").text() === "Подробности скоро") {
                        status = "Подробности скоро"
                    } else if ($(elem).find("div.salestart").length) {
                        status = "Скоро в продаже!"
                    } else {
                        status = "В продаже";
                    }
                    return getSizes("https://brandshop.ru/getproductsize/" + $(elem).attr("data-product-id")).then(sizes=>{
                        resolve({
                            title: title,
                            status: status,
                            url: url,
                            imgURL: imgURL,
                            sizes: sizes
                        });
                    })
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
