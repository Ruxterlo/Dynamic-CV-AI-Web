import Link from 'next/link';
import { fetchCvSource } from '@/lib/cvSource';
import { extractRawSection, extractSection } from '@/lib/latexParser';
import ProtectedImage from '@/components/ProtectedImage';
import JobCannonInsights from '@/components/JobCannonInsights';
import StoryFlow, { PREVIEW_MAX_LINES } from '@/components/StoryFlow';
import type { EducationTimelineItem } from '@/components/EducationTimeline';
import type { WorkTimelineItem } from '@/components/WorkTimeline';

export const dynamic = 'force-dynamic';

type IconProps = {
  className?: string;
};

const CV_SOURCE_URL = process.env.CV_SOURCE_URL?.trim() || '';
const INTRO_NEURAL_BACKGROUND =
  'https://muyinteresante.okdiario.com/wp-content/uploads/sites/5/2023/08/09/64d34711471cc.jpeg';

type RouteItem = {
  href: string;
  label: string;
};

type HeaderContact = {
  href: string;
  label: string;
};

type HeaderContacts = {
  email: HeaderContact | null;
  whatsapp: HeaderContact | null;
  location: HeaderContact | null;
  countryName: string;
  countryCode: string;
  countryFlag: string;
};

type StoryChapter = {
  id: string;
  href: string;
  title: string;
  previewLines: string[];
  hasOverflow: boolean;
  educationTimelineItems?: EducationTimelineItem[];
  educationTimelineStartYear?: number;
  educationTimelineEndYear?: number;
  workTimelineItems?: WorkTimelineItem[];
  workTimelineStartYear?: number;
  workTimelineEndYear?: number;
};

type PortfolioHighlight = {
  eyebrow: string;
  title: string;
  description: string;
};

type PortfolioProject = {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
};

type BigFiveTrait = {
  name: string;
  score: number;
  note: string;
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
  'Clients & Partners': '/clients-companies',
  'Clients and Companies': '/clients-companies',
  Clients: '/clients-companies',
  Companies: '/clients-companies',
  'Portfolio & Professional Profiles': '/portfolio-profiles',
  'Portfolio and Professional Profiles': '/portfolio-profiles',
  'Profiles & Portfolio': '/portfolio-profiles',
  'Professional Profiles': '/portfolio-profiles',
  Portfolio: '/portfolio-profiles',
};

const getSectionAliasesForRoute = (href: string): string[] => {
  const aliases: string[] = [];
  for (const [label, route] of Object.entries(SECTION_ROUTE_MAP)) {
    if (route === href && !aliases.includes(label)) {
      aliases.push(label);
    }
  }
  return aliases.length > 0 ? aliases : [href.slice(1).replace(/-/g, ' ')];
};

const normalizeLatexText = (value: string) =>
  value.replace(/\\&/g, '&').replace(/\\_/g, '_').replace(/\s+/g, ' ').trim();

const getCurrentYear = () => new Date().getFullYear();

const extractBirthYear = (cvText: string): number | null => {
  const candidates = [
    cvText.match(/\\newcommand\{\\birthyear\}\{(\d{4})\}/i)?.[1],
    cvText.match(/\\newcommand\{\\BirthYear\}\{(\d{4})\}/)?.[1],
    cvText.match(/\\birthyear\s*[:=]\s*(\d{4})/i)?.[1],
    cvText.match(/\\BirthYear\s*[:=]\s*(\d{4})/)?.[1],
  ];

  const yearText = candidates.find(value => !!value);
  if (!yearText) {
    return null;
  }

  const parsed = Number.parseInt(yearText, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeCountryKey = (value: string) =>
  normalizeLatexText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const COUNTRY_CODE_BY_NAME: Record<string, string> = {
  ireland: 'IE',
  irlanda: 'IE',
  spain: 'ES',
  espana: 'ES',
  germany: 'DE',
  alemania: 'DE',
  france: 'FR',
  francia: 'FR',
  italy: 'IT',
  italia: 'IT',
  portugal: 'PT',
  uk: 'GB',
  'united kingdom': 'GB',
  'reino unido': 'GB',
  usa: 'US',
  'united states': 'US',
  'estados unidos': 'US',
};

const countryCodeToFlag = (countryCode: string): string => {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return '🌍';
  }

  const regionalIndicatorOffset = 127397;
  return String.fromCodePoint(code.charCodeAt(0) + regionalIndicatorOffset, code.charCodeAt(1) + regionalIndicatorOffset);
};

const LANGUAGE_CODE_BY_NAME: Record<string, string> = {
  english: 'GB',
  spanish: 'ES',
  portuguese: 'BR',
  italian: 'IT',
  french: 'FR',
  german: 'DE',
  chinese: 'CN',
  japanese: 'JP',
  korean: 'KR',
  arabic: 'SA',
  russian: 'RU',
  hindi: 'IN',
  bengali: 'BD',
  urdu: 'PK',
  turkish: 'TR',
  vietnamese: 'VN',
  thai: 'TH',
  persian: 'IR',
  indonesian: 'ID',
  malay: 'MY',
  swahili: 'KE',
  dutch: 'NL',
  greek: 'GR',
  polish: 'PL',
  ukrainian: 'UA',
  hebrew: 'IL',
  finnish: 'FI',
  norwegian: 'NO',
  swedish: 'SE',
  danish: 'DK',
  czech: 'CZ',
  hungarian: 'HU',
  romanian: 'RO',
  slovak: 'SK',
  bulgarian: 'BG',
  serbian: 'RS',
  croatian: 'HR',
  bosnian: 'BA',
  albanian: 'AL',
  lithuanian: 'LT',
  latvian: 'LV',
  estonian: 'EE',
  icelandic: 'IS',
  malagasy: 'MG',
  filipino: 'PH',
  tamil: 'LK',
  telugu: 'IN',
  kannada: 'IN',
  marathi: 'IN',
  gujarati: 'IN',
  punjabi: 'IN',
  sinhalese: 'LK',
  urhobo: 'NG',
  yoruba: 'NG',
  igbo: 'NG',
  amharic: 'ET',
  somali: 'SO',
  nepali: 'NP',
  lao: 'LA',
  khmer: 'KH',
  mongolian: 'MN',
  georgian: 'GE',
  armenian: 'AM',
  azerbaijani: 'AZ',
  kazakh: 'KZ',
  uzbek: 'UZ',
  turkmen: 'TM',
  tajik: 'TJ',
  kyrgyz: 'KG',
  tibetan: 'CN',
  malayalam: 'IN',
};

const MOBILITY_ICON_BY_FA_NAME: Record<string, string> = {
  passport: '🛂',
  idcard: '🪪',
  briefcase: '💼',
  users: '👥',
  laptop: '💻',
  plane: '✈️',
  globe: '🌍',
  earth: '🌍',
  mapmarker: '📍',
  locationdot: '📍',
  clock: '⏱️',
  check: '✅',
  checkcircle: '✅',
};

const HOBBY_ICON_RULES: { keyword: RegExp; icon: string }[] = [
  { keyword: /read|book/i, icon: '📚' },
  { keyword: /lifelong learning/i, icon: '🧠' },
  { keyword: /working out/i, icon: '💪' },
  { keyword: /cooking/i, icon: '👨‍🍳' },
  { keyword: /teaching/i, icon: '👨‍🏫' },
  { keyword: /hiking|outdoor|swimming|adventure/i, icon: '🏔️' },
  { keyword: /travel/i, icon: '🌍' },
  { keyword: /tech|innovation/i, icon: '💻' },
  { keyword: /language/i, icon: '🗣️' },
  { keyword: /network/i, icon: '🤝' },
  { keyword: /invest/i, icon: '📈' },
  { keyword: /music/i, icon: '🎼🎻' },
  { keyword: /arts|theater/i, icon: '🎭' },
  { keyword: /cinema|movie|film|tv series/i, icon: '🎬' },
  { keyword: /volunteer|church|camp/i, icon: '🤲' },
];

const normalizeFaName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const extractFaName = (latexLine: string): string | null => {
  const faIconMatch = latexLine.match(/\\faIcon\s*\{\s*([^}]+)\s*\}/i)?.[1];
  if (faIconMatch) {
    return normalizeFaName(faIconMatch);
  }

  const faCommandMatch = latexLine.match(/\\fa([A-Za-z]+)(?:\{[^}]*\})?/i)?.[1];
  if (faCommandMatch) {
    return normalizeFaName(faCommandMatch);
  }

  return null;
};

