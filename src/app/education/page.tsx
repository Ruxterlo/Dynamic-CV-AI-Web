import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

type EducationBlock = {
  date: string;
  degree: string;
  school: string;
  location: string;
  keymodules: string[];
};

export default async function Education() {
  const cvText = await fetchCvSource();

  // 1️⃣ Extraer sección
  let education = extractSection(cvText, 'Education');

  // 2️⃣ Limpiar símbolos innecesarios (mantener saltos)
  education = education.replace(/<(?!\/?strong).*?>/g, ''); // quitar tags excepto strong
  education = education.replace(/\$/g, ''); // eliminar $

  // 3️⃣ Normalizar líneas
  const lines = education
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 4️⃣ Construir bloques
  const educationBlocks: EducationBlock[] = [];
  let currentBlock: EducationBlock | null = null;

  lines.forEach(line => {
    // 👉 Encabezado de educación
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());

      currentBlock = {
        date: parts[0].replace(/<\/?strong>/g, ''),
        degree: parts[1].replace(/<\/?strong>/g, ''),
        school: parts[2].replace(/<\/?strong>/g, '')|| '',
        location: parts[3] || '',
        keymodules: [],
      };

      educationBlocks.push(currentBlock);
      return;
    }

    // 👉 Línea descriptiva (Key Modules, etc.)
    if (currentBlock) {
      currentBlock.keymodules.push(line);
    }
  });

  // 5️⃣ Render timeline vertical (MISMA ESTRUCTURA QUE WORK)
  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Education</h1>

      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Línea vertical */}
        <div
          style={{
            position: 'absolute',
            left: '125px',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#333',
          }}
        />

        {educationBlocks.map((edu, idx) => (
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
                width: '100px',
                textAlign: 'right',
                paddingRight: '2rem',
                whiteSpace: 'nowrap',
              }}
            >
              <strong>{edu.date}</strong>
            </div>

            {/* Punto del timeline */}
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#333',
                borderRadius: '50%',
                marginTop: '6px',
                marginRight: '1.5rem',
                zIndex: 1,
              }}
            />
				{/* Contenido */}
				<div style={{ flex: 1 }}>
				  <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
				  <div>{edu.school}</div>
				  <div style={{ fontStyle: 'italic', fontSize: '13px' }}>{edu.location}</div>

				  {edu.keymodules.length > 0 && (
					<ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
					  {edu.keymodules.map((desc, i) => (
						<li
						  key={i}
						  style={{ marginBottom: '0.4rem' }}
						  dangerouslySetInnerHTML={{ __html: desc }} // si desc tiene HTML
						/>
					  ))}
					</ul>
				  )}
				</div>
          </div>
        ))}
      </div>
    </main>
  );
}
