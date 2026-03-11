import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const hfKey = process.env.HUGGINGFACE_API_KEY;

        if (!hfKey) {
            return NextResponse.json(
                { error: "Kein Hugging Face API Key konfiguriert. Bitte setze HUGGINGFACE_API_KEY in .env.local." },
                { status: 400 }
            );
        }

        console.log("Generating image with Hugging Face...");

        // Using FLUX.1-schnell – fast, high quality, free tier compatible
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${hfKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        width: 1024,
                        height: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF API error response:", errorText);

            if (response.status === 401 || response.status === 403) {
                throw new Error("API_KEY_INVALID");
            }
            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }
            if (response.status === 503) {
                throw new Error("MODEL_LOADING");
            }
            throw new Error(`Hugging Face API returned status ${response.status}: ${errorText}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        const imageUrl = `data:${contentType};base64,${base64}`;

        console.log("Successfully generated with Hugging Face!");
        return NextResponse.json({ image: imageUrl });

    } catch (error: any) {
        console.error('Hugging Face API error:', error);
        let errorMsg = "Ein unerwarteter Fehler ist aufgetreten.";

        if (error.message === "API_KEY_INVALID") {
            errorMsg = "Der Hugging Face API Key ist ungültig. Bitte prüfe deinen Key auf huggingface.co/settings/tokens.";
        } else if (error.message === "RATE_LIMIT") {
            errorMsg = "Hugging Face Rate Limit erreicht. Bitte kurz warten.";
        } else if (error.message === "MODEL_LOADING") {
            errorMsg = "Das Modell wird gerade geladen. Bitte versuche es in 30 Sekunden erneut.";
        } else {
            errorMsg = "Hugging Face API Fehler: " + (error.message || "Unbekannter Fehler");
        }

        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
