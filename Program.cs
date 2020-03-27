using System;
using DSharpPlus;
using DSharpPlus.Entities;
using System.Linq;
using System.Threading.Tasks;
using System.Data.SQLite;
using System.IO;
using System.Threading;
using System.Collections.Generic;
using PuppeteerSharp;
using PuppeteerSharp.Extra;

namespace Ruseller
{
    public class Item : IEquatable<Item>
    {
        public string Title { get; set; }
        public int Status { get; set; }
        public string Offline { get; set; }
        public string Online { get; set; }
        public Uri URL { get; set; }
        public Uri ImageURL { get; set; }
        public string[] Sizes { get; set; }
        public string Price { get; set; }
        public bool Equals(Item other)
        {
            if (other is null)
                return false;
            return Title == other.Title && URL.ToString() == other.URL.ToString() && Status == other.Status && Price == other.Price && String.Join(";", Sizes) == String.Join(";", other.Sizes);
        }
        public override bool Equals(object obj) => Equals(obj as Item);
        public override int GetHashCode() => (Title, URL.ToString(), Status, String.Join(" ", Sizes), Price).GetHashCode();
    }

    public class ItemsContainer
    {
        public int Shop { get; set; }
        public Item[] Items { get; set; }
    }


    public class DataBase
    {
        private string _dbFileName;
        private SQLiteConnection _dbConnection;

        public DataBase(string dbFileName)
        {
            _dbFileName = dbFileName;
            if (!File.Exists(_dbFileName))
                SQLiteConnection.CreateFile(_dbFileName);

            _dbConnection = new SQLiteConnection($"Data Source={_dbFileName}");

            _dbConnection.Open();

            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {
                cmd.CommandText = "CREATE TABLE IF NOT EXISTS Filters([Filter] VARCHAR(255) PRIMARY KEY)";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }

                cmd.CommandText = "CREATE TABLE IF NOT EXISTS NFilters([Filter] VARCHAR(255) PRIMARY KEY)";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }
            }

            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {

                cmd.CommandText = "CREATE TABLE IF NOT EXISTS Brandshop([Title] VARCHAR(255), [Status] INTEGER, [Offline] VARCHAR(63), [Online] VARCHAR(63), [URL] VARCHAR(511), [ImageURL] VARHCAR(511), [Sizes] VARCHAR(511), [Price] VARCHAR(63))";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }

