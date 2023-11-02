const mongoose = require('mongoose');
var conn = require('../db/main');

const Schema = mongoose.Schema;

const myModel = new Schema({
  name: { type: String, require: true}, 
  details: { type: String}, 
  icon: {type: String, require: true},

  date: { type: Date, default: Date.now },
});

myModel.set('toJSON', { getters: true });
myModel.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

module.exports = conn.model('rescue_team_category', myModel);
