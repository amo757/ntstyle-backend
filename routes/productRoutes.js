import express from 'express';
import Product from '../models/ProductModel.js';
import sampleProducts from '../data/products.js'; // 👈 1. ვაიმპორტებთ მონაცემებს

const router = express.Router();

// ---------------------------------------------------------
// 1. SEEDER - მონაცემების განახლება
// ---------------------------------------------------------
router.get('/seed', async (req, res) => {
    try {
        // 1. ვშლით ძველს
        await Product.deleteMany({});

        // 2. ვქმნით ახალს (იმპორტირებული ფაილიდან)
        const createdProducts = await Product.insertMany(sampleProducts);
        
        res.send({ message: "Products Created Successfully", products: createdProducts });

    } catch (error) {
        console.log("Seed Error:", error);
        res.status(500).send('Error: ' + error.message);
    }
});

// ---------------------------------------------------------
// 2. GET ALL PRODUCTS
// ---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// ---------------------------------------------------------
// 3. GET SINGLE PRODUCT
// ---------------------------------------------------------
router.get('/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

export default router;