                cmd.CommandText = "CREATE TABLE IF NOT EXISTS Streetbeat([Title] VARCHAR(255), [Status] INTEGER, [Offline] VARCHAR(63), [Online] VARCHAR(63), [URL] VARCHAR(511), [ImageURL] VARHCAR(511), [Sizes] VARCHAR(511), [Price] VARCHAR(63))";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }

                cmd.CommandText = "CREATE TABLE IF NOT EXISTS Sneakerhead([Title] VARCHAR(255), [Status] INTEGER, [Offline] VARCHAR(63), [Online] VARCHAR(63), [URL] VARCHAR(511), [ImageURL] VARHCAR(511), [Sizes] VARCHAR(511), [Price] VARCHAR(63))";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }

                cmd.CommandText = "CREATE TABLE IF NOT EXISTS Traektoria([Title] VARCHAR(255), [Status] INTEGER, [Offline] VARCHAR(63), [Online] VARCHAR(63), [URL] VARCHAR(511), [ImageURL] VARHCAR(511), [Sizes] VARCHAR(511), [Price] VARCHAR(63))";
                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex) { Console.WriteLine(dbex); }
            }

            _dbConnection.Close();
        }

        public bool UpdateItems(ItemsContainer container, out Item[] addedItems, out Item[] deletedItems)
        {
            bool result = true;

            _dbConnection.Open();
            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {
                List<Item> current = new List<Item>();

                string shop;

                switch (container.Shop)
                {
                    case 0:
                        shop = "Brandshop";
                        break;
                    case 1:
                        shop = "Streetbeat";
                        break;
                    case 2:
                        shop = "Sneakerhead";
                        break;
                    case 3:
                        shop = "Traektoria";
                        break;
                    default:
                        addedItems = null;
                        deletedItems = null;
                        return false;
                }

                cmd.CommandText = $"SELECT * FROM {shop}";

                try
                {
                    using (SQLiteDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            current.Add(new Item
                            {
                                Title = reader["Title"].ToString(),
                                Status = int.Parse(reader["Status"].ToString()),
                                Offline = reader["Offline"].ToString(),
                                Online = reader["Online"].ToString(),
                                URL = new Uri(reader["URL"].ToString()),
                                ImageURL = new Uri(reader["ImageURL"].ToString()),
                                Sizes = reader["Sizes"].ToString().Split(new char[] { ';' }),
                                Price = reader["Price"].ToString()
                            });
                        }
                    }

                    addedItems = container.Items.Except(current).ToArray();
                    deletedItems = current.Except(container.Items).ToArray();

                    foreach (var item in deletedItems)
                    {
                        Console.WriteLine("Old: " + item.Title + " " + item.Status + " " + item.Price + " " + String.Join(" ", item.Sizes));

                        cmd.CommandText = $"DELETE FROM {shop} WHERE Title = @Title AND Status = @Status AND URL = @URL AND ImageURL = @ImageURL AND Sizes = @Sizes AND Price = @Price";
                        cmd.Parameters.Add("@Title", System.Data.DbType.String).Value = item.Title;
                        cmd.Parameters.Add("@Status", System.Data.DbType.Int64).Value = item.Status;
                        cmd.Parameters.Add("@URL", System.Data.DbType.String).Value = item.URL.ToString();
                        cmd.Parameters.Add("@ImageURL", System.Data.DbType.String).Value = item.ImageURL.ToString();
                        cmd.Parameters.Add("@Sizes", System.Data.DbType.String).Value = String.Join(";", item.Sizes);
                        cmd.Parameters.Add("@Price", System.Data.DbType.String).Value = item.Price;

                        try { cmd.ExecuteNonQuery(); }
                        catch (SQLiteException dbex) { Console.WriteLine(dbex); }
                    }

                    foreach (var item in addedItems)
                    {
                        Console.WriteLine("New: " + item.Title + " " + item.Status + " " + item.Price + " " + String.Join(" ", item.Sizes));

                        //cmd.CommandText = $"UPDATE {shop} SET Title = @Title, Status = @Status, URL = @URL, ImageURL = @ImageURL, Sizes = @Sizes, Price = @Price WHERE Title = @Title";
                        cmd.CommandText = $"INSERT INTO {shop} values(@Title, @Status, @Offline, @Online, @URL, @ImageURL, @Sizes, @Price)";
                        cmd.Parameters.Add("@Title", System.Data.DbType.String).Value = item.Title;
                        cmd.Parameters.Add("@Status", System.Data.DbType.Int32).Value = item.Status;
                        cmd.Parameters.Add("@Offline", System.Data.DbType.String).Value = item.Offline;
                        cmd.Parameters.Add("@Online", System.Data.DbType.String).Value = item.Online;
                        cmd.Parameters.Add("@URL", System.Data.DbType.String).Value = item.URL.ToString();
                        cmd.Parameters.Add("@ImageURL", System.Data.DbType.String).Value = item.ImageURL.ToString();
                        cmd.Parameters.Add("@Sizes", System.Data.DbType.String).Value = String.Join(";", item.Sizes);
                        cmd.Parameters.Add("@Price", System.Data.DbType.String).Value = item.Price;

                        try { cmd.ExecuteNonQuery(); }
                        catch (SQLiteException dbex)
                        {
                            if (dbex.HResult == -2147473489)
                            {
                                cmd.CommandText = $"UPDATE {shop} SET Status = @Status, Offline = @Offline, Online = @Online URL = @URL, ImageURL = @ImageURL, Sizes = @Sizes, Price = @Price WHERE Title = @Title";
                                cmd.Parameters.Add("@Title", System.Data.DbType.String).Value = item.Title;
                                cmd.Parameters.Add("@Status", System.Data.DbType.Int32).Value = item.Status;
                                cmd.Parameters.Add("@Offline", System.Data.DbType.String).Value = item.Offline;
                                cmd.Parameters.Add("@Online", System.Data.DbType.String).Value = item.Online;
                                cmd.Parameters.Add("@URL", System.Data.DbType.String).Value = item.URL.ToString();
                                cmd.Parameters.Add("@ImageURL", System.Data.DbType.String).Value = item.ImageURL.ToString();
                                cmd.Parameters.Add("@Sizes", System.Data.DbType.String).Value = String.Join(";", item.Sizes);
                                cmd.Parameters.Add("@Price", System.Data.DbType.String).Value = item.Price;
                                cmd.ExecuteNonQuery();
                            }
                            else
                            {
                                Console.WriteLine(dbex);
                            }
                        }
                    }

                }
                catch (SQLiteException dbex)
                {
                    Console.WriteLine(dbex);
                    addedItems = null;
                    deletedItems = null;
                    result = false;
                }
            }
            _dbConnection.Close();

            return result;
        }

        public string[] GetFilters(bool negative)
        {
            List<string> filters = new List<string>();

            _dbConnection.Open();
            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {
                if (!negative)
                    cmd.CommandText = "SELECT * FROM Filters";
                else
                    cmd.CommandText = "SELECT * FROM NFilters";

                try
                {
                    SQLiteDataReader reader = cmd.ExecuteReader();
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            filters.Add(reader["Filter"].ToString());
                        }
                    }
                }
                catch (SQLiteException dbex)
                {
                    Console.WriteLine(dbex);
                    filters = null;
                }
            }
            _dbConnection.Close();
            return filters.ToArray();
        }

        public int AddFilter(string filter, bool negative)
        {
            int result = 0;
            _dbConnection.Open();
            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {
                if (!negative)
                    cmd.CommandText = "INSERT INTO Filters values(@Filter)";
                else
                    cmd.CommandText = "INSERT INTO NFilters values(@Filter)";

                cmd.Parameters.Add("@Filter", System.Data.DbType.String).Value = filter;

                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex)
                {

                    if (dbex.HResult == -2147473489)
                        result = -1;
                    else
                    {
                        result = -2;
                        Console.WriteLine(dbex);
                    }
                }
            }
            _dbConnection.Close();

            return result;
        }

        public int DeleteFilter(string filter, bool negative)
        {
            int result = 0;
            _dbConnection.Open();
            using (SQLiteCommand cmd = _dbConnection.CreateCommand())
            {
                if (!negative)
                    cmd.CommandText = "DELETE FROM Filters WHERE Filter = @Filter";
                else
                    cmd.CommandText = "DELETE FROM NFilters WHERE Filter = @Filter";

                cmd.Parameters.Add("@Filter", System.Data.DbType.String).Value = filter;

                try { cmd.ExecuteNonQuery(); }
                catch (SQLiteException dbex)
                {
                    result = -1;
                    Console.WriteLine(dbex);
                }
            }
            _dbConnection.Close();

            return result;
        }
    }



    public class Scraper
    {
        public delegate Task ItemsHandler(ItemsContainer container);
        public event ItemsHandler NewItems;
        private DataBase _db;

        public Scraper(DataBase db)
        {
            _db = db;
        }

        public void Run()
        {
            Thread brandshopThread = new Thread(() =>
            {
                ScrapeBrandshopAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            });

            Thread streetbeatThread = new Thread(() =>
            {
                ScrapeStreetBeatAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            });

            Thread sneakerheadThread = new Thread(() =>
            {
                ScrapeSneakerheadAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            });

            Thread traektoriaThread = new Thread(() =>
            {
                ScrapeTraektoriaAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            });

            sneakerheadThread.Start();
            //streetbeatThread.Start();
            brandshopThread.Start();
            traektoriaThread.Start();
        }

        public async Task ScrapeBrandshopAsync()
        {
            int timeout = 10000;
            while (true)
            {
                Browser browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });

                using (var page = await browser.NewPageAsync())
                {
                    try
                    {
                        await page.GoToAsync("https://brandshop.ru/muzhskoe/obuv/krossovki/");

                        ItemsContainer container = new ItemsContainer
                        {
                            Shop = 0
                        };

                        container.Items = await page.EvaluateFunctionAsync<Item[]>(
                             @"()=>{
                            let items = [];
                            let elements = document.querySelectorAll(""#mfilter-content-container > div > div.products-grid.row > div > div.row.category-products > div.product-container > div.product"");

                            for (let element of elements)
                            {
                                let title = null;
                                let online = null;
                                let status = 0;
                                let url = """";
                                let imgURL = """";
                                let sizes = [];
                                let price = null;

                                if(element.querySelector(""a.product-image""))
                                {
                                    title = element.querySelector(""a.product-image"").getAttribute(""title"");
                                }

                                if(element.querySelector(""div.special > div""))
                                {
                                    if(element.querySelector(""div.special > div"").innerHTML == ""Нет в наличии"")
                                    {
                                        status = 3;
                                    }
                                }
                                if(element.querySelector(""div.special > div""))
                                {
                                    if(element.querySelector(""div.special > div"").innerHTML == ""Подробности скоро"")
                                    {
                                        status = 2;
                                    }
                                }
                                if(element.querySelector(""div.salestart""))
                                {
                                    status = 1;
                                    online = element.querySelector(""div.salestart > div:nth-child(1) > span"").innerHTML + "" "" + element.querySelector(""div.salestart > div:nth-child(3) > span"").innerHTML;
                                }

                                if (element.querySelector(""a.product-image""))
                                {
                                    url = element.querySelector(""a.product-image"").getAttribute(""href"");
                                }

                                if (element.querySelector(""a.product-image > img""))
                                {
                                    imgURL = element.querySelector(""a.product-image > img"").getAttribute(""src"");
                                }

                                if(element.querySelector(""div.price.price-box""))
                                {
                                    price = element.querySelector(""div.price.price-box"").innerHTML.replace(new RegExp(""<em class=\""currency\"">р</em>""), """");
                                }

                                let xhr = new XMLHttpRequest();
                                xhr.open(""GET"", ""https://brandshop.ru/getproductsize/"" + element.getAttribute(""data-product-id""), false);
                                xhr.send();
                                sizes = JSON.parse(xhr.response).map(el=>el.name);

                                items.push({
                                    Title: title,
                                    Status: status,
                                    Online: online,
                                    URL: url,
                                    ImageURL: imgURL,
                                    Sizes: sizes,
                                    Price: price
                                });
                            }
                            return items;
                        }");

                        Item[] newItems;
                        Item[] outdatedItems;
                        bool result = _db.UpdateItems(container, out newItems, out outdatedItems);
                        if (result)
                        {
                            if (newItems.Length != 0)
                            {
                                await NewItems(new ItemsContainer
                                {
                                    Shop = 0,
                                    Items = newItems
                                });
                            }
                        }
                        else
                        {
                            Console.WriteLine("Some problems with database items updation");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }
                await browser.CloseAsync();
                Thread.Sleep(timeout);
            }
        }

        public async Task ScrapeStreetBeatAsync()
        {

            string streetbeatURL = "https://street-beat.ru/cat/man/krossovki/";
            Item[] items = new Item[] { };
            var puppeteer = new PuppeteerExtra();
            puppeteer.Use(new PuppeteerExtraPluginStealth
            {
                EnabledEvasions = new HashSet<string> { "window.outerdimensions" }
            });

            var browser = await puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                SlowMo = 50,
                Args = new string[] { "--ash-host-window-bounds" }

            });

            //var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            //{
            //    Headless = true
            //});
            using (var page = await browser.NewPageAsync())
            {
                try
                {
                    await page.SetUserAgentAsync((await browser.GetUserAgentAsync()).Replace("HeadlessChrome", "Chrome"));
                    await page.GoToAsync(streetbeatURL);

                    //await page.GoToAsync("https://bot.sannysoft.com/");

                    string content = await page.GetContentAsync();

                    Console.WriteLine(content);
                    if (content.IndexOf("(new Fingerprint") == -1 && content.IndexOf("setCookie:function()") == -1)
                    {
                        items = await page.EvaluateFunctionAsync<Item[]>(
                            @"()=>{
                                let items = [];
                                let elements = document.querySelectorAll(""body > main > div.grid-container.catalog-container > div.catalog-section__wrapper > div > div.col-5col-xl-4.col-lg-9.col-md-landscape-9.ajax_page > div.catalog-grid__wrapper > div > div > div > div"");

                                for (let element of elements)
                                {
                                    let title = """";
                                    let status = 0;
                                    let url = """";
                                    let imgURL = """";
                                    let sizes = [];
                                    let price = """";

                                    if(element.querySelector(""a.link.link--no-color.catalog-item__title.ddl_product_link > span""))
                                    {
                                        title = element.querySelector(""a.link.link--no-color.catalog-item__title.ddl_product_link > span"").innerText;
                                    }



                                    if(element.querySelector(""div.catalog-item__badge > div > div > div""))
                                    {
                                        if(element.querySelector(""div.catalog-item__badge > div > div > div"").innerHTML === ""Скоро"")
                                        {
                                            status = 2;
                                        }
                                        if(element.querySelector(""div.catalog-item__badge > div > div.badge-timer > div:nth-child(1) > div""))
                                        {
                                            status = 1;
                                            title += ""{Date: "" + element.querySelector(""div.catalog-item__badge > div > div.badge-timer > div:nth-child(1) > div"").innerHTML.trim() + "";"";
                                        }
                                        if(element.querySelector(""div.catalog-item__badge > div > div.badge-timer > div:nth-child(2) > div""))
                                        {
                                            let tmps = element.querySelector(""div.catalog-item__badge > div > div.badge-timer > div:nth-child(2) > div"").innerHTML.trim().split("" "");

                                            title += ""Time: "" + tmps[1] + "" offline / "" + tmps[4] + "" online"" + ""}"";
                                        }
                                    }

                                    if (element.querySelector(""a.link.link--no-color.catalog-item__title.ddl_product_link""))
                                    {
                                        url = ""https://street-beat.ru"" + element.querySelector(""a.link.link--no-color.catalog-item__title.ddl_product_link"").getAttribute(""href"");
                                    }

                                    if (element.querySelector(""a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img""))
                                    {
                                        imgURL = element.querySelector(""a.link.catalog-item__img-wrapper.ddl_product_link > picture.catalog-item__picture > img"").getAttribute(""src"");
                                    }

                                    let els = element.querySelectorAll(""div.catalog-item__block--hover > div > noindex > form > div > div > label"");
                                    for (let el of els)
                                    {
                                        sizes.push(el.querySelector(""span > a"").innerHTML.trim() + "" RUS"");
                                    }

                                    if(element.querySelector(""div.price__wrapper > div > span > div""))
                                    {
                                        price = element.querySelector(""div.price__wrapper > div > span > div"").innerText;
                                    }

                                    items.push({
                                        Title: title,
                                        Status: status,
                                        URL: url,
                                        ImageURL: imgURL,
                                        Sizes: sizes,
                                        Price: price
                                    });
                                }
                                return items;
                            }
                        ");
                    }
                    else
                    {
                        Console.WriteLine("Стритбит опять какую то срань вернул!");
                    }
                }
                catch (NavigationException ex)
                {
                    Console.WriteLine("Невозможно перейти по адресу: " + streetbeatURL + "\n" + ex);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Произошла какая-то неведомая херня:\n" + ex);
                }
            }
            await browser.CloseAsync();

        }

        public async Task ScrapeSneakerheadAsync()
        {
            int timeout = 10000;
            while (true)
            {
                Browser browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });

                using (var page = await browser.NewPageAsync())
                {
                    try
                    {
                        await page.GoToAsync("https://sneakerhead.ru/shoes/sneakers/");

                        ItemsContainer container = new ItemsContainer
                        {
                            Shop = 2
                        };

                        container.Items = await page.EvaluateFunctionAsync<Item[]>(
                             @"()=>{
                            let items = [];
                            let elements = document.querySelectorAll(""body > div.container.category-page > div.catalog > div > div.catalog__col.catalog__col--main > div.product-cards > div.product-cards__list > div.product-cards__item"");

                            for (let element of elements)
                            {
                                let title = """";
                                let online = null;
                                let status = 0;
                                let url = """";
                                let imgURL = """";
                                let sizes = [];
                                let price = """";

                                if(element.querySelector(""body > div.container.category-page > div.catalog > div > div.catalog__col.catalog__col--main > div.product-cards > div.product-cards__list > div > div > h5 > a""))
                                {
                                    title = element.querySelector(""body > div.container.category-page > div.catalog > div > div.catalog__col.catalog__col--main > div.product-cards > div.product-cards__list > div > div > h5 > a"").getAttribute(""title"").replace(""Кроссовки "", """");
                                }

                                    
                                if(element.querySelector(""div > div.product-card__image > div.product-card__labels.product-card__labels--top-right > div > div.product-label__title""))
                                {
                                    if(element.querySelector(""div > div.product-card__image > div.product-card__labels.product-card__labels--top-right > div > div.product-label__title"").innerHTML === ""Старт продаж"")
                                        {
                                            status = 1;
                                            if(element.querySelector(""div > div.product-card__image > div.product-card__labels.product-card__labels--top-right > div > div.product-label__value""))
                                                online = element.querySelector(""div > div.product-card__image > div.product-card__labels.product-card__labels--top-right > div > div.product-label__value"").innerHTML;
                                        }
                                }
                                if(element.querySelector(""div > div.product-card__price > link""))
                                {
                                    if(element.querySelector(""div > div.product-card__price > link"").getAttribute === ""http://schema.org/OutofStock"")
                                        { status = 3; }
                                }

                                if (element.querySelector(""div > h5 > a""))
                                {
                                    url = ""https://sneakerhead.ru"" + element.querySelector(""div > h5 > a"").getAttribute(""href"");
                                }

                                if (element.querySelector(""div > div.product-card__image > div.product-card__image-inner > picture > noscript""))
                                {
                                    imgURL = ""https://sneakerhead.ru"" + element.querySelector(""div > div.product-card__image > div.product-card__image-inner > picture > noscript"").innerHTML.match(/src=""(.+)"" alt=/)[1];
                                }

                                let els = element.querySelectorAll(""div > div.product-card__hover > dl > dd"");
                                for (let el of els)
                                {
                                    sizes.push(el.innerText);
                                }

                                if(element.querySelector(""div > div.product-card__price > span""))
                                {
                                    price = element.querySelector(""div > div.product-card__price > span"").innerText.trim() + "" RUB"";
                                }

                                items.push({
                                    Title: title,
                                    Status: status,
                                    Online: online,
                                    URL: url,
                                    ImageURL: imgURL,
                                    Sizes: sizes,
                                    Price: price
                                });
                            }
                            return items;
                        }"
                         );

                        Item[] newItems;
                        Item[] outdatedItems;
                        bool result = _db.UpdateItems(container, out newItems, out outdatedItems);
                        if (result)
                        {
                            if (newItems.Length != 0)
                            {
                                await NewItems(new ItemsContainer
                                {
                                    Shop = 2,
                                    Items = newItems
                                });
                            }
                        }
                        else
                        {
                            Console.WriteLine("Some problems with database items updation");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }
                await browser.CloseAsync();
                Thread.Sleep(timeout);
            }
        }

        public async Task ScrapeTraektoriaAsync()
        {
            int timeout = 10000;
            while (true)
            {
                Browser browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });

                using (var page = await browser.NewPageAsync())
                {
                    try
                    {
                        await page.GoToAsync("https://www.traektoria.ru/wear/sneakers/");

                        ItemsContainer container = new ItemsContainer
                        {
                            Shop = 3
                        };
                        //Console.WriteLine("start");

                        container.Items = await page.EvaluateFunctionAsync<Item[]>(
                             @"()=>{
                            let items = [];
                            let elements = document.querySelectorAll(""div[itemprop = 'itemListElement']"");

                            for (let element of elements)
                            {
                                let title = null;
                                let online = null;
                                let status = 0;
                                let url = """";
                                let imgURL = """";
                                let sizes = [];
                                let price = null;

                                if(element.querySelector(""img[itemprop='image']""))
                                {
                                    title = element.querySelector(""img[itemprop='image']"").getAttribute(""title"");
                                }

                                if(element.querySelector(""link[itemprop='availability']""))
                                {
                                    if(element.querySelector(""link[itemprop='availability']"").getAttribute(""href"") == ""http://schema.org/OutOfStock"")
                                    {
                                        status = 3;
                                    }
                                }

                                if (element.querySelector(""a[itemprop='url']""))
                                {
                                    url = ""https://www.traektoria.ru/"" + element.querySelector(""a[itemprop='url']"").getAttribute(""href"");
                                }

                                if (element.querySelector(""img[itemprop='image']""))
                                {
                                    imgURL = ""http:"" + element.querySelector(""img[itemprop='image']"").getAttribute(""src"");
                                }

                                if(element.querySelector(""meta[itemprop='price']""))
                                {
                                    price = element.querySelector(""meta[itemprop='price']"").getAttribute(""content"").replace("".00"", """");
                                }

                                let xhr = new XMLHttpRequest();
                                xhr.open(""GET"", url, false);
                                xhr.send();

                                let parser = new DOMParser();
                                let doc = parser.parseFromString(xhr.response, ""text/html"");

                                let els = doc.querySelectorAll(""div[itemprop='offers']"");
                                for(let el of els)
                                {
                                    if(el.querySelector(""link[itemprop='availability']""))
                                    {
                                         if(el.querySelector(""link[itemprop='availability']"").getAttribute(""href"") === ""http://schema.org/InStock"")
                                         {
                                            sizes.push(el.querySelector(""span"").innerHTML + "" US"");
                                         }
                                    }
                                }

                                items.push({
                                    Title: title,
                                    Status: status,
                                    Online: online,
                                    URL: url,
                                    ImageURL: imgURL,
                                    Sizes: sizes,
                                    Price: price
                                });
                            }
                            return items;
                        }");

                        //foreach (var item in container.Items) {
                        //    Console.WriteLine("Traektoria: " + String.Join(" ", item.Sizes));// + " " + item.Status + " " + item.Price + " " + String.Join(" ", item.Sizes));
                        //}
                        //Console.WriteLine("end");

                        Item[] newItems;
                        Item[] outdatedItems;
                        bool result = _db.UpdateItems(container, out newItems, out outdatedItems);
                        if (result)
                        {
                            if (newItems.Length != 0)
                            {
                                await NewItems(new ItemsContainer
                                {
                                    Shop = 3,
                                    Items = newItems
                                });
                            }
                        }
                        else
                        {
                            Console.WriteLine("Some problems with database items updation");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }
                await browser.CloseAsync();
                Thread.Sleep(timeout);

            }
        }

        class RusellerBot
        {
            private DiscordClient _discordClient;
            private DiscordChannel _mainChannel;
            private Dictionary<int, DiscordChannel> _newItemsChannels;
            private DataBase _db;
            private string[] _filters;
            private string[] _nfilters;

            public RusellerBot(string token, DataBase db, ulong mainChannelID, ulong BrandshopChannelID, ulong StreetBeatChannelID, ulong SneakerheadChannelID, ulong TraektoriaChannelID)
            {
                _discordClient = new DiscordClient(new DiscordConfiguration
                {
                    Token = token,
                    TokenType = TokenType.Bot,
                    UseInternalLogHandler = true,
                    LogLevel = LogLevel.Debug
                });

                _mainChannel = _discordClient.GetChannelAsync(mainChannelID).Result;

                _newItemsChannels = new Dictionary<int, DiscordChannel>(4);
                _newItemsChannels.Add(0, _discordClient.GetChannelAsync(BrandshopChannelID).Result);
                _newItemsChannels.Add(1, _discordClient.GetChannelAsync(StreetBeatChannelID).Result);
                _newItemsChannels.Add(2, _discordClient.GetChannelAsync(SneakerheadChannelID).Result);
                _newItemsChannels.Add(3, _discordClient.GetChannelAsync(TraektoriaChannelID).Result);

                _db = db;

                _filters = _db.GetFilters(false);
                _nfilters = _db.GetFilters(true);
            }

            public void Run()
            {
                Thread rusellerThread = new Thread(() =>
                {
                    Start().ConfigureAwait(false).GetAwaiter().GetResult();
                });
                rusellerThread.Start();
            }

            private async Task Start()
            {
                _discordClient.MessageCreated += async e =>
                {
                    string message = e.Message.Content;
                    if (e.Channel == _mainChannel && message.StartsWith("!", StringComparison.CurrentCulture) && e.Message.Author.Id != 624876950292267018)
                    {
                        if (message == "!help")
                        {
                            string answer =
                            "!show - показать текущие фильтры\n" +
                            "!add [filter] - добавить фильтр для поиска\n" +
                            "!delete [filter] - удалить фильтр для поиска";
                            await e.Message.RespondAsync(answer);
                        }
                        else if (message == "!show")
                        {
                            string[] filters = _db.GetFilters(false);
                            if (filters != null)
                            {
                                if (filters.Length != 0)
                                {
                                    await e.Message.RespondAsync("Текущие фильтры:\n" + String.Join("\n", filters));
                                }
                                else
                                {
                                    await e.Message.RespondAsync("Сейчас не существует ни одного фильтра, но вы можете их добавить командой \"!add [filter]\"");
                                }
                            }
                            else
                            {
                                Console.WriteLine("Patterns is null in MessageCreated event handler");
                                await e.Message.RespondAsync("Невозможно получить информацию о фильтрах в текущий момент, повторите попытку позже");
                            }
                        }
                        else if (message.StartsWith("!add"))
                        {
                            int errCode = _db.AddFilter(message.Substring(5), false);
                            if (errCode == 0)
                            {
                                await e.Message.RespondAsync("Фильтр успешно добавлен");
                            }
                            else if (errCode == -1)
                            {
                                await e.Message.RespondAsync("Данный фильтр уже существует");
                            }
                            else
                            {
                                await e.Message.RespondAsync("Произошла ошибка при добавлении фильтра");
                            }
                        }
                        else if (message.StartsWith("!delete"))
                        {
                            int errCode = _db.DeleteFilter(message.Substring(8), false);
                            if (errCode == 0)
                            {
                                await e.Message.RespondAsync("Фильтр успешно удален");
                            }
                            else
                            {
                                await e.Message.RespondAsync("Произошла ошибка при удалении фильтра");
                            }
                        }
                        else
                        {
                            await e.Message.RespondAsync("Неизвестная команда, используйте \"!help\" для получения списка доступных команд");
                        }
                    }
                };
                await _discordClient.ConnectAsync();
                await _mainChannel.SendMessageAsync("Starting2...");

                await Task.Delay(-1);
            }

            public async Task Notify(ItemsContainer container)
            {
                if (container != null)
                {
                    if (container.Items != null)
                    {
                        if (container.Items.Length != 0)
                        {
                            try
                            {
                                DiscordChannel channel = _newItemsChannels[container.Shop];
                                if (channel == null)
                                {
                                    Console.Write("Dicord channel is null in RusellerBot.Notify function");
                                    return;
                                }

                                foreach (Item item in container.Items)
                                {
                                    if (_filters.Any(f => item.Title.ToLower().Contains(f.ToLower())))
                                    {

                                        DiscordEmbedBuilder embed;

                                        switch (item.Status)
                                        {
                                            case 0:
                                                embed = new DiscordEmbedBuilder
                                                {
                                                    Title = item.Title,
                                                    Url = item.URL.ToString(),
                                                    Color = new DiscordColor("#00c7fd"),
                                                    ImageUrl = item.ImageURL.ToString()
                                                };
                                                break;
                                            case 1:
                                                embed = new DiscordEmbedBuilder
                                                {
                                                    Title = $"Upcoming: {item.Title}\nДоступно: {item.Online}",
                                                    Color = new DiscordColor("#b18cfe"),
                                                    ImageUrl = item.ImageURL.ToString()
                                                };
                                                break;
                                            case 2:
                                                embed = new DiscordEmbedBuilder
                                                {
                                                    Title = $"Details soon: {item.Title}",
                                                    Color = new DiscordColor("#9aa60d"),
                                                    ImageUrl = item.ImageURL.ToString()
                                                };
                                                break;
                                            case 3:
                                                embed = new DiscordEmbedBuilder
                                                {
                                                    Title = $"OutOfStock: {item.Title}",
                                                    Color = new DiscordColor("#e32400"),
                                                    ImageUrl = item.ImageURL.ToString()
                                                };
                                                break;
                                            default:
                                                Console.Write("The status of item is not provided in RusellerBot.Notify function");
                                                return;
                                        }

                                        if (item.Sizes != null)
                                        {
                                            if (item.Sizes.Length != 0)
                                            {
                                                embed.AddField("Размеры:", String.Join("\n", item.Sizes));
                                            }
                                            else
                                            {
                                                Console.WriteLine("The item sizes is empty in Rusller.Notify function");
                                            }
                                        }
                                        else
                                        {
                                            Console.WriteLine("The item sizes is null in Rusller.Notify function");
                                        }

                                        if (item.Price != null)
                                        {
                                            if (item.Price != "")
                                            {
                                                embed.AddField("Цена:", item.Price);
                                            }
                                            else
                                            {
                                                Console.WriteLine("The item price is empty in Rusller.Notify function");
                                            }
                                        }
                                        else
                                        {
                                            Console.WriteLine("The item price is null in Rusller.Notify function");
                                        }

                                        await channel.SendMessageAsync(embed: embed.Build());
                                    }
                                }
                            }
                            catch (Exception exp)
                            {
                                Console.Write(exp);
                            }
                        }
                        else
                        {
                            Console.Write("The items array lenght is 0 in RusellerBot.Notify function");
                        }
                    }
                    else
                    {
                        Console.Write("The items array is null in RusellerBot.Notify function");
                    }
                }
                else
                {
                    Console.Write("The container is null in RusellerBot.Notify function");
                }
            }
        }

        class Program
        {
            static void Main(string[] args)
            {
                DataBase sqlite = new DataBase("sample.db");
                Scraper scraper = new Scraper(sqlite);
                RusellerBot ruseller = new RusellerBot("NjI0ODc2OTUwMjkyMjY3MDE4.XidL7w.3Pz5jT4qwttzYuWKousP9JXsU3Y", sqlite, 624879703207051277, 624879703207051277, 624879703207051277, 624879703207051277, 624879703207051277);

                scraper.NewItems += ruseller.Notify;

                Console.Write("logging...\n");

                scraper.Run();
                ruseller.Run();
            }
        }
    }
}
