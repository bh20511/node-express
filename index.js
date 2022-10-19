//想要使用環境變數.env要引入dotenv
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
//想要讀取ＰＯＳＴ有圖檔的需要引入這個套件
// const multer = require('multer');
// const upload = multer({dest:'tmp_uploads/'})
const upload = require(__dirname + '/modules/upload-img');
const db = require(__dirname + '/modules/db_connect2');
const sessionStore = new MysqlStore({},db);
const cors = require('cors');
const axios = require('axios')
const fetch = require('node-fetch')
// const { default: axios } = require('axios');




//連結桌機那台資料庫
const dbpeak = require(__dirname + '/modules/db_connectpeak');

const fs = require('fs').promises;



//建立伺服器
const app = express();
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        console.log({origin});
        callback(null, true);
    }
};
app.use(cors(corsOptions));

app.set('view engine', 'ejs');

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "helloiambert",
    store: sessionStore,
    cookie: {
        maxAge: 1_200_000
    }
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//下面是自己定義的template helper functions
app.use((req,res,next)=>{
    res.locals.toDateString = (d)=>moment(d).format('YYYY-MM-DD');
    res.locals.toDatetimeString= (d)=>moment(d).format('YYYY-MM-DD HH:mm:ss');
    res.locals.title='柏宏的網站';
    res.locals.session=req.session;
    next();
});


app.use(express.static('public')) //可以直接使用public資料夾的東西當路徑呈現建議放上面一點
app.use(express.static('node_modules/bootstrap/dist'))
///Users/gilbert/Desktop/nodeclass/node_modules/bootstrap/dist/css/bootstrap.css

app.get('/', function (req, res) {
    res.render('main', { name: 'Gilbert' });
});

app.get('/abc', (req, res) => {
    res.send(`<h2>ABC</h2>`);
});

app.get('/sales-json', (req, res) => {
    const sales = require(__dirname + '/data/sales');
    // console.log(sales);
    res.render(`sales-json`, { sales });
})

app.get('/json-test', (req, res) => {
    res.send({ name: '漢考克', age: 22 });
    // res.json({name:'漢考克',age:22})
});

app.get('/try-qs', (req, res) => {
    res.json(req.query);
    // res.json({name:'漢考克',age:22})
});


app.post('/try-post', (req, res) => {
    res.json(req.body);
})

app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
});

app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
});

app.post('/try-upload', upload.single('avatar'), async (req, res) => {
    res.json(req.file);
});

app.get('/my-params1/:action?/:id', async (req, res) => {
    res.json(req.params);
})

app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/i, (req, res) => {
    let u = req.url.slice(3);
    u = u.split('?')[0];
    u = u.split('-').join('');
    res.json({ mobile: u });
})
//原始版本
// app.post('/try-upload',upload.single('avatar'),async(req,res)=>{
//     if(req.file && req.file.originalname){
//         await fs.rename(req.file.path,`public/imgs/${req.file.originalname}`);
//         res.json(req.file);
//     }else{
//         res.json({msg:'沒有上傳檔案'});
//     }
// });

app.use('/admin2', require(__dirname + '/routes/admin2'));

const myMiddle = (req, res, next) => {
    res.locals = { ...res.locals, bert: "hey" };
    res.locals.derrr = 567;
    next();
};

app.get('/try-middle', [myMiddle], (req, res) => {
    res.json(res.locals);
})

app.post('/try-upload2', upload.array('photos'), async (req, res) => {
    res.json(req.files);
});

app.get('/try-session', (req, res) => {
    req.session.aaa ||= 0; //一進來就判斷你有沒有undefined = 0
    req.session.aaa++;
    res.json(req.session);
})

app.get('/try-date', (req, res) => {
    const now = new Date;
    const m = moment(); //呼叫這個函式可以得到當下時間
    res.send({
        // t1:now,
        // t2:now.toString(),
        // t3:now.toDateString(),
        // t4:now.toLocaleDateString(),
        m: m.format('YYYY-MM-DD HH:mm:ss')
    })
});

