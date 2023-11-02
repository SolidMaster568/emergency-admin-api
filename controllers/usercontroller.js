const mongoose = require('mongoose');
const { MD5 } = require('crypto-js');
mongoose.set('debug', true);
const Admin = require('../models/Admin.js');
const User = require('../models/user.js');
const EMRCategory = require('../models/EMRCategory.js');
const Call = require('../models/Call.js');
const Emr = require('../models/Emr.js');
const Report = require('../models/Report.js');
const { createToken, hashPassword, verifyPassword } = require('../utils/authentication');

exports.register = async (req, res) => {
    try {
        // var { uid, firstname, lastname, email, mobile, password, confirm_password } = req.body
        var { uid, firstname, lastname, email, mobile, password, photourl } = req.body;

        // if (password != confirm_password) return res.status(400).json({ status: 'error', message: 'Password not matched', data: [] })

        const hashedPassword = await hashPassword(password);
        var new_user = new User({ uid, firstname, lastname, email, mobile, password: hashedPassword, photourl });

        await new_user.save();

        return res.status(201).json({ status: 'success', message: 'User registration successful', data: new_user })
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.quick_register = async (req, res) => {
    try {
        var { mobile } = req.body

        //Send OTP via Twilo TO_DO

        return res.status(200).json({ status: 'success', message: 'OTP sent successfully', data: [] })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.otp_verify = async (req, res) => {
    try {
        var { mobile, otp } = req.body

        if (!otp) return res.status(401).json({ status: 'error', message: 'OTP cannot be empty', data: [] })

        //Check OTP via Twilo TO_DO

        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(200).json({ status: 'success', message: 'OTP Verification successful', data: { 'account_status': 'unregistered' } });
        }

        let session_id = MD5(Math.random() * 100000).toString();
        user.session_id = session_id
        await user.save();

        return res.status(200).json({ status: 'success', message: 'OTP Verification successful', data: { 'account_status': 'registered', 'session_id': session_id } })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: 'OTP Verification failed' + error.message, data: [] }) //standard error
    }
}

exports.logout = async (req, res) => {
    try {
        var { session_id } = req.body
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId, session_id });

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Session deos not exist', data: [] });
        }

        user.session_id = "";
        await user.save();

        return res.json({ status: 'success', message: 'Logged out Successfully', data: [] })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.get_user_data = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'No user found', data: [] });
        }

        if (!user.blood_type || !user.height || !user.weight || !user.allergies)
            user.registration_status = 'incomplete'
        else
            user.registration_status = 'complete'

        return res.json({ status: 'success', message: 'User data fetched successfully', data: user })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.get_user_by_firebase_uid = async (req, res) => {
    try {
        const uid = req.params.uid;

        const user = await User.findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'No user found', data: [] });
        }

        if (!user.blood_type || !user.height || !user.weight || !user.allergies)
            user.registration_status = 'incomplete'
        else
            user.registration_status = 'complete'

        return res.json({ status: 'success', message: 'User data fetched successfully', data: user })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.fetch_emr_categories = async (req, res) => {
    try {

        const data = await EMRCategory.find({});

        return res.json({ status: 'success', message: 'Rescue categories fetched successfully', data: data })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.update = async (req, res) => {
    try {
        var { id, firstname, lastname, email, mobile, dob,
            blood_type, height, weight, allergies } = req.body

        await User.updateOne({ _id: id }, {
            firstname, lastname, email, mobile, dob,
            blood_type, height, weight, allergies
        }, { upsert: true });

        let user = await User.findOne({ _id: id });


        return res.json({ status: 'success', message: 'User update successful', data: user })
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.call_112 = async (req, res) => {
    try {
        var { user_id, user_lat, user_long, user_address, emr_id, emr_lat, emr_long, emr_address, category, type, user_fullname, channel_id } = req.body

        await Call.create({ user_id, user_lat, user_long, user_address, emr_id, emr_lat, emr_long, emr_address, category, type, channel_id })


        let os_data = {
            "address": user_address,
            "lattitude": user_long,
            "name": user_fullname,
            "type": type,
            "category": category,
            "longitude": user_lat,
            "channel_id": channel_id
        }
        let emr_data = await Emr.findOne({ _id: emr_id });
        let emr_app_id = emr_data.app_id;
        // _onsignal_call_trigger(os_data, emr_app_id); //TO_DO

        return res.json({ status: 'success', message: 'User update successful', data: os_data })
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.end_call_112 = async (req, res) => {
    try {
        var { call_id } = req.body

        await Call.updateOne({ _id: call_id }, { status: 2 })

        return res.json({ status: 'success', message: 'Call ended', data: [] })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.emergencies = async (req, res) => {
    try {
        var { user_id } = req.body
        let calldata = await Call.find({ user_id }).lean()

        const promises = calldata.map(async callitem => {
            let category_data = await EMRCategory.findOne({ _id: callitem.category });
            callitem.category = category_data?.name;

            let user_data = await User.findOne({ _id: callitem.user_id });
            callitem.user_data = user_data;
        })

        await Promise.all(promises)

        return res.json({ status: 'success', message: 'Emergencies fetched successfully', data: calldata })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.emergencies_for_category = async (req, res) => {
    try {
        var { category_id } = req.body
        const emrs = await Emr.find({ category: category_id });
       
        return res.json({ status: 'success', message: 'Emergencies for category fetched successfully', data: emrs })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.update_device_token = async (req, res) => {
    try {
        var { uid, devicetoken } = req.body

        const user = await User.findOne({ uid: uid });
        user.devicetoken = devicetoken;
        user.save();
       
        return res.json({ status: 'success', message: 'Device token is updated successfully', data: user })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}
