import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function TechnologySkills() {
  const cvText = await fetchCvSource();

  const sectionText = extractSection(cvText, ['Technology Skills', 'Technical Skills', 'Skills']);

  if (sectionText === 'Section not found') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Technology Skills</h1>
        <p>Technology Skills section not found.</p>
      </main>
    );
  }

  const blocks = sectionText
    .split('\n')
    .map(block => block.trim())
    .filter(block => block.length > 0);

  // Función para asignar emoji según palabras clave
  const getEmoji = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('virtualization')) return '👾';
    if (lower.includes('artificial intelligence')) return '🤖';
    if (lower.includes('sql')) return '🖥';
    if (lower.includes('python')) return '🐍';
    if (lower.includes('javascript') || lower.includes('typescript')) return '🟨';
    if (lower.includes('docker')) return '🐳';
    if (lower.includes('react')) return '⚛️';
    if (lower.includes('node')) return '🟩';
    if (lower.includes('aws')) return '☁️';
    if (lower.includes('git')) return '🔧';
    if (lower.includes('business')) return '📊';
    if (lower.includes('certification') || lower.includes('certified')) return '📜';
    return '💻';
  };

  // Convertir \textbf{} en <strong> y limpiar caracteres LaTeX
  const latexToHtml = (text: string) =>
    text
      .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
      .replace(/\\&/g, '&');

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Technology Skills</h1>
      <div style={{ marginTop: '1.5rem' }}>
        {blocks.map((block, idx) => (
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
            <span style={{ fontSize: '18px' }}>{getEmoji(block)}</span>
            <span
              style={{ fontSize: '14px', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ __html: latexToHtml(block) }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
