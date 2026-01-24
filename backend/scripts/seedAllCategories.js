import mongoose from 'mongoose'
import Product from '../models/Product.js'
import dotenv from 'dotenv'

dotenv.config()

const CATEGORIES = [
    'Electronics',
    'Clothing & Apparel',
    'Home & Kitchen',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
    'Furniture',
    'Jewelry & Accessories',
    'Pet Supplies',
    'Office Supplies',
    'Baby & Kids',
    'Garden & Tools',
    'Musical Instruments',
    'Art & Crafts',
    'Travel & Luggage',
    'Computer & Accessories',
    'Mobile Phones & Accessories',
]

const ADJECTIVES = ['Premium', 'Deluxe', 'Standard', 'Pro', 'Ultra', 'Compact', 'Portable', 'Durable', 'Classic', 'Modern', 'Sleek', 'Efficient', 'High-Performance', 'Eco-Friendly', 'Digital', 'Analog', 'Smart', 'Wireless', 'Ergonomic', 'Vintage']

const NOUNS_BY_CATEGORY = {
    'Electronics': ['Headphones', 'Speaker', 'Camera', 'Drone', 'Projector', 'Router', 'Power Bank', 'Charger', 'Adapter', 'Microphone', 'Webcam', 'Monitor', 'Receiver', 'Amplifier'],
    'Clothing & Apparel': ['T-Shirt', 'Jeans', 'Jacket', 'Hoodie', 'Sneakers', 'Socks', 'Hat', 'Scarf', 'Gloves', 'Belt', 'Dress', 'Skirt', 'Blazer', 'Coat'],
    'Home & Kitchen': ['Blender', 'Mixer', 'Toaster', 'Coffee Maker', 'Kettle', 'Microwave', 'Pot', 'Pan', 'Knife Set', 'Cutlery', 'Vacuum', 'Iron', 'Heater', 'Fan'],
    'Sports & Outdoors': ['Yoga Mat', 'Dumbbell', 'Treadmill', 'Bike', 'Tent', 'Sleeping Bag', 'Backpack', 'Helmet', 'Gloves', 'Ball', 'Racket', 'Net', 'Water Bottle', 'Jersey'],
    'Books & Media': ['Novel', 'Biography', 'Textbook', 'Cookbook', 'Comic', 'Manga', 'Magazine', 'DVD', 'Blu-ray', 'Vinyl', 'CD', 'Audiobook', 'E-book', 'Journal'],
    'Toys & Games': ['Action Figure', 'Doll', 'Puzzle', 'Board Game', 'Card Game', 'Building Blocks', 'Remote Control Car', 'Drone', 'Plush Toy', 'Educational Toy', 'Video Game', 'Console', 'Controller', 'Headset'],
    'Health & Beauty': ['Shampoo', 'Conditioner', 'Soap', 'Lotion', 'Cream', 'Serum', 'Oil', 'Perfume', 'Cologne', 'Makeup', 'Brush', 'Razor', 'Trimmer', 'Dryer'],
    'Automotive': ['Tire', 'Oil', 'Filter', 'Battery', 'Charger', 'Mat', 'Cover', 'Light', 'Wiper', 'Tool', 'Jack', 'Pump', 'Cleaner', 'Wax'],
    'Food & Beverages': ['Coffee', 'Tea', 'Snack', 'Chocolate', 'Candy', 'Cookie', 'Chip', 'Juice', 'Soda', 'Water', 'Oil', 'Spice', 'Sauce', 'Pasta'],
    'Furniture': ['Chair', 'Table', 'Sofa', 'Bed', 'Desk', 'Cabinet', 'Shelf', 'Wardrobe', 'Stool', 'Bench', 'Lamp', 'Mirror', 'Rug', 'Curtain'],
    'Jewelry & Accessories': ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Watch', 'Tie', 'Cufflinks', 'Wallet', 'Purse', 'Bag', 'Sunglasses', 'Hat', 'Scarf', 'Belt'],
    'Pet Supplies': ['Food', 'Treat', 'Toy', 'Bed', 'Collar', 'Leash', 'Harness', 'Cage', 'Tank', 'Bowl', 'Brush', 'Shampoo', 'Medicine', 'Carrier'],
    'Office Supplies': ['Pen', 'Pencil', 'Paper', 'Notebook', 'Binder', 'Folder', 'Stapler', 'Tape', 'Glue', 'Scissors', 'Calculator', 'Desk', 'Chair', 'Lamp'],
    'Baby & Kids': ['Diaper', 'Wipe', 'Lotion', 'Powder', 'Soap', 'Shampoo', 'Oil', 'Cream', 'Monitor', 'Stroller', 'Car Seat', 'Carrier', 'Crib', 'Toy'],
    'Garden & Tools': ['Shovel', 'Rake', 'Hoe', 'Pruner', 'Shears', 'Gloves', 'Hose', 'Sprinkler', 'Mower', 'Trimmer', 'Blower', 'Saw', 'Drill', 'Hammer'],
    'Musical Instruments': ['Guitar', 'Piano', 'Keyboard', 'Drum', 'Violin', 'Cello', 'Flute', 'Clarinet', 'Saxophone', 'Trumpet', 'Trombone', 'Harmonica', 'Ukulele', 'Banjo'],
    'Art & Crafts': ['Paint', 'Brush', 'Canvas', 'Paper', 'Pencil', 'Marker', 'Glue', 'Tape', 'Scissors', 'Clay', 'Yarn', 'Thread', 'Needle', 'Fabric'],
    'Travel & Luggage': ['Suitcase', 'Bag', 'Backpack', 'Duffel', 'Tote', 'Briefcase', 'Wallet', 'Passport Holder', 'Tag', 'Lock', 'Adapter', 'Pillow', 'Blanket', 'Mask'],
    'Computer & Accessories': ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Drive', 'Memory', 'Card', 'Cable', 'Adapter', 'Case', 'Stand', 'Cooler', 'Printer'],
    'Mobile Phones & Accessories': ['Phone', 'Case', 'Protector', 'Charger', 'Cable', 'Power Bank', 'Holder', 'Mount', 'Headset', 'Speaker', 'Lens', 'Stick', 'Gimbal', 'Watch'],
}

