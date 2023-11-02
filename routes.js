const maincontroller = require("./controllers/maincontroller.js");
const agoracontroller = require("./controllers/agoracontroller.js");
const usercontroller = require("./controllers/usercontroller.js");
const emrcontroller = require("./controllers/emrcontroller.js");
const admincontroller = require("./controllers/admincontroller.js");
const twiliocontroller = require("./controllers/twiliocontroller.js");

const router = require('express').Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
      },
      filename: function (req, file, cb) {
        let exploded_name = file.originalname.split(".");
        let ext = exploded_name[exploded_name.length - 1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
      }
});
const upload = multer({ storage: storage });

router.post('/ping', maincontroller.ping);
router.post('/init', maincontroller.init);
router.post('/test', twiliocontroller.sendOTP);
router.post('/agora_token', agoracontroller.get_token);
/**
 * User
 */
router.post('/user/auth/register', usercontroller.register);
router.post('/user/auth/mobile', usercontroller.quick_register);
router.post('/user/auth/otp_verify', usercontroller.otp_verify);
router.post('/user/auth/logout/:id', usercontroller.logout);

router.put('/user/update', usercontroller.update); //~~put mehtod
router.get('/user/emergency/categories', usercontroller.fetch_emr_categories);
router.post('/user/call_112', usercontroller.call_112); 
router.post('/user/end_call_112', usercontroller.end_call_112); 
router.get('/user/emergencies', usercontroller.emergencies); 
router.post('/user/emergencies_for_category', usercontroller.emergencies_for_category); 
router.get('/user/:id', usercontroller.get_user_data);
router.get('/user/firebase/:uid', usercontroller.get_user_by_firebase_uid);
router.post('/user/device_token', usercontroller.update_device_token);



/**
 * EMR
 */
router.post('/emr/auth/a-c/register', emrcontroller.register); //admin access
router.post('/emr/auth/login', emrcontroller.login);
router.post('/emr/auth/logout', emrcontroller.logout);
router.get('/emr/firebase/:uid', emrcontroller.get_emr_by_firebase_uid);
router.post('/emr/device_token', emrcontroller.update_device_token);


/**
 * Admin
 */
router.post('/admin/login', admincontroller.login);
router.post('/admin/dashboard', admincontroller.dashboard); // get dashboard information
router.post('/admin/appuser/get', admincontroller.appuser_get); // list of users
router.post('/admin/user/emergencies', usercontroller.emergencies);  //get each user's calls
// router.post('/admin/categories_add', admincontroller.categories_add);  //add emergency category
router.post('/admin/categories_add', upload.single('icon'),  admincontroller.categories_add);  //add emergency category
router.post('/admin/categories_del', admincontroller.categories_del);  //delete emergency category
router.post('/admin/emr_get', admincontroller.emr_get);  //get emrs in category
router.post('/admin/emr_del', admincontroller.emr_del);  //del emr


module.exports = (app) => {
  app.use('/api/v1', router);

  app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/public/test.html');
  });

  app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message
    });
  });
};
