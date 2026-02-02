const products = [
    {
        name: 'Silk Charmeuse Midi Dress1',
        slug: 'silk-charmeuse-midi-dress1',
        colors: [
            { name: "Red", hex: "#FF0000" },
            { name: "Black", hex: "#000000" }
        ],
        price: 150,
        description: 'ელეგანტური საღამოს კაბა.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/1.jpg', '/clothes/2.jpg'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'Double-breasted Wool Coat2',
        slug: 'wool-coat-black2',
        price: 120, // აქ 2 გეწერა, შევასწორე ლოგიკურად
        description: 'კლასიკური შავი პალტო.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/2.jpg', '/clothes/1.jpg'],
        countInStock: 3,
        isFeatured: true
    },
    // ... აქ ჩაამატე დანარჩენი პროდუქტებიც იმ სიიდან ...
    {
        name: 'Crystal-embellished Gown20',
        slug: 'crystal-gown20',
        price: 85,
        description: 'ბრწყინვალე კაბა.',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/21.jpg', '/clothes/19.jpg'],
        countInStock: 2,
        isFeatured: true
    }
];

export default products;