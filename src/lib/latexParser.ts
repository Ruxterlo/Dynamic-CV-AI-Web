type ExtractSectionOptions = {
  preserveItemize?: boolean;
};

const SECTION_HEADER_REGEX = /\\(?:cvsection|section\*?)\{([^}]*)\}/gi;

const normalizeLatexText = (value: string): string =>
  value
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\emph\{([^}]*)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const toSectionKey = (value: string): string =>
  normalizeLatexText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function findSectionRaw(cvText: string, sectionNames: string[]): string | null {
  const targetKeys = new Set(
    sectionNames
      .map(name => toSectionKey(name))
      .filter(name => name.length > 0)
  );

  if (targetKeys.size === 0) {
    return null;
  }

  const matches = [...cvText.matchAll(SECTION_HEADER_REGEX)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const title = match[1] ?? '';
    const key = toSectionKey(title);

    if (!targetKeys.has(key)) {
      continue;
    }

    const startIndex = (match.index ?? 0) + match[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index ?? cvText.length : cvText.length;
    return cvText.slice(startIndex, endIndex);
  }

  return null;
}

const normalizeInlineLatex = (value: string): string =>
  value
    .replace(/\\(?:begin|end)\{[^}]*\}/g, ' ')
    .replace(/\\qrcode(?:\[[^\]]*\])?\{[^}]*\}/g, '')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
    .replace(/\\fa[A-Za-z]+(?:\{[^}]*\})?/g, '')
    .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
    .replace(/\\emph\{([^}]*)\}/g, '$1')
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\$/g, '')
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function extractRawSection(cvText: string, sectionName: string | string[]): string | null {
  const sectionNames = Array.isArray(sectionName) ? sectionName : [sectionName];
  return findSectionRaw(cvText, sectionNames);
}

export function extractSection(
  cvText: string,
  sectionName: string | string[],
  options?: ExtractSectionOptions
): string {
  const sectionNames = Array.isArray(sectionName) ? sectionName : [sectionName];
  const rawSection = findSectionRaw(cvText, sectionNames);

  if (!rawSection) {
    return 'Section not found';
  }

  let content = rawSection
    .split('\n')
    .filter(line => !line.trim().startsWith('%'))
    .filter(line => !line.trim().startsWith('\\setlength'))
    .filter(line => !line.trim().startsWith('\\vspace'))
    .join('\n');

  content = content.replace(/\\begin\{itemize\}\[.*?\]/g, '\\begin{itemize}');
  content = content.replace(/\\setlength\\itemsep-?\d+pt/g, '');
  content = content.replace(/\[leftmargin=.*?\]/g, '');

  content = content.replace(
    /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
    (_: string, itemsBlock: string) => {
      const items = itemsBlock
        .split(/\\item\s+/)
        .map(item => normalizeInlineLatex(item))
        .filter(item => item.length > 0);

      if (options?.preserveItemize) {
        return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
      }

      return items.join('\n');
    }
  );

  content = content
    .split('\n')
    .map(line => normalizeInlineLatex(line.replace(/\\\\/g, ' ')))
    .filter(line => line.length > 0)
    .map(line => line.replace(/\s*\|\s*/g, ' | '))
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();

  return content;
}
