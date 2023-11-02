const mongoose = require('mongoose');
mongoose.set('debug', true);
const Admin = require('../models/Admin.js');
const User = require('../models/user.js');
const EMRCategory = require('../models/EMRCategory.js');
const Call = require('../models/Call.js');
const Emr = require('../models/Emr.js');
const Report = require('../models/Report.js');
const { createToken, hashPassword, verifyPassword } = require('../utils/authentication');

exports.ping = async (req, res) => {
    try {
        return res.json({ type: 'pong', message: 'Emergency API 2.0 - Node.js version' })
    } catch (error) {
        return res.json({ result: false, message: error.message })
    }
}

exports.init = async (req, res) => {
    try {
        let password = await hashPassword('12345');

        await Admin.deleteMany({})
        await Admin.create({ firstname: 'Admin', lastname: 'Admin', email: 'admin@admin.com', password: password })

        await User.deleteMany({})
        let user_row1 = await User.create({ uid: "mz2G7xy3YuWZyslXl8sMVRse9li1", firstname: 'Brian', lastname: 'Dawnson', mobile: '12345678901', email: 'bdawn1282@gmail.com', password: "Brian1!", photourl: "https://firebasestorage.googleapis.com/v0/b/emergency-911-dd703.appspot.com/o/ProfilePics%2Fmz2G7xy3YuWZyslXl8sMVRse9li1?alt=media&token=78344e09-2d2d-4f2f-89e0-8006e094c75e", dob: '1994-1-1', blood_type: 'O', height: '180', weight: '80', allergies: 'rice, beans, egg' })

        await EMRCategory.deleteMany({})
        let category_row1 = await EMRCategory.create({ name: 'Police', details: 'call police', icon: 'uploads/icon-1697507436046-882513001.png' })
        let category_row2 = await EMRCategory.create({ name: 'HealthCare', details: 'Health care service', icon: 'uploads/icon-1697507521742-1233534.png' })

        await Emr.deleteMany({})
        let emr_row1 = await Emr.create({ uid: "IOIYcdB0mQVCTQGHQXCtytmVg4F2", firstname: 'Adedayo', lastname: 'Sanni', category: category_row1._id, mobile: '12345678901', email: 'encostay@gmail.com', password: "Encostay1!" })

        await Call.deleteMany({})
        await Call.create({ user_id: user_row1._id, emr_id: emr_row1._id, type: 'video', category: category_row1._id, status: 1, user_lat: 123, user_long: 234, emr_lat: 345, emr_long: 456, user_address: 'Address 1', emr_address: 'Address 2', channel_id: '', report: '' })
        // await Call.create({ user_id: user_row1._id, emr_id: emr_row2._id, type: 'voice', category: category_row2._id, status: 1, user_lat: 123, user_long: 234, emr_lat: 345, emr_long: 456, user_address: 'Address 1', emr_address: 'Address 2', channel_id: '', report: '' })
        // await Call.create({ user_id: user_row2._id, emr_id: emr_row2._id, type: 'voice', category: category_row2._id, status: 2, user_lat: 123, user_long: 234, emr_lat: 345, emr_long: 456, user_address: 'Address 1', emr_address: 'Address 2', channel_id: '', report: '' })

        return res.json({ result: true, data: 'Passowrd: 12345, Admin - admin@admin.com,  EMR - encostay@gmail.com,   User - bdawn1282@gmail.com, Seed - EMRCategory, Call ' })
    } catch (error) {
        return res.json({ result: false, message: error.message })
    }
}
