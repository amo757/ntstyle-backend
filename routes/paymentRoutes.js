import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-payment', async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        // ⚠️ მონაცემები მივუთითეთ პირდაპირ (Hardcoded), რადგან ამან Postman-ში 100% იმუშავა
        const merchantId = 4055847; 
        const secretKey = "aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy"; // 👈 ნამდვილი, სწორი გასაღები!

        // თანხის გადაყვანა თეთრებში (Flitt ყოველთვის თეთრებში ითხოვს)
        const flittAmount = Math.round(amount * 100);

        const requestData = {
            amount: flittAmount,
            currency: "GEL",
            merchant_id: merchantId,
            order_desc: "Order_" + orderId, 
            order_id: orderId.toString(),
            response_url: "https://ntstyle.ge/order/" + orderId,
            // ბანკი აქ ფარულად გამოაგზავნის სტატუსს გადახდის მერე
            server_callback_url: "https://ntstyle-api.onrender.com/api/payment/callback"
        };

        const keys = Object.keys(requestData).sort();
        
        let signString = secretKey;
        for (const key of keys) {
            if (requestData[key] !== "" && requestData[key] !== null) {
                signString += "|" + requestData[key];
            }
        }

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
            console.log("🔍 დასაშიფრი სტრინგი იყო:", signString);
            res.status(400).json({ success: false, message: "ვერ მოხერხდა გადახდის ლინკის გენერაცია", details: data });
        }

    } catch (error) {
        console.error("❌ Server Error in /create-payment:", error);
        res.status(500).json({ success: false, message: "სერვერის შიდა შეცდომა", error: error.message });
    }
});

export default router;