const app = require("./app");
const mongoose = require("mongoose");
const config = require("./config");

const connect = url => {
  return mongoose.connect(url, config.db.options, () => console.log("*Connected to", url));
};

if (require.main === module) {

  // connect(config.db.prod);
  // mongoose.connection.on('error', console.log);
}

module.exports = { connect };

