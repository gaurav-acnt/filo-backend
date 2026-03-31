const nodemailer = require("nodemailer");

exports.mailSender = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"FILO Support" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.log(" sendEmail error:", error.message);
    throw error;
  }
};
