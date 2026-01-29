import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing products
  await knex('products').del();

  // Insert ChocoOps chocolate products based on provided images
  await knex('products').insert([
    // Chocolate Bars (Standard Line)
    {
      sku: 'CHOC-STD-001',
      name: 'ChocoOps Strawberry Bar',
      description: 'Handmade dark chocolate bar with freeze-dried strawberries',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 150,
      image_url: '/products/strawberry-bar.jpg'
    },
    {
      sku: 'CHOC-STD-002',
      name: 'ChocoOps Classic Dark Bar',
      description: '70% single-origin dark chocolate bar',
      category: 'Chocolate Bars',
      price: 10.99,
      cost: 4.40,
      stock: 200,
      image_url: '/products/dark-bar.jpg'
    },
    {
      sku: 'CHOC-STD-003',
      name: 'ChocoOps Milk Chocolate Bar',
      description: 'Creamy milk chocolate with 45% cocoa',
      category: 'Chocolate Bars',
      price: 9.99,
      cost: 4.00,
      stock: 180,
      image_url: '/products/milk-bar.jpg'
    },
    {
      sku: 'CHOC-STD-004',
      name: 'ChocoOps Hazelnut Bar',
      description: 'Milk chocolate with roasted hazelnuts',
      category: 'Chocolate Bars',
      price: 11.99,
      cost: 4.80,
      stock: 120,
      image_url: '/products/hazelnut-bar.jpg'
    },
    {
      sku: 'CHOC-STD-005',
      name: 'ChocoOps Sea Salt Caramel Bar',
      description: 'Dark chocolate with sea salt caramel pieces',
      category: 'Chocolate Bars',
      price: 13.99,
      cost: 5.60,
      stock: 100,
      image_url: '/products/caramel-bar.jpg'
    },

    // Gift Boxes (Premium Line)
    {
      sku: 'CHOC-GIFT-001',
      name: 'ChocoOps LOVE Box',
      description: 'Premium gift box with chocolate letters spelling LOVE, decorated with edible flowers',
      category: 'Gift Boxes',
      price: 49.99,
      cost: 20.00,
      stock: 50,
      image_url: '/products/love-box.jpg'
    },
    {
      sku: 'CHOC-GIFT-002',
      name: 'ChocoOps Luxury Assortment',
      description: 'Premium chocolate box with 24 assorted bonbons and pralines',
      category: 'Gift Boxes',
      price: 39.99,
      cost: 16.00,
      stock: 75,
      image_url: '/products/luxury-box.jpg'
    },
    {
      sku: 'CHOC-GIFT-003',
      name: 'ChocoOps Heart Collection',
      description: 'Heart-shaped box with 12 artisan chocolates',
      category: 'Gift Boxes',
      price: 29.99,
      cost: 12.00,
      stock: 60,
      image_url: '/products/heart-box.jpg'
    },
    {
      sku: 'CHOC-GIFT-004',
      name: 'ChocoOps Signature Box 18pc',
      description: 'Colorful signature box with 18 assorted chocolates',
      category: 'Gift Boxes',
      price: 34.99,
      cost: 14.00,
      stock: 80,
      image_url: '/products/signature-box-18.jpg'
    },
    {
      sku: 'CHOC-GIFT-005',
      name: 'ChocoOps Signature Box 24pc',
      description: 'Large colorful signature box with 24 premium chocolates',
      category: 'Gift Boxes',
      price: 44.99,
      cost: 18.00,
      stock: 65,
      image_url: '/products/signature-box-24.jpg'
    },

    // Specialty Items
    {
      sku: 'CHOC-SPEC-001',
      name: 'ChocoOps Gold Coins',
      description: 'Premium milk chocolate coins wrapped in gold foil',
      category: 'Specialty',
      price: 15.99,
      cost: 6.40,
      stock: 140,
      image_url: '/products/gold-coins.jpg'
    },
    {
      sku: 'CHOC-SPEC-002',
      name: 'ChocoOps Chocolate Covered Hazelnuts',
      description: 'Roasted hazelnuts covered in milk chocolate',
      category: 'Specialty',
      price: 18.99,
      cost: 7.60,
      stock: 90,
      image_url: '/products/covered-hazelnuts.jpg'
    },
    {
      sku: 'CHOC-SPEC-003',
      name: 'ChocoOps Artisan Truffles',
      description: 'Handmade chocolate truffles with various fillings',
      category: 'Specialty',
      price: 24.99,
      cost: 10.00,
      stock: 70,
      image_url: '/products/truffles.jpg'
    },

    // Nano-Banana Line (Smaller Portions)
    {
      sku: 'CHOC-NB-001',
      name: 'ChocoOps Mini Strawberry Bar',
      description: 'Mini version of our strawberry bar - 50g',
      category: 'Nano-Banana',
      price: 6.99,
      cost: 2.80,
      stock: 200,
      image_url: '/products/mini-strawberry.jpg'
    },
    {
      sku: 'CHOC-NB-002',
      name: 'ChocoOps Mini Dark Bar',
      description: 'Pocket-sized dark chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 5.99,
      cost: 2.40,
      stock: 250,
      image_url: '/products/mini-dark.jpg'
    },
    {
      sku: 'CHOC-NB-003',
      name: 'ChocoOps Mini Milk Bar',
      description: 'Pocket-sized milk chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 5.49,
      cost: 2.20,
      stock: 220,
      image_url: '/products/mini-milk.jpg'
    },
    {
      sku: 'CHOC-NB-004',
      name: 'ChocoOps Mini Hazelnut Bar',
      description: 'Small hazelnut chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 6.49,
      cost: 2.60,
      stock: 180,
      image_url: '/products/mini-hazelnut.jpg'
    },
    {
      sku: 'CHOC-NB-005',
      name: 'ChocoOps Sampler Box 6pc',
      description: 'Mini box with 6 assorted chocolates',
      category: 'Nano-Banana',
      price: 12.99,
      cost: 5.20,
      stock: 150,
      image_url: '/products/sampler-6.jpg'
    },
    {
      sku: 'CHOC-NB-006',
      name: 'ChocoOps Mini Gold Coins',
      description: 'Small pack of 10 chocolate gold coins',
      category: 'Nano-Banana',
      price: 8.99,
      cost: 3.60,
      stock: 170,
      image_url: '/products/mini-coins.jpg'
    },
    {
      sku: 'CHOC-NB-007',
      name: 'ChocoOps Mini Truffles 4pc',
      description: 'Box of 4 mini artisan truffles',
      category: 'Nano-Banana',
      price: 10.99,
      cost: 4.40,
      stock: 130,
      image_url: '/products/mini-truffles.jpg'
    },
    {
      sku: 'CHOC-NB-008',
      name: 'ChocoOps Chocolate Buttons',
      description: 'Small chocolate discs in resealable bag - 100g',
      category: 'Nano-Banana',
      price: 7.99,
      cost: 3.20,
      stock: 190,
      image_url: '/products/buttons.jpg'
    },
    {
      sku: 'CHOC-NB-009',
      name: 'ChocoOps Mini Heart Box',
      description: 'Small heart box with 4 chocolates',
      category: 'Nano-Banana',
      price: 9.99,
      cost: 4.00,
      stock: 140,
      image_url: '/products/mini-heart.jpg'
    },
    {
      sku: 'CHOC-NB-010',
      name: 'ChocoOps Party Pack',
      description: 'Mix of 20 mini chocolate pieces',
      category: 'Nano-Banana',
      price: 14.99,
      cost: 6.00,
      stock: 110,
      image_url: '/products/party-pack.jpg'
    },

    // Additional Standard Line Products
    {
      sku: 'CHOC-STD-006',
      name: 'ChocoOps White Chocolate Bar',
      description: 'Premium white chocolate bar with vanilla',
      category: 'Chocolate Bars',
      price: 10.99,
      cost: 4.40,
      stock: 160,
      image_url: '/products/white-bar.jpg'
    },
    {
      sku: 'CHOC-STD-007',
      name: 'ChocoOps Orange Dark Bar',
      description: 'Dark chocolate with candied orange peel',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 110,
      image_url: '/products/orange-bar.jpg'
    },
    {
      sku: 'CHOC-STD-008',
      name: 'ChocoOps Mint Dark Bar',
      description: 'Dark chocolate with natural mint essence',
      category: 'Chocolate Bars',
      price: 11.99,
      cost: 4.80,
      stock: 130,
      image_url: '/products/mint-bar.jpg'
    },
    {
      sku: 'CHOC-STD-009',
      name: 'ChocoOps Raspberry Bar',
      description: 'Dark chocolate with freeze-dried raspberries',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 125,
      image_url: '/products/raspberry-bar.jpg'
    },
    {
      sku: 'CHOC-STD-010',
      name: 'ChocoOps Almond Bar',
      description: 'Milk chocolate with roasted almonds',
      category: 'Chocolate Bars',
      price: 11.99,
      cost: 4.80,
      stock: 145,
      image_url: '/products/almond-bar.jpg'
    },

    // More Nano-Banana Line
    {
      sku: 'CHOC-NB-011',
      name: 'ChocoOps Mini Orange Bar',
      description: 'Mini orange chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 6.49,
      cost: 2.60,
      stock: 160,
      image_url: '/products/mini-orange.jpg'
    },
    {
      sku: 'CHOC-NB-012',
      name: 'ChocoOps Mini Mint Bar',
      description: 'Mini mint chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 6.49,
      cost: 2.60,
      stock: 155,
      image_url: '/products/mini-mint.jpg'
    },
    {
      sku: 'CHOC-NB-013',
      name: 'ChocoOps Mini Raspberry Bar',
      description: 'Mini raspberry chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 6.99,
      cost: 2.80,
      stock: 145,
      image_url: '/products/mini-raspberry.jpg'
    },
    {
      sku: 'CHOC-NB-014',
      name: 'ChocoOps Mini Almond Bar',
      description: 'Mini almond chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 6.49,
      cost: 2.60,
      stock: 170,
      image_url: '/products/mini-almond.jpg'
    },
    {
      sku: 'CHOC-NB-015',
      name: 'ChocoOps Mini White Bar',
      description: 'Mini white chocolate bar - 50g',
      category: 'Nano-Banana',
      price: 5.99,
      cost: 2.40,
      stock: 180,
      image_url: '/products/mini-white.jpg'
    },
    {
      sku: 'CHOC-NB-016',
      name: 'ChocoOps Snack Pack Dark',
      description: 'Resealable bag of dark chocolate squares - 150g',
      category: 'Nano-Banana',
      price: 11.99,
      cost: 4.80,
      stock: 120,
      image_url: '/products/snack-dark.jpg'
    },
    {
      sku: 'CHOC-NB-017',
      name: 'ChocoOps Snack Pack Milk',
      description: 'Resealable bag of milk chocolate squares - 150g',
      category: 'Nano-Banana',
      price: 10.99,
      cost: 4.40,
      stock: 135,
      image_url: '/products/snack-milk.jpg'
    },
    {
      sku: 'CHOC-NB-018',
      name: 'ChocoOps Travel Mix',
      description: 'Mixed nuts covered in chocolate - 120g bag',
      category: 'Nano-Banana',
      price: 9.99,
      cost: 4.00,
      stock: 150,
      image_url: '/products/travel-mix.jpg'
    },
    {
      sku: 'CHOC-NB-019',
      name: 'ChocoOps Dessert Coins',
      description: 'Small pack of assorted chocolate coins - 80g',
      category: 'Nano-Banana',
      price: 7.99,
      cost: 3.20,
      stock: 165,
      image_url: '/products/dessert-coins.jpg'
    },
    {
      sku: 'CHOC-NB-020',
      name: 'ChocoOps Pocket Treats',
      description: 'Assorted mini chocolate pieces in pocket pack',
      category: 'Nano-Banana',
      price: 8.99,
      cost: 3.60,
      stock: 175,
      image_url: '/products/pocket-treats.jpg'
    },

    // Additional premium items
    {
      sku: 'CHOC-STD-011',
      name: 'ChocoOps Coffee Bean Bar',
      description: 'Dark chocolate with whole roasted coffee beans',
      category: 'Chocolate Bars',
      price: 13.99,
      cost: 5.60,
      stock: 95,
      image_url: '/products/coffee-bar.jpg'
    },
    {
      sku: 'CHOC-STD-012',
      name: 'ChocoOps Pistachio Bar',
      description: 'Milk chocolate with crushed pistachios',
      category: 'Chocolate Bars',
      price: 14.99,
      cost: 6.00,
      stock: 85,
      image_url: '/products/pistachio-bar.jpg'
    },
    {
      sku: 'CHOC-STD-013',
      name: 'ChocoOps Coconut Bar',
      description: 'Dark chocolate with toasted coconut flakes',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 105,
      image_url: '/products/coconut-bar.jpg'
    },
    {
      sku: 'CHOC-STD-014',
      name: 'ChocoOps Chili Dark Bar',
      description: '75% dark chocolate with chili pepper',
      category: 'Chocolate Bars',
      price: 13.99,
      cost: 5.60,
      stock: 80,
      image_url: '/products/chili-bar.jpg'
    },
    {
      sku: 'CHOC-STD-015',
      name: 'ChocoOps Lavender Bar',
      description: 'White chocolate with culinary lavender',
      category: 'Chocolate Bars',
      price: 13.99,
      cost: 5.60,
      stock: 75,
      image_url: '/products/lavender-bar.jpg'
    },
    {
      sku: 'CHOC-SPEC-004',
      name: 'ChocoOps Praline Collection',
      description: 'Box of 12 Belgian-style pralines',
      category: 'Specialty',
      price: 28.99,
      cost: 11.60,
      stock: 60,
      image_url: '/products/pralines.jpg'
    },
    {
      sku: 'CHOC-SPEC-005',
      name: 'ChocoOps Bonbon Assortment',
      description: 'Premium bonbons with various fillings - 16pc',
      category: 'Specialty',
      price: 32.99,
      cost: 13.20,
      stock: 55,
      image_url: '/products/bonbons.jpg'
    },
    {
      sku: 'CHOC-STD-016',
      name:' ChocoOps Caramel Pecan Bar',
      description: 'Milk chocolate with caramel and pecans',
      category: 'Chocolate Bars',
      price: 14.99,
      cost: 6.00,
      stock: 90,
      image_url: '/products/caramel-pecan.jpg'
    },
    {
      sku: 'CHOC-STD-017',
      name: 'ChocoOps Blueberry Bar',
      description: 'White chocolate with freeze-dried blueberries',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 100,
      image_url: '/products/blueberry-bar.jpg'
    },
    {
      sku: 'CHOC-STD-018',
      name: 'ChocoOps Peanut Butter Bar',
      description: 'Milk chocolate with peanut butter filling',
      category: 'Chocolate Bars',
      price: 11.99,
      cost: 4.80,
      stock: 115,
      image_url: '/products/peanut-butter-bar.jpg'
    },
    {
      sku: 'CHOC-STD-019',
      name: 'ChocoOps Matcha Bar',
      description: 'White chocolate with Japanese matcha powder',
      category: 'Chocolate Bars',
      price: 14.99,
      cost: 6.00,
      stock: 70,
      image_url: '/products/matcha-bar.jpg'
    },
    {
      sku: 'CHOC-STD-020',
      name: 'ChocoOps Salted Pretzel Bar',
      description: 'Milk chocolate with crushed salted pretzels',
      category: 'Chocolate Bars',
      price: 12.99,
      cost: 5.20,
      stock: 105,
      image_url: '/products/pretzel-bar.jpg'
    }
  ]);

  console.log('✅ Seeded 50 ChocoOps chocolate products (30 Standard + 20 Nano-Banana)');
}
