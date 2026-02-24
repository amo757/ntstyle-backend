import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-payment', async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        // .trim() აშორებს ზედმეტ ჰარებს, თუ Render-ში შემთხვევით მიგვეწერა
        const merchantId = process.env.FLITT_MERCHANT_ID?.trim();
        const secretKey = process.env.FLITT_SECRET_KEY?.trim();

        if (!merchantId || !secretKey) {
             return res.status(500).json({ success: false, message: "სერვერის კონფიგურაციის შეცდომა" });
        }

        const flittAmount = Math.round(amount * 100);

        const requestData = {
            amount: flittAmount,
            currency: "GEL",
            merchant_id: merchantId,
            // ⚠️ ამოვიღეთ ქართული ასოები ენკოდინგის პრობლემის თავიდან ასარიდებლად
            order_desc: "Order " + orderId, 
            order_id: orderId.toString()
        };

        const keys = Object.keys(requestData).sort();
        
        let signString = secretKey;
        for (const key of keys) {
            if (requestData[key] !== "" && requestData[key] !== null) {
                signString += "|" + requestData[key];
            }
        }

        // ვაგენერირებთ ხელმოწერას utf8 ფორმატით
        const signature = crypto.createHash('sha1').update(signString, 'utf8').digest('hex').toLowerCase();
        requestData.signature = signature;

        const response = await fetch('https://pay.flitt.com/api/checkout/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request: requestData })
        });

        const data = await response.json();

        if (data.response && data.response.response_status === 'success') {
            res.status(200).json({
                success: true,
                checkoutUrl: data.response.checkout_url,
                paymentId: data.response.payment_id
            });
        } else {
            console.error("❌ Flitt API-მ დაიწუნა მოთხოვნა. დეტალები:", JSON.stringify(data, null, 2));
            console.log("🔍 დასაშიფრი სტრინგი იყო:", signString); // ამას დავლოგავთ, რომ ვნახოთ რას ვაგზავნით
            res.status(400).json({ success: false, message: "ვერ მოხერხდა გადახდის ლინკის გენერაცია", details: data });
        }

    } catch (error) {
        console.error("❌ Server Error in /create-payment:", error);
        res.status(500).json({ success: false, message: "სერვერის შიდა შეცდომა", error: error.message });
    }
});

export default router;