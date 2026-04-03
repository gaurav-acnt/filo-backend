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
