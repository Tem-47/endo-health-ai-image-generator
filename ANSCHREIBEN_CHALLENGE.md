# Bewerbung als AI-Solutions Engineer – Technical Challenge Report

**Von:** Taoufiq EL Maazouzi
**Projekt:** Endo Health AI Image Generator
**GitHub Repo:** [https://github.com/Tem-47/endo-health-ai-image-generator](https://github.com/Tem-47/endo-health-ai-image-generator)
**Live Demo:** [https://endo-health-ai-image-generator.vercel.app/](https://endo-health-ai-image-generator.vercel.app/)

---

## Intro

Sehr geehrtes Endo Health Team,

anbei sende ich euch meine Lösung für die Technical Challenge. Als leidenschaftlicher AI-Builder mit "Hacker-Mentalität" habe ich die bestehende App nicht nur repariert und für Vercel optimiert, sondern direkt zu einer flexiblen Multi-Provider-Plattform ausgebaut. Mein Ziel war es, eine Lösung zu schaffen, die sowohl technisches Verständnis für APIs als auch ein Auge für Brand-Identity und User-Experience vereint.

---

## Die Challenge: Konsistente Blog-Header mit KI

### Mein Ansatz & Workflow

Um die geforderten 10 konsistenten Blog-Bilder zu generieren, habe ich ein System entwickelt, das Markenkonsistenz durch **Prompt-Engineering** und **Provider-Diversität** sicherstellt:

1.  **Brand-Identität als Basis:** Ich habe die Brand-Farbe (#9d2b53) und den Stil (minimalistisch, empathisch, modern) direkt in die Logik integriert. Jedes generierte Bild durchläuft eine unsichtbare "Veredelung" des Prompts, um visuelle Konsistenz über alle 10 Bilder hinweg zu garantieren.
2.  **Multi-Provider System:** Da KI-Modelle unterschiedliche Stärken (und API-Limits) haben, habe ich drei Provider angebunden:
    *   **Google Gemini 1.5 Flash:** Hohe semantische Präzision für komplexe medizinische Themen.
    *   **Hugging Face (FLUX.1-schnell):** High-End Bildqualität und schnelle Iteration.
    *   **Pollinations AI (Flux):** Ein "100% Gratis"-Fallback ohne API-Limits, ideal für schnelles Testen.
3.  **Hacker-Mentalität & Robustheit:** Da kostenlose APIs oft instabil sind, habe ich eine **Server-Side Retry-Logik mit Exponential Backoff** implementiert (siehe `/api/generate-pollinations`). Fehler werden abgefangen, bevor der User sie sieht.

### Technische Highlights

- **Next.js & Serverless**: Alle API-Calls erfolgen server-seitig (geschützte Keys, kein Client-Leak).
- **Base64 Rendering**: Optimierte Darstellung und native Download-Funktion für generierte Bilder.
- **Provider-Selector UI**: Ein intuitives Dropdown mit Status-Badges (API-Key nötig vs. Gratis-Tier).
- **Deployment-Ready**: Vollständig für Vercel optimiert, inklusive Environment-Variable-Management.

---

## Fazit

Dieses Projekt zeigt, wie ich denke: Bedarfe erkennen (markengerechte Bilder), Lösungen prototypisch bauen (Multi-Provider Support) und das Ganze robust und deploybar machen.

Ich freue mich darauf, meine Begeisterung für AI-Workflows bald persönlich bei Endo Health einzubringen!

Beste Grüße,

Taoufiq EL Maazouzi
