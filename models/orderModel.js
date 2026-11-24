import mongoose from 'mongoose';

const shippingSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true, default: 'Georgia' },
    phoneNumber: { type: String },
    phone: { type: String },
});

// შენახვამდე ავტომატურად შეავსოს ორივე ველი, რომლის სახელითაც არ უნდა მოვიდეს
shippingSchema.pre('validate', function (next) {
    if (this.phoneNumber && !this.phone) {
        this.phone = this.phoneNumber;
    } else if (this.phone && !this.phoneNumber) {
        this.phoneNumber = this.phone;
    }
    next();
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
    size: { type: String },
    color: { type: String }
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: shippingSchema,
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