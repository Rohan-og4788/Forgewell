import { authService } from '../services/auth.service.ts';
import { prisma } from '../lib/prisma.ts';

async function main() {
  console.log('Seeding Forgewell testing accounts...\n');

  try {
    const userSession = await authService.testLogin('USER');
    console.log('✓ Developer Test Account Ready:');
    console.log(`  Email:    ${userSession.user.email}`);
    console.log(`  Password: password123`);
    console.log(`  Role:     ${userSession.user.role}`);
    console.log(`  Token:    ${userSession.token}\n`);

    const adminSession = await authService.testLogin('ADMIN');
    console.log('✓ Admin Test Account Ready:');
    console.log(`  Email:    ${adminSession.user.email}`);
    console.log(`  Password: admin123`);
    console.log(`  Role:     ${adminSession.user.role}`);
    console.log(`  Token:    ${adminSession.token}\n`);

    console.log('Both test accounts are active and ready for development & testing.');
  } catch (error) {
    console.error('Error seeding test user:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

