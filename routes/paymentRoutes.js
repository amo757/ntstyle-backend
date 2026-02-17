import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 🔑 TBC ტოკენის აღება (LIVE / PRODUCTION) ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.TBC_CLIENT_ID); 
        params.append('client_secret', process.env.TBC_CLIENT_SECRET);

        // 👇 ყურადღება: აქ არის LIVE მისამართი (sandbox-ის გარეშე)
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                // 👇 TBC V1 ითხოვს apikey ჰედერს, რაც იგივეა რაც Client ID
                'apikey': process.env.TBC_CLIENT_ID 
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("TOKEN ERROR DETAIL:", error.response?.data);
        throw new Error(`ბანკის ავტორიზაციის შეცდომა: ${error.response?.data?.title || error.message}`);
    }
};

// --- 💳 1. გადახდის შექმნა ---
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // 1. ტოკენის აღება
        const token = await getTbcToken();

        // 2. გადახდის მომზადება
        const paymentBody = {
            amount: { 
                currency: 'GEL', 
                total: parseFloat(order.totalPrice).toFixed(2) 
            },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7], // 5=Card, 7=Apple/Google Pay
            description: `Order #${order._id.toString().slice(-6)}`,
            extraId: order._id.toString() 
        };

        // 👇 აქაც LIVE მისამართი
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/payments', paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': process.env.TBC_CLIENT_ID // 👈 ეს აუცილებელია!
            }
        });

        // 3. ლინკის დაბრუნება ფრონტენდისთვის
        if (response.data.links) {
            const redirectLink = response.data.links.find(link => link.method === 'REDIRECT')?.uri;
            res.json({ checkout_url: redirectLink || response.data.links[0].uri });
        } else {
            res.status(400).json({ message: "ბანკმა არ დააბრუნა გადახდის ბმული" });
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
        console.log(`🔔 Callback for Order ${extraId}: ${status}`);

        if (status === 'Succeeded') {
            const order = await Order.findById(extraId).populate('user', 'name email');
            
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = { id: paymentId, status: status };
                
                await order.save();

                if(order.user?.email) {
                    try {
                        await resend.emails.send({
                            from: 'N.T.Style <info@ntstyle.ge>',
                            to: ['amiamo757@gmail.com', order.user.email],
                            subject: `გადახდილია! #${order._id.toString().slice(-6)}`,
                            html: `<h2>გადახდა წარმატებულია!</h2><p>თანხა: ${order.totalPrice} GEL</p>`
                        });
                    } catch (emailError) {
                        console.error("Email sending failed:", emailError);
                    }
                }
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("Callback Error:", error.message);
        res.status(500).send('Error');
    }
});

export default router;