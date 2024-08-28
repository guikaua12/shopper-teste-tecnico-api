import { Module } from '@nestjs/common';
import { MeasureController } from '@/measure/measure.controller';
import { GeminiModule } from '@/gemini/gemini.module';
import { MeasureService } from '@/measure/measure.service';

@Module({
    imports: [GeminiModule],
    controllers: [MeasureController],
    providers: [MeasureService],
})
export class MeasureModule {}
