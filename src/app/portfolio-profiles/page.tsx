import { fetchCvSource } from '@/lib/cvSource';
import Image from 'next/image';
import { extractRawSection } from '@/lib/latexParser';

export default async function PortfolioProfiles() {
  const cvText = await fetchCvSource();

  const rawSection = extractRawSection(cvText, [
    'Portfolio & Professional Profiles',
    'Portfolio and Professional Profiles',
    'Portfolio',
    'Professional Profiles',
    'Profiles & Portfolio'
  ]);

  if (!rawSection) {
    return (
      <main className="sectionPageMain">
        <h1>Portfolio & Professional Profiles</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  let sectionText = rawSection;

  // Clean basic LaTeX commands
  sectionText = sectionText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  const blocks: string[] = [];

  // 1️⃣ Try extracting itemize
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = sectionText.match(itemizeRegex);

  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];

    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(itemsText)) !== null) {
      const item = match[1].trim();
      blocks.push(item);
    }
  } else {
    // 2️⃣ If there is no itemize -> split by commas
    const cleaned = sectionText
      .replace(/\\textbf\{(.+?)\}/g, '$1')
      .replace(/\\&/g, '&');

    cleaned.split(',').forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length > 0) blocks.push(trimmed);
    });
  }

  // 🎨 Smart emojis by profile/platform type
  const getEmoji = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes('github')) return '🐙';
    if (lower.includes('linkedin')) return '💼';
    if (lower.includes('portfolio') || lower.includes('website')) return '🌐';
    if (lower.includes('behance') || lower.includes('dribbble')) return '🎨';
    if (lower.includes('gitlab') || lower.includes('bitbucket')) return '🧑‍💻';
    if (lower.includes('medium') || lower.includes('blog')) return '✍️';
    if (lower.includes('stack overflow')) return '🧠';
    if (lower.includes('kaggle')) return '📊';
    if (lower.includes('youtube')) return '🎥';

    return '🔗'; // default profile
  };

  const extractUrl = (text: string) => {
    const hrefMatch = text.match(/\\href\{([^}]+)\}/);
    if (hrefMatch?.[1]) {
      return hrefMatch[1].trim();
    }

    const plainUrlMatch = text.match(/https?:\/\/[^\s}]+/);
    if (plainUrlMatch?.[0]) {
      return plainUrlMatch[0].trim();
    }

    return null;
  };

  const getFaviconUrl = (text: string) => {
    const source = extractUrl(text);
    if (!source) {
      return null;
    }

    try {
      const parsed = new URL(source);
      return `https://www.google.com/s2/favicons?sz=64&domain=${parsed.hostname}`;
    } catch {
      return null;
    }
  };

  const shouldUseSemanticIcon = (text: string) => {
    const lower = text.toLowerCase();
    return lower.includes('website') || lower.includes('portfolio') || lower.includes('web');
  };

  const splitServiceAndAddress = (text: string, url: string | null) => {
    const trimmed = text.trim();

    if (!url) {
      return { service: trimmed, address: null as string | null };
    }

    const normalizedFull = url.replace(/\/$/, '');
    const normalizedShort = normalizedFull
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '');

    const fullIndex = trimmed.toLowerCase().indexOf(normalizedFull.toLowerCase());
    if (fullIndex >= 0) {
      return {
        service: trimmed.slice(0, fullIndex).trim(),
        address: trimmed.slice(fullIndex).trim(),
      };
    }

    const shortIndex = trimmed.toLowerCase().indexOf(normalizedShort.toLowerCase());
    if (shortIndex >= 0) {
      return {
        service: trimmed.slice(0, shortIndex).trim(),
        address: trimmed.slice(shortIndex).trim(),
      };
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex >= 0) {
      const afterColon = trimmed.slice(colonIndex + 1).trim();
      return {
        service: trimmed.slice(0, colonIndex + 1).trim(),
        address: afterColon || normalizedShort,
      };
    }

    return { service: trimmed, address: normalizedShort };
  };

  // Convert LaTeX to basic HTML
  const latexToText = (text: string) => {
    const qrcodeRegex = /\\qrcode(?:\[[^\]]*\])?\{[^}]*\}/g;

    return text
      .replace(/\\href\{([^}]+)\}\s*\{\s*\\qrcode(?:\[[^\]]*\])?\{[^}]*\}\s*\}/g, '$1')
      .replace(/\\href\{([^}]+)\}\s*\{([\s\S]*?)\}/g, (_m, url: string, label: string) => {
        const cleanLabel = label.replace(qrcodeRegex, '').trim();
        return cleanLabel || url;
      })
      .replace(qrcodeRegex, '')
      .replace(/\\fa[A-Za-z]+/g, '')
      .replace(/\$\s*\|\s*\$/g, '')
      .replace(/\\textbf\{(.+?)\}/g, '$1')
      .replace(/\\&/g, '&')
      .replace(/\\_/g, '_')
      .replace(/\\+/g, ' ')
      .replace(/[{}]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+:/g, ':')
      .trim();
  };

  return (
    <main className="sectionPageMain">
      <h1>Profiles & Portfolio</h1>

      <div className="sectionPageStack">
        {blocks.map((block, idx) => (
          (() => {
            const textContent = latexToText(block);
            const targetUrl = extractUrl(block);
            const useSemanticIcon = shouldUseSemanticIcon(textContent);
            const faviconUrl = useSemanticIcon ? null : getFaviconUrl(block);
            const parts = splitServiceAndAddress(textContent, targetUrl);
            const iconNode = faviconUrl ? (
              <Image
                src={faviconUrl}
                alt="profile icon"
                width={20}
                height={20}
                style={{ borderRadius: '4px', marginTop: '1px', flexShrink: 0 }}
              />
            ) : (
              <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{getEmoji(block)}</span>
            );

            return (
          <div
            key={idx}
            className="sectionGlassCard"
            style={{
              padding: '0.6rem 1rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start',
              fontSize: '14px',
            }}
          >
            {targetUrl && parts.address ? (
              <>
                {iconNode}
                <span style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>
                  {parts.service}{' '}
                  <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                    {parts.address}
                  </a>
                </span>
              </>
            ) : (
              <>
                {iconNode}
                <span style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>{textContent}</span>
              </>
            )}
          </div>
            );
          })()
        ))}
      </div>
    </main>
  );
}
