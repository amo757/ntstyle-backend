import express from 'express';
import axios from 'axios';
import crypto from 'crypto'; // 👈 დაემატა კრიპტოგრაფია Signature-სთვის
import Order from '../models/orderModel.js';

const router = express.Router();

// ⚠️ ყურადღება: აქ უნდა ჩასვა ახალი Flitt-ის გასაღებები (შენი ძველი TBC-ის პაროლები შეიძლება არ წავიდეს)
const FLITT_SECRET = '5PXzRQNR5xTiEcaK8F3LHcmmERLortie'; // საიდუმლო გასაღები Flitt პორტალიდან
const FLITT_MERCHANT_ID = 4055847; // შენი Merchant ID (ციფრები, რაც Flitt-ზე გაქვს)

// 1. გადახდის ლინკის შექმნა (ახალი Flitt API ლოგიკით)
router.post('/tbc/create/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });

        // ❗️მნიშვნელოვანია: Flitt თანხას კითხულობს თეთრებში/ცენტებში (მთელი რიცხვი). 
        // მაგალითად: 15.50 ლარი უნდა გაიგზავნოს როგორც 1550
        const amountInTetri = Math.round(order.totalPrice * 100);

        // ვაგროვებთ მონაცემებს ობიექტში
        const requestData = {
            amount: amountInTetri,
            currency: "GEL",
            merchant_id: FLITT_MERCHANT_ID,
            order_desc: "შეკვეთა საიტიდან", 
            order_id: order._id.toString() // ვიყენებთ მონგოს ID-ს შეკვეთის ნომრად
        };

        // ვქმნით Signature-ს (ხელმოწერას)
        const sortedKeys = Object.keys(requestData).sort(); // ვალაგებთ გასაღებებს ანბანურად
        const valuesToHash = [FLITT_SECRET, ...sortedKeys.map(key => requestData[key])];
        const signatureString = valuesToHash.join('|'); // ვაერთებთ | სიმბოლოთი
        
        // ვამატებთ ჰეშირებულ signature-ს ჩვენს ობიექტში
        requestData.signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        // ვაგზავნით მოთხოვნას პირდაპირ Flitt-ის სერვერზე
        const response = await axios.post('https://pay.flitt.com/api/checkout/url', {
            request: requestData
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // ვიღებთ გადახდის ლინკს პასუხიდან
        const checkoutUrl = response.data?.response?.checkout_url;
        
        if (checkoutUrl) {
            res.json({ checkout_url: checkoutUrl });
        } else {
            console.error("❌ ბანკის პასუხი ერორით:", response.data);
            res.status(400).json({ detail: "ბანკმა გადახდის ბმული არ დააბრუნა" });
        }

    } catch (error) {
        console.error("❌ PAYMENT ERROR:", error.response?.data || error.message);
        res.status(500).json({ detail: "გადახდის ინიციალიზაცია ვერ მოხერხდა" });
    }
});

// 2. Callback - აქ მოვა ინფორმაცია Flitt-დან (წარმატებული/წარუმატებელი)
router.post('/callback', async (req, res) => {
    console.log("🔔 Flitt Callback მოვიდა:", req.body);
    
    // TODO: აქ ამოიღებ order_id-ს და სტატუსს req.body-დან 
    // და გაანახლებ ბაზაში (მაგ: await Order.findByIdAndUpdate(..., { isPaid: true }))

    res.status(200).send('OK');
});

export default router;