const getMobilityIcon = (latexLine: string): string => {
  const faName = extractFaName(latexLine);
  if (!faName) {
    return '•';
  }

  return MOBILITY_ICON_BY_FA_NAME[faName] ?? '•';
};

const getHobbyIcon = (text: string): string => {
  const match = HOBBY_ICON_RULES.find(rule => rule.keyword.test(text));
  return match?.icon ?? '⭐';
};

const getPortfolioEmoji = (text: string): string => {
  const lower = text.toLowerCase();

  if (lower.includes('github')) return '🐙';
  if (lower.includes('linkedin')) return '💼';
  if (lower.includes('portfolio') || lower.includes('website')) return '🌐';
  if (lower.includes('behance') || lower.includes('dribbble')) return '🎨';
  if (lower.includes('gitlab') || lower.includes('bitbucket')) return '🧑‍💻';
  if (lower.includes('medium') || lower.includes('blog')) return '✍️';
  if (lower.includes('stack overflow')) return '🧠';
  if (lower.includes('kaggle')) return '📊';
  if (lower.includes('youtube')) return '🎥';

  return '🔗';
};

const shouldUseSemanticPortfolioIcon = (text: string): boolean => {
  const lower = text.toLowerCase();
  return lower.includes('website') || lower.includes('portfolio') || lower.includes('web');
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const languageFlagMarkup = (countryCode: string, languageName: string): string => {
  const code = countryCode.trim().toLowerCase();
  const alt = `${escapeHtml(languageName)} flag`;

  if (!/^[a-z]{2}$/.test(code)) {
    return '<span aria-hidden="true" style="display:inline-block;margin-right:0.45rem;vertical-align:-2px;">🗣️</span>';
  }

  return `<img src="https://flagcdn.com/w40/${code}.png" alt="${alt}" width="20" height="14" style="display:inline-block;width:20px;height:14px;object-fit:cover;border-radius:2px;vertical-align:-2px;margin-right:0.45rem;" />`;
};

const mobilityIconMarkup = (icon: string): string =>
  `<span aria-hidden="true" style="display:inline-block;margin-right:0.45rem;vertical-align:-2px;">${escapeHtml(icon)}</span>`;

const portfolioIconMarkup = (url: string | null, text: string): string => {
  if (url && !shouldUseSemanticPortfolioIcon(text)) {
    try {
      const parsed = new URL(url);
      const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${parsed.hostname}`;
      return `<img src="${escapeHtml(faviconUrl)}" alt="profile icon" width="18" height="18" style="display:inline-block;width:18px;height:18px;object-fit:cover;border-radius:4px;vertical-align:-4px;margin-right:0.45rem;" />`;
    } catch {
      // fallback to semantic emoji icon below
    }
  }

  const emoji = getPortfolioEmoji(text);
  return `<span aria-hidden="true" style="display:inline-block;margin-right:0.45rem;vertical-align:-3px;">${escapeHtml(emoji)}</span>`;
};

const toLanguagePreviewLine = (rawItem: string): string | null => {
  const cleaned = rawItem
    .replace(/\[\s*l\s*\]/gi, ' ')
    .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>')
    .replace(/\\makebox\[.*?\]\[.*?\]\{\\textbf\{(.+?)\}\}\s*\{(.+?)\}/g, '<strong>$1:</strong> $2')
    .replace(/\\&/g, '&')
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return null;
  }

  const plain = cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const languageName = plain.split(':')[0]?.trim() ?? '';
  const countryCode = LANGUAGE_CODE_BY_NAME[languageName] ?? '';
  const flag = languageFlagMarkup(countryCode, languageName || 'Language');

  return `${flag} ${cleaned}`;
};

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
  const role = normalizeLatexText(roleRaw.replace(/\\textbf\{([^}]*)\}/g, '$1'))
    .replace(/\$/g, '')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim();

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

const detectCountryFromLocation = (locationLabel: string) => {
  const pieces = normalizeLatexText(locationLabel)
    .split(',')
    .map(piece => piece.trim())
    .filter(Boolean);

  const countryCandidate = pieces[pieces.length - 1] ?? '';
  const key = normalizeCountryKey(countryCandidate);
  const countryCode = COUNTRY_CODE_BY_NAME[key] ?? '';

  return {
    countryName: countryCandidate || 'your location',
    countryCode,
    countryFlag: countryCodeToFlag(countryCode),
  };
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

const extractContacts = (cvText: string): HeaderContacts => {
  const hrefRegex = /\\href\s*\{([^}]*)\}\s*\{([^}]*)\}/g;
  const links = [...cvText.matchAll(hrefRegex)]
    .map(match => ({
      href: normalizeLatexText(match[1] ?? ''),
      label: normalizeLatexText(match[2] ?? ''),
    }))
    .filter(link => !!link.href && !!link.label);

  const email = links.find(link => link.href.toLowerCase().startsWith('mailto:')) ?? null;
  const whatsapp = links.find(link => /wa\.me|whatsapp/i.test(link.href)) ?? null;
  const locationByUrl = links.find(link => /share\.google|google\.|maps\.|openstreetmap|map/i.test(link.href)) ?? null;
  const locationByLabel = links.find(link => /location|ubicacion|city|country|dublin|ireland|irlanda/i.test(link.label)) ?? null;

  const fallbackLocationLabel =
    cvText.match(/(?:location|ubicaci[oó]n)\s*:\s*\\href\s*\{[^}]*\}\s*\{([^}]*)\}/i)?.[1] ??
    cvText.match(/(?:location|ubicaci[oó]n)\s*:\s*([^|\\\n]+)/i)?.[1] ??
    '';

  const locationFallback = normalizeLatexText(fallbackLocationLabel);

  const location =
    locationByUrl ??
    locationByLabel ??
    (locationFallback
      ? {
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationFallback)}`,
          label: locationFallback,
        }
      : null);

  const country = location
    ? detectCountryFromLocation(location.label)
    : { countryName: '', countryCode: '', countryFlag: '🌍' };

  return {
    email,
    whatsapp,
    location,
    countryName: country.countryName,
    countryCode: country.countryCode,
    countryFlag: country.countryFlag,
  };
};

const CountryFlagIcon = ({ className, countryCode }: IconProps & { countryCode: string }) => {
  const code = countryCode.trim().toUpperCase();

  if (code === 'IE') {
    return (
      <svg className={className} viewBox="0 0 36 24" aria-hidden="true">
        <rect x="0" y="0" width="12" height="24" fill="#169B62" />
        <rect x="12" y="0" width="12" height="24" fill="#FFFFFF" />
        <rect x="24" y="0" width="12" height="24" fill="#FF883E" />
        <rect x="0.5" y="0.5" width="35" height="23" rx="2" fill="none" stroke="rgba(15,23,42,0.16)" />
      </svg>
    );
  }

  if (code === 'ES') {
    return (
      <svg className={className} viewBox="0 0 36 24" aria-hidden="true">
        <rect x="0" y="0" width="36" height="24" fill="#AA151B" />
        <rect x="0" y="6" width="36" height="12" fill="#F1BF00" />
        <rect x="0.5" y="0.5" width="35" height="23" rx="2" fill="none" stroke="rgba(15,23,42,0.16)" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 36 24" aria-hidden="true">
      <rect x="0" y="0" width="36" height="24" rx="2" fill="#E2E8F0" />
      <text x="18" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">
        {code || '??'}
      </text>
      <rect x="0.5" y="0.5" width="35" height="23" rx="2" fill="none" stroke="rgba(15,23,42,0.16)" />
    </svg>
  );
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
    { href: '/clients-companies', label: 'Clients & Partners' },
    { href: '/portfolio-profiles', label: 'Portfolio & Professional Profiles' },
  ];
};

const createChapterId = (href: string) => `chapter-${href.replace(/\//g, '').trim()}`;

const splitLongPreviewLine = (line: string): string[] => {
  if (line.includes('|') || line.length < 160) {
    return [line];
  }

  const sentenceChunks = line
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  if (sentenceChunks.length <= 1) {
    return [line];
  }

  return sentenceChunks;
};

const cleanLatex = (text: string): string => {
  return text
    .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>') // Convertir \textbf a <strong>
    .replace(/\\emph\s*\{\s*(.+?)\s*\}/g, '<em>$1</em>') // Convertir \emph a <em>
    .replace(/\\faIcon\s*\{[^}]*\}/g, '') // Remove \faIcon{...}
    .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '') // Remove \faGlobe, \faPlane, etc.
    .replace(/\\&/g, '&') // Clean \&
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\$/g, '') // Remove $ (as Education and Work do)
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces before capitals
    .replace(/<(?!strong|em|\/)[^>]+>/g, ' ') // Remove tags except strong and em
    .replace(/\\\\/g, '<br />') // Convert \\ to <br /> (line breaks)
    .replace(/\r\n/g, '\n') // Normalize Windows line breaks
    .replace(/[{}]/g, ' ') // Remove braces
    .replace(/\s+/g, ' ') // Normalize repeated spaces
    .trim();
};

