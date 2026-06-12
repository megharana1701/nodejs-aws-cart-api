import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { CartItem } from './cart-item.entity';
import { CartStatus } from './cart-status.enum';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  user_id: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.OPEN,
  })
  status: CartStatus;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}
