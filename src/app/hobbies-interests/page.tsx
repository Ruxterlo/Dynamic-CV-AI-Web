import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function HobbiesInterests() {
  const cvText = await fetchCvSource();

  // Extract the section
  let hobbiesText = extractSection(cvText, [
    'Hobbies & Interests',
    'Hobbies and Interests',
    'Interests',
  ]);

  if (hobbiesText === 'Section not found') {
    return (
      <main className="sectionPageMain">
        <h1>Hobbies & Interests</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  // Clean line breaks, spaces, and unnecessary commands
  hobbiesText = hobbiesText
    .replace(/\\\\/g, '')
    .replace(/\n/g, ' ')
    .replace(/\\enddocument/g, '') // remove \end{document}
    .trim();

  // Split hobbies by commas outside parentheses
  const hobbies = hobbiesText
    .split(/,(?![^(]*\))/)  // commas outside parentheses
    .map(h => h.trim())
    .filter(h => h.length > 0);

  // Icon dictionary by keyword
  const iconMap: { keyword: RegExp; icon: string }[] = [
    { keyword: /read|book/i, icon: '📚' },
    { keyword: /lifelong learning/i, icon: '🧠' },
    { keyword: /Working out/i, icon: '💪' },
    { keyword: /cooking/i, icon: '👨‍🍳' },
    { keyword: /teaching/i, icon: '👨‍🏫' },
    { keyword: /hiking|outdoor|swimming|adventure/i, icon: '🏔️' },
    { keyword: /travel/i, icon: '🌍' },
    { keyword: /tech|innovation/i, icon: '💻' },
    { keyword: /language/i, icon: '🗣️' },
    { keyword: /network/i, icon: '🤝' },
    { keyword: /invest/i, icon: '📈' },
    { keyword: /music/i, icon: '🎼🎻' },
    { keyword: /arts|theater/i, icon: '🎭' },
    { keyword: /cinema|movie|film|tv series/i, icon: '🎬' },
    { keyword: /volunteer|church|camp/i, icon: '🤲' },
  ];

  const getIcon = (text: string) => {
    const match = iconMap.find(i => i.keyword.test(text));
    return match ? match.icon : '⭐';
  };

  return (
    <main className="sectionPageMain">
      <h1>Hobbies & Interests</h1>

      <div className="sectionPageStack">
        {hobbies.map((hobby, idx) => (
          <div
            key={idx}
            className="sectionGlassCard"
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}
          >
            <span style={{ fontSize: '18px' }}>{getIcon(hobby)}</span>
            <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{hobby}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
