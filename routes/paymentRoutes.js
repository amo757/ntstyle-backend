const express = require('express');
const crypto = require('crypto'); // Node.js-ის ჩაშენებული მოდული შიფრაციისთვის
// თუ axios-ს იყენებ, დაგჭირდება: const axios = require('axios');
// თუ Node 18+ გაქვს, ჩაშენებული fetch-იც იმუშავებს. აქ fetch-ით დაგიწერ.

const router = express.Router();

// 🔑 აქ ჩაწერე შენი Flitt-ის მონაცემები
const FLITT_MERCHANT_ID = "4055847";
const FLITT_SECRET_KEY = "5PXzRQNR5xTiEcaK8F3LHcmmERLortie";

router.post('/create-payment', async (req, res) => {
    try {
        // 1. ვაგროვებთ გასაგზავნ მონაცემებს (აქ შეგიძლია ფასი ფრონტიდან მიიღო: req.body.amount)
        const requestData = {
            merchant_id: FLITT_MERCHANT_ID,
            order_id: "order_" + Date.now(), // ყოველ ჯერზე უნიკალური ID რომ იყოს
            amount: 1500, // 15.00 ლარი (თეთრებში)
            currency: "GEL",
            order_desc: "Test Payment from Node.js"
        };

        // 2. ვალაგებთ ველებს ანბანის მიხედვით
        const keys = Object.keys(requestData).sort();
        
        // 3. ვაწყობთ სტრინგს ჰეშირებისთვის
        let signString = FLITT_SECRET_KEY;
        for (const key of keys) {
            if (requestData[key] !== "" && requestData[key] !== null) {
                signString += "|" + requestData[key];
            }
        }

        // 4. ვაგენერირებთ SHA1 ჰეშს Node.js-ის crypto-თი
        const signature = crypto.createHash('sha1').update(signString).digest('hex').toLowerCase();
        
        // 5. ვამატებთ signature-ს მონაცემებში
        requestData.signature = signature;

        // 6. ვაგზავნით მოთხოვნას Flitt-ის სერვერზე
        const response = await fetch('https://pay.flitt.com/api/checkout/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request: requestData })
        });

        const data = await response.json();

        // 7. ვაბრუნებთ პასუხს ფრონტში (React, Vue, HTML და ა.შ.)
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

module.exports = router;