const CV_SOURCE_URL = process.env.CV_SOURCE_URL?.trim() || '';

function validateCvSourceUrl(url: string): void {
  if (!url) {
    throw new Error(
      'CV source URL is empty. Set CV_SOURCE_URL to a public raw .tex URL.'
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `Invalid CV source URL "${url}". Set CV_SOURCE_URL to a valid HTTPS raw .tex URL.`
    );
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `Invalid CV source URL protocol "${parsed.protocol}". Use an HTTPS raw .tex URL.`
    );
  }
}

export async function fetchCvSource(): Promise<string> {
  validateCvSourceUrl(CV_SOURCE_URL);

  const response = await fetch(CV_SOURCE_URL, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CV source (${response.status} ${response.statusText}) from ${CV_SOURCE_URL}`
    );
  }

  return response.text();
}