const extractPreviewSentences = (content: string, maxLines: number): string[] => {
  const normalized = cleanLatex(content);

  if (!normalized) {
    return [];
  }

  // If there are <br /> tags, use those as line separators
  if (normalized.includes('<br />')) {
    return normalized
      .split('<br />')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, maxLines);
  }

  // If there are real line breaks, preserve them
  if (normalized.includes('\n')) {
    return normalized
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, maxLines);
  }

  // Fallback: split by sentences
  const sentenceChunks = normalized
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  if (sentenceChunks.length === 0) {
    return [normalized.slice(0, 260).trim()];
  }

  const previewLines: string[] = [];
  for (const sentence of sentenceChunks) {
    const chunks = splitLongPreviewLine(sentence);
    for (const chunk of chunks) {
      const cleanedChunk = chunk.replace(/\s+/g, ' ').trim();
      if (!cleanedChunk) {
        continue;
      }

      previewLines.push(cleanedChunk);
      if (previewLines.length >= maxLines) {
        return previewLines;
      }
    }
  }

  return previewLines.length > 0 ? previewLines : [normalized.slice(0, 260).trim()];
};

const normalizeTimelineLine = (line: string): string | null => {
  const cleaned = line
    .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>')
    .replace(/\\&/g, '&')
    .replace(/\$/g, '')
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/<(?!strong|\/)[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return null;
  }

  const pipeParts = cleaned.split(/\s*\|\s*/).map(part => part.trim()).filter(Boolean);
  if (pipeParts.length >= 4) {
    const [date, role, company, location] = pipeParts;
    return [date, role, company, location].filter(Boolean).join(' | ');
  }

  if (pipeParts.length === 3) {
    const [date, role, company] = pipeParts;
    return [date, role, company].filter(Boolean).join(' | ');
  }

  if (pipeParts.length === 2) {
    return pipeParts.join(' | ');
  }

  const dateMatch = cleaned.match(/^(\d{4}(?:\s*[-–]\s*\d{4}|\s*[-–]\s*present)?|\d{1,2}\/\d{4}|\d{4})\b/i);
  if (!dateMatch) {
    return cleaned;
  }

  const remainder = cleaned.slice(dateMatch[0].length).replace(/^\s*[-–|,.:]\s*/, '').trim();
  if (!remainder) {
    return dateMatch[0].trim();
  }

  const chunkParts = remainder
    .split(/\s{2,}|\s*[-–|,]\s*/)
    .map(part => part.trim())
    .filter(Boolean);

  const title = chunkParts[0] ?? remainder;
  const location = chunkParts[1] ?? '';

  return [dateMatch[0].trim(), title, location].filter(Boolean).join(' | ');
};

const cleanEducationHeaderPart = (value: string): string =>
  value
    .replace(/<\/?strong>/g, '')
    .trim();

const buildEducationTimelineItems = (content: string): EducationTimelineItem[] => {
  // Keep the same base cleanup used by the dedicated Education page.
  const education = content
    .replace(/<(?!\/?strong).*?>/g, '')
    .replace(/\$/g, '');

  const lines = education
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const educationBlocks: EducationTimelineItem[] = [];
  let currentBlock: EducationTimelineItem | null = null;

  lines.forEach(line => {
    if (line.includes('|')) {
      const parts = line.split('|').map(part => part.trim());

      currentBlock = {
        date: cleanEducationHeaderPart(parts[0] ?? ''),
        degree: cleanEducationHeaderPart(parts[1] ?? ''),
        school: cleanEducationHeaderPart(parts[2] ?? ''),
        location: (parts[3] ?? '').trim(),
        keymodules: [],
      };

      if (currentBlock.date || currentBlock.degree || currentBlock.school) {
        educationBlocks.push(currentBlock);
      }

      return;
    }

    if (currentBlock) {
      const cleaned = line.trim();
      if (cleaned.length > 0) {
        currentBlock.keymodules.push(cleaned);
      }
    }
  });

  return educationBlocks;
};

const buildEducationTimelineRange = (cvText: string) => {
  const birthYear = extractBirthYear(cvText);
  const startYear = birthYear ? birthYear + 15 : undefined;
  const endYear = getCurrentYear();

  return {
    startYear,
    endYear,
  };
};

