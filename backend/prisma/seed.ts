import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menuItems = [
  {
    name: 'Margherita Pizza',
    description:
      'Classic tomato sauce, fresh mozzarella, and basil on a hand-tossed crust.',
    price: 12.99,
    imageUrl:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    category: 'pizza',
  },
  {
    name: 'BBQ Chicken Burger',
    description:
      'Grilled chicken breast with smoky BBQ sauce, cheddar, lettuce, and pickles.',
    price: 10.49,
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'burger',
  },
  {
    name: 'Veggie Tacos',
    description:
      'Three soft tacos filled with roasted peppers, black beans, avocado, and salsa.',
    price: 9.99,
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    category: 'tacos',
  },
  {
    name: 'Classic Cheeseburger',
    description:
      'Juicy beef patty with American cheese, caramelized onions, mustard, and ketchup.',
    price: 11.49,
    imageUrl:
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    category: 'burger',
  },
  {
    name: 'Pepperoni Pizza',
    description:
      'Generous pepperoni slices on rich tomato sauce and melted mozzarella.',
    price: 14.99,
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    category: 'pizza',
  },
  {
    name: 'Caesar Salad',
    description:
      'Crisp romaine lettuce, parmesan shavings, croutons, and house Caesar dressing.',
    price: 8.99,
    imageUrl:
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    category: 'salad',
  },
  {
    name: 'Spicy Ramen',
    description:
      'Rich pork broth with ramen noodles, soft-boiled egg, nori, and chili oil.',
    price: 13.49,
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    category: 'noodles',
  },
  {
    name: 'Chocolate Lava Cake',
    description:
      'Warm chocolate cake with a gooey molten centre, served with vanilla ice cream.',
    price: 6.99,
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    category: 'dessert',
  },
];

async function main() {
  console.log('Seeding menu items...');

  // Clear existing items
  await prisma.menuItem.deleteMany();

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`✅ Seeded ${menuItems.length} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
