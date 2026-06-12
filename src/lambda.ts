import { Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import * as express from 'express';
import * as serverlessExpress from '@codegenie/serverless-express';

let cachedServer: Handler;

async function bootstrap() {
  console.log('STEP 1');

  const expressApp = express();

  console.log('STEP 2');

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  console.log('STEP 3');

  await app.init();

  console.log('STEP 4', serverlessExpress);

  return serverlessExpress.configure({
    app: expressApp,
  });
}

export const handler: Handler = async (event, context, callback) => {
  cachedServer = cachedServer ?? (await bootstrap());

  return cachedServer(event, context, callback);
};
