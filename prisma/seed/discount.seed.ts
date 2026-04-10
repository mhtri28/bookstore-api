import { PrismaClient } from '../../src/generated/prisma/client';
import { CommonStatus, DiscountType } from '../../src/generated/prisma/enums';

export async function seedDiscounts(prisma: InstanceType<typeof PrismaClient>) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const sixMonthsLater = new Date(now);
  sixMonthsLater.setMonth(now.getMonth() + 6);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const seedData = [
    {
      code: 'BOOK10',
      description: 'Giam 10% toi da 50.000 cho don tu 100.000',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 10,
      max_discount_amount: 50000,
      min_order_value: 100000,
      start_at: thirtyDaysAgo,
      expires_at: sixMonthsLater,
      usage_limit: 200,
      status: CommonStatus.ACTIVE,
    },
    {
      code: 'FREESHIP30',
      description: 'Giam truc tiep 30.000 cho don tu 150.000',
      discount_type: DiscountType.FIXED_AMOUNT,
      discount_value: 30000,
      max_discount_amount: null,
      min_order_value: 150000,
      start_at: thirtyDaysAgo,
      expires_at: sixMonthsLater,
      usage_limit: 100,
      status: CommonStatus.ACTIVE,
    },
    {
      code: 'EXPIRED15',
      description: 'Ma giam gia da het han de test',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 15,
      max_discount_amount: 40000,
      min_order_value: 120000,
      start_at: sixMonthsAgo,
      expires_at: yesterday,
      usage_limit: 50,
      status: CommonStatus.INACTIVE,
    },
  ];

  for (const discount of seedData) {
    await prisma.discount.upsert({
      where: { code: discount.code },
      update: {
        description: discount.description,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        max_discount_amount: discount.max_discount_amount,
        min_order_value: discount.min_order_value,
        start_at: discount.start_at,
        expires_at: discount.expires_at,
        usage_limit: discount.usage_limit,
        status: discount.status,
      },
      create: {
        ...discount,
        used_count: 0,
      },
    });
  }

  console.log(' ✅ Seed discounts xong');
}
