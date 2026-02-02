import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: { 
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    material: { 
        type: String,
    },
    designer: { 
        type: String,
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    colors: [
        {
            name: { type: String, required: true }, 
            hex: { type: String, required: true } 
        }
    ],
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    isFeatured: { 
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product; // <--- მთავარია ეს ხაზი იყოს, და ყველაფერი იმუშავებს!