export function extractSection(
  cvText: string,
  sectionName: string,
  options?: {
    preserveItemize?: boolean;
  }
): string {

  // Escapar nombre de sección para regex
  const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Detecta \section*{} o \cvsection{}
  const regex = new RegExp(
    `\\\\(?:section\\*|cvsection)\\{${escapedSectionName}[^}]*\\}([\\s\\S]*?)(?=\\\\section|\\\\cvsection|$)`,
    'i'
  );

  const match = cvText.match(regex);
  if (!match) return 'Section not found';

  let content = match[1];

  // ------------------------------------------------
  // 1. Limpieza básica LaTeX estructural
  // ------------------------------------------------
  content = content
    .split('\n')
    .filter(line => !line.trim().startsWith('%'))      // comentarios
    .filter(line => !line.trim().startsWith('\\setlength'))
    .filter(line => !line.trim().startsWith('\\vspace'))
    .join('\n');

  // ------------------------------------------------
  // 2. Eliminar configuraciones inline
  // ------------------------------------------------
  content = content.replace(/\\begin\{itemize\}\[.*?\]/g, '\\begin{itemize}');
  content = content.replace(/\\setlength\\itemsep-?\d+pt/g, '');
  content = content.replace(/\[leftmargin=.*?\]/g, '');

  // ------------------------------------------------
  // 3. Eliminar símbolos LaTeX visuales
  // ------------------------------------------------
  content = content.replace(/\$/g, '');
  content = content.replace(/\\&/g, '&');
  content = content.replace(/\\vspace.*?cm/g, '');

  // ------------------------------------------------
  // 4. Convertir texto en negrita (EXCEPTO FECHAS)
  // ------------------------------------------------
  // Detecta fechas reales con dash largo o corto
  const dateRegex = /\d{4}(?:--|–)\d{4}/g;
  const protectedDates: string[] = [];

  // Proteger fechas
  content = content.replace(dateRegex, match => {
    const key = `__DATE_${protectedDates.length}__`;
    protectedDates.push(match);
    return key;
  });

  // Convertir \textbf{} a <strong>
  content = content.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');

  // Restaurar fechas sin <strong>
  protectedDates.forEach((date, i) => {
    content = content.replace(`__DATE_${i}__`, date);
  });

	// ------------------------------------------------
	// 5. Manejo de itemize (dependiendo de la sección)
	// ------------------------------------------------
	content = content.replace(
	  /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
    (_: string, itemsBlock: string) => {
    const items: string[] = itemsBlock
		  .split(/\\item\s+/)
      .filter((item: string) => item.trim())
      .map((item: string) => item.trim());

		// 👉 Skills / declarativo → mantener lista
		if (options?.preserveItemize) {
      return `<ul>${items.map((item: string) => `<li>${item}</li>`).join('')}</ul>`;
		}

		// 👉 Experience / Education → texto plano
		return items.join('\n');
	  }
	);


  // ------------------------------------------------
  // 6. Separadores visuales
  // ------------------------------------------------
  // Normalizar separadores |
  content = content.replace(/\s*\|\s*/g, ' | ');

  // Saltos de línea
  content = content.replace(/\\\\/g, '<br>');

  // ------------------------------------------------
  // 7. Limpieza final
  // ------------------------------------------------
  content = content.replace(/\{|\}/g, '');
  content = content.replace(/\n{2,}/g, '\n');

  return content.trim();
}
