import express from 'express';
import axios from 'axios';
import https from 'https';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🛑 შენი SANDBOX გასაღებები
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

const TBC_BASE_URL = 'https://sandbox.api.tbcbank.ge/v1/tpay';

// 🛑 "ბრმა" აგენტი - თიშავს ყველანაირ SSL შემოწმებას
const ignoreSslAgent = new https.Agent({  
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined // 👈 ეს ხაზი აგვარებს Hostname error-ს
});

// --- 🔑 TBC ტოკენის აღება ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', TBC_ID);
        params.append('client_secret', TBC_SECRET);
        
        console.log("⏳ (Sandbox) ტოკენის მოთხოვნა...");

        const response = await axios.post(`${TBC_BASE_URL}/access-token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': TBC_ID
            },
            httpsAgent: ignoreSslAgent // 👈 ვიყენებთ აგენტს
        });

        console.log("✅ ტოკენი მიღებულია!");
        return response.data.access_token;

    } catch (error) {
        // აქ დავბეჭდავთ ზუსტ მიზეზს
        console.error("TOKEN ERROR DETAILED:", error.code || error.message);
        if (error.response) console.error("Response Data:", error.response.data);
        
        throw new Error("ბანკთან კავშირი ვერ დამყარდა (Sandbox)");
    }
};

// --- 💳 1. გადახდის შექმნა ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // 1. ტოკენის აღება
        const token = await getTbcToken();

        // 2. გადახდის მოთხოვნა
        const paymentBody = {
            amount: { currency: 'GEL', total: parseFloat(order.totalPrice).toFixed(2) },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7], 
            extraId: order._id.toString()
        };

        console.log("⏳ (Sandbox) გადახდის შექმნა...");

        const response = await axios.post(`${TBC_BASE_URL}/payments`, paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': TBC_ID
            },
            httpsAgent: ignoreSslAgent // 👈 აქაც იგივე აგენტი
        });

        console.log("✅ გადახდა შეიქმნა:", response.data);

        if (response.data.links) {
            const redirectLink = response.data.links.find(link => link.method === 'REDIRECT')?.uri;
            res.json({ checkout_url: redirectLink || response.data.links[0].uri });
        } else {
            res.status(400).json({ message: "ბანკმა ლინკი არ დააბრუნა" });
        }

    } catch (error) {
        console.error("PAYMENT ERROR:", error.message);
        res.status(500).json({ message: "Payment Failed" });
    }
});

// Callback იგივე რჩება...
router.post('/callback', async (req, res) => {
    // ... (იგივე კოდი რაც გქონდა)
    res.status(200).send('OK');
});

export default router;