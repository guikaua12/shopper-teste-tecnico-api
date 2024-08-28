import { Injectable } from '@nestjs/common';
import { GeminiService } from '@/gemini/gemini.service';
import { MeasureUpload, MeasureUploadResponse } from '@/measure/measure.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DoubleMeasureReportException } from '@/measure/measure.exception';
import { generationConfig, systemInstruction } from '@/measure/measure.constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MeasureService {
    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService
    ) {}

    async upload({
        image,
        customer_code,
        measure_datetime,
        measure_type,
    }: MeasureUpload): Promise<MeasureUploadResponse> {
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
                    {
                        customer_code,
                    },
                ],
            },
        });

        if (hasMeasureWithType) {
            throw new DoubleMeasureReportException();
        }

        const { url, mimeType } = await this.geminiService.upload(image);

        const measure_value = await this.extractMeasureValue(url, mimeType);

        const measure = await this.prisma.measure.create({
            data: {
                measure_uuid: uuid(),
                measure_datetime,
                measure_type,
                has_confirmed: false,
                image_url: url,
                customer_code,
            },
        });

        return {
            image_url: url,
            measure_value,
            measure_uuid: measure.measure_uuid,
        };
    }

    private async extractMeasureValue(imageUrl: string, mimeType: string): Promise<number> {
        const result = await this.geminiService.generateContent({
            systemInstruction,
            generationConfig,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                mimeType,
                                fileUri: imageUrl,
                            },
                        },
                    ],
                },
            ],
        });

        const { consumption } = JSON.parse(result.response.text());

        return this.removeDecimalDot(consumption);
    }

    private removeDecimalDot(num: number) {
        const numStr = num.toString();

        const parts = numStr.split(/[.,]/);

        if (parts.length === 1) {
            return num;
        }

        return parseInt(parts.join(''), 10);
    }
}
