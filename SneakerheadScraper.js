const request = require("request-promise");
const cheerio = require("cheerio");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "sneakerhead"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const options = {
    uri: "https://sneakerhead.ru/shoes/sneakers/",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
};

mongoClient.connect((err, client)=>{
    setInterval(()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        request.get(options).then(async (response, error)=>{
                const $ = cheerio.load(response);
                let promises = [];
                $("body > div.container.category-page > div.catalog > div > div.catalog__col.catalog__col--main > div.product-cards > div.product-cards__list > div.product-cards__item > div").each((i, elem) => {
                    promises.push(new Promise((resolve, reject)=>{
                        let title = $(elem).find("h5 > a").attr("title");
                        let url = "https://sneakerhead.ru" + $(elem).find("h5 > a").attr("href");
                        let imgURL = "https://sneakerhead.ru" + $(elem).find("div.product-card__image > div.product-card__image-inner > picture > source").attr("data-src");
                        let status = "В продаже";
                        let sizes = Array.from(new Set($(elem).find(".product-card__sizes").text().replace(/[^a-zA-Z0-9. \n]/g, '').split("\n")));
                        sizes.shift();
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