const buildWorkExperiencePreview = (content: string): string[] => {
  // Clean the same way as the Work Experience page
  const work = content
    .replace(/<(?!\/?strong)[^>]+>/g, '')
    .replace(/\$/g, '');

  const lines = work
    .split('\n')
    .map(line => line.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const previewLines: string[] = [];
  let currentBlockHeader = false;
  let hasMoreBlocks = false;

  for (const line of lines) {
    if (line.includes('|')) {
      if (currentBlockHeader && previewLines.length > 0) {
        hasMoreBlocks = true;
        break;
      }

      // Work header
      currentBlockHeader = true;
      const normalized = normalizeTimelineLine(line);
      if (normalized && previewLines.length === 0) {
        previewLines.push(normalized);
      }
    } else if (currentBlockHeader) {
      // Bullets/details after the header
      const cleaned = line
        .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\&/g, '&')
        .replace(/\$/g, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned && !cleaned.includes('|')) {
        previewLines.push(cleaned);
      }
    }
  }

  if (previewLines.length === 0) {
    return extractPreviewSentences(content, PREVIEW_MAX_LINES);
  }

  if (hasMoreBlocks) {
    previewLines.push('...');
  }

  return previewLines;
};

const cleanWorkHeaderPart = (value: string): string =>
  value
    .replace(/<\/?strong>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/^\s*["'`]+/, '')
    .replace(/["'`]+\s*$/, '')
    .trim();

const buildWorkTimelineItems = (content: string): WorkTimelineItem[] => {
  const work = content
    .replace(/<(?!\/?strong)[^>]+>/g, '')
    .replace(/\$/g, '');

  const lines = work
    .split('\n')
    .map(line => line.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const workBlocks: WorkTimelineItem[] = [];
  let currentBlock: WorkTimelineItem | null = null;

  lines.forEach(line => {
    if (line.includes('|')) {
      const parts = line.split('|').map(part => part.trim());

      currentBlock = {
        date: cleanWorkHeaderPart(parts[0] ?? ''),
        role: cleanWorkHeaderPart(parts[1] ?? ''),
        company: cleanWorkHeaderPart(parts[2] ?? ''),
        location: cleanWorkHeaderPart(parts[3] ?? ''),
        bullets: [],
      };

      if (currentBlock.date || currentBlock.role || currentBlock.company) {
        workBlocks.push(currentBlock);
      }

      return;
    }

    if (currentBlock) {
      const cleaned = line
        .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\&/g, '&')
        .replace(/\$/g, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned) {
        currentBlock.bullets.push(cleaned);
      }
    }
  });

  return workBlocks;
};

const buildWorkTimelineRange = (cvText: string) => {
  const birthYear = extractBirthYear(cvText);
  const startYear = birthYear ? birthYear + 18 : undefined;
  const endYear = getCurrentYear();

  return {
    startYear,
    endYear,
  };
};

const buildEducationPreview = (content: string): string[] => {
  // Clean the same way as the Education page
  const education = content
    .replace(/<(?!\/?strong)[^>]+>/g, '')
    .replace(/\$/g, '');

  const lines = education
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const previewLines: string[] = [];
  let currentBlockHeader = false;
  let hasMoreBlocks = false;

  for (const line of lines) {
    if (line.includes('|')) {
      if (currentBlockHeader && previewLines.length > 0) {
        hasMoreBlocks = true;
        break;
      }

      // Education header
      currentBlockHeader = true;
      const normalized = normalizeTimelineLine(line);
      if (normalized && previewLines.length === 0) {
        previewLines.push(normalized);
      }
    } else if (currentBlockHeader) {
      // Details/modules after the header
      const cleaned = line
        .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\&/g, '&')
        .replace(/\$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleaned && !cleaned.includes('|')) {
        previewLines.push(cleaned);
      }
    }
  }

  if (previewLines.length === 0) {
    return extractPreviewSentences(content, PREVIEW_MAX_LINES);
  }

  if (hasMoreBlocks) {
    previewLines.push('...');
  }

  return previewLines;
};

const buildLanguagesPreview = (content: string): string[] => {
  const LANGUAGES_VISIBLE_ITEMS = 3;
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = content.match(itemizeRegex);

  const sourceText = itemizeMatch ? itemizeMatch[1] : content;
  const previewLines: string[] = [];

  // 1) Intentar por \item
  const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
  const itemEntries = [...sourceText.matchAll(itemRegex)].map(match => match[1]?.trim() ?? '').filter(Boolean);

  // 2) If it comes as one line with [l] Spanish ... [l] English ...
  const markerEntries = (itemEntries.length > 0 ? itemEntries : [sourceText])
    .flatMap(entry => entry.split(/\[\s*l\s*\]/gi))
    .map(entry => entry.trim())
    .filter(Boolean);

  // 3) If it still does not split well, try line breaks
  const rawEntries = markerEntries.length > 0
    ? markerEntries
    : sourceText
        .split('\n')
        .map(entry => entry.trim())
        .filter(Boolean);

  const validLines = rawEntries
    .map(entry => toLanguagePreviewLine(entry))
    .filter((line): line is string => !!line);

  const hasMoreLanguages = validLines.length > LANGUAGES_VISIBLE_ITEMS;

  for (const line of validLines.slice(0, LANGUAGES_VISIBLE_ITEMS)) {
    previewLines.push(line);
  }

  if (hasMoreLanguages) {
    previewLines.push('...');
  }

  return previewLines.length > 0 ? previewLines : extractPreviewSentences(content, LANGUAGES_VISIBLE_ITEMS);
};

const buildFlexibilityMobilityPreview = (content: string): string[] => {
  const MOBILITY_VISIBLE_ITEMS = 4;
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = content.match(itemizeRegex);
  const sourceText = itemizeMatch ? itemizeMatch[1] : content;

  const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
  const rawItems = [...sourceText.matchAll(itemRegex)]
    .map(match => match[1]?.trim() ?? '')
    .filter(Boolean);

  const fallbackItems = sourceText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('%') && !line.startsWith('\\setlength'));

  const items = (rawItems.length > 0 ? rawItems : fallbackItems)
    .map(item => {
      const icon = getMobilityIcon(item);
      const html = item
        .replace(/\\href\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
        .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\emph\{(.+?)\}/g, '<em>$1</em>')
        .replace(/\\faIcon\s*\{[^}]*\}/g, '')
        .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
        .replace(/\\&/g, '&')
        .replace(/\\_/g, '_')
        .replace(/\\%/g, '%')
        .replace(/\\\\/g, ' ')
        .replace(/[{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return html ? `${mobilityIconMarkup(icon)}${html}` : '';
    })
    .filter(Boolean);

  const previewLines = items.slice(0, MOBILITY_VISIBLE_ITEMS);
  if (items.length > MOBILITY_VISIBLE_ITEMS) {
    previewLines.push('...');
  }

  return previewLines.length > 0 ? previewLines : extractPreviewSentences(content, PREVIEW_MAX_LINES);
};

const buildClientsPreview = (content: string): string[] => {
  // Clients extrae items de itemize o divide por comas
  const CLIENTS_VISIBLE_ITEMS = 5;
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = content.match(itemizeRegex);

  const entries: string[] = [];

  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];
    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;

    let match;
    while ((match = itemRegex.exec(itemsText)) !== null) {
      const item = match[1].trim();
      const cleaned = item
        .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
        .replace(/\\emph\{(.+?)\}/g, '<em>$1</em>')
        .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
        .replace(/\\faIcon\s*\{[^}]*\}/g, '')
        .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
        .replace(/\\&/g, '&')
        .replace(/^\d+\s+/, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned) {
        entries.push(cleaned);
      }
    }
  } else {
    // If there is no itemize, keep line breaks and commas
    const cleaned = content
      .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
      .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
      .replace(/\\emph\{(.+?)\}/g, '<em>$1</em>')
      .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
      .replace(/\\faIcon\s*\{[^}]*\}/g, '')
      .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
      .replace(/\\&/g, '&')
      .replace(/^\d+\s+/, '')
      .replace(/\r/g, '');

    const items = cleaned
      .split(/\n|,/)
      .map(item => item.replace(/^\d+\s+/, '').trim())
      .filter(Boolean);

    for (const item of items) {
      entries.push(item);
    }
  }

  if (entries.length === 0) {
    return extractPreviewSentences(content, PREVIEW_MAX_LINES);
  }

  const previewLines = entries.slice(0, CLIENTS_VISIBLE_ITEMS);
  if (entries.length > CLIENTS_VISIBLE_ITEMS) {
    previewLines.push('...');
  }

  return previewLines;
};

