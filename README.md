
# Endo Health AI Image Generator

Ein professioneller KI-Bildgenerator für Endo Health Blogbeiträge. Diese App ermöglicht die Erstellung konsistenter, markengerechter Header-Bilder mittels verschiedener KI-Modelle.

**🚀 [Live Demo ansehen](https://endo-health-ai-image-generator.vercel.app/)**


## ✨ Features

- **Multi-Provider Support**: Wähle zwischen Gemini (Google), Pollinations AI und Hugging Face (FLUX).
- **Brand Consistency**: Integrierte Style-Prompts für einen einheitlichen Look.
- **Batch Generation**: Generiere Bilder für alle 10 Blog-Titel gleichzeitig.
- **Download-Funktion**: Speichere generierte Bilder direkt als PNG.
- **Modern UI**: Clean Design mit Tailwind CSS und Motion (Framer Motion).

## 🚀 Lokale Entwicklung

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/Tem-47/endo-health-ai-image-generator.git
    cd endo-health-ai-image-generator
    ```

2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

3.  **Umgebungsvariablen konfigurieren:**
    Erstelle eine `.env.local` Datei (basierend auf `.env.example`):
    ```env
    GEMINI_API_KEY=dein_key
    HUGGINGFACE_API_KEY=dein_hf_token
    POLLINATIONS_API_KEY=dein_pollinations_key (optional)
    ```

4.  **App starten:**
    ```bash
    npm run dev
    ```
    Öffne [http://localhost:3000](http://localhost:3000).

## 🌐 Deployment auf Vercel

Dieses Projekt ist für [Vercel](https://vercel.com) optimiert.

1.  Push deinen Code auf GitHub.
2.  Importiere das Repository in Vercel.
3.  Füge folgende **Environment Variables** in den Vercel-Projekteinstellungen hinzu:
    - `GEMINI_API_KEY`
    - `HUGGINGFACE_API_KEY`
    - `POLLINATIONS_API_KEY`
4.  Klicke auf **Deploy**.

Die App ist nun unter **[https://endo-health-ai-image-generator.vercel.app/](https://endo-health-ai-image-generator.vercel.app/)** erreichbar.


## 📖 Dokumentation
Weitere Details zum internen Workflow findest du in der [WORKFLOW.md](WORKFLOW.md).

