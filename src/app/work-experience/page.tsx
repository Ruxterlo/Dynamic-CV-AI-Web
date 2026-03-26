import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

type WorkBlock = {
  date: string;
  role: string;
  company: string;
  location: string;
  bullets: string[];
};

export default async function WorkExperience() {
  const cvText = await fetchCvSource();

  // 1️⃣ Extraer sección
  let work = extractSection(cvText, ['Work Experience', 'Professional Experience', 'Experience']);

  if (work === 'Section not found') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Work Experience</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  // 2️⃣ Limpiar símbolos innecesarios (NO eliminar saltos de línea)
  work = work.replace(/<(\/?strong).*?>/g, ''); // eliminar tags excepto strong
  work = work.replace(/\$/g, ''); // eliminar $

  // 3️⃣ Normalizar líneas
  const lines = work
    .split('\n')
    .map(line => line.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 4️⃣ Construir bloques de experiencia
  const workBlocks: WorkBlock[] = [];
  let currentBlock: WorkBlock | null = null;

  lines.forEach(line => {
    // 👉 Encabezado del trabajo
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());

      currentBlock = {
        date: parts[0].replace(/<\/?strong>/g, ''),
        role: parts[1] || '',
        company: parts[2] || '',
        location: parts[3] || '',
        bullets: [],
      };

      workBlocks.push(currentBlock);
      return;
    }

    // 👉 Cada línea posterior = UN bullet
    if (currentBlock) {
      currentBlock.bullets.push(line);
    }
  });

  // 5️⃣ Render timeline vertical
  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Work Experience</h1>

      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Línea vertical */}
        <div
          style={{
            position: 'absolute',
            left: '165px',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#333',
          }}
        />

        {workBlocks.map((job, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              marginBottom: '2.5rem',
              position: 'relative',
            }}
          >
            {/* Fecha */}
            <div
              style={{
                width: '140px',
                textAlign: 'right',
                paddingRight: '2rem',
                whiteSpace: 'nowrap',
              }}
            >
              <strong>{job.date}</strong>
            </div>

            {/* Punto del timeline */}
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#333',
                borderRadius: '50%',
                marginTop: '6px',
                marginRight: '2.25rem',
                zIndex: 1,
              }}
            />

            {/* Contenido */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{job.role}</div>
              <div>{job.company}</div>
              <div style={{ fontStyle: 'italic', fontSize: '13px' }}>
                {job.location}
              </div>

              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                {job.bullets.map((bullet, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
