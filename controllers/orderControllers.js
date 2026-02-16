import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { Resend } from 'resend'; 
import dotenv from 'dotenv';

dotenv.config();

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

    // 📧 მეილების გაგზავნა
    try {
      console.log("🚀 Attempting to send emails via Resend API...");

      await resend.emails.send({
        // ✅ შეცვლილია რეალურ დომენზე, რადგან უკვე Verified ხარ
        from: 'N.T.Style <info@ntstyle.ge>', 
        to: ['amiamo757@gmail.com', req.user.email], 
        subject: `ახალი შეკვეთა! #${createdOrder._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
            <h2 style="color: #333; text-align: center;">მადლობა შეკვეთისთვის! 🎉</h2>
            <p>მოგესალმებით <strong>${req.user.name}</strong>,</p>
            <p>თქვენი შეკვეთა <strong>#${createdOrder._id}</strong> წარმატებით მიღებულია და გადაცემულია დასამუშავებლად.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>ჯამური თანხა:</strong> ${createdOrder.totalPrice} GEL</p>
              <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>
              <p><strong>გადახდის მეთოდი:</strong> ${paymentMethod}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="text-align: center;">
              <a href="https://ntstyle.ge/order/${createdOrder._id}" 
                 style="background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                 შეკვეთის დეტალები
              </a>
            </p>
            <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">
              ეს არის ავტომატური შეტყობინება, გთხოვთ ნუ უპასუხებთ.<br/>
              © 2026 N.T.Style
            </p>
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