import type { JobCannonStudy } from '@/lib/jobcannon';

export type JobCannonInsight = {
	headline: string;
	summary: string;
	bullets: string[];
	employerSignal: string;
};

type JobCannonInsightMap = Record<string, JobCannonInsight>;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini';

const normalizeText = (value: string): string => value.replace(/\s+/g, ' ').trim();

const topNumericScores = (scores: Record<string, number>, limit: number): Array<[string, number]> =>
  Object.entries(scores)
	.sort((left, right) => right[1] - left[1])
	.slice(0, limit);

const buildHeuristicInsight = (study: JobCannonStudy): JobCannonInsight => {
	const topScores = topNumericScores(study.scores, 3);
	const topScoreText = topScores.map(([label, value]) => `${label} (${value})`).join(', ');
	const highest = topScores[0]?.[0] ?? 'the strongest area';

	if (study.slug === 'multiple-intelligences') {
		return {
			headline: 'Analytical breadth with practical pattern recognition',
			summary: 'The profile combines structured reasoning with spatial and intrapersonal awareness, which supports solving complex work problems without losing context.',
			bullets: [
				`Strongest signals: ${topScoreText}.`,
				'This mix fits roles that need logic, systems thinking and clear translation of complexity into action.',
				'An employer should expect strong diagnosis, planning and independent reflection before execution.',
			],
			employerSignal: `Use this profile for diagnostic, process and solution work centered on ${highest}.`,
		};
	}

	if (study.slug === 'leadership-style') {
		return {
			headline: 'Transformational leadership is the dominant mode',
			summary: 'The result points to a leadership style that motivates through direction, alignment and team momentum instead of pure control.',
			bullets: [
				`Top result: ${study.topResult}.`,
				'Balanced scores show that the style can adapt across directive and collaborative settings when the business context changes.',
				'For employers, this suggests a leader who can move people without losing the operational goal.',
			],
			employerSignal: 'Best suited for change, alignment and implementation environments where people need direction and context.',
		};
	}

	if (study.slug === 'enneagram') {
		return {
			headline: 'Achievement-driven with a strategic depth layer',
			summary: 'Type 3 dominance suggests visible momentum, while the strong 5 score adds analysis, quality control and thoughtful planning.',
			bullets: [
				`Core pattern: ${study.topResult} with a strong analytical secondary profile.`,
				'This usually performs well in consulting, delivery and roles where results must be both visible and well-founded.',
				'The profile can combine pace with depth, which is valuable in client-facing execution.',
			],
			employerSignal: 'A good fit for ownership-heavy roles that value outcome orientation and rigor.',
		};
	}

	if (study.slug === 'mbti-type-indicator') {
		return {
			headline: 'People-centered, structured and execution-friendly',
			summary: 'The MBTI result points to a practical communicator who can translate business needs into coordinated action and stable delivery.',
			bullets: [
				`Type signal: ${study.metadata.fullType || study.topResult}.`,
				'Low-friction communication and team orientation are highlighted by the social and organizational balance.',
				'For employers, this suggests a candidate who can coordinate stakeholders and keep delivery grounded.',
			],
			employerSignal: 'Strong for client work, internal alignment and environments with frequent cross-functional interaction.',
		};
	}

	if (study.slug === 'eq-emotional-intelligence') {
		return {
			headline: 'Relational strength with solid self-management',
			summary: 'The profile shows strong social skills and self-awareness, which are the core ingredients for trust, coaching and collaboration.',
			bullets: [
				`Leading dimensions: ${topScoreText}.`,
				'Social intelligence is the standout signal, supported by decent self-regulation during pressure.',
				'That combination is especially useful in consultative and customer-facing environments.',
			],
			employerSignal: 'Useful for mentoring, stakeholder management and high-contact roles where trust matters.',
		};
	}

	if (study.slug === 'disc') {
		return {
			headline: 'Direct, disciplined and execution-oriented',
			summary: 'The DISC result reflects a balance of drive and structure, with enough steadiness to keep execution moving without becoming chaotic.',
			bullets: [
				`Dominant pattern: ${topScoreText}.`,
				'High D and C values suggest decisiveness plus attention to standards, which is effective in delivery and problem solving.',
				'Moderate S indicates that the pace can be sustained without ignoring team stability.',
			],
			employerSignal: 'Good for implementation, operations and project environments that need ownership and follow-through.',
		};
	}

	return {
		headline: 'Balanced openness with disciplined execution',
		summary: 'The Big Five profile suggests someone who can explore new ideas while remaining structured enough to deliver them reliably.',
		bullets: [
			`Top dimensions: ${topScoreText}.`,
			'High openness and conscientiousness are strong signals for innovation with follow-through.',
			'Lower neuroticism and moderate extraversion support calm client-facing work and steady coordination.',
		],
		employerSignal: 'Strong fit for solution design, implementation and advisory roles that need both curiosity and discipline.',
	};
};

const buildFallbackInsights = (studies: JobCannonStudy[]): JobCannonInsightMap =>
	Object.fromEntries(studies.map(study => [study.slug, buildHeuristicInsight(study)]));

export async function generateJobCannonInsights(studies: JobCannonStudy[]): Promise<JobCannonInsightMap> {
	if (!OPENAI_API_KEY) {
		return buildFallbackInsights(studies);
	}

	const payload = {
		studies: studies.map(study => ({
			slug: study.slug,
			title: study.title,
			topResult: study.topResult,
			completed: study.completed,
			questionsAnswered: study.questionsAnswered,
			totalQuestions: study.totalQuestions,
			metadata: study.metadata,
			scores: study.scores,
		})),
	};

	const systemPrompt = [
		'You are analyzing career-assessment results for a professional portfolio website.',
		'Write concise, employer-facing insights in English only.',
		'Avoid medical, psychiatric, or overly personal claims.',
		'Focus on strengths, working style, and how the profile could help in consulting, implementation, or solution-engineering roles.',
		'Return only valid JSON in the exact shape: {"results":{"slug":{"headline":"...","summary":"...","bullets":["...","...","..."],"employerSignal":"..."}}}.',
	].join(' ');

	const userPrompt = JSON.stringify(payload);

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: OPENAI_MODEL,
				temperature: 0.35,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
			}),
		});

		if (!response.ok) {
			return buildFallbackInsights(studies);
		}

		const body = (await response.json()) as {
			choices?: Array<{ message?: { content?: string | null } }>;
		};

		const content = normalizeText(body.choices?.[0]?.message?.content ?? '');
		if (!content) {
			return buildFallbackInsights(studies);
		}

		const parsed = JSON.parse(content) as {
			results?: Record<string, JobCannonInsight>;
		};

		if (!parsed.results) {
			return buildFallbackInsights(studies);
		}

		const fallback = buildFallbackInsights(studies);
		return Object.fromEntries(
			studies.map(study => [study.slug, parsed.results?.[study.slug] ?? fallback[study.slug]])
		);
	} catch {
		return buildFallbackInsights(studies);
	}
}
