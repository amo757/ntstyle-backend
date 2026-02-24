import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// 🔑 აქ ჩაწერე შენი Flitt-ის რეალური მონაცემები 
// (ან აჯობებს პირდაპირ .env-ში გქონდეს და process.env.FLITT_MERCHANT_ID-ით იღებდე)
const FLITT_MERCHANT_ID = "4055847";
const FLITT_SECRET_KEY = "5PXzRQNR5xTiEcaK8F3LHcmmERLortie";

router.post('/create-payment', async (req, res) => {
    try {
        // ✅ აღარ გვინდა JSON.parse(). პირდაპირ ვიღებთ ფრონტიდან გამოგზავნილ ინფორმაციას:
        const { orderId, amount } = req.body;

        // ⚠️ Flitt-ს თანხა სჭირდება თეთრებში (მაგ: 15.50 ლარი უნდა გაიგზავნოს როგორც 1550)
        // ამიტომ ფრონტიდან მოსულ თანხას ვამრავლებთ 100-ზე და ვამრგვალებთ
        const flittAmount = Math.round(amount * 100);

        const requestData = {
            merchant_id: FLITT_MERCHANT_ID,
            order_id: orderId, // ვატანთ რეალურ შეკვეთის ID-ს
            amount: flittAmount, // ვატანთ რეალურ თანხას თეთრებში
            currency: "GEL",
            order_desc: "N.T.Style - შეკვეთა #" + orderId
        };

        const keys = Object.keys(requestData).sort();
        
        let signString = FLITT_SECRET_KEY;
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

        if (data.response && data.response.response_status === 'success') {
            res.status(200).json({
                success: true,
                checkoutUrl: data.response.checkout_url,
                paymentId: data.response.payment_id
            });
        } else {
            console.error("Flitt API Error:", data);
            res.status(400).json({ success: false, message: "ვერ მოხერხდა ლინკის გენერაცია", details: data });
        }

    } catch (error) {
        // ერორის ლოგირება, რომ ზუსტად დავინახოთ რაშია საქმე თუ კიდევ გაფუჭდა
        console.error("Server Error in /create-payment:", error);
        res.status(500).json({ success: false, message: "სერვერის შიდა შეცდომა", error: error.message });
    }
});

export default router;