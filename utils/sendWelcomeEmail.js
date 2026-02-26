import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (userEmail, userName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Email credentials missing in .env file");
        return;
    }

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

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333; border: 1px solid #e1e1e1;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-size: 24px;">N.T.Style</h1>
        </div>
        <div style="padding: 40px 20px; text-align: center;">
          <h2 style="font-weight: normal; margin-bottom: 20px;">გამარჯობა, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            გილოცავთ! თქვენი ანგარიში წარმატებით შეიქმნა.
            ახლა უკვე შეგიძლიათ შეხვიდეთ სისტემაში და დაიწყოთ შოპინგი.
          </p>
          <a href="https://ntstyle.ge/login" style="background-color: #000; color: #fff; text-decoration: none; padding: 15px 30px; text-transform: uppercase; font-size: 14px; font-weight: bold; letter-spacing: 1px;">შესვლა</a>
        </div>
      </div>
    `;

    const mailOptions = {
        from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `წარმატებული რეგისტრაცია 🎉`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};