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

  // 1️⃣ Extract section
  let work = extractSection(cvText, ['Work Experience', 'Professional Experience', 'Experience']);

  if (work === 'Section not found') {
    return (
      <main className="sectionPageMain">
        <h1>Work Experience</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  // 2️⃣ Clean unnecessary symbols (do not remove line breaks)
  work = work.replace(/<(\/??strong).*?>/g, ''); // remove tags except strong
  work = work.replace(/\$/g, ''); // remove $

  // 3️⃣ Normalize lines
  const lines = work
    .split('\n')
    .map(line => line.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 4️⃣ Build experience blocks
  const workBlocks: WorkBlock[] = [];
  let currentBlock: WorkBlock | null = null;

  lines.forEach(line => {
    // 👉 Work header
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

    // 👉 Each subsequent line = one bullet
    if (currentBlock) {
      currentBlock.bullets.push(line);
    }
  });

  // 5️⃣ Render vertical timeline
  return (
    <main className="sectionPageMain">
      <h1>Work Experience</h1>

      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Vertical line */}
        <div
          className="sectionTimelineTrack"
          style={{
            position: 'absolute',
            left: '180px',
            top: 0,
            bottom: 0,
            width: '2px',
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
            {/* Date */}
            <div
              style={{
                width: '145px',
                textAlign: 'right',
                paddingRight: '10rem',
                whiteSpace: 'nowrap',
              }}
            >
              <strong>{job.date}</strong>
            </div>

            {/* Timeline dot */}
            <div
              className="sectionTimelineDot"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                marginTop: '6px',
                marginRight: '1.5rem',
                zIndex: 1,
              }}
            />

            {/* Content */}
			<div className="sectionGlassCard" style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{job.role}</div>
              <div>{job.company}</div>
              <div className="sectionMutedText" style={{ fontStyle: 'italic', fontSize: '13px' }}>
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
