const request = require("request-promise");
const cheerio = require("cheerio");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "traektoria"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const options = {
    uri: "https://www.traektoria.ru/wear/sneakers/",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
};

function getSizes(url){
    return request.get({
        uri: url,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
        referrer: "https://www.traektoria.ru/wear/sneakers/"
    }).then((res, err)=>{
        const $ = cheerio.load(res);
        let sizes = new Set();
        $(".choose_size_column").each((i, elem)=>{
            if($(elem).find("[itemprop='availability']").attr("href") === "http://schema.org/InStock"){
                sizes.add($(elem).find(".choose_size").attr("data-size"));
            }
        });
        return Array.from(sizes);
    });
}

mongoClient.connect((err, client)=>{
    if(err){
        console.error(err);
        return;
    }
    setInterval(()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        request.get(options).then(async (response, error)=>{
                const $ = cheerio.load(response);
                let promises = [];
                $(`div[itemprop = "itemListElement"]`).each((i, elem) => {
                    promises.push(new Promise((resolve, reject)=>{
                        let title = $(elem).find("[itemprop='image']").attr("title");
                        let url = "https://www.traektoria.ru" + $(elem).find("[itemprop='url']").attr("href");
                        let imgURL = "https:" + $(elem).find("[itemprop='image']").attr("src");
                        let status = "В продаже";
                        return getSizes(url).then(sizes=>{
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
