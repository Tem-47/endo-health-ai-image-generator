'use client';

import { useState, useRef } from 'react';
import { Loader2, Image as ImageIcon, Wand2, Download, RefreshCw, CheckCircle2, XCircle, ChevronDown, Sparkles, Zap, Flower2 } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

// Helper: Download base64 image as file
function downloadBase64Image(dataUrl: string, filename: string) {
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Provider configuration
type Provider = 'gemini' | 'pollinations' | 'huggingface';

const PROVIDERS: Record<Provider, { name: string; description: string; badge: string; badgeColor: string }> = {
  gemini: {
    name: 'Gemini (Google)',
    description: 'Gemini 3.1 Flash Image Preview',
    badge: 'API Key',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  pollinations: {
    name: 'Pollinations AI',
    description: 'Flux – Kostenlos, kein Key nötig',
    badge: '100% Gratis',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  huggingface: {
    name: 'Hugging Face',
    description: 'FLUX.1-schnell – Schnell & hochqualitativ',
    badge: 'Free Tier',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
};

const PROVIDER_ENDPOINTS: Record<Provider, string> = {
  gemini: '/api/generate-image',
  pollinations: '/api/generate-pollinations',
  huggingface: '/api/generate-huggingface',
};

// Generic image generation helper
async function generateImageWithProvider(prompt: string, provider: Provider, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(PROVIDER_ENDPOINTS[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API error');
    }
    const data = await response.json();
    return data.image || null;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('Request aborted');
      return null;
    }
    console.error('API error:', err);
    throw err;
  }
}

const BLOG_TITLES = [
  "Künstliche Wechseljahre – was steckt dahinter und was kannst du tun?",
  "Endometriose kennt kein Alter",
  "Yselty® – Neu zugelassener Wirkstoff bei Endometriose",
  "Speicheltest für Endometriose: Das sagen die kritischen Stimmen",
  "Endometriose-Awareness im März",
  "Die Rolle von Fusobakterien bei der Entstehung von Endometriose",
  "Endometriose, Reizdarm und Essstörungen – Stimme aus der Praxis",
  "Früherkennung bei Endometriose",
  "Yoga im Sitzen",
  "Periode und Regelschmerzen: Was ist normal? Was nicht?"
];

const BRAND_STYLE_PROMPT = "Create a minimalist, modern vector illustration suitable for a digital health startup focusing on women's health. Use soft, empathetic pastel colors (soft pinks, warm yellows, gentle greens, and calming blues). The style should be flat, clean, medical but approachable, without any text. Consistent corporate brand identity style.";

export default function Page() {
  const [images, setImages] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState<Record<number, boolean>>({});
  const [globalGenerating, setGlobalGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>('gemini');
  const [providerOpen, setProviderOpen] = useState(false);

  // Custom Generator State
  const [customPrompt, setCustomPrompt] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customGenerating, setCustomGenerating] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGlobalGenerating(false);
    setCustomGenerating(false);
    setGenerating({});
  };

  const generateCustomImage = async () => {
    if (!customPrompt) return;
    setCustomGenerating(true);
    setCustomError(null);
    abortControllerRef.current = new AbortController();
    try {
      const imageUrl = await generateImageWithProvider(customPrompt, provider, abortControllerRef.current.signal);
      if (imageUrl) {
        setCustomImageUrl(imageUrl);
      }
    } catch (error: any) {
      console.error("Error generating custom image:", error);
      const msg = error.message || "Ein Fehler ist aufgetreten.";
      if (msg.includes("API Key") || msg.includes("API_KEY_INVALID")) {
        setCustomError("Der Gemini API Key ist ungültig oder nicht für Bildgenerierung berechtigt. Bitte prüfe deinen Key im Google AI Studio.");
      } else {
        setCustomError(msg);
      }
    } finally {
      setCustomGenerating(false);
    }
  };

  const generateImage = async (title: string, index: number, externalSignal?: AbortSignal) => {
    setGenerating(prev => ({ ...prev, [index]: true }));
    setGlobalError(null);
    const prompt = `Blog title: "${title}". ${BRAND_STYLE_PROMPT}`;
    
    let signal = externalSignal;
    if (!signal) {
      abortControllerRef.current = new AbortController();
      signal = abortControllerRef.current.signal;
    }

    try {
      const imageUrl = await generateImageWithProvider(prompt, provider, signal);
      if (imageUrl && !signal.aborted) {
        setImages(prev => ({ ...prev, [index]: imageUrl }));
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      if (!signal.aborted) {
        setGlobalError(error.message || "Ein Fehler ist aufgetreten.");
      }
    } finally {
      setGenerating(prev => ({ ...prev, [index]: false }));
    }
  };

  const generateAll = async () => {
    setGlobalGenerating(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Generate sequentially to avoid rate limits
    for (let i = 0; i < BLOG_TITLES.length; i++) {
      if (signal.aborted) break;
      if (!images[i]) {
        await generateImage(BLOG_TITLES[i], i, signal);
      }
    }
    setGlobalGenerating(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow bg-[#9d2b53]/10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Endo Health"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="font-semibold text-xl tracking-tight text-[#9d2b53]">Endo Health</h1>
          </div>
          <div className="flex items-center gap-2">
            {globalGenerating && (
              <button
                onClick={cancelGeneration}
                className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <XCircle size={16} />
                Abbrechen
              </button>
            )}
            <button
              onClick={generateAll}
              disabled={globalGenerating}
              className="flex items-center gap-2 bg-[#9d2b53] hover:bg-[#7e2242] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {globalGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wand2 size={16} />
              )}
              {globalGenerating ? 'Generiere...' : 'Alle Bilder generieren'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Custom Generator Section */}
        <div className="mb-16 bg-white p-8 rounded-2xl border border-stone-200 shadow">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#9d2b53]">Freier KI Bildgenerator</h2>
              <p className="text-[#9d2b53]">
                Generiere Bilder mit verschiedenen KI-Modellen.
              </p>
            </div>

            {/* Provider Selector */}
            <div className="relative">
              <button
                onClick={() => setProviderOpen(!providerOpen)}
                className="flex items-center gap-3 bg-white border-2 border-[#9d2b53]/20 hover:border-[#9d2b53]/40 rounded-xl px-4 py-3 transition-colors min-w-[260px] text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{PROVIDERS[provider].name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PROVIDERS[provider].badgeColor}`}>
                      {PROVIDERS[provider].badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{PROVIDERS[provider].description}</p>
                </div>
                <ChevronDown size={16} className={`text-stone-400 transition-transform ${providerOpen ? 'rotate-180' : ''}`} />
              </button>

              {providerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-[300px] bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden"
                >
                  {(Object.keys(PROVIDERS) as Provider[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setProvider(key); setProviderOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors ${
                        provider === key ? 'bg-[#9d2b53]/5 border-l-2 border-[#9d2b53]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                        {key === 'gemini' && <Sparkles size={16} className="text-blue-600" />}
                        {key === 'pollinations' && <Flower2 size={16} className="text-emerald-600" />}
                        {key === 'huggingface' && <Zap size={16} className="text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-stone-900">{PROVIDERS[key].name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PROVIDERS[key].badgeColor}`}>
                            {PROVIDERS[key].badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{PROVIDERS[key].description}</p>
                      </div>
                      {provider === key && <CheckCircle2 size={16} className="text-[#9d2b53] flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {customError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <p className="font-medium">Fehler bei der Generierung:</p>
              <p className="text-sm mt-1">{customError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateCustomImage()}
              placeholder="Beschreibe ein Bild (z.B. 'Ein rotes Auto im Wald im Aquarell-Stil')"
              className="flex-1 border border-[#9d2b53] p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9d2b53] focus:border-transparent transition-all text-lg"
            />
            {customGenerating && (
              <button
                onClick={cancelGeneration}
                className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-lg shadow"
              >
                <XCircle size={22} />
                Abbrechen
              </button>
            )}
            <button
              onClick={generateCustomImage}
              disabled={customGenerating || !customPrompt}
              className="bg-[#9d2b53] hover:bg-[#9d2b53]/90 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-lg shadow"
            >
              {customGenerating ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Wand2 size={22} />
              )}
              {customGenerating ? 'Generiere...' : 'Generieren'}
            </button>
          </div>

          {customImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-[#9d2b53] bg-[#9d2b53]/5 group shadow"
            >
              <img
                src={customImageUrl}
                alt={customPrompt}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => downloadBase64Image(customImageUrl!, 'custom-ai-image.png')}
                  className="bg-white/90 hover:bg-white text-[#9d2b53] px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 text-lg shadow"
                >
                  <Download size={22} />
                  Bild herunterladen
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Blog Header-Bilder</h2>
          <p className="text-stone-500 text-lg">
            Automatische Generierung von konsistenten, markengerechten Header-Bildern für die neuesten Blogbeiträge.
            Der Stil ist auf die Brand Identity von Endo Health abgestimmt: minimalistisch, empathisch und modern.
          </p>
          {globalError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <p className="font-medium">Fehler bei der Generierung:</p>
              <p className="text-sm mt-1">{globalError}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_TITLES.map((title, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-[16/9] bg-stone-100 relative group">
                {images[index] ? (
                  <>
                    <img
                      src={images[index]}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => generateImage(title, index)}
                        className="bg-white/90 hover:bg-white text-stone-900 p-2 rounded-full transition-colors"
                        title="Neu generieren"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        onClick={() => downloadBase64Image(images[index], `endo-blog-${index + 1}.png`)}
                        className="bg-white/90 hover:bg-white text-stone-900 p-2 rounded-full transition-colors"
                        title="Herunterladen"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                    {generating[index] ? (
                      <>
                        <Loader2 size={32} className="animate-spin mb-3 text-[#9d2b53]" />
                        <p className="text-sm font-medium text-stone-600">Generiere Bild...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={32} className="mb-3 opacity-50" />
                        <p className="text-sm mb-4">Kein Bild vorhanden</p>
                        <button
                          onClick={() => generateImage(title, index)}
                          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Wand2 size={16} />
                          Generieren
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-xs font-bold text-[#9d2b53] uppercase tracking-wider">
                    Blog Post {index + 1}
                  </span>
                  {images[index] && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                </div>
                <h3 className="font-semibold text-lg leading-snug text-stone-900">
                  {title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
