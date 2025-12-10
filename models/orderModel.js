import mongoose from 'mongoose';

const shippingSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true, default: 'Georgia' },
    phoneNumber: { type: String, required: true },
});

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    // დამატებითი ატრიბუტები
    size: { type: String },
    color: { type: String }
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // ვის ეკუთვნის შეკვეთა (მთელი პროფილი)
            required: true,
        },
        orderItems: [orderItemSchema], // შეძენილი ნივთების სია
        shippingAddress: shippingSchema, // მიწოდების დეტალები
        paymentMethod: { type: String, required: true },
        itemsPrice: { type: Number, required: true, default: 0.0 },
        shippingPrice: { type: Number, required: true, default: 0.0 },
        totalPrice: { type: Number, required: true, default: 0.0 },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, required: true, default: false },
        deliveredAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;