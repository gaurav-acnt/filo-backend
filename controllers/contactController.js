const { mailSender} = require("../utils/mailSender");


const Contact = require("../models/Contact");

// exports.sendContactMessage = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     //  Save in DB 
//     await Contact.create({ name, email, message });

//     //  Send email to admin
//     const receiver = process.env.CONTACT_RECEIVER_EMAIL;

//     const subject = "📩 New Contact Form Message - ShareIt";
//     const html = `
//       <h2>New Contact Message</h2>
//       <p><b>Name:</b> ${name}</p>
//       <p><b>Email:</b> ${email}</p>
//       <p><b>Message:</b></p>
//       <p>${message}</p>
//       <hr/>
//       <p>✅ Sent from ShareIt Contact Page</p>
//     `;

//     await mailSender(receiver, subject, html);

//     return res.status(200).json({
//       success: true,
//       message: "✅ Message sent successfully",
//     });
//   } catch (error) {
//     console.log("❌ Contact Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //   in DB 
    await Contact.create({ name, email, message });

    //  Send email 
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;

    const subject = "📩 New Contact Form Message - FILO";
    const html = `
      <h2>New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
      <hr/>
      <p>✅ Sent from FILO Contact Page</p>
    `;

    await mailSender(receiver, subject, html);

    return res.status(200).json({
      success: true,
      message: " Message sent successfully",
    });
  } catch (error) {
    console.log(" Contact Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
