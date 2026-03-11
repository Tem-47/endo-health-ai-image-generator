import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        console.log("Generating image with Pollinations AI...");

        const pollinationsKey = process.env.POLLINATIONS_API_KEY;

        // Use the unified API gateway with JSON POST for authenticated requests
        const response = await fetch("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?" + new URLSearchParams({
            width: "1024",
            height: "1024",
            nologo: "true",
            nofeed: "true",
            seed: String(Date.now()),
            ...(pollinationsKey ? { token: pollinationsKey } : {}),
        }).toString(), {
            signal: AbortSignal.timeout(120000), // 120s timeout – generation can be slow
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`Pollinations returned ${response.status}:`, errorText.substring(0, 200));

            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }
            throw new Error(`Pollinations API returned status ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || 'image/png';

        if (!contentType.startsWith('image/')) {
            const text = await response.text();
            console.error("Pollinations returned non-image:", text.substring(0, 200));
            throw new Error("Pollinations hat kein Bild zurückgegeben. Service möglicherweise überlastet.");
        }

        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:${contentType};base64,${base64}`;

        console.log("Successfully generated with Pollinations AI!");
        return NextResponse.json({ image: imageUrl });

    } catch (error: any) {
        console.error('Pollinations API error:', error);

        let errorMsg: string;
        if (error.message === "RATE_LIMIT") {
            errorMsg = "Pollinations AI Rate Limit erreicht. Bitte wechsle zu Gemini oder Hugging Face, oder warte kurz.";
        } else if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
            errorMsg = "Pollinations AI Timeout – der Service braucht zu lange. Bitte versuche es erneut oder wechsle den Provider.";
        } else if (error.message?.includes('500') || error.message?.includes('503')) {
            errorMsg = "Pollinations AI Server-Fehler. Bitte versuche es erneut oder wechsle den Provider.";
        } else {
            errorMsg = "Pollinations API Fehler: " + (error.message || "Unbekannter Fehler");
        }

        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
