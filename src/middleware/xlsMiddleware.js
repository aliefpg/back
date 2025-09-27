const multer = require('multer');
const path = require('path');
const imageName = ""
const helper = require('../helpers')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/dokumen'),
            file
    },
    filename: function(req, file, cb) {
        const fileExt = file.originalname.split('.')[1]
        cb(null, file.fieldname + "-" + Date.now() + "." + fileExt)
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000024 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
})

function checkFileType(file, cb) {
    const filetypes = /xls|xlsx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = file.mimetype === 'xls'||'xlsx';
    if(extname && mimeType){
        return cb(null, true)
    } else {
        console.log(file)
        return cb("Upload xls/xlsx saja", false)
    }
    // if (extname) {
    //     return cb(null, true);
    // } else {
    //     cb('Error: Images Only!');
       

    // }
}

module.exports = upload.single('file');




// limits: { fileSize: 1000024 },

// `${file.fieldname}-${Date.now()}`+path.extname(file.originalname)
// destination:path.join(__dirname+'../../public/images/'),