const mongoose = require('mongoose');
var conn = require('../db/main');

const Schema = mongoose.Schema;

const myModel = new Schema({
  call_id: { type: String}, 
  emr_id: { type: String}, 
  report: { type: String}, 

  created_at: { type: Date, default: Date.now },
});

myModel.set('toJSON', { getters: true });
myModel.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

module.exports = conn.model('reports', myModel);
