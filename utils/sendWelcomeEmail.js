import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// .env-ში აუცილებლად უნდა გქონდეს RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        console.log("🚀 Resend-ით მეილის გაგზავნა დაიწყო...");

        const { data, error } = await resend.emails.send({
            from: 'N.T.Style <onboarding@resend.dev>', // სანამ დომენს არ დააკავშირებ, დატოვე onboarding@resend.dev
            to: [userEmail],
            subject: 'მოგესალმებით N.T.Style-ში! 🎉',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #000;">გამარჯობა ${userName}!</h2>
                    <p>თქვენ წარმატებით დარეგისტრირდით ჩვენს პლატფორმაზე.</p>
                    <p>მოხარულები ვართ, რომ შემოგვიერთდით.</p>
                    <br>
                    <a href="https://ntstyle.ge" style="background: black; color: white; padding: 10px 20px; text-decoration: none;">საიტზე გადასვლა</a>
                </div>
            `,
        });

        if (error) {
            console.error("❌ Resend-ის შეცდომა:", error);
            return { success: false, error };
        }

        console.log("✅ მეილი გაიგზავნა წარმატებით! ID:", data.id);
        return { success: true, data };
    } catch (err) {
        console.error("❌ სისტემური შეცდომა გაგზავნისას:", err);
        return { success: false, error: err.message };
    }
};