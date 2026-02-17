import express from 'express';
import axios from 'axios';
import https from 'https';
import Order from '../models/orderModel.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🛑 შენი გასაღებები (გადაამოწმე developers.tbcbank.ge-ზე!)
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

// 🛑 ვბრუნდებით მთავარ URL-ზე, რადგან sandbox ლინკი მკვდარია
const TBC_BASE_URL = 'https://api.tbcbank.ge/v1/tpay';

// SSL პრობლემის პრევენცია
const ignoreSslAgent = new https.Agent({  
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined 
});

// --- 🔑 TBC ტოკენის აღება ---
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', TBC_ID);
        params.append('client_secret', TBC_SECRET);
        
        console.log(`⏳ ტოკენის მოთხოვნა მისამართზე: ${TBC_BASE_URL}/access-token`);
        console.log(`🔑 ვიყენებთ Client ID-ს: ${TBC_ID.substring(0, 5)}...`);

        const response = await axios.post(`${TBC_BASE_URL}/access-token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': TBC_ID // TBC V1 მოითხოვს ამ ჰედერს
            },
            httpsAgent: ignoreSslAgent
        });

        console.log("✅ ტოკენი წარმატებით მიღებულია!");
        return response.data.access_token;

    } catch (error) {
        // აქ ზუსტად გავიგებთ რა ხდება
        if (error.response) {
            console.error("❌ TBC ERROR RESPONSE:", JSON.stringify(error.response.data, null, 2));
            console.error("❌ STATUS CODE:", error.response.status);
        } else {
            console.error("❌ CONNECTION ERROR:", error.message);
        }
        throw new Error("ბანკთან კავშირი ვერ დამყარდა");
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

        console.log("⏳ გადახდის შექმნა...");

        const response = await axios.post(`${TBC_BASE_URL}/payments`, paymentBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'apikey': TBC_ID
            },
            httpsAgent: ignoreSslAgent
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
        if(error.response) console.error("Details:", error.response.data);
        res.status(500).json({ message: "Payment Failed" });
    }
});

// --- ✅ 2. CALLBACK ---
router.post('/callback', async (req, res) => {
    try {
        const { status, extraId } = req.body;
        console.log(`Callback მოსულია: ${status} შეკვეთაზე ${extraId}`);

        if (status === 'Succeeded') {
            const order = await Order.findById(extraId).populate('user');
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                await order.save();
                
                if(order.user?.email) {
                    await resend.emails.send({
                        from: 'N.T.Style <info@ntstyle.ge>',
                        to: ['amiamo757@gmail.com', order.user.email],
                        subject: `გადახდილია!`,
                        html: `<p>შეკვეთა #${order._id} წარმატებით გადახდილია.</p>`
                    });
                }
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).send('Error');
    }
});

export default router;