const buildPortfolioPreview = (content: string): string[] => {
  // Portfolio extrae items de itemize o divide por comas
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = content.match(itemizeRegex);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const normalizePortfolioHeader = (value: string): string => {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    if (normalized.includes('linkedin')) {
      return 'LinkedIn:';
    }

    if (normalized.includes('github')) {
      return 'GitHub:';
    }

    if (normalized.includes('ai interactive cv website') || normalized.includes('interactive cv website')) {
      return 'AI-Interactive CV Website:';
    }

    const cleaned = value.replace(/\s*:\s*$/, '').trim();
    return cleaned ? `${cleaned}:` : 'Link:';
  };

  const toPortfolioPreviewLine = (rawItem: string): string | null => {
    const hrefMatch = rawItem.match(/\\href\{([^}]*)\}\{([^}]*)\}/);
    const urlMatch = rawItem.match(/https?:\/\/[^\s}]+/i);
    const href = normalizeLatexText(hrefMatch?.[1] ?? urlMatch?.[0] ?? '').trim();
    const linkLabel = normalizeLatexText(hrefMatch?.[2] ?? '').trim();

    if (!href) {
      return null;
    }

    const safeHref = /^https?:\/\//i.test(href) ? href : `https://${href}`;

    const headerSource = rawItem
      .replace(/\\href\{[^}]*\}\{[^}]*\}/g, ' ')
      .replace(/https?:\/\/[^\s}]+/gi, ' ')
      .replace(/\\faIcon\s*\{[^}]*\}/g, ' ')
      .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, ' ')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[{}]/g, ' ')
      .replace(/\\&/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    const headerToken = headerSource.split(':')[0] ?? '';
    const headerLabel = normalizePortfolioHeader(headerToken);
    const anchorText = linkLabel || href.replace(/^https?:\/\//i, '');
    const icon = portfolioIconMarkup(safeHref, `${headerLabel} ${anchorText}`);

      return `${icon}<strong>${escapeHtml(headerLabel)}</strong> <a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(anchorText)} <span class="storyInlineLinkIcon" aria-hidden="true">🔗</span></a>`;
  };

  const cleanPortfolioEntry = (value: string): string => {
    return value
      .replace(/^\s*\d+\s*$/g, '')
      .replace(/^\s*\d+\s+/, '')
      .replace(/^\s*\\+\s*/g, '')
      .replace(/\\textbf\{(.+?)\}/g, '<strong>$1</strong>')
      .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
      .replace(/\\faIcon\s*\{[^}]*\}/g, '')
      .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
      .replace(/\\&/g, '&')
      .replace(/\s+/g, ' ')
      .replace(/(https?:\/\/[^\s]+)\s+\1$/i, '$1')
      .replace(/(www\.[^\s]+)\s+\1$/i, '$1')
      .trim();
  };

  const previewLines: string[] = [];

  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];
    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;

    let match;
    while ((match = itemRegex.exec(itemsText)) !== null) {
      const item = match[1].trim();
      const linked = toPortfolioPreviewLine(item);
      const cleaned = linked || cleanPortfolioEntry(item);

      if (cleaned && cleaned !== '2') {
        previewLines.push(cleaned);
        if (previewLines.length >= PREVIEW_MAX_LINES) break;
      }
    }
  } else {
    // If there is no itemize, split by commas or lines
    const rawEntries = content
      .split(/\n|,/)
      .map(item => toPortfolioPreviewLine(item) || cleanPortfolioEntry(item))
      .filter(Boolean)
      .filter(item => item !== '2');

    for (const item of rawEntries) {
      if (previewLines.length >= PREVIEW_MAX_LINES) break;
      previewLines.push(item);
    }
  }

  return previewLines.length > 0 ? previewLines : extractPreviewSentences(content, PREVIEW_MAX_LINES);
};

const extractProjectTitle = (latexLine: string): string => {
  const titleMatch = latexLine.match(/\\textbf\s*\{\s*([^}]+)\s*\}/);
  if (titleMatch?.[1]) {
    return titleMatch[1].toLowerCase();
  }
  return '';
};

const getProjectEmoji = (latexLine: string): string => {
  const title = extractProjectTitle(latexLine);
  if (!title) return '📌';

  if (title.includes('hr') || title.includes('performance')) return '👥';
  if (title.includes('financial') || title.includes('forecast')) return '📈';
  if (title.includes('facial') || title.includes('recognition')) return '🧑‍🤝‍🧑';
  if (title.includes('recommendation')) return '⭐';
  if (title.includes('chatbot')) return '🤖';
  if (title.includes('data')) return '📊';
  if (title.includes('travel')) return '✈️';
  if (title.includes('collaboration') || title.includes('team')) return '🤝';
  return '📌';
};

const ensureProjectTitleBreak = (value: string): string => {
  const withHtmlBreak = value.replace(/<\/strong>(\s*)(?!<br\s*\/?>)/i, '</strong><br />');
  if (withHtmlBreak !== value) {
    return withHtmlBreak;
  }

  return value;
};

const projectPreviewMarkup = (rawItem: string): string => {
  const emoji = getProjectEmoji(rawItem);
  const html = rawItem
    .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>')
    .replace(/\\emph\s*\{\s*(.+?)\s*\}/g, '<em>$1</em>')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\\\\/g, '<br />')
    .replace(/--/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalized = ensureProjectTitleBreak(html);
  return `<span aria-hidden="true" style="display:inline-block;margin-right:0.45rem;vertical-align:-2px;">${emoji}</span>${normalized}`;
};

