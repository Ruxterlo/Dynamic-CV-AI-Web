import Link from 'next/link';
import { fetchCvSource } from '@/lib/cvSource';

type RouteItem = {
  href: string;
  label: string;
};

const SECTION_ROUTE_MAP: Record<string, string> = {
  'Professional Summary': '/professional-summary',
  'Technology Skills': '/technology-skills',
  Education: '/education',
  'Work Experience': '/work-experience',
  'Recent Projects': '/projects',
  Languages: '/languages',
  'Flexibility & Mobility': '/flexibility-mobility',
  'Hobbies & Interests': '/hobbies-interests',
  'Clients & Companies': '/clients-companies',
  'Portfolio & Professional Profiles': '/portfolio-profiles',
};

const normalizeLatexText = (value: string) =>
  value.replace(/\\&/g, '&').replace(/\\_/g, '_').replace(/\s+/g, ' ').trim();

const extractHeader = (cvText: string) => {
  const firstName = cvText.match(/\\newcommand\{\\FirstName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';
  const middleName = cvText.match(/\\newcommand\{\\MiddleName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';
  const lastName = cvText.match(/\\newcommand\{\\LastName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

  const roleRaw = cvText.match(/\{\\Large\s+([^}]+)\}\s*\\\[/)?.[1]?.trim() ?? '';
  const role = normalizeLatexText(roleRaw);

  return {
    fullName: fullName || 'Professional CV',
    role: role || 'Professional Profile',
  };
};

const extractSummaryIntro = (cvText: string) => {
  const summaryMatch = cvText.match(/\\cvsection\{Professional Summary\}([\s\S]*?)(?=\\cvsection|$)/);
  if (!summaryMatch) {
    return 'Select a section to explore my background, experience, and projects.';
  }

  const summaryText = normalizeLatexText(
    summaryMatch[1]
      .replace(/%.*$/gm, '')
      .replace(/\\vspace\{[^}]*\}/g, '')
      .replace(/\\textbf\{([^}]*)\}/g, '$1')
  );

  const firstSentence = summaryText.match(/^(.{60,220}?[.!?])(?:\s|$)/)?.[1]?.trim();
  return firstSentence || summaryText.slice(0, 220).trim() || 'Select a section to explore my background, experience, and projects.';
};

const extractRoutes = (cvText: string): RouteItem[] => {
  const sectionRegex = /\\cvsection\{([^}]*)\}(?:\[[^\]]*\])?/g;
  const seen = new Set<string>();
  const routeItems: RouteItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(cvText)) !== null) {
    const normalizedSection = normalizeLatexText(match[1]);

    if (!normalizedSection || seen.has(normalizedSection)) {
      continue;
    }

    const href = SECTION_ROUTE_MAP[normalizedSection];
    if (!href) {
      continue;
    }

    seen.add(normalizedSection);
    routeItems.push({ href, label: normalizedSection === 'Recent Projects' ? 'Projects' : normalizedSection });
  }

  if (routeItems.length > 0) {
    return routeItems;
  }

  return [
    { href: '/professional-summary', label: 'Professional Summary' },
    { href: '/technology-skills', label: 'Technology Skills' },
    { href: '/education', label: 'Education' },
    { href: '/work-experience', label: 'Work Experience' },
    { href: '/projects', label: 'Projects' },
    { href: '/languages', label: 'Languages' },
    { href: '/flexibility-mobility', label: 'Flexibility & Mobility' },
    { href: '/hobbies-interests', label: 'Hobbies & Interests' },
    { href: '/clients-companies', label: 'Clients & Companies' },
    { href: '/portfolio-profiles', label: 'Portfolio & Professional Profiles' },
  ];
};

export default async function Home() {
  const cvText = await fetchCvSource();
  const header = extractHeader(cvText);
  const intro = extractSummaryIntro(cvText);
  const routes = extractRoutes(cvText);

  return (
    <main>
      <section className="homeHero">
        <p className="homeHeroBadge">Dynamic CV</p>
        <h1>{header.fullName}</h1>
        <p className="homeHeroRole">{header.role}</p>
        <p>{intro}</p>
      </section>

      <ul className="homeGrid">
        {routes.map(route => (
          <li key={route.href}>
            <Link href={route.href} className="homeCard">
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
