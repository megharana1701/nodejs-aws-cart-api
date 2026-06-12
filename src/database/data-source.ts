import { DataSource } from 'typeorm';
import { SecretsManager } from 'aws-sdk';

import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

let dataSource: DataSource | null = null;

export const getDbCredentials = async () => {
  const secretArn = process.env.DB_SECRET_ARN;

  if (!secretArn) {
    throw new Error('DB_SECRET_ARN is not defined');
  }

  const secretsManager = new SecretsManager();

  const secretValue = await secretsManager
    .getSecretValue({
      SecretId: secretArn,
    })
    .promise();

  if (!secretValue.SecretString) {
    throw new Error('SecretString is empty');
  }

  return JSON.parse(secretValue.SecretString);
};

export const getDataSource = async (): Promise<DataSource> => {
  if (dataSource?.isInitialized) {
    return dataSource;
  }

  const credentials = await getDbCredentials();

  dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,

    username: credentials.username,
    password: credentials.password,

    ssl: {
      rejectUnauthorized: false,
    },

    entities: [Cart, CartItem],

    synchronize: false,
  });

  await dataSource.initialize();

  console.log('TypeORM Connected');

  return dataSource;
};
