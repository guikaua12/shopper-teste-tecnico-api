import { z } from 'zod';

export const MeasureUploadSchema = z.object({
    image: z
        .string({ required_error: 'Image is required', invalid_type_error: 'Invalid image type' })
        .base64('Image must be in base64 format')
        .min(1),
    customer_code: z
        .string({
            required_error: 'customer_code is required',
            invalid_type_error: 'Invalid customer_code type',
        })
        .min(1),
    measure_datetime: z
        .string({ required_error: 'measure_datetime is required', invalid_type_error: 'invalid measure_datetime type' })
        .datetime('measure_datetime must be datetime string')
        .pipe(z.coerce.date()),
    measure_type: z
        .string({
            required_error: 'measure_type is required',
            invalid_type_error: 'measure_type must be WATER or GAS',
        })
        .transform((val) => val.toUpperCase())
        .refine((val) => ['WATER', 'GAS'].includes(val), {
            message: 'measure_type must be WATER or GAS',
        }),
});

export type MeasureUpload = z.infer<typeof MeasureUploadSchema>;

export type MeasureUploadResponse = {
    image_url: string;
    measure_value: number;
    measure_uuid: string;
};

export const MeasureConfirmSchema = z.object({
    measure_uuid: z.string({
        required_error: 'measure_uuid is required',
        invalid_type_error: 'invalid measure_uuid type',
    }),
    confirmed_value: z
        .number({
            required_error: 'confirmed_value is required',
            invalid_type_error: 'invalid confirmed_value type',
        })
        .int('confirmed_value must be integer'),
});

export type MeasureConfirm = z.infer<typeof MeasureConfirmSchema>;

export type MeasureConfirmResponse = {
    success: boolean;
};
