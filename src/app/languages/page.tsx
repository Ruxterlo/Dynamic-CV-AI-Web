import { fetchCvSource } from '@/lib/cvSource';
import Image from 'next/image';
import { extractRawSection } from '@/lib/latexParser';

// Mapa de idioma → código de país en minúsculas
const languageToCountryCode: Record<string, string> = {
  english: 'gb',
  spanish: 'es',
  portuguese: 'br',
  italian: 'it',
  french: 'fr',
  german: 'de',
  chinese: 'cn',
  japanese: 'jp',
  korean: 'kr',
  arabic: 'sa',
  russian: 'ru',
  hindi: 'in',
  bengali: 'bd',
  urdu: 'pk',
  turkish: 'tr',
  vietnamese: 'vn',
  thai: 'th',
  persian: 'ir',
  indonesian: 'id',
  malay: 'my',
  swahili: 'ke',
  dutch: 'nl',
  greek: 'gr',
  polish: 'pl',
  ukrainian: 'ua',
  hebrew: 'il',
  finnish: 'fi',
  norwegian: 'no',
  swedish: 'se',
  danish: 'dk',
  czech: 'cz',
  hungarian: 'hu',
  romanian: 'ro',
  slovak: 'sk',
  bulgarian: 'bg',
  serbian: 'rs',
  croatian: 'hr',
  bosnian: 'ba',
  albanian: 'al',
  lithuanian: 'lt',
  latvian: 'lv',
  estonian: 'ee',
  icelandic: 'is',
  malagasy: 'mg',
  filipino: 'ph',
  tamil: 'lk', // Sri Lanka
  telugu: 'in',
  kannada: 'in',
  marathi: 'in',
  gujarati: 'in',
  punjabi: 'in',
  sinhalese: 'lk',
  urhobo: 'ng',
  yoruba: 'ng',
  igbo: 'ng',
  amharic: 'et',
  somali: 'so',
  nepali: 'np',
  lao: 'la',
  khmer: 'kh',
  mongolian: 'mn',
  georgian: 'ge',
  armenian: 'am',
  azerbaijani: 'az',
  kazakh: 'kz',
  uzbek: 'uz',
  turkmen: 'tm',
  tajik: 'tj',
  kyrgyz: 'kg',
  tibetan: 'cn',
  malayalam: 'in',
};

export default async function Languages() {
  const cvText = await fetchCvSource();

  const rawSection = extractRawSection(cvText, ['Languages', 'Language Skills']);

  if (!rawSection) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Languages</h1>
        <p>Languages section not found.</p>
      </main>
    );
  }

  const sectionText = rawSection
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  const blocks: string[] = [];

  // Extraer items dentro de itemize
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = sectionText.match(itemizeRegex);
  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];
    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
    let match;
    while ((match = itemRegex.exec(itemsText)) !== null) {
      let item = match[1].trim();
      const makeboxRegex = /\\makebox\[.*?\]\[.*?\]\{\\textbf\{(.+?)\}\}\s*\{(.+?)\}/;
      const makeboxMatch = item.match(makeboxRegex);
      if (makeboxMatch) {
        let name = makeboxMatch[1].trim();
        if (!name.endsWith(':')) name += ':';
        const value = makeboxMatch[2].trim();
        item = `${name} ${value}`;
      }
      blocks.push(item);
    }
  }

  // Convertir \textbf{} a <strong>
  const latexToHtml = (text: string) =>
    text.replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>').replace(/\\&/g, '&');

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', fontFamily: 'sans-serif' }}>
      <h1>Languages</h1>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, idx) => {
          const name = block.split(':')[0].trim().toLowerCase();
          const code = languageToCountryCode[name];

          return (
            <div
              key={idx}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              {code ? (
                <Image
                  src={`https://flagcdn.com/w40/${code}.png`}
                  alt={name}
                  width={24}
                  height={24}
                  style={{ borderRadius: '2px' }}
                />
              ) : (
                <span style={{ fontSize: '22px' }}>🗣️</span>
              )}
              <span
                style={{ lineHeight: '1.5' }}
                dangerouslySetInnerHTML={{ __html: latexToHtml(block) }}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
