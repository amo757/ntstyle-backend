import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// 🔑 აქ ჩაწერე შენი Flitt-ის რეალური მონაცემები
const FLITT_MERCHANT_ID = "4055847";
const FLITT_SECRET_KEY = "5PXzRQNR5xTiEcaK8F3LHcmmERLortie";

router.post('/create-payment', async (req, res) => {
    try {
        const requestData = {
            merchant_id: FLITT_MERCHANT_ID,
            order_id: "order_" + Date.now(),
            amount: 1500, // 15.00 ლარი
            currency: "GEL",
            order_desc: "Test Payment from Node.js"
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
            body: JSON.parse({ request: requestData })
        });

        const data = await response.json();

        if (data.response && data.response.response_status === 'success') {
            res.status(200).json({
                success: true,
                checkoutUrl: data.response.checkout_url,
                paymentId: data.response.payment_id
            });
        } else {
            console.error("Flitt Error:", data);
            res.status(400).json({ success: false, message: "ვერ მოხერხდა ლინკის გენერაცია", details: data });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "სერვერის შიდა შეცდომა" });
    }
});

// 🚀 მთავარი ცვლილება: ვაექსპორტებთ ES Modules წესით
export default router;