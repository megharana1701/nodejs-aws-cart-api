import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PutCartPayload } from 'src/order/type';
import { Cart as CartEntity } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<CartEntity | null> {
    return this.cartRepo.findOne({
      where: { user_id: userId },
      relations: ['items'],
    });
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    let cart = await this.findByUserId(userId);

    if (cart) {
      return cart;
    }

    cart = this.cartRepo.create({
      user_id: userId,
    });

    return this.cartRepo.save(cart);
  }

  async updateByUserId(
    userId: string,
    payload: PutCartPayload,
  ): Promise<CartEntity> {
    const cart = await this.findOrCreateByUserId(userId);

    let item = await this.cartItemRepo.findOne({
      where: {
        cart_id: cart.id,
        product_id: payload.product.id,
      },
    });

    if (!item && payload.count > 0) {
      item = this.cartItemRepo.create({
        cart_id: cart.id,
        product_id: payload.product.id,
        count: payload.count,
      });

      await this.cartItemRepo.save(item);
    } else if (item && payload.count === 0) {
      await this.cartItemRepo.remove(item);
    } else if (item) {
      item.count = payload.count;
      await this.cartItemRepo.save(item);
    }

    return this.findOrCreateByUserId(userId);
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      return;
    }

    await this.cartRepo.remove(cart);
  }
}
