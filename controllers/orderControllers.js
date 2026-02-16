import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { Resend } from 'resend'; 
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 📧 პროდუქტების სიის გენერაცია HTML-ისთვის
    const itemsListHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty} x ${item.price} GEL</td>
      </tr>
    `).join('');

    try {
      console.log("🚀 Attempting to send order report to admin and user...");

      await resend.emails.send({
        from: 'N.T.Style <info@ntstyle.ge>', // შენი Verified დომენი
        to: ['amiamo757@gmail.com', req.user.email], // მეილი მოგივა შენც და კლიენტსაც
        subject: `ახალი შეკვეთა! #${createdOrder._id} - ${req.user.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #333; text-align: center;">ახალი შეკვეთის დეტალები 🎉</h2>
            
            <h4 style="background: #f4f4f4; padding: 10px;">👤 მყიდველის ინფორმაცია:</h4>
            <p><strong>სახელი:</strong> ${req.user.name}</p>
            <p><strong>ელ-ფოსტა:</strong> ${req.user.email}</p>
            <p><strong>ტელეფონი:</strong> ${shippingAddress.postalCode || 'არ არის მითითებული'}</p>
            <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>

            <h4 style="background: #f4f4f4; padding: 10px;">📦 შეკვეთილი პროდუქტები:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #eee;">
                  <th style="padding: 10px; text-align: left;">პროდუქტი</th>
                  <th style="padding: 10px; text-align: center;">რაოდენობა/ფასი</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right; font-size: 18px;">
              <strong>ჯამური თანხა: <span style="color: #e44d26;">${totalPrice} GEL</span></strong>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="text-align: center;">
              <a href="https://ntstyle.ge/order/${createdOrder._id}" 
                 style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 ადმინ პანელში ნახვა
              </a>
            </p>
          </div>
        `,
      });

      console.log("✅ Order details sent to admin!");
    } catch (error) {
      console.error("❌ Resend Error:", error.message);
    }

    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };