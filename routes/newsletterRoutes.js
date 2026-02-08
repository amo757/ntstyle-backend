import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- მეილის გამგზავნი ფუნქცია ---
const sendDiscountEmail = async (userEmail) => {
  // შემოწმება: არსებობს თუ არა პაროლი და მეილი .env-ში
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing in .env file");
    throw new Error("Email credentials missing");
  }

  // ტრანსპორტერის შექმნა
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // HTML შაბლონი
  const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333; border: 1px solid #e1e1e1;">
      <div style="background-color: #000; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-size: 24px;">N.T.Style</h1>
      </div>
      <div style="padding: 40px 20px; text-align: center;">
        <h2 style="font-weight: normal; margin-bottom: 20px;">Welcome to the Family!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          Thank you for subscribing to our newsletter. We are thrilled to have you with us. 
          As a special welcome gift, please enjoy this exclusive discount on your next purchase.
        </p>
        <div style="background-color: #f8f8f8; border: 2px dashed #000; display: inline-block; padding: 20px 40px; margin-bottom: 30px;">
            <span style="display: block; font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 5px;">Your Coupon Code</span>
            <span style="display: block; font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000;">NTSTYLE10</span>
        </div>
        <br>
        <a href="https://ntstyle.ge" style="background-color: #000; color: #fff; text-decoration: none; padding: 15px 30px; text-transform: uppercase; font-size: 14px; font-weight: bold; letter-spacing: 1px;">Shop Collection</a>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2024 N.T.Style. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Welcome Gift! 🎁 Your 10% Discount Code`,
    html: htmlTemplate,
  };

  // მეილის გაგზავნა
  await transporter.sendMail(mailOptions);
};

// --- როუტი (Endpoint) ---
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`📩 Request received for: ${email}`);
    
    // ✅ ნაბიჯი 1: მომხმარებელს ვპასუხობთ მომენტალურად!
    // აქ აღარ ველოდებით მეილის გაგზავნას (await-ის გარეშე)
    res.status(200).json({ success: true, message: "Discount code sent successfully!" });

    // ✅ ნაბიჯი 2: მეილს ვაგზავნით ფონურად (Background)
    sendDiscountEmail(email)
      .then(() => {
        console.log(`✅ Email successfully sent to: ${email} (Background)`);
      })
      .catch((err) => {
        // ეს ერორი გამოჩნდება მხოლოდ Render-ის ლოგებში და არ შეაწუხებს მომხმარებელს
        console.error("❌ Background Email Error:", err.message);
      });

  } catch (error) {
    console.error("❌ Controller Error:", error);
    // შეცდომას ვაბრუნებთ მხოლოდ თუ პასუხი ჯერ არ გაგვიცია
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
  }
});

export default router;