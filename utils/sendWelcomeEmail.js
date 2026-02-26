import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// API Key-ს შემოწმება
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        console.log(`🚀 მეილის გაგზავნის მცდელობა: ${userEmail}`);

        const { data, error } = await resend.emails.send({
            // თუ საკუთარი დომენი არ გაქვს, გამოიყენე onboarding@resend.dev
            from: 'N.T.Style <onboarding@resend.dev>', 
            to: [userEmail],
            subject: 'მოგესალმებით N.T.Style-ში! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eeeeee; padding: 20px;">
                    <div style="text-align: center; background-color: #000; padding: 10px;">
                        <h1 style="color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 2px;">N.T.Style</h1>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <h2 style="color: #333;">გამარჯობა ${userName}!</h2>
                        <p style="color: #666; line-height: 1.5;">
                            მოხარულები ვართ, რომ დარეგისტრირდით ჩვენს პლატფორმაზე. 
                            თქვენი ანგარიში წარმატებით გააქტიურდა.
                        </p>
                        <div style="margin-top: 30px;">
                            <a href="https://ntstyle.ge" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px;">დაიწყე შოპინგი</a>
                        </div>
                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 20px;">
                        <p>© 2026 N.T.Style. ყველა უფლება დაცულია.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("❌ Resend API-ს შეცდომა:", error);
            return { success: false, error };
        }

        console.log("✅ მეილი წარმატებით გაიგზავნა! ID:", data.id);
        return { success: true, data };

    } catch (err) {
        console.error("❌ სისტემური შეცდომა გაგზავნისას:", err.message);
        return { success: false, error: err.message };
    }
};