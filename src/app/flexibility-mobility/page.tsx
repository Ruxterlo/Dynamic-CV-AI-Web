import { fetchCvSource } from '@/lib/cvSource';
import { extractRawSection } from '@/lib/latexParser';

type MobilityItem = {
  icon: string;
  html: string;
};

const ICON_BY_FA_NAME: Record<string, string> = {
  passport: '🛂',
  idcard: '🪪',
  briefcase: '💼',
  users: '👥',
  laptop: '💻',
  plane: '✈️',
  globe: '🌍',
  earth: '🌍',
  mapmarker: '📍',
  locationdot: '📍',
  clock: '⏱️',
  check: '✅',
  checkcircle: '✅',
};

const normalizeFaName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const extractFaName = (latexLine: string): string | null => {
  const faIconMatch = latexLine.match(/\\faIcon\s*\{\s*([^}]+)\s*\}/i)?.[1];
  if (faIconMatch) {
    return normalizeFaName(faIconMatch);
  }

  const faCommandMatch = latexLine.match(/\\fa([A-Za-z]+)(?:\{[^}]*\})?/i)?.[1];
  if (faCommandMatch) {
    return normalizeFaName(faCommandMatch);
  }

  return null;
};

const getMobilityIcon = (latexLine: string): string => {
  const faName = extractFaName(latexLine);
  if (!faName) {
    return '•';
  }

  return ICON_BY_FA_NAME[faName] ?? '•';
};

const latexToHtml = (value: string): string =>
  value
    .replace(/\\href\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
    .replace(/\\emph\{(.+?)\}/g, '<em>$1</em>')
    .replace(/\\faIcon\s*\{[^}]*\}/g, '')
    .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\\\\/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractMobilityItems = (rawSection: string): MobilityItem[] => {
  const cleaned = rawSection
    .split('\n')
    .filter(line => !line.trim().startsWith('%'))
    .filter(line => !line.trim().startsWith('\\setlength'))
    .filter(line => !line.trim().startsWith('\\vspace'))
    .join('\n');

  const itemRegex = /\\item\s+([\s\S]*?)(?=\\item\s+|\\end\{itemize\}|$)/g;
  const rawItems = [...cleaned.matchAll(itemRegex)]
    .map(match => match[1]?.trim() ?? '')
    .filter(Boolean);

  return rawItems
    .map(item => ({
      icon: getMobilityIcon(item),
      html: latexToHtml(item),
    }))
    .filter(item => item.html.length > 0);
};

export default async function FlexibilityMobility() {
  const cvText = await fetchCvSource();

  const mobilityRaw = extractRawSection(cvText, [
    'Flexibility & Mobility',
    'Flexibility and Mobility',
    'Mobility',
  ]);

  if (!mobilityRaw) {
    return (
    <main className="sectionPageMain">
      <h1>Flexibility & Mobility</h1>
      <p>Section not found in the CV.</p>
    </main>
    );
  }

  const mobilityItems = extractMobilityItems(mobilityRaw);

  return (
    <main className="sectionPageMain">
      <h1>Flexibility & Mobility</h1>

      <div className="sectionPageStack">
        {mobilityItems.map((item, idx) => (
          <div
            key={idx}
            className="sectionGlassCard"
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span
              style={{ fontSize: '14px', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
