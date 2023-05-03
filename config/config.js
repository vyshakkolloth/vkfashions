const mongoose = require('mongoose');



const sessionSecret ="mysitesessionsecret"
const multer = require('multer');
const path = require('path');




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/temp'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});
const stor = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/temp'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '' + file.originalname)
  }
});

const uploads = multer({
  storage: stor,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});


module.exports={
    sessionSecret,upload,uploads
}