const products = [
    {
        name: 'asd',
        slug: 'asass',
        colors: [
            { name: "Red", hex: "#a41a1ac4" },
            { name: "Black", hex: "#655b5b" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 150,
        description: 'ელეგანტური საღამოს კაბა.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/55.jpg', '/clothes/2.jpg'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'Double-breasted Wool Coat2',
        slug: 'wool-coat-black2',
        colors: [
            { name: "Red", hex: "#efefef" },
            { name: "Black", hex: "#60769a" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 150,
        description: 'ელეგანტური საღამოს კაბა.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/3.jpg', '/clothes/4.jpg'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'Crystal-embellished Gown20',
        slug: 'crystal-gown20',
        price: 85,
        sizes: ["XS", "S"], // 👈 დაამატე ზომები ყველგან
        description: 'ბრწყინვალე კაბა.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/5.jpg', '/clothes/6.jpg'],
        countInStock: 2,
        isFeatured: true
    }
];

export default products;