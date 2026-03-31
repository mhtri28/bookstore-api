import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

describe('DiscountsController', () => {
  let controller: DiscountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [DiscountsService],
    }).compile();

    controller = module.get<DiscountsController>(DiscountsController);
  });

  it('phải được khởi tạo', () => {
    expect(controller).toBeDefined();
  });
});