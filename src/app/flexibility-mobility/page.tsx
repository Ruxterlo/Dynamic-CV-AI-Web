import { fetchCvSource } from '@/lib/cvSource';

export default async function FlexibilityMobility() {
  const cvText = await fetchCvSource();

  // Regex para capturar la sección completa
  const sectionRegex = /\\cvsection\{Flexibility\s*\\&\s*Mobility\}([\s\S]*?)\\end\{itemize\}/;
  const sectionMatch = cvText.match(sectionRegex);

  if (!sectionMatch) return (
    <main style={{ padding: '2rem' }}>
      <h1>Flexibility & Mobility</h1>
      <p>Sección no encontrada en el CV.</p>
    </main>
  );

  let mobilityText = sectionMatch[1];

  // Limpiar comandos LaTeX innecesarios
  mobilityText = mobilityText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  // Regex para separar cada item correctamente, modo dotall para incluir saltos de línea
  const itemRegex = /\\item(?:\[[^\]]*\])?\s+([\s\S]*?)(?=(\\item|$))/g;
  const mobilityItems: string[] = [];
  let match;
  while ((match = itemRegex.exec(mobilityText)) !== null) {
    const item = match[1].trim();
    if (item) mobilityItems.push(item);
  }

  // Iconos según LaTeX \faIcon
  const getIcon = (text: string) => {
    if (/\\faIcon\{briefcase\}/.test(text)) return '💼';
    if (/\\faIcon\{users\}/.test(text)) return '👥';
    if (/\\faIcon\{laptop\}/.test(text)) return '💻';
    return '⭐';
  };

  // Convertir \textbf{} en <strong> y eliminar \faIcon
  const latexToHtml = (text: string) =>
    text.replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\faIcon\{.*?\}/g, '');

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Flexibility & Mobility</h1>

      <div style={{ marginTop: '1.5rem' }}>
        {mobilityItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '18px' }}>{getIcon(item)}</span>
            <span
              style={{ fontSize: '14px', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ __html: latexToHtml(item) }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
