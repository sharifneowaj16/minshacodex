/**
 * lib/prisma.ts
 *
 * Prisma Client singleton with PrismaPg adapter.
 * Prisma 7 requires explicit driver adapter.
 *
 * @prisma/client@^7.4.0
 * @prisma/adapter-pg@^7.4.0
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}




// import { PrismaClient } from "@/generated/prisma/client";
// import { PrismaPg } from '@prisma/adapter-pg';

// const adapter = new PrismaPg({ 
//   connectionString: process.env.DATABASE_URL 
// });

// const prismaClientSingleton = () => {
//   return new PrismaClient({ adapter })
// }
// declare const globalThis: {
//   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;
// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// export default prisma
// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma