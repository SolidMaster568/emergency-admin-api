const mongoose = require('mongoose');
var conn = require('../db/main');

const Schema = mongoose.Schema;

const userModel = new Schema({
  uid: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  photourl: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: String },
  blood_type: { type: String },
  height: { type: String },
  weight: { type: String },
  allergies: { type: String },
  devicetoken: { type: String },
  session_id: { type: String },

  registration_status: { type: String }, //custom

  registered: { type: Date, default: Date.now }
});

userModel.set('toJSON', { getters: true });
userModel.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

module.exports = conn.model('user', userModel);
