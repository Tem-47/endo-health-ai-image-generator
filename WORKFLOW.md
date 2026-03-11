# Endo Health AI Image Generator – App Workflow

## Überblick

Die App generiert mittels KI markengerechte Bilder für Endo Health Blogbeiträge. Es stehen drei KI-Provider zur Auswahl.

## KI-Provider

| Provider | Modell | Key nötig? | Besonderheit |
|---|---|---|---|
| **Gemini (Google)** | Gemini 3.1 Flash Image Preview | Ja (`GEMINI_API_KEY`) | Hohe Qualität, 500 Req/Tag gratis |
| **Pollinations AI** | Flux | Nein | 100% kostenlos, kein Account nötig |
| **Hugging Face** | FLUX.1-schnell | Ja (`HUGGINGFACE_API_KEY`) | Schnell, Free Tier verfügbar |

## Architektur

```
┌─────────────────────────────────────────────┐
│  Frontend (page.tsx)                        │
│  ┌─────────────────────────────────────┐    │
│  │  Provider-Selector (Dropdown)       │    │
│  │  → Gemini / Pollinations / HF      │    │
│  └──────────────┬──────────────────────┘    │
│                 │ POST /api/generate-*      │
└─────────────────┼───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  API Routes (Server-Side)                   │
│                                             │
│  /api/generate-image        → Gemini API    │
│  /api/generate-pollinations → Pollinations  │
│  /api/generate-huggingface  → HF Inference  │
│                                             │
│  Alle geben base64 data URI zurück          │
└─────────────────────────────────────────────┘
```

## User-Flow

### 1. Freier Bildgenerator
1. User wählt KI-Provider im Dropdown
2. User gibt Prompt ins Textfeld ein
3. Klick auf "Generieren" → API-Route wird aufgerufen
4. Bild wird als base64 empfangen und angezeigt
5. Hover über Bild → Download-Button erscheint

### 2. Blog Header-Bilder
1. 10 vordefinierte Blog-Titel werden als Karten angezeigt
2. "Generieren" pro Karte → einzelnes Bild generieren
3. "Alle Bilder generieren" → sequentiell alle 10 generieren
4. Abbrechen jederzeit möglich
5. Hover → Neu generieren oder herunterladen

## Dateistruktur

```
app/
├── page.tsx                          # Hauptseite (Client Component)
├── layout.tsx                        # Root Layout + Metadata
├── globals.css                       # Tailwind CSS Import
└── api/
    ├── generate-image/route.ts       # Gemini API
    ├── generate-pollinations/route.ts # Pollinations API
    └── generate-huggingface/route.ts  # Hugging Face API
public/
└── logo.png                          # App Logo
.env.local                            # API Keys (server-only)
```

## Konfiguration

```bash
# .env.local
GEMINI_API_KEY=dein_gemini_key
HUGGINGFACE_API_KEY=dein_hf_token     # Von https://huggingface.co/settings/tokens
# Pollinations braucht keinen Key!
```

## Lokales Starten

```bash
npm install
npm run dev        # → http://localhost:3000
```
