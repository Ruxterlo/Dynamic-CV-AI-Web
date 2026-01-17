import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to My Dynamic CV</h1>
      <p>Select a section to view:</p>

      <ul>
        <li><Link href="/professional-summary">Professional Summary</Link></li>
        <li><Link href="/technology-skills">Technology Skills</Link></li>
        <li><Link href="/education">Education</Link></li>
        <li><Link href="/work-experience">Work Experience</Link></li>
        <li><Link href="/projects">Projects</Link></li>
        <li><Link href="/languages">Languages</Link></li>
        <li><Link href="/flexibility-mobility">Flexibility & Mobility</Link></li>
        <li><Link href="/hobbies-interests">Hobbies & Interests</Link></li>
        <li><Link href="/clients-companies">Clients & Companies</Link></li>
        <li><Link href="/portfolio-profiles">Portfolio & Professional Profiles</Link></li>
      </ul>
    </main>
  );
}
