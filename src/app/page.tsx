import Link from 'next/link';
import { fetchCvSource } from '@/lib/cvSource';
import { extractSection } from '@/lib/latexParser';
import ProtectedImage from '@/components/ProtectedImage';

const CV_SOURCE_URL = process.env.CV_SOURCE_URL?.trim() || '';

type RouteItem = {
  href: string;
  label: string;
};

const SECTION_ROUTE_MAP: Record<string, string> = {
  'Professional Summary': '/professional-summary',
  Summary: '/professional-summary',
  Profile: '/professional-summary',
  'Technology Skills': '/technology-skills',
  'Technical Skills': '/technology-skills',
  Skills: '/technology-skills',
  Education: '/education',
  'Academic Background': '/education',
  'Work Experience': '/work-experience',
  'Professional Experience': '/work-experience',
  Experience: '/work-experience',
  'Recent Projects': '/projects',
  Projects: '/projects',
  Languages: '/languages',
  'Language Skills': '/languages',
  'Flexibility & Mobility': '/flexibility-mobility',
  'Flexibility and Mobility': '/flexibility-mobility',
  Mobility: '/flexibility-mobility',
  'Hobbies & Interests': '/hobbies-interests',
  'Hobbies and Interests': '/hobbies-interests',
  Interests: '/hobbies-interests',
  'Clients & Companies': '/clients-companies',
  'Clients and Companies': '/clients-companies',
  Clients: '/clients-companies',
  Companies: '/clients-companies',
  'Portfolio & Professional Profiles': '/portfolio-profiles',
  'Portfolio and Professional Profiles': '/portfolio-profiles',
  'Profiles & Portfolio': '/portfolio-profiles',
  'Professional Profiles': '/portfolio-profiles',
  Portfolio: '/portfolio-profiles',
};

const normalizeLatexText = (value: string) =>
  value.replace(/\\&/g, '&').replace(/\\_/g, '_').replace(/\s+/g, ' ').trim();

const normalizeSectionKey = (value: string) =>
  normalizeLatexText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const SECTION_ROUTE_BY_KEY = Object.fromEntries(
  Object.entries(SECTION_ROUTE_MAP).map(([label, href]) => [normalizeSectionKey(label), href])
) as Record<string, string>;

const extractHeader = (cvText: string) => {
  const firstName = cvText.match(/\\newcommand\{\\FirstName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';
  const middleName = cvText.match(/\\newcommand\{\\MiddleName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';
  const lastName = cvText.match(/\\newcommand\{\\LastName\}\{([^}]+)\}/)?.[1]?.trim() ?? '';

  const fallbackName =
    cvText
      .match(/\{\\Huge[\s\S]*?\{([^}]*)\}\s*\}/)?.[1]
      ?.replace(/\\MakeUppercase\s*/g, '')
      ?.trim() ?? '';

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim() || normalizeLatexText(fallbackName);

  const roleCandidates = [
    cvText.match(/\{\\Large\s+([\s\S]*?)\}\s*\\\\\[[^\]]*\]/)?.[1],
    cvText.match(/\{\\Large\s+([\s\S]*?)\}\s*\\\\/)?.[1],
    cvText.match(/\\newcommand\{\\(?:Role|Title|Position)\}\{([^}]*)\}/i)?.[1],
    cvText.match(/\\begin\{center\}[\s\S]*?\{\\Huge[\s\S]*?\}\s*\\\\\[[^\]]*\]\s*\{\\Large\s+([\s\S]*?)\}\s*\\\\/)
      ?. [1],
  ];

  const roleRaw = roleCandidates.find(candidate => !!candidate && candidate.trim().length > 0) ?? '';
  const role = normalizeLatexText(roleRaw.replace(/\\textbf\{([^}]*)\}/g, '$1'));

  return {
    fullName: fullName || 'Professional CV',
    role: role || 'Professional Profile',
  };
};

const extractSummaryIntro = (cvText: string) => {
  const summaryText = extractSection(cvText, ['Professional Summary', 'Summary', 'Profile']);
  if (summaryText === 'Section not found') {
    return 'Select a section to explore my background, experience, and projects.';
  }

  const normalizedSummary = normalizeLatexText(summaryText);

  const firstSentence = normalizedSummary.match(/^(.{60,220}?[.!?])(?:\s|$)/)?.[1]?.trim();
  return firstSentence || normalizedSummary.slice(0, 220).trim() || 'Select a section to explore my background, experience, and projects.';
};

