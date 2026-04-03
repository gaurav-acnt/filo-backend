// const nodemailer = require("nodemailer");

// exports.sendEmail = async (to,subject,html) => {
//     const transporter = nodemailer.createTransport({
//         service:"gmail",
//         auth:{
//             user:process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         }
//     })
//     await transporter.sendMail({
//         from:`"FILO" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//     })
// }

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

