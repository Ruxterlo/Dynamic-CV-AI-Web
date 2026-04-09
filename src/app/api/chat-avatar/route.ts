import { fetchCvSource } from '@/lib/cvSource';

export const dynamic = 'force-dynamic';

const CV_SOURCE_URL = process.env.CV_SOURCE_URL?.trim() || '';
const POOF_API_KEY = process.env.POOF_API_KEY?.trim() || process.env.REMOVEBG_API_KEY?.trim() || '';
const POOF_API_URL = 'https://api.poof.bg/v1/remove';

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

	try {
		return new URL(cleanedPath).toString();
	} catch {
		if (!CV_SOURCE_URL) {
			return null;
		}

		try {
			return new URL(encodeURI(cleanedPath), CV_SOURCE_URL).toString();
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

	const chatbotPattern = /chatbot(?:\s|%20|_|-)*photo/i;
	const profilePattern = /photo|profile|avatar|headshot/i;
	const preferred =
		matches.find(path => chatbotPattern.test(path)) ??
		matches.find(path => profilePattern.test(path)) ??
		matches[0];
	return resolveCvAssetUrl(preferred);
};

const tryResolveChatbotVariantUrl = async (imageUrl: string): Promise<string> => {
	const chatbotVariantUrl = imageUrl.replace(
		/profile(?:\s|%20|_|-)*photo/gi,
		'Chatbot%20Photo'
	);

	if (chatbotVariantUrl === imageUrl) {
		return imageUrl;
	}

	try {
		const response = await fetch(chatbotVariantUrl, {
			method: 'HEAD',
			cache: 'no-store',
		});

		if (response.ok) {
			return chatbotVariantUrl;
		}
	} catch {
		// Keep original image URL if the chatbot variant is unavailable.
	}

	return imageUrl;
};

export async function GET() {
	try {
		const cvText = await fetchCvSource();
		const extractedImageUrl = extractProfileImageUrl(cvText);

		if (!extractedImageUrl) {
			return new Response('Profile image not found in CV source.', { status: 404 });
		}

		const profileImageUrl = await tryResolveChatbotVariantUrl(extractedImageUrl);

		if (!POOF_API_KEY) {
			console.log('[chat-avatar] No API key configured, returning original image');
			const response = await fetch(profileImageUrl, { cache: 'no-store' });
			if (!response.ok) {
				return new Response('Failed to fetch profile image', { status: 500 });
			}
			return new Response(response.body, {
				status: 200,
				headers: {
					'Content-Type': response.headers.get('content-type') ?? 'image/jpeg',
					'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
				},
			});
		}

		console.log('[chat-avatar] Downloading image from:', profileImageUrl);
		const imageResponse = await fetch(profileImageUrl, { cache: 'no-store' });
		if (!imageResponse.ok) {
			return new Response('Failed to fetch profile image', { status: 500 });
		}

		const imageBuffer = await imageResponse.arrayBuffer();
		const blob = new Blob([imageBuffer], { type: imageResponse.headers.get('content-type') ?? 'image/jpeg' });

		// Create FormData for poof.bg API
		const formData = new FormData();
		formData.append('image_file', blob, 'profile.jpg');
		formData.append('format', 'png');
		formData.append('size', 'full');

		console.log('[chat-avatar] Calling poof.bg API...');
		const poofResponse = await fetch(POOF_API_URL, {
			method: 'POST',
			headers: {
				'x-api-key': POOF_API_KEY,
			},
			body: formData,
			cache: 'no-store',
		});

		if (!poofResponse.ok) {
			const errorText = await poofResponse.text();
			console.error('[chat-avatar] poof.bg error:', poofResponse.status, errorText.slice(0, 200));
			const fallbackResponse = await fetch(profileImageUrl, { cache: 'no-store' });
			if (!fallbackResponse.ok) {
				return new Response('Failed to fetch fallback image', { status: 500 });
			}
			return new Response(fallbackResponse.body, {
				status: 200,
				headers: {
					'Content-Type': fallbackResponse.headers.get('content-type') ?? 'image/jpeg',
					'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
				},
			});
		}

		console.log('[chat-avatar] poof.bg success');
		return new Response(poofResponse.body, {
			status: 200,
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unable to generate chat avatar.';
		console.error('[chat-avatar] Error:', message);
		return new Response(message, { status: 500 });
	}
}