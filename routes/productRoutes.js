import express from 'express';
import Product from '../models/ProductModel.js';

const router = express.Router();

// ---------------------------------------------------------
// 1. SEEDER - მონაცემების განახლება თქვენი ფოტოებით
// ---------------------------------------------------------
router.get('/seed', async (req, res) => {
    try {
        // 1. ვშლით ძველ მონაცემებს
        await Product.deleteMany({});

        // 2. ვქმნით ახალ პროდუქტებს თქვენი ფოტოებით
        // ⚠️ დარწმუნდი, რომ public/clothes საქაღალდეში გაქვს ფაილები: 1.jpg, 2.jpg, 3.jpg, 4.jpg
        const sampleProducts = [
            {
                name: 'Silk Charmeuse Midi Dress1',
                slug: 'silk-charmeuse-midi-dress1',
                colors: [
                    { name: "Red", hex: "#FF0000" },
                    { name: "Black", hex: "#000000" }
                ],
                price: 3400,
                description: 'ელეგანტური საღამოს კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/1.jpg',  // მთავარი ფოტო
                    '/clothes/2.jpg'   // მეორე ფოტო (ჰოვერისთვის - შეგიძლია სხვა ფოტო ჩასვა)
                ],
                countInStock: 5,
                isFeatured: true
            },
            {
                name: 'Double-breasted Wool Coat2',
                slug: 'wool-coat-black2',
                price: 2,
                description: 'კლასიკური შავი პალტო.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/2.jpg',
                    '/clothes/1.jpg'
                ],
                countInStock: 3,
                isFeatured: true
            },
            {
                name: 'Oversized Cotton Shirt3',
                slug: 'cotton-shirt-white3',
                price: 1200,
                description: 'თავისუფალი სტილის პერანგი.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/3.jpg',
                    '/clothes/4.jpg'
                ],
                countInStock: 10,
                isFeatured: false
            },
            {
                name: 'Crystal-embellished Gown4',
                slug: 'crystal-gown4',
                price: 8500,
                description: 'ბრწყინვალე კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/4.jpg',
                    '/clothes/3.jpg'
                ],
                countInStock: 2,
                isFeatured: true
            }, {
                name: 'Silk Charmeuse Midi Dress5',
                slug: 'silk-charmeuse-midi-dress5',
                price: 3400,
                description: 'ელეგანტური საღამოს კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/5.jpg',  // მთავარი ფოტო
                    '/clothes/6.jpg'   // მეორე ფოტო (ჰოვერისთვის - შეგიძლია სხვა ფოტო ჩასვა)
                ],
                countInStock: 5,
                isFeatured: true
            },
            {
                name: 'Double-breasted Wool Coat6',
                slug: 'wool-coat-black6',
                price: 5200,
                description: 'კლასიკური შავი პალტო.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/6.jpg',
                    '/clothes/5.jpg'
                ],
                countInStock: 3,
                isFeatured: true
            },
            {
                name: 'Oversized Cotton Shirt7',
                slug: 'cotton-shirt-white7',
                price: 1200,
                description: 'თავისუფალი სტილის პერანგი.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/7.jpg',
                    '/clothes/8.jpg'
                ],
                countInStock: 10,
                isFeatured: false
            },
            {
                name: 'Crystal-embellished Gown8',
                slug: 'crystal-gown8',
                price: 8500,
                description: 'ბრწყინვალე კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/8.jpg',
                    '/clothes/7.jpg'
                ],
                countInStock: 2,
                isFeatured: true
            }, {
                name: 'Silk Charmeuse Midi Dress9',
                slug: 'silk-charmeuse-midi-dress9',
                
                price: 3400,
                description: 'ელეგანტური საღამოს კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/9.jpg',  // მთავარი ფოტო
                    '/clothes/10.jpg'   // მეორე ფოტო (ჰოვერისთვის - შეგიძლია სხვა ფოტო ჩასვა)
                ],
                countInStock: 5,
                isFeatured: true
            },
            {
                name: 'Double-breasted Wool Coat10',
                slug: 'wool-coat-black10',
                price: 5200,
                description: 'კლასიკური შავი პალტო.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/10.jpg',
                    '/clothes/9.jpg'
                ],
                countInStock: 3,
                isFeatured: true
            },
            {
                name: 'Oversized Cotton Shirt11',
                slug: 'cotton-shirt-white11',
                price: 1200,
                description: 'თავისუფალი სტილის პერანგი.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/11.jpg',
                    '/clothes/12.jpg'
                ],
                countInStock: 10,
                isFeatured: false
            },
            {
                name: 'Crystal-embellished Gown12',
                slug: 'crystal-gown12',
                price: 8500,
                description: 'ბრწყინვალე კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/12.jpg',
                    '/clothes/11.jpg'
                ],
                countInStock: 2,
                isFeatured: true
            }, {
                name: 'Silk Charmeuse Midi Dress13',
                slug: 'silk-charmeuse-midi-dress13',
                price: 3400,
                description: 'ელეგანტური საღამოს კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/16.jpg',  // მთავარი ფოტო
                    '/clothes/14.jpg'   // მეორე ფოტო (ჰოვერისთვის - შეგიძლია სხვა ფოტო ჩასვა)
                ],
                countInStock: 5,
                isFeatured: true
            },
            {
                name: 'Double-breasted Wool Coat14',
                slug: 'wool-coat-black14',
                price: 5200,
                description: 'კლასიკური შავი პალტო.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/14.jpg',
                    '/clothes/16.jpg'
                ],
                countInStock: 3,
                isFeatured: true
            },
            {
                name: 'Oversized Cotton Shirt15',
                slug: 'cotton-shirt-white15',
                price: 1200,
                description: 'თავისუფალი სტილის პერანგი.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/15.jpg',
                    '/clothes/16.jpg'
                ],
                countInStock: 10,
                isFeatured: false
            },
            {
                name: 'Crystal-embellished Gown16',
                slug: 'crystal-gown16',
                price: 8500,
                description: 'ბრწყინვალე კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/16.jpg',
                    '/clothes/15.jpg'
                ],
                countInStock: 2,
                isFeatured: true
            }, {
                name: 'Silk Charmeuse Midi Dress17',
                slug: 'silk-charmeuse-midi-dress17',
                price: 3400,
                description: 'ელეგანტური საღამოს კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/17.jpg',  // მთავარი ფოტო
                    '/clothes/18.jpg'   // მეორე ფოტო (ჰოვერისთვის - შეგიძლია სხვა ფოტო ჩასვა)
                ],
                countInStock: 5,
                isFeatured: true
            },
            {
                name: 'Double-breasted Wool Coat18',
                slug: 'wool-coat-black18',
                price: 5200,
                description: 'კლასიკური შავი პალტო.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/18.jpg',
                    '/clothes/17.jpg'
                ],
                countInStock: 3,
                isFeatured: true
            },
            {
                name: 'Oversized Cotton Shirt19',
                slug: 'cotton-shirt-white19',
                price: 1200,
                description: 'თავისუფალი სტილის პერანგი.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/19.jpg',
                    '/clothes/21.jpg'
                ],
                countInStock: 10,
                isFeatured: false
            },
            {
                name: 'Crystal-embellished Gown20',
                slug: 'crystal-gown20',
                price: 8500,
                description: 'ბრწყინვალე კაბა.',
                category: 'clothing',
                designer: 'Natia Tkhelidze',
                images: [
                    '/clothes/21.jpg',
                    '/clothes/19.jpg'
                ],
                countInStock: 2,
                isFeatured: true
            }
        ];

        // 3. ვწერთ ბაზაში
        const createdProducts = await Product.insertMany(sampleProducts);
        res.send(createdProducts);

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
        if (product) res.json(product);
        else res.status(404).json({ message: 'Product not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

export default router;