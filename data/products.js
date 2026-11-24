const products = [

 {
        name: 'სატესტო1',
        slug: 'NT-001',
        colors: [
            { name: "orange", hex: "#e67d15" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 2,
        description: 'სატესტო3',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/58.png'],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'კოსტუმი მაკრამით',
        slug: 'NT-002',
        colors: [
            { name: "black", hex: "#020100" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 289,
        description: 'კოსტუმი მაკრამით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/58.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'ორეული თეთრი ვარდით',
        slug: 'NT-003',
        colors: [
            { name: "black", hex: "#020100" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'ორეული თეთრი ვარდით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/57.png'],
        countInStock: 5,
        isFeatured: true
    },
     {
        name: 'პლაში',
        slug: 'NT-004',
        colors: [
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#030200" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'პლაში',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/55.png', '/clothes/newnew/56.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'კაბა მაკრამით',
        slug: 'კაბა მაკრამით',
        colors: [
            { name: "black", hex: "#050000" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'კაბა მაკრამით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/54.png'],
        countInStock: 5,
        isFeatured: true
    },
    
     {
        name: 'თასმიანი ორეული',
        slug: 'თასმიანი ორეული',
        colors: [
            { name: "brown", hex: "#662500" },
            { name: "beige", hex: "#c2af7d" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'თასმიანი ორეული',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/51.png', '/clothes/newnew/49.png', '/clothes/newnew/50.png', '/clothes/newnew/52.png', '/clothes/newnew/53.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'სამეული შავი ვარდით',
        slug: 'სამეული შავი ვარდით',
        colors: [
            { name: "black", hex: "#0a0000" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 349,
        description: 'სამეული შავი ვარდით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/47.png', '/clothes/newnew/48.png', '/clothes/newnew/46.png' ],
        countInStock: 5,
        isFeatured: true
    },
     {
        name: 'სამეული თეთრი ვარდით',
        slug: 'სამეული თეთრი ვარდით',
        colors: [
            { name: "white", hex: "#c5b3b3" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 349,
        description: 'სამეული თეთრი ვარდით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/44.png', '/clothes/newnew/45.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'ლაკის პლაში',
        slug: 'ლაკის პლაში',
        colors: [
            { name: "black", hex: "#000000" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'ლაკის პლაში',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/40.png', '/clothes/newnew/41.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'კაბა ბაფთით',
        slug: 'კაბა ბაფთით',
        colors: [
            { name: "yellow", hex: "#faea06" },
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 169,
        description: 'კაბა ბაფთით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/42.png', '/clothes/newnew/43.png'],
        countInStock: 5,
        isFeatured: true
    },
    {
        name: 'წითელი ორეული',
        slug: 'წითელი ორეული',
        colors: [
            { name: "red", hex: "#fa0606" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'წითელი ორეული',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/37.png', '/clothes/newnew/38.png', '/clothes/newnew/39.png'],
        countInStock: 5,
        isFeatured: true
    },
{
        name: 'შიფონის ზედა',
        slug: 'შიფონის ზედა',
        colors: [
            { name: "white", hex: "#e2e2e2" },
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 149,
        description: 'შიფონის ზედა',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/36.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'პრინტიანი მოსაცმელი',
        slug: 'პრინტიანი მოსაცმელი',
        colors: [
            { name: "green", hex: "#89aa87" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'პრინტიანი მოსაცმელი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/34.png', '/clothes/newnew/35.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'კაბა მაკრამით',
        slug: 'კაბა მაკრამით',
        colors: [
            { name: "white", hex: "#e2e2e2" },
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 179,
        description: 'კაბა მაკრამით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/33.png',],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'ჟილეტი თეთრი კვირტებით',
        slug: 'ჟილეტი თეთრი კვირტებით',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 149,
        description: 'ჟილეტი თეთრი კვირტებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/32.png',],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'ჟილეტი შავი კვირტებით',
        slug: 'ჟილეტი შავი კვირტებით',
        colors: [
            { name: "white", hex: "#e2e2e2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 149,
        description: 'ჟილეტი შავი კვირტებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/31.png',],
        countInStock: 5,
        isFeatured: true
    },


{
        name: 'პერანგი შავი კვირტებით',
        slug: 'პერანგი შავი კვირტებით',
        colors: [
            { name: "white", hex: "#e2e2e2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 79,
        description: 'პერანგი შავი კვირტებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/29.png', '/clothes/newnew/30.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'ქაშმირის პალტო პრინტიანი',
        slug: 'ქაშმირის პალტო პრინტიანი',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'ქაშმირის პალტო პრინტიანი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/28.png'],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'ქაშმირის პალტო',
        slug: 'ქაშმირის პალტო',
        colors: [
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#000000" },

        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 269,
        description: 'ქაშმირის პალტო',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/26.png', '/clothes/newnew/27.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'საროჩკული ზედა',
        slug: 'საროჩკული ზედა',
        colors: [
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#000000" },

        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 149,
        description: 'საროჩკული ზედა',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/23.png', '/clothes/newnew/24.png', '/clothes/newnew/25.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'საროჩკული ორეული',
        slug: 'საროჩკული ორეული',
        colors: [
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'საროჩკული ორეული',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/22.png'],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'როლინგი ყვავილით',
        slug: 'როლინგი ყვავილით',
        colors: [
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#000000" },
            { name: "white", hex: "#e2e2e2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 79,
        description: 'როლინგი ყვავილით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/19.png' , '/clothes/newnew/20.png' , '/clothes/newnew/21.png'],
        countInStock: 5,
        isFeatured: true
    },
{
        name: 'კოსტუმი თეთრი კვირტებით',
        slug: 'კოსტუმი თეთრი კვირტებით',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'კოსტუმი თეთრი კვირტებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/18.png' ],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'კოსტუმი შავი კვირტებით',
        slug: 'კოსტუმი შავი კვირტებით',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'კოსტუმი შავი კვირტებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/17.png', '/clothes/newnew/16.png', ],
        countInStock: 5,
        isFeatured: true
    },


{
        name: 'პლაში',
        slug: 'პლაში',
        colors: [
            { name: "White", hex: "#e2e2e2" },
            { name: "beige", hex: "#c2af7d" },
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 249,
        description: 'პლაში',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/13.png', '/clothes/newnew/14.png', '/clothes/newnew/15.png',],
        countInStock: 5,
        isFeatured: true
    },

{
        name: 'კოსტუმი შავი ვარდით',
        slug: 'კოსტუმი შავი ვარდით',
        colors: [
            { name: "White", hex: "#e2e2e2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 289,
        description: 'კოსტუმი შავი ვარდით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/12.png', ],
        countInStock: 5,
        isFeatured: true
    },


{
        name: 'კოსტუმი თეთრი ვარდით',
        slug: 'კოსტუმი თეთრი ვარდით',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 289,
        description: 'კოსტუმი თეთრი ვარდით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/11.png', ],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'ბეწვიანი ჟილეტი',
        slug: 'ბეწვიანი ჟილეტი',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 159,
        description: 'ბეწვიანი ჟილეტი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/9.png', '/clothes/newnew/10.png',],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'პალტო',
        slug: 'პალტო',
        colors: [
            { name: "beige", hex: "#dfd8c2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 229,
        description: 'პალტო',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/8.png',],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'კოპლიანი ზედით სამეული',
        slug: 'კოპლიანი ზედით სამეული',
        colors: [
            { name: "black", hex: "#000000" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 289,
        description: 'კოპლიანი ზედით სამეული',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/6.png', '/clothes/newnew/7.png',],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'ყვავილიანი მოსაცმელი',
        slug: 'ყვავილიანი მოსაცმელი',
        colors: [
            { name: "white", hex: "#e2e2e2" },
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 129,
        description: 'ყვავილიანი მოსაცმელი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/5.png', '/clothes/newnew/4.png',],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'ბეწვის მოსაცმელი',
        slug: 'ბეწვის მოსაცმელი',
        colors: [
            { name: "brown", hex: "#633a05" },
            { name: "black", hex: "#000000" },
            { name: "gray", hex: "#aca69e" },

        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 229,
        description: 'ბეწვის მოსაცმელი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/newnew/1.png', '/clothes/newnew/2.png', '/clothes/newnew/3-2.png', '/clothes/newnew/3.png',],
        countInStock: 5,
        isFeatured: true
    },
    // ახლები --------------------------------------------------------
    {
        name: 'საროჩკული კაბა',
        slug: 'საროჩკული კაბა',
        colors: [
            { name: "Black", hex: "#1f1f1f" },

        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 169,
        description: 'საროჩკული კაბა',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/news/1.png'],
        countInStock: 3,
        isFeatured: true
    },

    {
        name: 'რეგლანის კაბა',
        slug: 'რეგლანის კაბა',
        colors: [
            { name: "Black", hex: "#1f1f1f" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 169,
        description: 'რეგლანის კაბა',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/news/2.png'],
        countInStock: 3,
        isFeatured: true

    },
    {
        name: 'კრემისფერი კაბა ღილებით',
        slug: 'კრემისფერი კაბა ღილებით',
        colors: [
            { name: "white", hex: "rgba(238, 238, 238, 0.77)" }
        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 169,
        description: 'ელეგანტური კაბა ღილებით',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/news/3.png'],
        countInStock: 3,
        isFeatured: true

    },
    {
        name: 'ხელით ნაქსოვი ბეწვიანი ჟაკეტი',
        slug: 'ხელით ნაქსოვი ბეწვიანი ჟაკეტი',
        colors: [
            { name: "white", hex: "#e2e2e2" },
            { name: "Red", hex: "#a41a1ac4" },
            { name: "Black", hex: "#655b5b" },
            { name: "blue", hex: "#113baf" },
            { name: "light blue", hex: "#60769a" }


        ],
        sizes: ["S", "M", "L"], // 👈 აუცილებელია ფილტრისთვის
        price: 349,
        description: 'ხელით ნაქსოვი ბეწვიანი ჟაკეტი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/55.jpg', '/clothes/2.jpg'],
        countInStock: 5,
        isFeatured: true
    },

    {
        name: 'პრინტიანი მოსაცმელი',
        slug: 'პრინტიანი მოსაცმელი',
        colors: [{ name: "Black", hex: "#1f1f1f" }],
        price: 169,
        sizes: ["XS", "S"], // 👈 დაამატე ზომები ყველგან
        description: 'პრინტიანი მოსაცმელი',
        category: 'clothing',
        designer: 'Natia Tkhelidze',
        images: ['/clothes/5.jpg', '/clothes/6.jpg'],
        countInStock: 2,
        isFeatured: true
    },





];

export default products;