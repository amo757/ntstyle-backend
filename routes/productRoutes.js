import express from 'express';
import Product from '../models/ProductModel.js';
import sampleProducts from '../data/products.js';

const router = express.Router();

// ---------------------------------------------------------
// 1. SEEDER - მონაცემების ბაზაში ჩაყრა/განახლება
// ---------------------------------------------------------
// გაითვალისწინე: ამ ლინკზე (ბრაუზერში) შესვლა წაშლის ძველ პროდუქტებს და ჩაწერს sampleProducts-ს
router.get('/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        
        // 👇 ეს ხაზი ფილტრავს მასივს და ტოვებს მხოლოდ უნიკალურ სახელებს
        const uniqueProducts = sampleProducts.filter((v, i, a) => 
            a.findIndex(t => t.name === v.name) === i
        );

        const createdProducts = await Product.insertMany(uniqueProducts);
        res.status(201).send({ 
            message: "წარმატებით აიტვირთა", 
            count: createdProducts.length 
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// ---------------------------------------------------------
// 2. GET ALL PRODUCTS (ფილტრაციის მხარდაჭერით)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // აქ შეგვიძლია დავამატოთ Query ძებნა (მაგალითად: /api/products?keyword=dress)
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i', // Case-insensitive
            },
        } : {};

        const products = await Product.find({ ...keyword }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'პროდუქტების წამოღება ვერ მოხერხდა' });
    }
});

// ---------------------------------------------------------
// 3. GET SINGLE PRODUCT BY SLUG
// ---------------------------------------------------------
router.get('/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'პროდუქტი ვერ მოიძებნა' });
        }
    } catch (error) {
        res.status(500).json({ message: 'სერვერის შეცდომა' });
    }
});

export default router;