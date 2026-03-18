import { fetchCvSource } from '@/lib/cvSource';

export default async function TechnologySkills() {
  const cvText = await fetchCvSource();

  // Capturar toda la sección Technology Skills hasta el siguiente \cvsection o final
  const sectionRegex = /\\cvsection\{Technology Skills\}([\s\S]*?)(?=(\\cvsection|$))/;
  const sectionMatch = cvText.match(sectionRegex);

  if (!sectionMatch) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Technology Skills</h1>
        <p>Technology Skills section not found.</p>
      </main>
    );
  }

  let sectionText = sectionMatch[1];

  // Limpiar comandos LaTeX innecesarios
  sectionText = sectionText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  const blocks: string[] = [];

  // 1️⃣ Extraer items dentro de itemize
  const itemizeRegex = /\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g;
  let lastIndex = 0;
  let match;

  while ((match = itemizeRegex.exec(sectionText)) !== null) {
    // Agregar contenido antes del itemize (texto fuera de itemize)
    const beforeItemize = sectionText.slice(lastIndex, match.index).trim();
    if (beforeItemize) blocks.push(beforeItemize);

    // Extraer cada \item dentro del itemize
    const itemText = match[0]
      .replace(/\\begin\{itemize\}[\s\S]*?/, '')
      .replace(/\\end\{itemize\}/, '')
      .trim();

    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(itemText)) !== null) {
      const item = itemMatch[1].trim();
      if (item) blocks.push(item);
    }

    lastIndex = match.index + match[0].length;
  }

  // Agregar cualquier texto después del último itemize
  const afterItemize = sectionText.slice(lastIndex).trim();
  if (afterItemize) blocks.push(afterItemize);

  // Función para asignar emoji según palabras clave
  const getEmoji = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('python')) return '🐍';
    if (lower.includes('javascript') || lower.includes('typescript')) return '🟨';
    if (lower.includes('docker')) return '🐳';
    if (lower.includes('react')) return '⚛️';
    if (lower.includes('node')) return '🟩';
    if (lower.includes('aws')) return '☁️';
    if (lower.includes('git')) return '🔧';
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