const getImageForCategory = (category) => {
    // Placeholder images or generic unsplash images based on category
    const images = {
        'Electronics': 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500',
        'Clothing & Apparel': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500',
        'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500',
        'Sports & Outdoors': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
        'Books & Media': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
        'Toys & Games': 'https://images.unsplash.com/photo-1566576912902-1d6ebc123b77?w=500',
        'Health & Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=500',
        'Automotive': 'https://images.unsplash.com/photo-1486262715619-6785710b1063?w=500',
        'Food & Beverages': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
        'Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500',
        'Jewelry & Accessories': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
        'Pet Supplies': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
        'Office Supplies': 'https://images.unsplash.com/photo-1534484337225-b1a77464670c?w=500',
        'Baby & Kids': 'https://images.unsplash.com/photo-1515488042361-25f4682ee08c?w=500',
        'Garden & Tools': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
        'Musical Instruments': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
        'Art & Crafts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500',
        'Travel & Luggage': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        'Computer & Accessories': 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=500',
        'Mobile Phones & Accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    }
    return [images[category] || 'https://images.unsplash.com/photo-1526304640152-d4619684e204?w=500']
}

const generateProducts = () => {
    const allProducts = []

    CATEGORIES.forEach(category => {
        // Generate 10 products for each category
        const nouns = NOUNS_BY_CATEGORY[category] || ['Item']

        for (let i = 0; i < 10; i++) {
            // Pick a random adjective
            const adj = ADJECTIVES[i % ADJECTIVES.length] // Use modulo to rotate through adjectives
            // Pick a noun, circling through available nouns
            const noun = nouns[i % nouns.length]

            const name = `${adj} ${noun} ${String.fromCharCode(65 + i)}` // Add a letter suffix to ensure uniqueness

            allProducts.push({
                name: name,
                description: `This is a high-quality ${name.toLowerCase()} suitable for all your needs. It is one of our best-selling items in the ${category} category.`,
                price: Math.floor(Math.random() * 500) + 20, // Random price between 20 and 520
                discount: i % 3 === 0 ? 10 : 0, // Every 3rd item has a discount
                stock: Math.floor(Math.random() * 100) + 10,
                category: category,
                images: getImageForCategory(category),
                rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
                reviewCount: Math.floor(Math.random() * 50),
                isActive: true
            })
        }
    })

    return allProducts
}


const seedDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tana-market'
        console.log(`Connecting to ${mongoURI}...`)
        await mongoose.connect(mongoURI)
        console.log('✅ Connected to MongoDB')

        // Optional: Clear existing products if you want a fresh start
        // const deleted = await Product.deleteMany({})
        // console.log(`Cleared ${deleted.deletedCount} existing products`)

        const products = generateProducts()
        console.log(`Prepared ${products.length} products to insert...`)

        const result = await Product.insertMany(products)
        console.log(`✅ Successfully inserted ${result.length} products!`)

        // Log counts per category
        const counts = {}
        result.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1
        })
        console.log('Category breakdown:', counts)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    }
}

seedDatabase()
