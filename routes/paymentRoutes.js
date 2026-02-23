import express from 'express';
import Order from '../models/orderModel.js';
import FlittPay from '@flittpayments/flitt-node-js-sdk';

const router = express.Router();

// 🔴 ყურადღება: აქ ძველი aAvS... გასაღებები აღარ იმუშავებს!
// უნდა შეხვიდე შენს Flitt-ის / TBC-ის მერჩანტ კაბინეტში და იქიდან აიღო:
const flitt = new FlittPay({
    merchantId: 4055847, // 👈 შენი ახალი Merchant ID (ციფრები იქნება)
    secretKey: '5PXzRQNR5xTiEcaK8F3LHcmmERLortie' // 👈 შენი ახალი Secret
});

router.post('/flitt/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });

        const requestData = {
            order_id: order._id.toString(),
            order_desc: 'N.T.Style Order',
            currency: 'GEL',
            // Flitt თანხას ითხოვს თეთრებში (მაგ. 15.50 ₾ -> გაგზავნის 1550)
            amount: Math.round(order.totalPrice * 100).toString(), 
            server_callback_url: 'https://ntstyle-api.onrender.com/api/payments/callback'
        };

        // გადახდის შექმნა SDK-ით
        flitt.Checkout(requestData)
            .then(data => {
                // Flitt დაგვიბრუნებს ბმულს
                res.json({ checkout_url: data.checkout_url });
            })
            .catch(err => {
                console.error("❌ Flitt API Error:", err);
                res.status(500).json({ detail: "გადახდის შექმნა ვერ მოხერხდა" });
            });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ detail: error.message });
    }
});

// Callback რაუთი - აქ მოვა ინფორმაცია წარმატებულ გადახდაზე
router.post('/callback', async (req, res) => {
    console.log("🔔 Flitt Callback მოვიდა:", req.body);
    res.status(200).send('OK');
});

export default router;