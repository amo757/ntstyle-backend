import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { Resend } from 'resend'; 
import dotenv from 'dotenv';

dotenv.config();

// 📧 Resend-ის ინიციალიზაცია
const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // 1. შეკვეთის შენახვა მონაცემთა ბაზაში
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 📧 2. მეილების გაგზავნა Resend API-ით
    try {
      console.log("🚀 Attempting to send emails via Resend API...");

      await resend.emails.send({
        from: 'N.T.Style <onboarding@resend.dev>', 
        to: ['amiamo757@gmail.com', req.user.email], 
        subject: `თქვენი შეკვეთა მიღებულია! #${createdOrder._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333;">მადლობა შეკვეთისთვის! 🎉</h2>
            <p>თქვენი შეკვეთა <strong>#${createdOrder._id}</strong> წარმატებით გაფორმდა.</p>
            <p><strong>მომხმარებელი:</strong> ${req.user.name} (${req.user.email})</p>
            <p><strong>გადასახდელი თანხა:</strong> ${createdOrder.totalPrice} GEL</p>
            <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>
            <p><strong>ტელეფონი:</strong> ${shippingAddress.postalCode || 'მითითებული არაა'}</p> 
            <hr />
            <p>ჩვენ მალე დაგიკავშირდებით დეტალების დასაზუსტებლად.</p>
            <br/>
            <a href="https://ntstyle.ge/order/${createdOrder._id}" 
               style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               შეკვეთის ნახვა
            </a>
            <p style="font-size: 12px; color: #777; margin-top: 20px;">პატივისცემით, N.T.Style გუნდი</p>
          </div>
        `,
      });

      console.log("✅ Email sent successfully via Resend!");
    } catch (error) {
      console.error("❌ Resend API Error:", error.message);
    }

    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };