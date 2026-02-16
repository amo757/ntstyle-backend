import express from 'express';
import axios from 'axios';
import https from 'https';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// SSL-ის იგნორირება მხოლოდ სატესტო გარემოსთვის
const httpsAgent = new https.Agent({ 
    rejectUnauthorized: false 
});

// --- 🔑 TBC ტოკენის აღება ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.TBC_CLIENT_ID); 
        params.append('client_secret', process.env.TBC_CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'tpay');

        const response = await axios.post('https://sandbox.api.tbcbank.ge/v1/tpay/token', params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': process.env.TBC_CLIENT_ID
            },
            httpsAgent: httpsAgent
        });
        return response.data.access_token;
    } catch (error) {
        console.error("TOKEN ERROR:", error.response?.data || error.message);
        throw error;
    }
};

// --- 💳 1. გადახდის შექმნა ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        // 1. ვპოულობთ შეკვეთას
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });

        // 2. ვიღებთ ტოკენს ბანკიდან
        const token = await getTbcToken();

        // 3. ვამზადებთ ბანკისთვის მონაცემებს
        const paymentBody = {
            amount: { 
                currency: 'GEL', 
                total: parseFloat(order.totalPrice).toFixed(2) // აუცილებელია იყოს ციფრი 2 ნიშნით
            },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7], // ბარათი და Apple/Google Pay
            description: `Order #${order._id.toString().slice(-6)}`,
            extraId: order._id.toString() 
        };

        const response = await axios.post('https://sandbox.api.tbcbank.ge/v1/tpay/payments', paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': process.env.TBC_CLIENT_ID
            },
            httpsAgent: httpsAgent
        });

        if (response.data.links && response.data.links.find(l => l.method === 'REDIRECT')) {
            const redirectLink = response.data.links.find(l => l.method === 'REDIRECT').uri;
            res.json({ checkout_url: redirectLink });
        } else {
            res.status(400).json({ message: "ბანკმა არ დააბრუნა გადახდის ბმული" });
        }

    } catch (error) {
        console.error("❌ TBC API ERROR:", error.response?.data || error.message);
        res.status(500).json({ 
            message: "გადახდის ინიციალიზაცია ვერ მოხერხდა",
            error: error.response?.data || error.message
        });
    }
});
export default router;