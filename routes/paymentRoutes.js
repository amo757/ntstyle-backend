import express from 'express';
import axios from 'axios';
import Order from '../models/orderModel.js';

const router = express.Router();

// შენი TBC გასაღებები მერჩანტის კაბინეტიდან
const TBC_ID = 'aAvS5nigREZqTHxTbx4ELhjXwtaRe8sy';
const TBC_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie';

// 1. ტოკენის აღება TBC-დან
const getTbcToken = async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', TBC_ID);
        params.append('client_secret', TBC_SECRET);
        params.append('grant_type', 'client_credentials');

        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': TBC_ID // 👈 ეს ყველაზე მნიშვნელოვანია!
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error("❌ TOKEN ERROR:", error.response?.data || error.message);
        throw error; // ერორს ვისვრით, რომ ქვედა ბლოკმა დაიჭიროს
    }
};

// 2. გადახდის ლინკის შექმნა
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });

        const token = await getTbcToken();

        // ვაგზავნით გადახდის მოთხოვნას
        const response = await axios.post('https://api.tbcbank.ge/v1/tpay/payments', {
            amount: { 
                currency: "GEL", 
                total: parseFloat(order.totalPrice).toFixed(2) // ბანკი ითხოვს ფორმატს 15.00
            },
            return_url: `https://ntstyle.ge/order/${order._id}`,
            callback_url: `https://ntstyle-api.onrender.com/api/payments/callback`,
            methods: [5, 7] // 5, 7 არის ბარათით გადახდის მეთოდები
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': TBC_ID,
                'Content-Type': 'application/json'
            }
        });

        // ბანკი აბრუნებს მასივს links, საიდანაც გვჭირდება approval_url
        const checkoutUrl = response.data.links?.find(l => l.rel === 'approval_url')?.uri;
        
        if (checkoutUrl) {
            res.json({ checkout_url: checkoutUrl });
        } else {
            res.status(400).json({ detail: "ბანკმა გადახდის ბმული არ დააბრუნა" });
        }

    } catch (error) {
        console.error("❌ PAYMENT ERROR:", error.response?.data || error.message);
        res.status(500).json({ detail: "გადახდის ინიციალიზაცია ვერ მოხერხდა" });
    }
});

// 3. Callback - აქ მოვა ინფორმაცია წარმატებულ გადახდაზე
router.post('/callback', async (req, res) => {
    console.log("🔔 TBC Callback მოვიდა:", req.body);
    // აქ შეგიძლია განაახლო შეკვეთა (მაგ. order.isPaid = true)
    res.status(200).send('OK');
});

export default router;