const mongoose = require('mongoose');
const { MD5 } = require('crypto-js');
mongoose.set('debug', true);
const Admin = require('../models/Admin.js');
const User = require('../models/user.js');
const EMRCategory = require('../models/EMRCategory.js');
const Call = require('../models/Call.js');
const Emr = require('../models/Emr.js');
const Report = require('../models/Report.js');
const { createToken, hashPassword, verifyPassword } = require('../utils/authentication.js');
const jwtDecode = require('jwt-decode');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("email =>", email);
        console.log("password =>", password);
        const user = await Admin.findOne({
            email
        });

        if (!user) {
            return res.status(403).json({
                message: 'Wrong email.'
            });
        }

        const passwordValid = await verifyPassword(password, user.password);

        if (passwordValid) {
            const token = createToken(user);
            const decodedToken = jwtDecode(token);
            const expiresAt = decodedToken.exp;
            const { username, role, id, created, profilePhoto, email } = user;
            const userInfo = { username, role, id, created, profilePhoto, email };

            res.json({
                message: 'Authentication successful!',
                token,
                userInfo,
                expiresAt
            });
        } else {
            res.status(403).json({
                message: 'Wrong email or password.'
            });
        }
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}

exports.dashboard = async (req, res) => {
    try {
        var { } = req.body;
        console.log('here')
        let data = {};
        data.num_users = await User.countDocuments();
        data.num_categories = await EMRCategory.countDocuments();
        data.num_emrs = await Emr.countDocuments();
        data.num_calls = await Call.countDocuments();
        data.num_calls_ended = await Call.find({ status: 2 }).countDocuments();
        data.num_calls_inprogress = Number(data.num_calls) - Number(data.num_calls_ended);

        return res.json({ result: true, data });

    } catch (err) {
        return res.json({ result: false, data: err.message });
    }
};

exports.appuser_get = async (req, res) => {
    try {
        var { _id } = req.body;
        if (_id) {
            var user = await User.findOne({ _id });
            return res.json({ result: true, data: user });
        }
        else {
            var users = await User.find().lean();

            return res.json({ result: true, data: users });
        }
    } catch (err) {
        return res.json({ result: false, data: err.message });
    }
};

exports.categories_add = async (req, res) => {
    try {
        var { name, details } = req.body;
        const filename = req.file?.filename;
        if (filename === null || filename === "") {
            return res.json({ result: false, data: "Icon file is required" });
        }

        await EMRCategory.create({ name, details, icon: "uploads/" + filename })

        return res.json({ result: true, data: 'success' });
    } catch (err) {        
        return res.json({ result: false, data: err.message });
    }
};

exports.categories_del = async (req, res) => {
    try {
        var { id } = req.body;
        await EMRCategory.deleteOne({ _id: id })

        return res.json({ result: true, data: 'success' });
    } catch (err) {
        return res.json({ result: false, data: err.message });
    }
};


exports.emr_get = async (req, res) => {
    try {
        var { category_id } = req.body;
        let data = await Emr.find({ category: category_id })

        return res.json({ result: true, data: data });
    } catch (err) {
        return res.json({ result: false, data: err.message });
    }
};

exports.emr_del = async (req, res) => {
    try {
        var { id } = req.body;
        await Emr.deleteOne({ _id: id })

        return res.json({ result: true, data: 'success' });
    } catch (err) {
        return res.json({ result: false, data: err.message });
    }
};