const normalizeLatexAssetPath = (assetPath: string): string =>
  assetPath
    .replace(/\\%/g, '%')
    .replace(/%/g, ' ')
    .replace(/\\ /g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const resolveCvAssetUrl = (assetPath: string): string | null => {
  const cleanedPath = normalizeLatexAssetPath(assetPath);
  if (!cleanedPath) {
    return null;
  }

  const encodedPath = encodeURI(cleanedPath);

  try {
    return new URL(encodedPath).toString();
  } catch {
    if (!CV_SOURCE_URL) {
      return null;
    }

    try {
      return new URL(encodedPath, CV_SOURCE_URL).toString();
    } catch {
      return null;
    }
  }
};

const extractProfileImageUrl = (cvText: string): string | null => {
  const includeGraphicsRegex = /^\s*%?\s*\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/gm;
  const matches = [...cvText.matchAll(includeGraphicsRegex)]
    .map(match => match[1]?.trim())
    .filter((value): value is string => !!value && value.length > 0);

  if (matches.length === 0) {
    return null;
  }

  const preferred =
    matches.find(path => /photo|profile|avatar|headshot/i.test(path)) ??
    matches[0];

  return resolveCvAssetUrl(preferred);
};

const extractRoutes = (cvText: string): RouteItem[] => {
  const sectionRegex = /\\(?:cvsection|section\*?)\{([^}]*)\}(?:\[[^\]]*\])?/g;
  const seen = new Set<string>();
  const routeItems: RouteItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(cvText)) !== null) {
    const normalizedSection = normalizeLatexText(match[1]);

    if (!normalizedSection || seen.has(normalizedSection)) {
      continue;
    }

    const href = SECTION_ROUTE_BY_KEY[normalizeSectionKey(normalizedSection)];
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

type IconRule = {
  icon: string;
  keywords: string[];
};

const ICON_RULES: IconRule[] = [
  { icon: '🧾', keywords: ['summary', 'profile', 'resumen', 'perfil', 'about'] },
  { icon: '🛠️', keywords: ['technology', 'tech', 'skills', 'skill', 'herramienta', 'competencia'] },
  { icon: '🎓', keywords: ['education', 'academic', 'study', 'degree', 'formacion', 'educacion'] },
  { icon: '💼', keywords: ['work', 'experience', 'career', 'employment', 'job', 'empleo', 'laboral'] },
  { icon: '🚀', keywords: ['project', 'projects', 'portfolio', 'initiative', 'proyecto'] },
  { icon: '🗣️', keywords: ['language', 'languages', 'idioma', 'idiomas'] },
  { icon: '🌍', keywords: ['mobility', 'travel', 'relocation', 'remote', 'movilidad', 'viaje'] },
  { icon: '🎯', keywords: ['hobbies', 'interests', 'hobby', 'interes', 'intereses'] },
  { icon: '🤝', keywords: ['clients', 'companies', 'customer', 'partners', 'clientes', 'companias'] },
  { icon: '🔗', keywords: ['link', 'links', 'website', 'web', 'profile', 'profiles', 'social'] },
  { icon: '🏅', keywords: ['certification', 'certifications', 'award', 'awards', 'certificacion'] },
];

const scoreRule = (normalizedLabel: string, rule: IconRule) => {
  let score = 0;

  rule.keywords.forEach(keyword => {
    if (normalizedLabel.includes(keyword)) {
      score += keyword.length;
    }
  });

  return score;
};

const getRouteIcon = (label: string) => {
  const normalized = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let bestIcon = '📁';
  let bestScore = 0;

  ICON_RULES.forEach(rule => {
    const score = scoreRule(normalized, rule);
    if (score > bestScore) {
      bestScore = score;
      bestIcon = rule.icon;
    }
  });

  return bestIcon;
};

export default async function Home() {
  const cvText = await fetchCvSource();
  const header = extractHeader(cvText);
  const intro = extractSummaryIntro(cvText);
  const routes = extractRoutes(cvText);
  const profileImageUrl = extractProfileImageUrl(cvText);

  return (
    <main>
      <section className="homeHero">
        <div className="homeHeroText">
          <p className="homeHeroBadge">Dynamic CV</p>
          <h1>{header.fullName}</h1>
          <p className="homeHeroRole">{header.role}</p>
          <p>{intro}</p>
        </div>

        {profileImageUrl && (
          <div className="homeHeroMedia" aria-hidden="true">
            <ProtectedImage
              src={profileImageUrl}
              alt={`${header.fullName} profile photo`}
              className="homeHeroImage"
            />
          </div>
        )}
      </section>

      <ul className="homeGrid">
        {routes.map(route => (
          <li key={route.href}>
            <Link href={route.href} className="homeCard">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <span aria-hidden="true">{getRouteIcon(route.label)}</span>
                <span>{route.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
