import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-payment', async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        // 1. ვიღებთ მონაცემებს .env-დან (Render-იდან)
        const merchantId = process.env.FLITT_MERCHANT_ID;
        const secretKey = process.env.FLITT_SECRET_KEY;

        // დამცველი: თუ ვერ იპოვა, ერორს ამოაგდებს
        if (!merchantId || !secretKey) {
             console.error("❌ ერორი: Flitt-ის მონაცემები ვერ მოიძებნა Environment-ში!");
             return res.status(500).json({ success: false, message: "სერვერის კონფიგურაციის შეცდომა" });
        }

        const flittAmount = Math.round(amount * 100);

        // 2. ვაგზავნით მონაცემებს
        const requestData = {
            merchant_id: merchantId,
            order_id: orderId,
            amount: flittAmount,
            currency: "GEL",
            order_desc: "N.T.Style - შეკვეთა #" + orderId
        };

        const keys = Object.keys(requestData).sort();
        
        let signString = secretKey;
        for (const key of keys) {
            if (requestData[key] !== "" && requestData[key] !== null) {
                signString += "|" + requestData[key];
            }
        }

        const signature = crypto.createHash('sha1').update(signString).digest('hex').toLowerCase();
        requestData.signature = signature;

        const response = await fetch('https://pay.flitt.com/api/checkout/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request: requestData })
        });

        const data = await response.json();

        // 3. ვამოწმებთ Flitt-ის პასუხს
        if (data.response && data.response.response_status === 'success') {
            res.status(200).json({
                success: true,
                checkoutUrl: data.response.checkout_url,
                paymentId: data.response.payment_id
            });
        } else {
            // ⚠️ ეს არის ყველაზე მთავარი ხაზი ახლა: 
            console.error("❌ Flitt API-მ დაიწუნა მოთხოვნა. დეტალები:", JSON.stringify(data, null, 2));
            res.status(400).json({ success: false, message: "ვერ მოხერხდა გადახდის ლინკის გენერაცია", details: data });
        }

    } catch (error) {
        console.error("❌ Server Error in /create-payment:", error);
        res.status(500).json({ success: false, message: "სერვერის შიდა შეცდომა", error: error.message });
    }
});

export default router;