import { Client } from 'pg';
import { SecretsManager } from 'aws-sdk';

let client: Client | null = null;

export const connectDB = async () => {
  if (client) {
    return client;
  }

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

  const credentials = JSON.parse(secretValue.SecretString);

  client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: credentials.username,
    password: credentials.password,
  });

  await client.connect();

  console.log('DB Connected');

  return client;
};
