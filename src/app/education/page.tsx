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

  // 1️⃣ Extract section
  let education = extractSection(cvText, ['Education', 'Academic Background', 'Academic Formation']);

  if (education === 'Section not found') {
    return (
      <main className="sectionPageMain">
        <h1>Education</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  // 2️⃣ Clean unnecessary symbols (keep line breaks)
  education = education.replace(/<(?!\/??strong).*?>/g, ''); // remove tags except strong
  education = education.replace(/\$/g, ''); // remove $

  // 3️⃣ Normalize lines
  const lines = education
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 4️⃣ Build blocks
  const educationBlocks: EducationBlock[] = [];
  let currentBlock: EducationBlock | null = null;

  lines.forEach(line => {
    // 👉 Education header
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

    // 👉 Descriptive line (Key Modules, etc.)
    if (currentBlock) {
      currentBlock.keymodules.push(line);
    }
  });

  // 5️⃣ Render vertical timeline (same structure as Work)
  return (
    <main className="sectionPageMain">
      <h1>Education</h1>

      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Vertical line */}
        <div
          className="sectionTimelineTrack"
          style={{
            position: 'absolute',
            left: '125px',
            top: 0,
            bottom: 0,
            width: '2px',
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
            {/* Date */}
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
				  <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
				  <div>{edu.school}</div>
				  <div className="sectionMutedText" style={{ fontStyle: 'italic', fontSize: '13px' }}>{edu.location}</div>

				  {edu.keymodules.length > 0 && (
					<ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
					  {edu.keymodules.map((desc, i) => (
						<li
						  key={i}
						  style={{ marginBottom: '0.4rem' }}
              dangerouslySetInnerHTML={{ __html: desc }} // if desc contains HTML
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
