import express from 'express';
import axios from 'axios';
import crypto from 'crypto'; 
import Order from '../models/orderModel.js';

const router = express.Router();

const FLITT_SECRET = 'შენი_FLITT_SECRET_KEY'; // ჩასვი შენი ახალი პაროლი
const FLITT_MERCHANT_ID = 1549901; // ჩასვი შენი ახალი ID

router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });

        const amountInTetri = Math.round(order.totalPrice * 100);

        // 1. ვაგროვებთ ყველა საჭირო პარამეტრს
        const requestData = {
            amount: amountInTetri,
            currency: "GEL",
            merchant_id: FLITT_MERCHANT_ID,
            order_desc: "Website Order",  // 👈 შევცვალეთ ინგლისურით სტაბილურობისთვის
            order_id: order._id.toString(),
            response_url: `https://ntstyle.ge/order/${order._id}`, // 👈 მომხმარებლის დასაბრუნებელი ლინკი
            server_callback_url: `https://ntstyle-api.onrender.com/api/payments/callback` // 👈 სერვერის ვებჰუკი
        };

        // 2. ვქმნით Signature-ს
        const sortedKeys = Object.keys(requestData).sort(); 
        const valuesToHash = [FLITT_SECRET.trim()]; // .trim() აშორებს უჩინარ სფეისებს

        for (let key of sortedKeys) {
            // Flitt-ის მოთხოვნა: ცარიელი ველები არ უნდა მოხვდეს ჰეშში
            if (requestData[key] !== '' && requestData[key] !== null) {
                valuesToHash.push(String(requestData[key]).trim());
            }
        }

        const signatureString = valuesToHash.join('|');
        
        // ლოგებში ვბეჭდავთ, რომ ზუსტად დავინახოთ რას ვაჰეშებთ
        console.log("📝 სტრინგი, რომელიც იჰეშება:", signatureString);

        // ჰეშის გენერაცია (აუცილებლად lowercase, რასაც .digest('hex') ისედაც შვება)
        requestData.signature = crypto.createHash('sha1').update(signatureString, 'utf8').digest('hex');
        console.log("🔐 დაგენერირებული ჰეში:", requestData.signature);

        // 3. ვაგზავნით მოთხოვნას
        const response = await axios.post('https://pay.flitt.com/api/checkout/url', {
            request: requestData
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const checkoutUrl = response.data?.response?.checkout_url;
        
        if (checkoutUrl) {
            res.json({ checkout_url: checkoutUrl });
        } else {
            console.error("❌ ბანკის პასუხი ერორით:", response.data);
            res.status(400).json({ detail: "ბანკმა გადახდის ბმული არ დააბრუნა", flitt_error: response.data });
        }

    } catch (error) {
        console.error("❌ PAYMENT ERROR:", error.response?.data || error.message);
        res.status(500).json({ detail: "გადახდის ინიციალიზაცია ვერ მოხერხდა" });
    }
});

// Callback ლოგიკა იგივე რჩება...
router.post('/callback', async (req, res) => {
    console.log("🔔 Flitt Callback მოვიდა:", req.body);
    res.status(200).send('OK');
});

export default router;