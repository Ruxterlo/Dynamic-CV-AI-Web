import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';

export default async function ProfessionalSummary() {
  const cvText = await fetchCvSource();

  // Extract only the Professional Summary section
  const professionalSummary = extractSection(cvText, [
    'Professional Summary',
    'Summary',
    'Profile',
  ]);

  if (professionalSummary === 'Section not found') {
    return (
      <main className="sectionPageMain">
        <h1>Professional Summary</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  return (
    <main className="sectionPageMain">
      <h1>Professional Summary</h1>

      <div
        className="sectionGlassCard"
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          marginTop: '1rem',
        }}
      >
        {professionalSummary}
      </div>
    </main>
  );
}
