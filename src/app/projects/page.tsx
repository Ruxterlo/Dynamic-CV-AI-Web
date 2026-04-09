import { fetchCvSource } from '@/lib/cvSource';
import { extractRawSection } from '@/lib/latexParser';

type ProjectItem = {
  emoji: string;
  html: string;
};

const extractProjectTitle = (latexLine: string): string => {
  const titleMatch = latexLine.match(/\\textbf\s*\{\s*([^}]+)\s*\}/);
  if (titleMatch?.[1]) {
    return titleMatch[1].toLowerCase();
  }
  return '';
};

const getProjectEmoji = (latexLine: string): string => {
  const title = extractProjectTitle(latexLine);
  if (!title) return '📌';

  if (title.includes('hr') || title.includes('performance')) return '👥';
  if (title.includes('financial') || title.includes('forecast')) return '📈';
  if (title.includes('facial') || title.includes('recognition')) return '🧑‍🤝‍🧑';
  if (title.includes('recommendation')) return '⭐';
  if (title.includes('chatbot')) return '🤖';
  if (title.includes('data')) return '📊';
  if (title.includes('travel')) return '✈️';
  if (title.includes('collaboration') || title.includes('team')) return '🤝';
  return '📌';
};

const latexToHtml = (text: string): string =>
  text
    .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>')
    .replace(/\\emph\s*\{\s*(.+?)\s*\}/g, '<em>$1</em>')
    .replace(/\\&/g, '&')
    .replace(/\s*-\s*-\s*/g, '<br />')
    .replace(/\\\\/g, '<br />')
    .replace(/\s+/g, ' ')
    .trim();

const extractProjectItems = (rawSection: string): ProjectItem[] => {
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
      emoji: getProjectEmoji(item),
      html: latexToHtml(item),
    }))
    .filter(item => item.html.length > 0);
};

export default async function Projects() {
  const cvText = await fetchCvSource();

  const projectsRaw = extractRawSection(cvText, ['Recent Projects', 'Projects', 'Project Experience']);

  if (!projectsRaw) {
    return (
      <main className="sectionPageMain">
        <h1>Projects</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  const projectItems = extractProjectItems(projectsRaw);

  return (
    <main className="sectionPageMain">
      <h1>Projects</h1>
      <div className="sectionPageStack">
        {projectItems.map((item, idx) => (
          <div
            key={idx}
            className="sectionGlassCard"
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.emoji}</span>
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
