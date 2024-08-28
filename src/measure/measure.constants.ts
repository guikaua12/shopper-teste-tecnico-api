import { Content, GenerationConfig, SchemaType } from '@google/generative-ai';

export const measure_prompt = `Act as a water and gas consumption reader. You will have to analyze images of water and gas consumption meters. 
    Read the number value indicated on the water or gas meter reader, if you don't find any consumption or number in the image, the consumption is 0.
    
    Examples:
    
    Input: Image with a meter with value '00000221'
    Output: 221

    Input: Image with a meter with value '3587756.8'
    Output: 35877568
    
    Input: Image with a meter with value '1234567.8'
    Output: 12345678
    `;

export const systemInstruction: Content = {
    role: 'system',
    parts: [{ text: measure_prompt }],
};

export const generationConfig: GenerationConfig = {
    responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
            consumption: {
                type: SchemaType.NUMBER,
            },
        },
        required: ['consumption'],
    },
    responseMimeType: 'application/json',
    temperature: 0,
    topP: 0,
};
