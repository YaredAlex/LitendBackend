import { createTransport } from "nodemailer";
import "dotenv/config.js";

const transport = createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
const sendEmail = (email, text) => {
  //sending email
  transport.sendMail(
    {
      from: "yared@gokapinnotech.com",
      to: email,
      subject: "Welcome to Litend",
      text: `
      We are happy to have you on board, thank you for joining litend 
      where you can find your personality.
      with rigard
      CEO zeeshan
      `,
    },
    function (error, info) {
      if (error) console.log(error.message);
      else console.log("email sent to", info.accepted);
    }
  );
};

const sendEmailOTP = async (email, otp) => {
  transport.sendMail(
    {
      from: "yared@gokapinnotech.com",
      to: email,
      subject: "OTP",
      html: `<h5>OTP Verification</h5>
      <img alt="litend" src="https://i.postimg.cc/5NrCWyGX/litend-icon01.png"/>
      <p>Dear ${email}</p>
      <p>Your OTP is <strong>${otp}</strong> it will expires in 30min</p>
      <p>Team Litend send with ❤️ </p>
      <p>2023-2024 Litend Ltd.</p>
      `,
    },
    function (error, info) {
      if (error) console.log(error.message);
      else console.log("email sent to", info.accepted);
    }
  );
};
export { sendEmail, sendEmailOTP };
