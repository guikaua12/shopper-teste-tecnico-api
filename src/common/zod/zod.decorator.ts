import { Body, Param, Query } from '@nestjs/common';
import { z, ZodSchema } from 'zod';
import { ZodPipe } from './zod.pipe';

export const ValidBody = (schema: ZodSchema) => Body(new ZodPipe(schema));

export const ValidParam = <T>(schema: z.ZodType<T>) => Param(new ZodPipe(schema));

export const ValidQuery = <T>(schema: z.ZodType<T>) => Query(new ZodPipe(schema));
