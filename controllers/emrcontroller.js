const mongoose = require('mongoose');
const { MD5 } = require('crypto-js');
mongoose.set('debug', true);
const Emr = require('../models/Emr.js');
const { createToken, hashPassword, verifyPassword } = require('../utils/authentication');
const EMRCategory = require('../models/EMRCategory.js');

exports.register = async (req, res) => {
    try {
        var { uid, firstname, lastname, category, email, mobile, password } = req.body
        console.log(req.body);
        const app_id = MD5(mobile + email).toString();
        const hashedPassword = await hashPassword(password);

        var new_one = new Emr({ uid, firstname, lastname, category, email, mobile, app_id, password: hashedPassword });

        await new_one.save();

        return res.json({ status: 'success', message: 'emr registration successful', data: new_one })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.login = async (req, res) => {
    try {
        var { email, password } = req.body

        const user = await Emr.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Invalid Login credentials', data: [] });
        }
        const passwordValid = await verifyPassword(password, user.password);


        if (passwordValid) {
            //Handle session_id
            user.session_id = MD5(Math.random() * 100000).toString();
            await user.save();

            return res.json({ status: 'success', message: 'Login successful', data: user })
        } else {
            return res.status(400).json({ status: 'error', message: 'Invalid Login credentials', data: [] });
        }

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] });
    }
}

exports.logout = async (req, res) => {
    try {
        var { user_id, session_id } = req.body

        const user = await Emr.findOne({ _id: user_id, session_id });

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Session deos not exist', data: [] });
        }

        user.session_id = "";
        await user.save();

        return res.json({ status: 'success', message: 'Session destroyed successfully!', data: [] })


    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] });
    }
}

exports.get_emr_by_firebase_uid = async (req, res) => {
    try {
        const uid = req.params.uid;

        const emr = await Emr.findOne({ uid: uid }).lean();

        if (!emr) {
            return res.status(404).json({ status: 'error', message: 'No emr found', data: [] });
        }

        const category_info = await EMRCategory.findOne({ _id: emr.category });
        emr.category_info = category_info
        return res.json({ status: 'success', message: 'Emr data fetched successfully', data: emr })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}

exports.update_device_token = async (req, res) => {
    try {
        var { uid, devicetoken } = req.body

        const emr = await Emr.findOne({ uid: uid });
        emr.devicetoken = devicetoken;
        emr.save();
       
        return res.json({ status: 'success', message: 'Device token is updated successfully', data: emr })

    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: [] }) //standard error
    }
}
