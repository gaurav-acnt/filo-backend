// const nodemailer = require("nodemailer");

// exports.mailSender = async (to, subject, html) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: false, 
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"FILO Support" <${process.env.MAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     return info;
//   } catch (error) {
//     console.log(" sendEmail error:", error.message);
//     throw error;
//   }
// };



const SibApiV3Sdk = require("sib-api-v3-sdk");

exports.mailSender = async (to, subject, html) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
      email: process.env.BREVO_EMAIL, 
      name: "FILO Support",
    };

    const receivers = [
      {
        email: to,
      },
    ];

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: subject,
      htmlContent: html,
    });

    return response;

  } catch (error) {
    console.log("sendEmail error:", error.message);
    throw error;
  }
};
