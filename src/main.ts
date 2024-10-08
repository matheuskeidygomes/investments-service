import { NestApplication, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import AppModule from './app/app.module';
import helmet from 'helmet';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.enableCors();
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Investments Service')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app
    .listen(process.env.PORT || 3000)
    .then(() => {
      console.log(
        `------- App is running on port: ${process.env.PORT || 3000}`,
      );
    })
    .catch((err) => {
      console.log(`------- Error when running app: ${err}`);
    });
}

bootstrap();