app.get('/try-moment', (req, res) => {
    const fm = 'YYYY-MM-DD HH:mm:ss'
    // const m = moment('06/10/22','DD/MM/YY'); 
    const m = moment();
    res.json({
        // m,
        m1: m.format(fm), //這是格式化後的本地時間
        m2: m.tz('Europe/London').format(fm)
    })
});

app.get('/try-db', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM address_book LIMIT 5");
    res.json(rows);
});

app.get('/try-dbpeak', async (req, res) => {
    const [rows] = await dbpeak.query("SELECT * FROM room LIMIT 5");
    res.json(rows);
});

app.get('/try-db-add', async (req, res) => {
    const name = '凱爾';
    const email = 'handson5286@gmail.com';
    const mobile = '0988792455';
    const birthday = '1999-01-24';
    const address = '桃園區國際路';

    const sql = "INSERT INTO `address_book`(`name`,`email`,`mobile`,`birthday`,`address`,`created_at`)VALUES(?,?,?,?,?,NOW())"
    
    const [result] = await db.query(sql,[name,email,mobile,birthday,address]);
    res.json(result);
});

app.get('/try-db-add2', async (req, res) => {
    const name = '凱爾';
    const email = 'handson5286@gmail.com';
    const mobile = '0988792455';
    const birthday = '1999-01-24';
    const address = '桃園區國際路';

    const sql = "INSERT INTO `address_book` SET ?"
    
    const [result] = await db.query(sql,[{name,email,mobile,birthday,address,created_at:new Date()}]);
    res.json(result);
});

app.use('/cate',async(req,res)=>{
    const sql = "SELECT * FROM categories ORDER BY sid"
    const [rows]= await db.query(sql);

    const firsts = [];
    for(let i of rows){
        if(i.parent_sid===0){
            firsts.push(i);
        }
    }

    for(let f of firsts){
        for(let i of rows){
            if(f.sid===i.parent_sid){
                f.children ||=[];
                f.children.push(i);
            }
        }
    }

    res.json(firsts);
});

app.use('/cate2',async(req,res)=>{
    const sql = "SELECT * FROM categories ORDER BY sid"
    const [rows]= await db.query(sql);
    
    const dict = {};
    for(let i of rows){
        dict[i.sid] = i;
    }
    for(let i of rows){
        if(i.parent_sid!=0){
            const p = dict[i.parent_sid];
            p.children ||=[];
            p.children.push(i);
        }
    }

    const firsts = []
    for(let i of rows){
        if(i.parent_sid===0){
            firsts.push(i);
        }
    }
    res.json(firsts);
});

//------------ 重要的三個範例----------------
app.use('/ab',require(__dirname+'/routes/address-book'));


app.get('/fake-login',(req,res)=>{
    req.session.admin = {
        id:12,
        account:'Bert',
        nickname:'柏宏'
    };
    res.redirect('/');
});

app.get('/logout',(req,res)=>{
    delete req.session.admin;
    res.redirect('/');
});



app.get('/yahoo',async (req,res)=>{
    const response = await axios.get('https://tw.yahoo.com/')
    res.send(response.data);
})

app.get('/banana',async (req,res)=>{
    const key = 'CWB-ABA5A49E-46A4-468A-8392-65DCAE6040D7'
    let d = await fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-ABA5A49E-46A4-468A-8392-65DCAE6040D7&locationName=%E6%A1%83%E5%9C%92%E5%B8%82');
    let data = await d.json();
    let {records} = data;
    res.json(records.location);
})
// app.use('/homework',require('/homework.html'))
// app.use('/homework', (req,res)=>{
//     res.redirect('homework.html')
// })


// app.use((req, res) => {
//     // res.type('text/plain'); 
//     //上面表示純文字 如果沒有打這行就會預設以ＨＴＭＬ送出所以下面的標籤不會被解析
//     res.status(404).render('404.ejs');
// });


app.use((req, res) => {
    // res.type('text/plain'); 
    //上面表示純文字 如果沒有打這行就會預設以ＨＴＭＬ送出所以下面的標籤不會被解析
    res.status(404).render('404.ejs');
});
// 只要沒有設定路徑的都會進來


const port = process.env.SERVER_PORT || 3002
app.listen(port, () => {
    console.log(`伺服器已開始運行:${port}`);
})