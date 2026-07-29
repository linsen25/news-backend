import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const createOpenApiDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('News Platform API')
    .setDescription(
      'Mock-backed CMS contract for authentication, articles, review workflow, users and audit logs.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .addTag('Auth')
    .addTag('Articles')
    .addTag('Review')
    .addTag('Users')
    .addTag('Audit')
    .addTag('Upload')
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
  });
};
