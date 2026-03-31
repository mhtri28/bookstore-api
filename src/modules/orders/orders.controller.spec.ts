import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/shared/guards/access-token.guard';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // bypass auth
      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('phải được khởi tạo', () => {
    expect(controller).toBeDefined();
  });
});
