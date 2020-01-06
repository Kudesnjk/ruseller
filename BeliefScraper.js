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
