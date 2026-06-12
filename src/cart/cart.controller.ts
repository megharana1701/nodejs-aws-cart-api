import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CartItem } from './models';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  //@UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    console.log('GET CART CALLED');

    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req) || 'test-user',
    );

    return cart?.items ?? [];
  }

  // @UseGuards(JwtAuthGuard)
  //@UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body: PutCartPayload) {
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req) || 'test-user',
      body,
    );

    return cart?.items ?? [];
  }

  // @UseGuards(JwtAuthGuard)
  //@UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(
      getUserIdFromRequest(req) || 'test-user',
    );
  }

  //@UseGuards(JwtAuthGuard)
  //@UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req) || 'test-user';

    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const order = this.orderService.create({
      userId,
      cartId: String(cart.id),
      items: cart.items.map(({ product_id, count }) => ({
        productId: product_id,
        count,
      })),
      address: body.address,
      total: 0, // temporary
    });

    await this.cartService.removeByUserId(userId);

    return {
      order,
    };
  }

  //@UseGuards(BasicAuthGuard)
  @Get('order')
  getOrder(): Order[] {
    return this.orderService.getAll();
  }
}
