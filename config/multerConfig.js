/* multer configuration */

const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        // console.log('filed name :',file.fieldname); //printing eventimg
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        // console.log('File Filter - Originalname:', file.originalname);
        // console.log('File Filter - Mimetype:', file.mimetype);
        // console.log('File Filter - Size:', file.size);
        checkFileType(file, cb);
    }
}).single('eventimg');

function checkFileType(file, cb) {
    // console.log('checkfile');//printing
    // Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    // console.log('file name :',file.originalname); //printing
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);
    // console.log(extname);//printing (true)
    if (mimetype && extname) {
        // console.log('inside mimetype');//printing
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

module.exports = upload;
