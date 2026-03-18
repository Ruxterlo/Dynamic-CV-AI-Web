'use client';

type Item = {
  date: string;        // ejemplo: "2011 - 2014"
  title: string;       // escuela + grado
  description?: string;
};

export default function EducationTimeline({ items }: { items: Item[] }) {
  if (!items || items.length === 0) return null;

  // 1️⃣ Extraer años de cada bloque
  const years = items.flatMap(item => {
    const match = item.date.match(/(\d{4})/g);
    return match ? match.map(Number) : [];
  });

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const totalYears = maxYear - minYear || 1; // evitar división por 0

  return (
    <div style={{ position: 'relative', marginTop: '3rem', height: '120px' }}>
      {/* Línea horizontal */}
      <div
        style={{
          position: 'absolute',
          top: '18px',
          left: 0,
          right: 0,
          height: '2px',
          background: '#ccc',
          zIndex: 0
        }}
      />

      {items.map((item, idx) => {
        // Obtener primer año del bloque
        const match = item.date.match(/(\d{4})/);
        const startYear = match ? Number(match[1]) : minYear;

        // calcular posición proporcional
        const leftPercent = ((startYear - minYear) / totalYears) * 100;

        return (
          <div
            key={idx}
            className="timeline-item"
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              textAlign: 'center',
              transform: 'translateX(-50%)', // centrar respecto al punto
              paddingBottom: '4rem'
            }}
          >
            {/* Punto */}
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#333',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
              }}
            />

            {/* Fecha y título */}
            <div
              className="timeline-content"
              style={{
                marginTop: '0.75rem'
              }}
            >
              <div style={{ fontSize: '14px' }}>{item.date}</div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginTop: '0.5rem',
                  lineHeight: 1.3
                }}
              >
                {item.title}
              </div>

              {/* Descripción como lista */}
              {item.description && (
                <ul
                  style={{
                    marginTop: '0.5rem',
                    textAlign: 'left',
                    paddingLeft: '1rem',
                    fontSize: '13px',
                    listStyleType: 'disc'
                  }}
                >
                  {item.description.split('\n').map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
