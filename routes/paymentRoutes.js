import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🛑 გასაღებები პირდაპირ აქ, რომ გამოვრიცხოთ .env-ის შეცდომა
// ესენი აღებულია შენი სურათიდან: image_07e91e.png
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';      // Client ID (Payment key)
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';  // Client Secret (Credit private key)

// --- 🔑 TBC ტოკენის აღება ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', TBC_ID);
        params.append('client_secret', TBC_SECRET);

        console.log("Token Request with ID:", TBC_ID); // ლოგში ვნახოთ რა იგზავნება

        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // 👇 TBC-ს სჭირდება API KEY ჰედერი, რაც იგივეა რაც Client ID
                'apikey': TBC_ID 
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("TOKEN ERROR FULL:", JSON.stringify(error.response?.data, null, 2));
        throw new Error(`ბანკის ავტორიზაციის შეცდომა: ${error.response?.data?.detail || error.message}`);
    }
};

// --- 💳 1. გადახდის შექმნა ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const token = await getTbcToken();

        const paymentBody = {
            amount: { currency: 'GEL', total: parseFloat(order.totalPrice).toFixed(2) },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7],
            description: `Order ${order._id}`,
            extraId: order._id.toString()
        };

        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/payments', paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': TBC_ID // 👈 აქაც აუცილებელია
            }
        });

        if (response.data.links) {
            const redirectLink = response.data.links.find(link => link.method === 'REDIRECT')?.uri;
            res.json({ checkout_url: redirectLink || response.data.links[0].uri });
        } else {
            res.status(400).json({ message: "ბანკმა ლინკი არ დააბრუნა" });
        }

    } catch (error) {
        console.error("PAYMENT ERROR:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment Failed" });
    }
});

// --- ✅ 2. CALLBACK ---
router.post('/callback', async (req, res) => {
    // Callback ლოგიკა იგივე რჩება...
    res.status(200).send('OK');
});

export default router;