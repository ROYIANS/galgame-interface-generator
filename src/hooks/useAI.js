import { useState } from 'react';
import OpenAI from 'openai';

export const useAI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getClient = (config) => {
        return new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl || undefined,
            dangerouslyAllowBrowser: true
        });
    };

    const generateText = async (currentText, config) => {
        if (!config.apiKey) {
            setError('API Key is missing');
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const client = getClient(config);

            // Determine if user provided input
            const hasInput = currentText && currentText.trim().length > 0;

            let systemPrompt, userPrompt;

            if (hasInput) {
                // Rewrite user's input in the same language
                systemPrompt = `You are a creative writer for a visual novel (Galgame).

Your task: Rewrite the user's input to be more dramatic, expressive, and anime-styled with "Chuunibyou" (8th grader syndrome) flavor.

IMPORTANT: Respond in the SAME LANGUAGE as the user's input. If they write in Chinese, respond in Chinese. If they write in English, respond in English. If they write in Japanese, respond in Japanese, etc.

Style guidelines:
- Make it sound like character dialogue
- Add dramatic flair and emotional intensity
- Keep it concise but expressive (1-3 sentences)
- Add anime/visual novel style expressions if appropriate
- Maintain the core meaning of the original text

Output ONLY the rewritten dialogue text, nothing else.`;

                userPrompt = currentText;
            } else {
                // Generate random dialogue - default to Chinese
                systemPrompt = `You are a creative writer for a visual novel (Galgame).

Your task: Generate a random, interesting line of character dialogue.

Style guidelines:
- Dramatic, expressive, anime-styled with "Chuunibyou" flavor
- Could be mysterious, philosophical, emotional, or action-oriented
- 1-2 sentences
- Generate in Chinese (中文) by default

Output ONLY the dialogue text, nothing else.`;

                userPrompt = "Generate a random interesting visual novel dialogue line.";
            }

            const completion = await client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: config.textModel || "gpt-3.5-turbo",
            });

            return completion.choices[0].message.content;
        } catch (err) {
            console.error(err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async (prompt, config) => {
        if (!config.apiKey) {
            setError('API Key is missing');
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const client = getClient(config);

            // Enhanced prompt for pure background without text or UI elements
            const enhancedPrompt = `Create a pixel art style background scene for a visual novel game based on this description: "${prompt}".

            Requirements:
            - Pure background scenery only (landscape, interior, or environment)
            - Pixel art or retro game aesthetic
            - Anime/Japanese visual novel style
            - NO text, NO dialogue boxes, NO UI elements, NO characters with speech bubbles
            - Focus on atmospheric scenery that matches the mood of: ${prompt}
            - Suitable as a background for dialogue overlay`;

            const imageModel = config.imageModel || "dall-e-3";

            // Check if the model is a Gemini image model (or other chat-completion based image model)
            const isGeminiModel = imageModel.includes('gemini') || imageModel.includes('image-preview');

            if (isGeminiModel) {
                // Use chat completions API for Gemini-style models
                const aspectRatio = "16:9"; // Visual novel standard aspect ratio

                const response = await client.chat.completions.create({
                    model: imageModel,
                    messages: [
                        { role: "system", content: `aspect_ratio=${aspectRatio}` },
                        {
                            role: "user",
                            content: [{ type: "text", text: enhancedPrompt }]
                        }
                    ],
                    modalities: ["text", "image"]
                });

                // Extract image from multi_mod_content
                const parts = response.choices[0].message.multi_mod_content;
                if (parts) {
                    for (const part of parts) {
                        if ("inline_data" in part) {
                            // Convert base64 to data URL
                            const base64Data = part.inline_data.data;
                            const mimeType = part.inline_data.mime_type || "image/png";
                            return `data:${mimeType};base64,${base64Data}`;
                        }
                    }
                }

                throw new Error("No image data received from Gemini model");
            } else {
                // Use standard OpenAI images API for DALL-E models
                const response = await client.images.generate({
                    model: imageModel,
                    prompt: enhancedPrompt,
                    n: 1,
                    size: "1024x1024",
                });
                return response.data[0].url;
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { generateText, generateImage, loading, error };
};
