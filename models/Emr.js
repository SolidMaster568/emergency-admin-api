const mongoose = require('mongoose');
var conn = require('../db/main');

const Schema = mongoose.Schema;

const myModel = new Schema({
  uid: { type: String, require: true },
  firstname: { type: String, },
  lastname: { type: String, },
  category: { type: String, },
  email: { type: String, },
  mobile: { type: String, },
  devicetoken: { type: String, },
  password: { type: String },
  app_id: { type: String, },
  session_id: { type: String, },

  created: { type: Date, default: Date.now },
});

myModel.set('toJSON', { getters: true });
myModel.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

module.exports = conn.model('rescue_team', myModel);