const buildProjectsPreview = (content: string): string[] => {
  // Projects extrae items de itemize
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = content.match(itemizeRegex);

  const PROJECTS_VISIBLE_ITEMS = 3;
  const previewLines: string[] = [];
  let projectEntries: string[] = [];

  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];
    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
    projectEntries = [...itemsText.matchAll(itemRegex)].map(match => match[1]?.trim() ?? '').filter(Boolean);
  } else {
    const normalized = content.replace(/\r/g, '').trim();
    const byLines = normalized.split('\n').map(line => line.trim()).filter(Boolean);

    if (byLines.length > 1) {
      projectEntries = byLines;
    } else {
      projectEntries = normalized
        .split(/(?=\\textbf\s*\{|<strong>)/)
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  const cleanedProjects = projectEntries
    .map(item => projectPreviewMarkup(item))
    .filter(Boolean);

  previewLines.push(...cleanedProjects.slice(0, PROJECTS_VISIBLE_ITEMS));

  const hasMoreProjects = cleanedProjects.length > PROJECTS_VISIBLE_ITEMS;

  if (hasMoreProjects) {
    previewLines.push('...');
  }

  return previewLines.length > 0 ? previewLines : extractPreviewSentences(content, PREVIEW_MAX_LINES);
};

const buildTechnologySkillsPreview = (content: string): string[] => {
  // Technology Skills split by lines
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const previewLines: string[] = [];

  for (const line of lines) {
    const cleaned = line
      .replace(/\\textbf\s*\{\s*(.+?)\s*\}/g, '<strong>$1</strong>')
      .replace(/\\&/g, '&')
      .replace(/\$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned && !cleaned.startsWith('%')) {
      previewLines.push(cleaned);
      if (previewLines.length >= PREVIEW_MAX_LINES) break;
    }
  }

  return previewLines.length > 0 ? previewLines : extractPreviewSentences(content, PREVIEW_MAX_LINES);
};

const buildHobbiesPreview = (content: string): string[] => {
  // Same base logic as the Hobbies page
  const hobbiesText = content
    .replace(/\\\\/g, '')
    .replace(/\n/g, ' ')
    .replace(/\\enddocument/g, '')
    .replace(/\\textbf\{(.+?)\}/g, '$1')
    .replace(/\\emph\{(.+?)\}/g, '$1')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
    .replace(/\\faIcon\s*\{[^}]*\}/g, '')
    .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
    .replace(/\\&/g, '&')
    .replace(/\\/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const hobbies = hobbiesText
    .split(/,(?![^(]*\))/)
    .map(hobby => hobby.trim())
    .filter(Boolean)
    .filter(hobby => hobby.length > 1);

  if (hobbies.length === 0) {
    return extractPreviewSentences(content, PREVIEW_MAX_LINES);
  }

  const visible = hobbies.slice(0, 5).map(hobby => `${getHobbyIcon(hobby)} ${hobby}`);
  if (hobbies.length > 5) {
    visible.push('...');
  }

  return visible;
};

const buildProfessionalSummaryPreview = (cvText: string): string[] => {
  const summarySection = extractRawSection(cvText, ['Professional Summary', 'Summary', 'Profile'])
    ?? extractSection(cvText, ['Professional Summary', 'Summary', 'Profile']);

  const summaryText = cleanLatex(summarySection)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const introLines = summaryText
    .split(/(?<=\.)\s+/)
    .map(line => line.trim())
    .filter(Boolean);

  if (introLines.length > 0) {
    return introLines;
  }

  const fallback = summaryText.slice(0, 260).trim();
  return fallback ? [fallback] : ['Professional Summary'];
};

const getChapterPreview = (cvText: string, href: string) => {
  const content = extractSection(cvText, getSectionAliasesForRoute(href));

  if (content === 'Section not found') {
    return {
      previewLines: [],
      hasOverflow: false,
    };
  }

  // Professional Summary: limit strictly to 5 lines
  if (href === '/professional-summary') {
    const previewLines = buildProfessionalSummaryPreview(cvText);
    return {
      previewLines,
      hasOverflow: previewLines.length > 3,
    };
  }

  // For Education and Work Experience: include headers + first bullets
  if (href === '/work-experience') {
    const workTimelineItems = buildWorkTimelineItems(content);
    const workTimelineRange = buildWorkTimelineRange(cvText);
    const previewLines = buildWorkExperiencePreview(content);
    return {
      previewLines,
      hasOverflow: workTimelineItems.length > 0 || previewLines.length >= PREVIEW_MAX_LINES,
      workTimelineItems,
      workTimelineStartYear: workTimelineRange.startYear,
      workTimelineEndYear: workTimelineRange.endYear,
    };
  }

  if (href === '/education') {
    const educationTimelineItems = buildEducationTimelineItems(content);
    const educationTimelineRange = buildEducationTimelineRange(cvText);
    const previewLines = buildEducationPreview(content);
    return {
      previewLines,
      hasOverflow: educationTimelineItems.length > 0 || previewLines.length >= PREVIEW_MAX_LINES,
      educationTimelineItems,
      educationTimelineStartYear: educationTimelineRange.startYear,
      educationTimelineEndYear: educationTimelineRange.endYear,
    };
  }

  // For Languages: show each language as a line
  if (href === '/languages') {
    const previewLines = buildLanguagesPreview(content);
    return {
      previewLines,
      hasOverflow: previewLines.includes('...') || previewLines.length > 3,
    };
  }

  // For Clients & Companies: show each company as a line
  if (href === '/clients-companies') {
    const rawContent = extractRawSection(cvText, getSectionAliasesForRoute(href));
    const previewLines = buildClientsPreview(rawContent || content);
    return {
      previewLines,
      hasOverflow: previewLines.includes('...') || previewLines.length > 5,
    };
  }

  // For Portfolio & Profiles: show each profile as a line
  if (href === '/portfolio-profiles') {
    const rawContent = extractRawSection(cvText, getSectionAliasesForRoute(href));
    const previewLines = buildPortfolioPreview(rawContent || content);
    return {
      previewLines,
      hasOverflow: previewLines.length >= PREVIEW_MAX_LINES,
    };
  }

  // For Projects: show each project as a line
  if (href === '/projects') {
    const rawContent = extractRawSection(cvText, getSectionAliasesForRoute(href));
    const previewLines = buildProjectsPreview(rawContent || content);
    return {
      previewLines,
      hasOverflow: previewLines.includes('...') || previewLines.length >= PREVIEW_MAX_LINES,
    };
  }

  // For Technology Skills: show each skill as a line
  if (href === '/technology-skills') {
    const previewLines = buildTechnologySkillsPreview(content);
    return {
      previewLines,
      hasOverflow: previewLines.length > 3,
    };
  }

  // For Hobbies & Interests: show each hobby as a line
  if (href === '/hobbies-interests') {
    const rawContent = extractRawSection(cvText, getSectionAliasesForRoute(href));
    const previewLines = buildHobbiesPreview(rawContent || content);
    return {
      previewLines,
      hasOverflow: previewLines.includes('...') || previewLines.length > 5,
    };
  }

  // For Flexibility & Mobility: show lines with icons
  if (href === '/flexibility-mobility') {
    const rawContent = extractRawSection(cvText, getSectionAliasesForRoute(href));
    const previewLines = buildFlexibilityMobilityPreview(rawContent || content);
    return {
      previewLines,
      hasOverflow: previewLines.includes('...') || previewLines.length > 4,
    };
  }

  // For other sections: use sentence extraction
  const previewLines = extractPreviewSentences(content, PREVIEW_MAX_LINES);

  return {
    previewLines,
    hasOverflow: previewLines.length >= PREVIEW_MAX_LINES,
  };
};

const buildStoryChapters = (cvText: string, routes: RouteItem[]): StoryChapter[] => {
  return routes.map(route => {
    const preview = getChapterPreview(cvText, route.href);

    return {
      id: createChapterId(route.href),
      href: route.href,
      title: route.label,
      previewLines: preview.previewLines,
      hasOverflow: preview.hasOverflow,
      educationTimelineItems: preview.educationTimelineItems,
      educationTimelineStartYear: preview.educationTimelineStartYear,
      educationTimelineEndYear: preview.educationTimelineEndYear,
      workTimelineItems: preview.workTimelineItems,
      workTimelineStartYear: preview.workTimelineStartYear,
      workTimelineEndYear: preview.workTimelineEndYear,
    };
  });
};

const MailIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-9Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m4.6 8.1 6.72 4.95a1.15 1.15 0 0 0 1.36 0l6.72-4.95"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WhatsAppIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3.75a8.25 8.25 0 0 0-7.16 12.34L4 20.25l4.31-.79A8.25 8.25 0 1 0 12 3.75Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.3 8.95c.12-.31.24-.32.45-.33h.38c.12 0 .29.05.44.39.14.34.5 1.19.54 1.28.04.09.07.2 0 .31-.06.11-.1.18-.2.28-.1.1-.2.22-.29.29-.1.08-.2.17-.08.34.12.17.53.87 1.14 1.41.78.69 1.43.9 1.64 1 .2.1.32.08.43-.05.12-.13.51-.59.65-.8.14-.2.28-.16.47-.1.2.07 1.24.59 1.46.69.22.1.37.16.42.25.05.1.05.58-.14 1.14-.18.54-1.05 1-1.45 1.03-.39.03-.88.05-2.81-.7-2.31-.9-3.8-3.16-3.92-3.33-.11-.17-.94-1.25-.94-2.38 0-1.12.59-1.68.8-1.91Z"
      fill="currentColor"
    />
  </svg>
);

const LocationIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 20.25s6-5.57 6-10.02A6 6 0 0 0 6 10.23c0 4.45 6 10.02 6 10.02Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const PORTFOLIO_HIGHLIGHTS: PortfolioHighlight[] = [
  {
    eyebrow: 'Identity',
    title: 'Human & Technological Solutions Architect',
    description:
      'A profile built to translate operational complexity into technology that people can actually adopt.',
  },
  {
    eyebrow: 'Value',
    title: 'Systems Integration Specialist',
    description:
      'Connects business logic, workflows, data and teams so the system works as one coordinated whole.',
  },
  {
    eyebrow: 'Delivery',
    title: 'AI Solutions Engineer',
    description:
      'Focuses on practical AI applications: automation, dashboards, document intelligence and enablement.',
  },
];

const FEATURED_PROJECTS: PortfolioProject[] = [
  {
    title: 'AI-assisted operations automation',
    description:
      'Workflow automation and intelligent assistants that reduce repetitive work and speed up decision-making.',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'Automation', 'Enablement'],
  },
  {
    title: 'Business systems integration',
    description:
      'Multi-tool implementation work that aligns POS, ERP, databases and reporting inside real operations.',
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    tags: ['Integration', 'ERP', 'Operations'],
  },
  {
    title: 'Employer-facing CV portfolio',
    description:
      'A narrative web experience designed to help recruiters understand impact, personality and delivery style fast.',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-6f8e9f33d0b4?auto=format&fit=crop&w=1200&q=80',
    tags: ['Portfolio', 'Consulting', 'Brand'],
  },
];

