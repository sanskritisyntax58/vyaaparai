const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= 30; i++) {
    await prisma.startup.create({
      data: {
        ideaPrompt: `Idea ${i}`,
        businessName: `Startup Name ${i}`,
        tagline: `Tagline for startup ${i}`,
        description: `Description for startup ${i}`,
        products: JSON.stringify([`Product ${i}.1`, `Product ${i}.2`]),
        theme: i % 2 === 0 ? 'blue' : 'purple',
        isFavorite: i % 5 === 0
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
