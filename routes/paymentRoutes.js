import express from 'express';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import Order from '../models/orderModel.js'; 
import User from '../models/UserModel.js';   
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- მეილის ფუნქცია ---
const sendOrderNotification = async (order, userEmail) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const itemsListHtml = order.orderItems.map(item => 
        `<li><b>${item.name}</b> - Qty: ${item.quantity} - ${item.price} GEL</li>`
    ).join('');

    const mailOptions = {
        from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `✅ Order Confirmed: #${order._id.toString().slice(-6)}`,
        html: `<h2>Order Confirmed!</h2><p>Total: ${order.totalPrice} GEL</p><ul>${itemsListHtml}</ul>`
    };

    try { await transporter.sendMail(mailOptions); } catch (e) { console.error(e); }
};

// 👇👇👇 აქ შევცვალეთ სახელი /charge-დან /create-payment-intent-ზე
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { 
            userId, 
            amount,     
            token,      
            orderItems, 
            shippingAddress 
        } = req.body; 

        // 1. ვალიდაცია
        if (!userId || !shippingAddress || !orderItems) {
            return res.status(400).json({ message: "Incomplete data from Frontend" });
        }

        // 2. --- თანხის ჩამოჭრა ---
        const charge = await stripe.charges.create({
            amount: Math.round(amount * 100), // თეთრებში
            currency: 'gel',
            source: token.id,
            description: `Order by user: ${userId}`,
            receipt_email: token.email
        });

        console.log("💰 Payment Successful:", charge.id);

        // 3. შეკვეთის შენახვა
        const newOrder = await Order.create({
            user: userId,
            orderItems: orderItems.map(item => ({...item, product: item._id})),
            shippingAddress,
            paymentMethod: "Stripe Card",
            itemsPrice: amount,
            totalPrice: amount, 
            isPaid: true,
            paidAt: Date.now(),
            paymentResult: { 
                id: charge.id,
                status: charge.status,
                email_address: charge.receipt_email,
            },
        });

        // 4. მეილის გაგზავნა
        const user = await User.findById(userId);
        if (user) await sendOrderNotification(newOrder, user.email);

        res.status(201).json({ success: true, orderId: newOrder._id });

    } catch (error) {
        console.error("❌ Payment Failed:", error);
        res.status(400).json({ 
            message: "Payment Failed", 
            error: error.message 
        });
    }
});

export default router;