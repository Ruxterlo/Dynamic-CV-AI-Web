import { fetchCvSource } from '@/lib/cvSource';

export default async function Projects() {
  const cvText = await fetchCvSource();

  // Capturar toda la sección de Projects
  const sectionRegex = /\\cvsection\{Recent Projects\}([\s\S]*?)\\end\{itemize\}/;
  const sectionMatch = cvText.match(sectionRegex);

  if (!sectionMatch) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Projects</h1>
        <p>Projects section not found.</p>
      </main>
    );
  }

  let projectsText = sectionMatch[1];

  // Limpiar comandos LaTeX innecesarios
  projectsText = projectsText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  // Separar cada \item como bloque independiente
  const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
  const projectItems: string[] = [];
  let match;
  while ((match = itemRegex.exec(projectsText)) !== null) {
    const item = match[1].trim();
    if (item) projectItems.push(item);
  }

  // Función para asignar emoji basado en palabras clave dentro del título
  const getEmoji = (text: string) => {
    const titleMatch = text.match(/\\textbf\{(.+?)\}/);
    if (!titleMatch) return '📌';
    const title = titleMatch[1].toLowerCase();

    if (title.includes('hr') || title.includes('performance')) return '👥';
    if (title.includes('financial') || title.includes('forecast')) return '📈';
    if (title.includes('facial') || title.includes('recognition')) return '🧑‍🤝‍🧑';
    if (title.includes('recommendation')) return '⭐';
    if (title.includes('chatbot')) return '🤖';
    if (title.includes('data')) return '📊';
    if (title.includes('travel')) return '✈️';
    if (title.includes('collaboration') || title.includes('team')) return '🤝';
    return '📌'; // default
  };

  // Convertir LaTeX \textbf{} en <strong> y limpiar caracteres
  const latexToHtml = (text: string) =>
    text
      .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
      .replace(/\\&/g, '&');

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Projects</h1>
      <div style={{ marginTop: '1.5rem' }}>
        {projectItems.map((item, idx) => (
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
            <span style={{ fontSize: '18px' }}>{getEmoji(item)}</span>
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
