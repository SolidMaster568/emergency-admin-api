var mongoose = require('mongoose');
const config = require('../config');
var conn = mongoose.createConnection('mongodb://127.0.0.1:27017/emergency', config.db.options);
mongoose.connection.on('error', console.log);
module.exports = conn;
