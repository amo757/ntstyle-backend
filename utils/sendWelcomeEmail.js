import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (userEmail, userName) => {
    //  DEBUG 1: ვამოწმებთ, საერთოდ შემოდის თუ არა აქ
    console.log("--- Email Debug: Function Started ---");
    console.log("Sending to:", userEmail);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const htmlTemplate = `<h1>მოგესალმებით, ${userName}!</h1><p>თქვენ წარმატებით დარეგისტრირდით N.T.Style-ზე.</p>`;

    const mailOptions = {
        from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `წარმატებული რეგისტრაცია 🎉`,
        html: htmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent Success:", info.response);
        return info;
    } catch (error) {
        console.error("❌ Nodemailer Error Inside Function:", error);
        throw error;
    }
};