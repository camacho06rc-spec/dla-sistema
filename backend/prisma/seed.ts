import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Manager role with limited access',
    },
  });

  console.log('✅ Roles created:', { adminRole: adminRole.name, managerRole: managerRole.name });

  // Create admin user
  const hashedPassword = await hashPassword('Admin123!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dla.com' },
    update: {},
    create: {
      email: 'admin@dla.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin role assigned to admin user');

  // Create main branch
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Sucursal Principal',
      code: 'MAIN',
      address: 'Dirección Principal',
      phone: '1234567890',
      isActive: true,
      deliveryDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
    },
  });

  console.log('✅ Main branch created:', mainBranch.code);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
