import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeasureModule } from './measure/measure.module';
import { GeminiModule } from './gemini/gemini.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MeasureModule,
        GeminiModule,
        PrismaModule,
    ],
})
export class AppModule {}
