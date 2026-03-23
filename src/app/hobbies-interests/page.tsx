import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function HobbiesInterests() {
  const cvText = await fetchCvSource();

  // Extraer la sección
  let hobbiesText = extractSection(cvText, [
    'Hobbies & Interests',
    'Hobbies and Interests',
    'Interests',
  ]);

  if (hobbiesText === 'Section not found') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Hobbies & Interests</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  // Limpiar saltos, espacios y comandos innecesarios
  hobbiesText = hobbiesText
    .replace(/\\\\/g, '')
    .replace(/\n/g, ' ')
    .replace(/\\enddocument/g, '') // eliminar \end{document}
    .trim();

  // Separar hobbies por comas fuera de paréntesis
  const hobbies = hobbiesText
    .split(/,(?![^(]*\))/)  // comas fuera de paréntesis
    .map(h => h.trim())
    .filter(h => h.length > 0);

  // Diccionario de iconos según palabras clave
  const iconMap: { keyword: RegExp; icon: string }[] = [
    { keyword: /read|learning|book/i, icon: '📚' },
    { keyword: /hiking|outdoor|swimming|adventure/i, icon: '🏔️' },
    { keyword: /travel/i, icon: '🌍' },
    { keyword: /tech|innovation/i, icon: '💻' },
    { keyword: /language/i, icon: '🗣️' },
    { keyword: /network/i, icon: '🤝' },
    { keyword: /invest/i, icon: '📈' },
    { keyword: /volunteer|church|camp/i, icon: '❤️' },
  ];

  const getIcon = (text: string) => {
    const match = iconMap.find(i => i.keyword.test(text));
    return match ? match.icon : '⭐';
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Hobbies & Interests</h1>

      <div style={{ marginTop: '1.5rem' }}>
        {hobbies.map((hobby, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
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
