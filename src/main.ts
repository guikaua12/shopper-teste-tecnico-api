import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodExceptionFilter } from './common/zod/zod.exception-filter';
import { CustomExceptionFilter } from './common/error/error.exception-filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new CustomExceptionFilter(), new ZodExceptionFilter());

    await app.listen(3000);
}

bootstrap();
