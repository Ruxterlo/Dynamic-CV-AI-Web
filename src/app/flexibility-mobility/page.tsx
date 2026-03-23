import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function FlexibilityMobility() {
  const cvText = await fetchCvSource();

  const mobilityText = extractSection(cvText, [
    'Flexibility & Mobility',
    'Flexibility and Mobility',
    'Mobility',
  ]);

  if (mobilityText === 'Section not found') {
    return (
    <main style={{ padding: '2rem' }}>
      <h1>Flexibility & Mobility</h1>
      <p>Sección no encontrada en el CV.</p>
    </main>
    );
  }

  const mobilityItems = mobilityText
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);

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
