import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        console.log(`🚀 მეილის გაგზავნა: ${userEmail}`);

        const { data, error } = await resend.emails.send({
            // 👇 აქ შეცვალე შენი დომენით! 
            // შეგიძლია დააწერო ნებისმიერი რამ @-ის წინ (info, hello, no-reply)
            from: 'N.T.Style <hello@ntstyle.ge>', 
            to: [userEmail],
            subject: 'მოგესალმებით N.T.Style-ში! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; background: #000; padding: 10px; border-radius: 5px;">
                        <h1 style="color: #fff; margin: 0; letter-spacing: 2px;">N.T.STYLE</h1>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <h2 style="color: #333;">გამარჯობა ${userName}!</h2>
                        <p style="color: #666;">მოხარულები ვართ, რომ შემოგვიერთდით. თქვენი რეგისტრაცია წარმატებით დასრულდა.</p>
                        <br>
                        <a href="https://ntstyle.ge" style="background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ეწვიეთ მაღაზიას</a>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("❌ Resend Error:", error);
            return;
        }

        console.log("✅ მეილი წარმატებით გაიგზავნა ყველასთან!");
    } catch (err) {
        console.error("❌ შეცდომა:", err.message);
    }
};