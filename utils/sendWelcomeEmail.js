import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// დარწმუნდი, რომ .env-ში გაქვს RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        console.log(`🚀 პროცესი დაიწყო: მეილის გაგზავნა Resend-ით ${userEmail}-ზე`);

        const { data, error } = await resend.emails.send({
            // თუ დომენი ntstyle.ge ჯერ არ გაქვს ვერიფიცირებული Resend-ზე, 
            // აუცილებლად გამოიყენე ეს მისამართი:
            from: 'N.T.Style <onboarding@resend.dev>', 
            to: [userEmail],
            subject: 'მოგესალმებით N.T.Style-ში! 🎉',
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #000; letter-spacing: 3px; text-transform: uppercase;">N.T.Style</h1>
                    </div>
                    <div style="padding: 20px; text-align: center; background-color: #fafafa; border-radius: 4px;">
                        <h2 style="color: #333; font-weight: 400;">გამარჯობა ${userName}!</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            თქვენ წარმატებით დარეგისტრირდით <strong>N.T.Style</strong>-ის ონლაინ მაღაზიაში. 
                            მოხარულები ვართ, რომ გახდით ჩვენი ოჯახის წევრი!
                        </p>
                        <div style="margin-top: 30px;">
                            <a href="https://ntstyle.ge" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block;">შედით საიტზე</a>
                        </div>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 25px;">
                        © 2026 N.T.Style. All rights reserved.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("❌ Resend API Error:", error);
            return { success: false, error };
        }

        console.log("✅ მეილი გაიგზავნა წარმატებით! ID:", data.id);
        return { success: true, data };

    } catch (err) {
        console.error("❌ სისტემური შეცდომა გაგზავნისას:", err.message);
        return { success: false, error: err.message };
    }
};