const puppeteer = require("puppeteer-extra");

const MongoClient = require("mongodb").MongoClient;
let mongoOptions = {
    ServerUri: "mongodb://localhost:27017/",
    dbName:"ruseller",
    collectionName: "streetbeat"
};
const mongoClient = new MongoClient(mongoOptions.ServerUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoClient.connect((err, client)=>{
    setInterval(async ()=>{
        const db = client.db(mongoOptions.dbName);
        const collection = db.collection(mongoOptions.collectionName);
        const browser = await puppeteer.launch({});
        let page = await browser.newPage();
        await page.goto("https://street-beat.ru/cat/man/krossovki/");
        // console.log(await page.content());
        let items = await page.evaluate(()=>{
            let items = [];
            let elements = document.querySelectorAll("body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div.col-xl-3.col-md-4.col-xs-6.view-type_ > div");
            // let sizes = [];
            for(let element of elements){
                let title = element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link > span").innerText;
                let status = "В продаже";
                let url;
                let imgURL;
                if(element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link")){
                    url = "https://street-beat.ru" + element.querySelector("a.link.link--no-color.catalog-item__title.ddl_product_link").getAttribute("href");
                }
                if(element.querySelector("a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img")){
                    imgURL = element.querySelector("a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img").getAttribute("src");
                }
                let sizes = [];
                let els = document.querySelectorAll("body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div:nth-child(1) > div > div.catalog-item__block--hover > div > noindex > form > div > div > label");
                for(let el of els){
                    sizes.push(el.querySelector("span > a").innerHTML.trim());
                }
                items.push({
                    title: title,
                    status: status,
                    url: url,
                    imgURL: imgURL,
                    sizes: sizes
                });
            }
            return items;
        });
        browser.close();
        // console.log(items);

        collection.deleteMany({title: {$nin: items.map((elem)=>{return elem.title})}});
        items.forEach(item=>{
            collection.updateOne({title: item.title}, {$set: {sizes: item.sizes, imgURL: item.imgURL, url: item.url, status: item.status}}, {upsert: true})
        });
        console.log(`Writed ${items.length} items to ${mongoOptions.collectionName} collection`);
    }, 10000);
});
