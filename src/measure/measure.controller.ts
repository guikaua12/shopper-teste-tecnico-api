import { Controller, Post } from '@nestjs/common';
import { ValidBody } from '@/common/zod/zod.decorator';
import { MeasureUpload, MeasureUploadSchema } from '@/measure/measure.dto';
import { MeasureService } from '@/measure/measure.service';

@Controller('measure')
export class MeasureController {
    constructor(private measureService: MeasureService) {}

    @Post('upload')
    async upload(@ValidBody(MeasureUploadSchema) body: MeasureUpload) {
        return this.measureService.upload(body);
    }
}
