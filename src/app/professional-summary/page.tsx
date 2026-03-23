import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function ProfessionalSummary() {
  const cvText = await fetchCvSource();

  // Extraemos solo la sección Professional Summary
  const professionalSummary = extractSection(cvText, [
    'Professional Summary',
    'Summary',
    'Profile',
  ]);

  if (professionalSummary === 'Section not found') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Professional Summary</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Professional Summary</h1>

      <div
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          background: '#f5f5f5',
          padding: '1rem',
          marginTop: '1rem',
        }}
      >
        {professionalSummary}
      </div>
    </main>
  );
}
