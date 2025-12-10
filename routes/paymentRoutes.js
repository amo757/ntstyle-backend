import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';

// ⚠️ Models-ის იმპორტი
import Order from '../models/orderModel.js'; 
import User from '../models/UserModel.js';

const router = express.Router();

// --- 🛑 Email Sender Utility (ამისთვის საჭიროა .env ფაილში EMAIL_HOST, EMAIL_USER, EMAIL_PASS) ---
const sendOrderNotification = async (order, userEmail) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const itemsList = order.orderItems.map(item => 
        `- ${item.name} (${item.size || 'N/A'}, Qty: ${item.quantity}) - ${item.price} GEL`
    ).join('\n');
    
    // ადმინისთვის გასაგზავნი მეილი
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL_RECEIVER || process.env.EMAIL_USER, 
        subject: `[NTStyle] NEW ORDER #${order._id.toString().slice(-6)} - Total: ${order.totalPrice} GEL`,
        text: `--- NEW ORDER CONFIRMED ---\n\n` +
              `CLIENT: ${order.shippingAddress.fullName} (Email: ${userEmail})\n` +
              `PHONE: ${order.shippingAddress.phoneNumber}\n` +
              `ADDRESS: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}\n` +
              `\n--- ITEMS ---\n${itemsList}\n` +
              `\nTOTAL: ${order.totalPrice.toFixed(2)} GEL (Paid via ${order.paymentMethod})\n` +
              `STATUS: Payment Verified. Ready for Delivery.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("🔔 Admin Notification Email Sent.");
    } catch (error) {
        console.error("❌ Failed to send admin email:", error.message);
    }
};


// @route POST /api/payment/charge
// @desc  გადახდის პროცესი, შეკვეთის შენახვა და ადმინის ინფორმირება
router.post('/charge', async (req, res) => {
    // ⚠️ Security Note: userId should come from JWT (req.user._id), not req.body
    const { 
        userId, // Temporarily taken from body for demo
        amount, 
        paymentToken, // Token from Payment Gateway (e.g., TBC Pay)
        orderItems, 
        shippingAddress, 
        paymentMethod
    } = req.body; 

    // 🛑 აქ უნდა იყოს Gateway-სთან დაკავშირების რეალური ლოგიკა
    const paymentSuccess = true; // ⚠️ დროებით ვთვლით, რომ გადახდა წარმატებულია

    

    if (!userId || !shippingAddress || orderItems.length === 0) {
        return res.status(400).json({ message: "Order details missing." });
    }

    if (paymentSuccess) {
        try {
            // 1. Order-ის შექმნა (Persistence)
            const user = await User.findById(userId);
            
            const newOrder = await Order.create({
                user: userId,
                orderItems: orderItems,
                shippingAddress: {
                    // სრული სახელი შეგვიძლია აქ შევქმნათ
                    fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.zip,
                    country: shippingAddress.country,
                    phoneNumber: shippingAddress.phone,
                },
                paymentMethod: paymentMethod,
                itemsPrice: amount,
                shippingPrice: 0,
                totalPrice: amount, 
                isPaid: true,
                paidAt: Date.now(),
            });
            
            // 2. ადმინის ინფორმირება Email-ით
            if (user) {
                sendOrderNotification(newOrder, user.email);
            }

            // 3. წარმატების დაბრუნება (ფრონტენდს შეკვეთის ID-ის მისაცემად)
            res.status(201).json({ 
                success: true, 
                message: "Order placed successfully.",
                orderId: newOrder._id
            });
            
        } catch (error) {
            console.error("❌ ORDER SAVE ERROR:", error);
            res.status(500).json({ message: "Failed to save order to database." });
        }

    } else {
        // თუ Gateway-მ უარყო გადახდა
        res.status(402).json({ success: false, message: "Payment authorization failed." });
    }
});

// ⚠️ აუცილებელია, რომ ეს მარშრუტი დაამატოთ server.js-ში: app.use('/api/payment', paymentRoutes);
export default router;