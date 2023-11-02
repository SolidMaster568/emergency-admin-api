const mongoose = require('mongoose');
var conn = require('../db/main');

const Schema = mongoose.Schema;

const myModel = new Schema({
  user_id: { type: String, required: true, },
  emr_id: { type: String, required: true },
  type: { type: String },
  category: { type: String },
  status: { type: Number }, //1-in progress, 2-ended
  user_lat: { type: String },
  user_long: { type: String },
  emr_lat: { type: String },
  emr_long: { type: String },
  user_address: { type: String },
  emr_address: { type: String },
  channel_id: { type: String },
  report: { type: String },

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

module.exports = conn.model('calls', myModel);
