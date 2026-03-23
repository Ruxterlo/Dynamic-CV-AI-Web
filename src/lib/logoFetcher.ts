export type LogoSource = 'clearbit' | 'google-favicon' | 'none';

export type CompanyLogoResult = {
	companyName: string;
	website?: string;
	domain?: string;
	logoUrl?: string;
	source: LogoSource;
};

type ResolveLogoInput = {
	companyName: string;
	websiteHint?: string;
};

type ClearbitAutocompleteCompany = {
	domain?: string;
	logo?: string;
	name?: string;
};

const COMPANY_DOMAIN_CACHE = new Map<string, string | undefined>();
const IMAGE_URL_CACHE = new Map<string, boolean>();

const IMAGE_CONTENT_TYPE_REGEX = /^image\/(png|jpe?g|webp|x-icon|vnd\.microsoft\.icon)$/i;

const normalizeName = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const normalizeUrl = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) {
		return '';
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	return `https://${trimmed}`;
};

const domainFromUrl = (value: string): string | undefined => {
	const normalized = normalizeUrl(value);
	if (!normalized) {
		return undefined;
	}

	try {
		const { hostname } = new URL(normalized);
		return hostname.replace(/^www\./i, '').toLowerCase();
	} catch {
		return undefined;
	}
};

const pickBestClearbitMatch = (companies: ClearbitAutocompleteCompany[], companyName: string) => {
	const normalizedTarget = normalizeName(companyName);

	return companies
		.filter(company => !!company.domain)
		.sort((a, b) => {
			const aName = normalizeName(a.name ?? '');
			const bName = normalizeName(b.name ?? '');

			const aScore = aName.includes(normalizedTarget) ? normalizedTarget.length : 0;
			const bScore = bName.includes(normalizedTarget) ? normalizedTarget.length : 0;

			return bScore - aScore;
		})[0];
};

const lookupDomainByCompanyName = async (companyName: string): Promise<string | undefined> => {
	const cacheKey = normalizeName(companyName);
	if (COMPANY_DOMAIN_CACHE.has(cacheKey)) {
		return COMPANY_DOMAIN_CACHE.get(cacheKey);
	}

	const query = companyName.trim();
	if (!query) {
		COMPANY_DOMAIN_CACHE.set(cacheKey, undefined);
		return undefined;
	}

	try {
		const response = await fetch(
			`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`,
			{
				next: { revalidate: 60 * 60 * 24 },
			}
		);

		if (!response.ok) {
			COMPANY_DOMAIN_CACHE.set(cacheKey, undefined);
			return undefined;
		}

		const payload = (await response.json()) as ClearbitAutocompleteCompany[];
		const bestMatch = pickBestClearbitMatch(payload, companyName);
		const resolvedDomain = bestMatch?.domain?.replace(/^www\./i, '').toLowerCase();

		COMPANY_DOMAIN_CACHE.set(cacheKey, resolvedDomain);
		return resolvedDomain;
	} catch {
		COMPANY_DOMAIN_CACHE.set(cacheKey, undefined);
		return undefined;
	}
};

const canLoadImageUrl = async (url: string): Promise<boolean> => {
	if (IMAGE_URL_CACHE.has(url)) {
		return IMAGE_URL_CACHE.get(url) ?? false;
	}

	try {
		const response = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			next: { revalidate: 60 * 60 * 24 },
		});

		const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
		const isValid = response.ok && IMAGE_CONTENT_TYPE_REGEX.test(contentType);

		IMAGE_URL_CACHE.set(url, isValid);
		return isValid;
	} catch {
		IMAGE_URL_CACHE.set(url, false);
		return false;
	}
};

const getLogoCandidates = (domain: string) => [
	{
		url: `https://logo.clearbit.com/${domain}`,
		source: 'clearbit' as const,
	},
	{
		url: `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(`https://${domain}`)}`,
		source: 'google-favicon' as const,
	},
];

export const resolveCompanyLogo = async ({ companyName, websiteHint }: ResolveLogoInput): Promise<CompanyLogoResult> => {
	const website = websiteHint?.trim() || undefined;

	const domainFromWebsite = website ? domainFromUrl(website) : undefined;
	const domainFromSearch = domainFromWebsite ? undefined : await lookupDomainByCompanyName(companyName);
	const domain = domainFromWebsite ?? domainFromSearch;

	if (!domain) {
		return {
			companyName,
			website,
			source: 'none',
		};
	}

	const candidates = getLogoCandidates(domain);

	for (const candidate of candidates) {
		if (await canLoadImageUrl(candidate.url)) {
			return {
				companyName,
				website,
				domain,
				logoUrl: candidate.url,
				source: candidate.source,
			};
		}
	}

	return {
		companyName,
		website,
		domain,
		source: 'none',
	};
};
