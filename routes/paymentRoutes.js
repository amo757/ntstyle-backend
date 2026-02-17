import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// კონსტანტები (უმჯობესია .env-ში გქონდეს, მაგრამ პირდაპირაც იმუშავებს)
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';
const TBC_URL = 'https://api.tbcbank.ge/v1/tpay';

// 1. ტოკენის აღების ფუნქცია (განახლებული Basic Auth-ით)
const getTbcToken = async () => {
    try {
        // გასაღებების დაშიფვრა (Base64)
        const authString = Buffer.from(`${TBC_ID}:${TBC_SECRET}`).toString('base64');

        const response = await axios.post(`${TBC_URL}/access-token`, 
            'grant_type=client_credentials', 
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'apikey': TBC_ID // ზოგიერთ შემთხვევაში TBC ამასაც ითხოვს
                }
            }
        );

        console.log("✅ TBC ტოკენი წარმატებით აიღო");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ TOKEN ERROR:", error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "ავტორიზაციის შეცდომა ბანკთან");
    }
};

// 2. გადახდის შექმნის რაუთი
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
        }

        // აიღე ტოკენი
        const token = await getTbcToken();

        // შექმენი გადახდა
        const paymentResponse = await axios.post(`${TBC_URL}/payments`, {
            amount: {
                currency: "GEL",
                total: parseFloat(order.totalPrice).toFixed(2)
            },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7], // ბარათით გადახდა
            extraId: order._id.toString()
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': TBC_ID,
                'Content-Type': 'application/json'
            }
        });

        // თუ წარმატებულია, დააბრუნე checkout_url
        if (paymentResponse.data && paymentResponse.data.links) {
            const checkoutUrl = paymentResponse.data.links.find(l => l.rel === 'approval_url')?.uri;
            res.json({ checkout_url: checkoutUrl });
        } else {
            throw new Error("ბანკმა ბმული არ დააბრუნა");
        }

    } catch (error) {
        console.error("❌ PAYMENT CREATION ERROR:", error.response?.data || error.message);
        res.status(500).json({ 
            message: "გადახდის შექმნა ვერ მოხერხდა",
            detail: error.response?.data?.detail || error.message 
        });
    }
});

// 3. Callback რაუთი (ბანკი აქ აგზავნის სტატუსს)
router.post('/callback', async (req, res) => {
    console.log("🔔 TBC Callback მოვიდა:", req.body);
    // აქ შეგიძლია განაახლო შეკვეთის სტატუსი ბაზაში (isPaid: true)
    res.status(200).send('OK');
});

export default router;