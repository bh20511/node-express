const multer = require('multer');
const {v4:uuidv4} = require('uuid');

const extMap = {
    'image/jpeg': '.jpg',
    'image/png' : '.png',
    'image/gif' : '.gif',
};

const fileFilter = (req,file,callback)=>{
    callback(null,!!extMap[file.mimetype])
};

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__dirname+'/../public/uploads')
    },
    filename:(req,file,cb)=>{
        const ext = extMap[file.mimetype];
        cb(null,uuidv4()+ext)
    }
});

module.exports = multer({storage,fileFilter});
//upload=multer({storage,fileFilter});
// index upload有用到 upload.single('avatar)
// 