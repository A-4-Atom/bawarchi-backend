import { prisma } from '../src/prisma/client';

async function main() {
  // Step 1: Create menu items (only once per unique dish)
  const items = await prisma.menuItem.createMany({
    data: [
      { name: 'Poha' },
      { name: 'Idli Sambhar' },
      { name: 'Chole Bhature' },
      { name: 'Rajma Chawal' },
      { name: 'Aloo Paratha' },
      { name: 'Paneer Butter Masala' },
      { name: 'Dal Makhani' },
      { name: 'Veg Biryani' },
      { name: 'Roti' },
      { name: 'Mix Veg Curry' },
    ],
    skipDuplicates: true,
  });

  // Fetch item IDs for schedule creation
  const allItems = await prisma.menuItem.findMany();

  const getItemId = (name: string) => {
    const item = allItems.find((i) => i.name === name);
    return item?.id!;
  };

  // Step 2: Create menu schedule for all days
  const weekdays = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ] as const;

  for (const day of weekdays) {
    await prisma.menuSchedule.createMany({
      data: [
        { day, type: 'BREAKFAST', itemId: getItemId('Poha') },
        { day, type: 'BREAKFAST', itemId: getItemId('Idli Sambhar') },
        { day, type: 'LUNCH', itemId: getItemId('Rajma Chawal') },
        { day, type: 'LUNCH', itemId: getItemId('Dal Makhani') },
        { day, type: 'DINNER', itemId: getItemId('Paneer Butter Masala') },
        { day, type: 'DINNER', itemId: getItemId('Roti') },
      ],
    });
  }

  // Step 3: Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Step 4: Add feedback for some items
  await prisma.feedback.createMany({
    data: [
      {
        rating: 4,
        comment: 'Delicious and fresh!',
        userId: user.id,
        itemId: getItemId('Poha'),
      },
      {
        rating: 5,
        comment: 'Paneer was soft and flavorful.',
        userId: user.id,
        itemId: getItemId('Paneer Butter Masala'),
      },
      {
        rating: 3,
        comment: 'Too spicy for me.',
        userId: user.id,
        itemId: getItemId('Rajma Chawal'),
      },
    ],
  });
}

main()
  .then(() => {
    console.log('🌱 Database seeded successfully.');
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());