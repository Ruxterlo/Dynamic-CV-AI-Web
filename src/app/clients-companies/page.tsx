import { fetchCvSource } from '@/lib/cvSource';
import Image from 'next/image';
import { resolveCompanyLogo } from '@/lib/logoFetcher';

type CompanyEntry = {
  companyName: string;
  website?: string;
};

export default async function ClientsCompanies() {
  const cvText = await fetchCvSource();

  // Capturar la sección
  const sectionRegex = /\\cvsection\{Clients.*?Companies\}([\s\S]*?)(?=(\\cvsection|$))/;
  const sectionMatch = cvText.match(sectionRegex);

  if (!sectionMatch) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Clients & Companies</h1>
        <p>Section not found.</p>
      </main>
    );
  }

  let sectionText = sectionMatch[1];

  // Limpiar comandos LaTeX básicos
  sectionText = sectionText
    .replace(/\\setlength\{.*?\}\{.*?\}/g, '')
    .replace(/\\\\/g, ' ')
    .trim();

  const blocks: string[] = [];

  // 1️⃣ Intentar extraer itemize
  const itemizeRegex = /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/;
  const itemizeMatch = sectionText.match(itemizeRegex);

  if (itemizeMatch) {
    const itemsText = itemizeMatch[1];

    const itemRegex = /\\item\s+([\s\S]*?)(?=(\\item|$))/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(itemsText)) !== null) {
      const item = match[1].trim();
      blocks.push(item);
    }
  } else {
    // 2️⃣ Si no hay itemize → dividir por comas
    const cleaned = sectionText
      .replace(/\\textbf\{(.+?)\}/g, '$1')
      .replace(/\\&/g, '&');

    cleaned.split(',').forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length > 0) blocks.push(trimmed);
    });
  }

  const latexToPlainText = (text: string) =>
    text
      .replace(/\\textbf\{([^}]*)\}/g, '$1')
      .replace(/\\emph\{([^}]*)\}/g, '$1')
      .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
      .replace(/\\&/g, '&')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const extractWebsite = (text: string) => {
    const hrefUrl = text.match(/\\href\{([^}]*)\}/)?.[1]?.trim();
    if (hrefUrl) {
      return hrefUrl;
    }

    const inlineUrl = text.match(/https?:\/\/[^\s}]+/i)?.[0]?.trim();
    if (inlineUrl) {
      return inlineUrl;
    }

    return undefined;
  };

  const extractCompanyName = (text: string) => {
    const plain = latexToPlainText(text);

    const beforeColon = plain.split(':')[0]?.trim();
    if (beforeColon) {
      return beforeColon;
    }

    const beforeDash = plain.split('-')[0]?.trim();
    if (beforeDash) {
      return beforeDash;
    }

    return plain;
  };

  const toCompanyEntry = (block: string): CompanyEntry | null => {
    const companyName = extractCompanyName(block);
    if (!companyName) {
      return null;
    }

    return {
      companyName,
      website: extractWebsite(block),
    };
  };

  const entries = blocks
    .map(toCompanyEntry)
    .filter((entry): entry is CompanyEntry => entry !== null);

  const companies = await Promise.all(
    entries.map(async entry => {
      const logo = await resolveCompanyLogo({
        companyName: entry.companyName,
        websiteHint: entry.website,
      });

      return {
        ...entry,
        website: logo.website ?? entry.website,
        domain: logo.domain,
        logoUrl: logo.logoUrl,
        logoSource: logo.source,
      };
    })
  );

  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Clients & Companies</h1>

      <div
        style={{
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.9rem',
        }}
      >
        {companies.map((company, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.95rem 0.75rem',
              borderRadius: '10px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ececec',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              fontSize: '14px',
              textAlign: 'center',
              minHeight: '130px',
            }}
          >
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e2e2',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
                title={company.logoSource === 'none' ? `Open ${company.companyName} website` : `Open ${company.companyName} (${company.logoSource})`}
              >
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.companyName} logo`}
                    width={56}
                    height={56}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    unoptimized
                  />
                ) : (
                  company.companyName.slice(0, 2).toUpperCase()
                )}
              </a>
            ) : (
              <span
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e2e2',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
                title="No website available"
              >
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.companyName} logo`}
                    width={56}
                    height={56}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    unoptimized
                  />
                ) : (
                  company.companyName.slice(0, 2).toUpperCase()
                )}
              </span>
            )}

            <strong>{company.companyName}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
