import { fetchCvSource } from '@/lib/cvSource';

export default async function PortfolioProfiles() {
  const cvText = await fetchCvSource();

  // Capturar la sección
  const sectionRegex = /\\cvsection\{Portfolio\s*(?:&|\\&)\s*Professional\s*Profiles\}([\s\S]*?)(?=(\\cvsection|$))/;
  const sectionMatch = cvText.match(sectionRegex);

  if (!sectionMatch) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Portfolio & Professional Profiles</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  let sectionText = sectionMatch[1];

  // Limpiar comandos LaTeX básicos
  sectionText = sectionText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  const blocks: string[] = [];

  // 1️⃣ Intentar extraer itemize
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
    // 2️⃣ Si no hay itemize → dividir por comas
    const cleaned = sectionText
      .replace(/\\textbf\{(.+?)\}/g, '$1')
      .replace(/\\&/g, '&');

    cleaned.split(',').forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length > 0) blocks.push(trimmed);
    });
  }

  // 🎨 Emojis inteligentes según tipo de perfil/plataforma
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

    return '🔗'; // default perfil
  };

  // Convertir LaTeX a HTML básico
  const latexToHtml = (text: string) =>
    text
      .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
      .replace(/\\&/g, '&');

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Portfolio & Professional Profiles</h1>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            {/* Emoji */}
            <span style={{ fontSize: '20px' }}>{getEmoji(block)}</span>

            {/* Texto */}
            <span dangerouslySetInnerHTML={{ __html: latexToHtml(block) }} />
          </div>
        ))}
      </div>
    </main>
  );
}
