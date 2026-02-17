import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 🔑 TBC ტოკენის აღება (Production) ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.TBC_CLIENT_ID); 
        params.append('client_secret', process.env.TBC_CLIENT_SECRET);
        // params.append('grant_type', 'client_credentials'); // ხანდახან არ სჭირდება, მაგრამ იყოს
        // params.append('scope', 'tpay'); // ესეც

        // 👇 ყურადღება: აქ აღარ არის "sandbox"!
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': process.env.TBC_API_KEY || process.env.TBC_CLIENT_ID 
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("TOKEN ERROR:", error.response?.data || error.message);
        throw new Error("ბანკის ტოკენი ვერ მივიღეთ");
    }
};

// --- 💳 1. გადახდის შექმნა ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const token = await getTbcToken();

        const paymentBody = {
            amount: { 
                currency: 'GEL', 
                total: parseFloat(order.totalPrice).toFixed(2) 
            },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7], 
            description: `Order #${order._id.toString().slice(-6)}`,
            extraId: order._id.toString() 
        };

        // 👇 აქაც, მხოლოდ "api.tbcbank.ge" (sandbox-ის გარეშე)
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/payments', paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': process.env.TBC_API_KEY || process.env.TBC_CLIENT_ID
            }
        });

        // TBC-ს პასუხის დამუშავება
        if (response.data.links) {
            // ვეძებთ REDIRECT ლინკს
            const redirectLink = response.data.links.find(link => link.method === 'REDIRECT')?.uri;
            
            if (redirectLink) {
                res.json({ checkout_url: redirectLink });
            } else {
                // ზოგჯერ პირდაპირ links[1]-ია ხოლმე
                res.json({ checkout_url: response.data.links[1]?.uri });
            }
        } else {
            res.status(400).json({ message: "ბანკმა ლინკი არ დააბრუნა" });
        }

    } catch (error) {
        console.error("❌ PAYMENT ERROR:", error.response?.data || error.message);
        res.status(500).json({ 
            message: "Payment Error", 
            details: error.response?.data 
        });
    }
});

// --- ✅ 2. CALLBACK ---
router.post('/callback', async (req, res) => {
    try {
        const { status, extraId, paymentId } = req.body;
        console.log("🔔 Callback received:", req.body);

        if (status === 'Succeeded') {
            const order = await Order.findById(extraId).populate('user', 'name email');
            
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = { id: paymentId, status: status };
                
                await order.save(); // აქ შეიძლება ამოაგდოს quantity error, თუ მოდელში არ არის

                // მეილის გაგზავნა
                if(order.user?.email) {
                     await resend.emails.send({
                        from: 'N.T.Style <info@ntstyle.ge>',
                        to: ['amiamo757@gmail.com', order.user.email],
                        subject: `გადახდილია! #${order._id.toString().slice(-6)}`,
                        html: `<h2>თანხა მიღებულია: ${order.totalPrice} GEL</h2>`
                    });
                }
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("Callback Error:", error.message);
        res.status(500).send('Error');
    }
});

export default router; // 👈 ეს აუცილებელია!