import { Prisma } from 'src/generated/prisma/client';

export const prismaNotFoundError = () =>
  new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: '4.x.x',
  } as any);

export const prismaUniqueError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '4.x.x',
  } as any);
