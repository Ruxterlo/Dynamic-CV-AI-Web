import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function Projects() {
  const cvText = await fetchCvSource();

  const projectsText = extractSection(cvText, ['Recent Projects', 'Projects', 'Project Experience']);

  if (projectsText === 'Section not found') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Projects</h1>
        <p>Projects section not found.</p>
      </main>
    );
  }

  const projectItems = projectsText
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);

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