const BIG_FIVE_TRAITS: BigFiveTrait[] = [
  {
    name: 'Openness',
    score: 93,
    note: 'Curious, cross-functional and comfortable exploring new systems and ideas.',
  },
  {
    name: 'Conscientiousness',
    score: 88,
    note: 'Structured, reliable and focused on execution, process quality and outcomes.',
  },
  {
    name: 'Extraversion',
    score: 74,
    note: 'Strong consultative energy and communication across technical and business teams.',
  },
  {
    name: 'Agreeableness',
    score: 90,
    note: 'Empathetic, service-oriented and attentive to user adoption and team alignment.',
  },
  {
    name: 'Emotional Stability',
    score: 84,
    note: 'Calm under operational pressure and resilient during change or implementation gaps.',
  },
];

const PortfolioCvMenu = ({ href, label }: { href: string; label: string }) => (
  <details className="portfolioCvMenu">
    <summary className="portfolioCvMenuSummary">Switch to CV</summary>
    <div className="portfolioCvMenuPanel">
      <a href={href} className="portfolioCvMenuLink portfolioCvMenuLinkPrimary">
        {label}
      </a>
    </div>
  </details>
);

const StoryPortfolioMenu = ({ href, label }: { href: string; label: string }) => (
  <details className="portfolioCvMenu">
    <summary className="portfolioCvMenuSummary">Switch to Portfolio</summary>
    <div className="portfolioCvMenuPanel">
      <a href={href} className="portfolioCvMenuLink portfolioCvMenuLinkPrimary">
        {label}
      </a>
    </div>
  </details>
);

