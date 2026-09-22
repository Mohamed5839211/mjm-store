import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const prisma = {
    category: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockResolvedValue({ id: 1 }),
      count: jest.fn().mockResolvedValue(1),
    },
    product: { findMany: jest.fn().mockResolvedValue([]) },
  };
  let service: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(prisma as never);
  });

  it('returns 404 for unknown categories', async () => {
    prisma.category.findUnique.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('guards update and remove with existence checks', async () => {
    prisma.category.findUnique.mockResolvedValueOnce(null);
    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
