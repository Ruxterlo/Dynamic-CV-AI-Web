const CV_REPO_RAW_URL =
  'https://raw.githubusercontent.com/Ruxterlo/roque-s-cv/main/main.tex';

export async function fetchCvSource(): Promise<string> {
  const response = await fetch(CV_REPO_RAW_URL, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CV source from GitHub');
  }

  return response.text();
}
