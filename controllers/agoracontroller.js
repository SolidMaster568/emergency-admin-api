const { RtcTokenBuilder, RtcRole } = require("agora-token");

exports.get_token = async (req, res) => {

    try {
        const APP_ID = process.env.AGORA_APP_ID;
        const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
        const { uid, channelName } = req.body

        if (!uid || uid === "") {
            return res.status(400).json({ status: 'error', message: "No auth data", data: [] }) //standard error
        }

        if (!channelName || channelName === "") {
            return res.status(400).json({ status: 'error', message: "channelName is required", data: [] }) //standard error
        }

        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUserAccount(APP_ID, APP_CERTIFICATE, channelName, uid, RtcRole.PUBLISHER, expirationTimestamp);
        return res.json({ status: 'success', message: 'agora token generated successfully', data: { "app_id": APP_ID, "token": token } })
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message, data: {} }) //standard error
    }
}
