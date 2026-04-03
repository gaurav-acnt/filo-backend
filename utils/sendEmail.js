const SibApiV3Sdk = require("sib-api-v3-sdk");

exports.sendEmail = async (to, subject, html) => {
    try {
        const client = SibApiV3Sdk.ApiClient.instance;

        const apiKey = client.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

        const sender = {
            email: process.env.BREVO_EMAIL,
            name: "FILO",
        };

        const receivers = [
            {
                email: to,
            },
        ];

        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: subject,
            htmlContent: html,
        });

    } catch (error) {
        console.error("Brevo Email Error:", error);
        throw error;
    }
};

