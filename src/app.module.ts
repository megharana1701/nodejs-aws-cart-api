import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

import { getDbCredentials } from './database/data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const credentials = await getDbCredentials();

        console.log('DB_HOST=', process.env.DB_HOST);
        console.log('DB_PORT=', process.env.DB_PORT);
        console.log('DB_NAME=', process.env.DB_NAME);
        console.log('DB_USER=', credentials.username);

        return {
          type: 'postgres',

          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),

          database: process.env.DB_NAME,

          username: credentials.username,
          password: credentials.password,

          ssl: {
            rejectUnauthorized: false,
          },

          autoLoadEntities: true,

          synchronize: true,
        };
      },
    }),

    AuthModule,
    CartModule,
    OrderModule,
  ],
})
export class AppModule {}