const PortfolioProjectCard = ({ project }: { project: PortfolioProject }) => (
  <article className="portfolioProjectCard">
    <div className="portfolioProjectImageWrap">
      <div
        className="portfolioProjectImage"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.08), rgba(2, 6, 23, 0.58)), url(${project.imageUrl})`,
        }}
      />
    </div>
    <div className="portfolioProjectBody">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="portfolioTagRow">
        {project.tags.map(tag => (
          <span key={tag} className="portfolioTag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </article>
);

const PortfolioHighlightCard = ({ highlight }: { highlight: PortfolioHighlight }) => (
  <article className="portfolioHighlightCard">
    <p className="portfolioHighlightEyebrow">{highlight.eyebrow}</p>
    <h3>{highlight.title}</h3>
    <p>{highlight.description}</p>
  </article>
);

const PortfolioTraitCard = ({ trait }: { trait: BigFiveTrait }) => (
  <article className="portfolioTraitCard">
    <div className="portfolioTraitHeader">
      <h3>{trait.name}</h3>
      <span>{trait.score}%</span>
    </div>
    <div className="portfolioTraitBar" aria-hidden="true">
      <span style={{ width: `${trait.score}%` }} />
    </div>
    <p>{trait.note}</p>
  </article>
);

export async function CvJourney() {
  const cvText = await fetchCvSource();
  const header = extractHeader(cvText);
  const intro = extractSummaryIntro(cvText);
  const routes = extractRoutes(cvText);
  const chapters = buildStoryChapters(cvText, routes);
  const firstChapterId = chapters[0]?.id ?? '';
  const profileImageUrl = extractProfileImageUrl(cvText);
  const contacts = extractContacts(cvText);

  return (
    <>
      <section className="storyGateway" style={{ backgroundImage: `url(${INTRO_NEURAL_BACKGROUND})` }}>
        <div className="storyGatewayOverlay" />

        <div className="storyGatewayContent">
          <div className="storyTopBar">
            <div>
              <p className="homeHeroBadge">Interactive CV</p>
            </div>

            <StoryPortfolioMenu href="/portfolio-profiles" label="Open professional portfolio" />
          </div>

          <div className="storyGatewayMain">
            <div className="storyGatewayCopy">
              <h1 className="storyDisplayHeading storyHeroName">{header.fullName}</h1>
              <p className="homeHeroRole">{header.role}</p>
              <p>{intro}</p>

              {(contacts.email || contacts.whatsapp || contacts.location) && (
                <div className="homeContacts" aria-label="Contact links">
                  {contacts.email && (
                    <a
                      href={contacts.email.href}
                      className="homeContactButton"
                      aria-label={`Send email to ${contacts.email.label}`}
                    >
                      <MailIcon className="homeContactIcon" />
                      <span>Email</span>
                    </a>
                  )}

                  {contacts.whatsapp && (
                    <a
                      href={contacts.whatsapp.href}
                      className="homeContactButton"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Send WhatsApp message"
                    >
                      <WhatsAppIcon className="homeContactIcon" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {contacts.location && (
                    <div className="homeLocationBlock">
                      <a
                        href={contacts.location.href}
                        className="homeContactButton homeContactButtonLocation"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open location: ${contacts.location.label}`}
                      >
                        <LocationIcon className="homeContactIcon" />
                        {contacts.countryCode ? (
                          <CountryFlagIcon className="homeLocationFlagImage" countryCode={contacts.countryCode} />
                        ) : (
                          <span className="homeLocationFlag" aria-hidden="true">
                            {contacts.countryFlag}
                          </span>
                        )}
                        <span>{contacts.location.label}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {firstChapterId && (
                <div className="storyPrimaryCtaCenter">
                  <a href={`#${firstChapterId}`} className="storyPrimaryCta">
                    Start CV journey
                  </a>
                </div>
              )}
            </div>

            {profileImageUrl && (
              <div className="storyGatewayPortrait" aria-hidden="true">
                <ProtectedImage
                  src={profileImageUrl}
                  alt={`${header.fullName} profile photo`}
                  className="homeHeroImage"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <StoryFlow chapters={chapters} backgroundImage={INTRO_NEURAL_BACKGROUND} />

      <noscript>
        <section style={{ padding: '1rem', textAlign: 'center' }}>
          {routes.map(route => (
            <Link key={route.href} href={route.href} style={{ margin: '0 0.5rem' }}>
              {route.label}
            </Link>
          ))}
        </section>
      </noscript>
    </>
  );
}

export default async function Home() {
  const cvText = await fetchCvSource();
  const header = extractHeader(cvText);
  const intro = extractSummaryIntro(cvText);
  const profileImageUrl = extractProfileImageUrl(cvText);
  const contacts = extractContacts(cvText);

  return (
    <>
      <section className="portfolioGateway" style={{ backgroundImage: `url(${INTRO_NEURAL_BACKGROUND})` }}>
        <div className="storyGatewayOverlay portfolioGatewayOverlay" />

        <div className="storyGatewayContent portfolioGatewayContent">
          <div className="portfolioTopBar">
            <div>
              <p className="homeHeroBadge">Professional Portfolio</p>
            </div>

            <PortfolioCvMenu href="/cv" label="Open full CV page" />
          </div>

          <div className="portfolioHeroGrid">
            <div className="portfolioHeroCopy">
              <h1 className="storyDisplayHeading portfolioHeroTitle">{header.fullName}</h1>
              <p className="homeHeroRole">{header.role}</p>
              <p className="portfolioHeroIntro">{intro}</p>

              <div className="portfolioActionRow">
                <a href="#portfolio-personality" className="storyPrimaryCta">
                  Discover my profile
                </a>
              </div>

              {(contacts.email || contacts.whatsapp || contacts.location) && (
                <div className="homeContacts" aria-label="Contact links">
                  {contacts.email && (
                    <a
                      href={contacts.email.href}
                      className="homeContactButton"
                      aria-label={`Send email to ${contacts.email.label}`}
                    >
                      <MailIcon className="homeContactIcon" />
                      <span>Email</span>
                    </a>
                  )}

                  {contacts.whatsapp && (
                    <a
                      href={contacts.whatsapp.href}
                      className="homeContactButton"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Send WhatsApp message"
                    >
                      <WhatsAppIcon className="homeContactIcon" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {contacts.location && (
                    <div className="homeLocationBlock">
                      <a
                        href={contacts.location.href}
                        className="homeContactButton homeContactButtonLocation"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open location: ${contacts.location.label}`}
                      >
                        <LocationIcon className="homeContactIcon" />
                        {contacts.countryCode ? (
                          <CountryFlagIcon className="homeLocationFlagImage" countryCode={contacts.countryCode} />
                        ) : (
                          <span className="homeLocationFlag" aria-hidden="true">
                            {contacts.countryFlag}
                          </span>
                        )}
                        <span>{contacts.location.label}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="portfolioHeroVisual">
              {profileImageUrl && (
                <div className="portfolioHeroPortraitWrap">
                  <ProtectedImage
                    src={profileImageUrl}
                    alt={`${header.fullName} profile photo`}
                    className="homeHeroImage"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <JobCannonInsights />

      <section className="portfolioSection" id="portfolio-personality">
        <div className="portfolioSectionHeadingBlock">
          <p className="portfolioSectionEyebrow">Profile</p>
          <h2>What stands out from the document</h2>
        </div>

        <div className="portfolioHighlightGrid">
          {PORTFOLIO_HIGHLIGHTS.map(highlight => (
            <PortfolioHighlightCard key={highlight.title} highlight={highlight} />
          ))}
        </div>
      </section>

      <section className="portfolioSection" id="portfolio-traits">
        <div className="portfolioSectionHeadingBlock">
          <p className="portfolioSectionEyebrow">Qualities</p>
          <h2>Consultative traits that employers can read fast</h2>
        </div>

        <div className="portfolioTraitGrid">
          {BIG_FIVE_TRAITS.map(trait => (
            <PortfolioTraitCard key={trait.name} trait={trait} />
          ))}
        </div>
      </section>

      <section className="portfolioSection" id="portfolio-projects">
        <div className="portfolioSectionHeadingBlock">
          <p className="portfolioSectionEyebrow">Projects</p>
          <h2>Featured work and visual proof</h2>
        </div>

        <div className="portfolioProjectGrid">
          {FEATURED_PROJECTS.map(project => (
            <PortfolioProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      <section className="portfolioSection portfolioCvAccessSection" id="cv-preview">
        <div className="portfolioSectionHeadingBlock">
          <p className="portfolioSectionEyebrow">CV access</p>
          <h2>Discover more about my professional trajectory</h2>
        </div>

        <a
          href="/cv"
          className="portfolioCvAccessBar"
          aria-label="Discover more about my professional trajectory"
        >
          <span className="portfolioCvAccessBarLabel">View my CV here . . . </span>
          <span className="portfolioCvAccessBarHint">Portfolio to CV</span>
          <span className="portfolioCvAccessArrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <p className="portfolioCvAccessFooter" aria-label="Copyright and powered by AI note">
           
           
           &copy; 2026 R. Lopez · Powered by AI
        </p>
      </section>
    </>
  );
}
