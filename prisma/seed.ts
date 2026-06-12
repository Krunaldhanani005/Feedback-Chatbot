import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@nantatech.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123!'

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (!existing) {
    const hashed = await bcrypt.hash(password, 12)
    await prisma.adminUser.create({
      data: { email, password: hashed, name: 'Admin', role: 'admin' },
    })
    console.log(`Admin user created: ${email}`)
  } else {
    console.log(`Admin user already exists: ${email}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
