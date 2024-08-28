import { Injectable } from '@nestjs/common';
import { GeminiService } from '@/gemini/gemini.service';
import { MeasureUpload } from '@/measure/measure.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DoubleMeasureReportException } from '@/measure/measure.exception';

@Injectable()
export class MeasureService {
    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService
    ) {}

    async upload({ image, customer_code, measure_datetime, measure_type }: MeasureUpload) {
        const month = measure_datetime.getMonth();

        const hasMeasureWithType = await this.prisma.measure.findFirst({
            where: {
                AND: [
                    {
                        measure_datetime: {
                            gte: new Date(measure_datetime.getFullYear(), month, 1),
                        },
                    },
                    {
                        measure_datetime: {
                            lt: new Date(measure_datetime.getFullYear(), month + 1, 1),
                        },
                    },
                    {
                        measure_type,
                    },
                ],
            },
        });

        if (hasMeasureWithType) {
            throw new DoubleMeasureReportException();
        }
    }
}
