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

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const accountSid = 'AC18db7994e93878c14574d6ddeb422a99'; //test
const accountSid = 'AC395c996a959f3a15d103522bf66e89fb';

// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const authToken = 'ebbbbbf92cd93253a7b5d5788e6a384e'; //test
const authToken = '772e4508ae1aa8451d705e2d043ded26';

const client = require('twilio')(accountSid, authToken);

const twilio_service_sid = 'VA843e2f1d3c8167a17075859966dadb59';

exports.sendOTP = async (req, res) => {
    try {
        client.verify.v2.services(twilio_service_sid)
            .verifications
            .create({ to: '+12055759478', channel: 'sms' })
            .then(verification => {
                console.log(verification.status);
                return res.json({
                    result: true,
                    message: 'success'
                });
            });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        client.verify.v2.services(twilio_service_sid)
            .verificationChecks
            .create({ to: '+12055759478', code: '338884' })
            .then(verification_check => {
                console.log(verification_check.status)
                return res.json({
                    result: true,
                    message: 'success'
                });
            });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}
