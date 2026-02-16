import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';
import User from '../models/UserModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 🔑 TBC ტოკენის აღება (Sandbox) ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.TBC_CLIENT_ID); 
        params.append('client_secret', process.env.TBC_CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'tpay');

        // გამოიყენე sandbox მისამართი ტოკენისთვის
        const response = await axios.post('https://sandbox.api.tbcbank.ge/v1/tpay/token', params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': process.env.TBC_CLIENT_ID
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("TOKEN ERROR:", error.response?.data || error.message);
        throw new Error("ბანკის ავტორიზაციის შეცდომა");
    }
};

// --- 💳 1. გადახდის დაწყება ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const token = await getTbcToken();

        const paymentBody = {
            amount: { currency: 'GEL', total: order.totalPrice },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7],
            description: `Order #${order._id}`,
            extraId: order._id.toString() 
        };

        // ⚠️ მნიშვნელოვანი: აქაც sandbox.api... უნდა ეწეროს!
        const response = await axios.post('https://sandbox.api.tbcbank.ge/v1/tpay/payments', paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': process.env.TBC_CLIENT_ID
            }
        });

        if (response.data.links && response.data.links[1]) {
            res.json({ checkout_url: response.data.links[1].uri });
        } else {
            res.status(400).json({ message: "Bank did not return redirect link" });
        }

    } catch (error) {
        console.error("❌ TBC ERROR DETAILS:", error.response?.data || error.message);
        res.status(500).json({ 
            message: "TBC Payment Error", 
            details: error.response?.data 
        });
    }
});

// --- ✅ 2. CALLBACK ---
router.post('/callback', async (req, res) => {
    const { paymentId, status, extraId } = req.body;

    try {
        if (status === 'Succeeded') {
            const order = await Order.findById(extraId).populate('user', 'name email');

            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = { id: paymentId, status: status };
                await order.save();

                await resend.emails.send({
                    from: 'N.T.Style <info@ntstyle.ge>',
                    to: ['amiamo757@gmail.com', order.user.email],
                    subject: `შეკვეთა გადახდილია! #${order._id.toString().slice(-6)}`,
                    html: `<h2>გადახდა დადასტურებულია! 🎉</h2><p>თანხა: ${order.totalPrice} GEL</p>`
                });
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Callback Error:", error.message);
        res.status(500).send('Internal Error');
    }
});

export default router;