import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateJobCannonInsights, type JobCannonInsight } from '@/lib/openai';

export type JobCannonStudy = {
	slug: string;
	title: string;
	topResult: string;
	completed: string;
	questionsAnswered: number;
	totalQuestions: number;
	scores: Record<string, number>;
	metadata: Record<string, string>;
	insight: JobCannonInsight;
};

export type JobCannonReport = {
	sourcePath: string;
	exportedAt: string | null;
	totalTests: number;
	studies: JobCannonStudy[];
};

const JOBCANNON_FILE_REGEX = /^jobcannon-results.*\.md$/i;

const normalizeSlug = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const parseNumber = (value: string): number | null => {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const parseIntro = (markdown: string): { exportedAt: string | null; totalTests: number } => {
	const exportedAt = markdown.match(/_Exported\s+([^·_]+)\s+·/i)?.[1]?.trim() ?? null;
	const totalTests = Number.parseInt(markdown.match(/_Exported\s+[^·_]+\s+·\s*(\d+)\s+tests/i)?.[1] ?? '0', 10);

	return {
		exportedAt,
		totalTests: Number.isFinite(totalTests) ? totalTests : 0,
	};
};

const parseStudies = (markdown: string): Omit<JobCannonStudy, 'insight'>[] => {
	const sections = markdown.split(/^##\s+/gm).slice(1);

	return sections.map(section => {
		const [rawTitle, ...restLines] = section.split('\n');
		const title = rawTitle?.trim() || 'Untitled study';
		const rest = restLines.join('\n');
		const topResult = rest.match(/\*\*Top result:\*\*\s*([^\n]+)/i)?.[1]?.trim() ?? '';
		const completed = rest.match(/\*\*Completed:\*\*\s*([^\n]+)/i)?.[1]?.trim() ?? '';
		const questionsAnswered = Number.parseInt(
			rest.match(/\*\*Questions answered:\*\*\s*(\d+)/i)?.[1] ?? '0',
			10
		);
		const totalQuestions = Number.parseInt(
			rest.match(/\*\*Questions answered:\*\*\s*\d+\s+of\s+(\d+)/i)?.[1] ?? '0',
			10
		);

		const scores: Record<string, number> = {};
		const metadata: Record<string, string> = {};

		for (const line of rest.split('\n')) {
			const match = line.match(/^[-*]\s*([^:]+):\s*(.+)$/);
			if (!match) {
				continue;
			}

			const key = match[1]?.trim() ?? '';
			const value = match[2]?.trim() ?? '';
			const numericValue = parseNumber(value);

			if (numericValue !== null) {
				scores[key] = numericValue;
			} else if (key) {
				metadata[key] = value;
			}
		}

		return {
			slug: normalizeSlug(title),
			title,
			topResult,
			completed,
			questionsAnswered: Number.isFinite(questionsAnswered) ? questionsAnswered : 0,
			totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
			scores,
			metadata,
		};
	});
};

async function resolveJobCannonSourcePath(): Promise<string> {
	const workspaceRoot = process.cwd();
	const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
	const candidates = entries
		.filter(entry => entry.isFile() && JOBCANNON_FILE_REGEX.test(entry.name))
		.map(entry => path.join(workspaceRoot, entry.name));

	if (candidates.length === 0) {
		return path.join(workspaceRoot, 'jobcannon-results-2026-07-30.md');
	}

	if (candidates.length === 1) {
		return candidates[0];
	}

	const withStats = await Promise.all(
		candidates.map(async candidate => ({
			path: candidate,
			mtimeMs: (await fs.stat(candidate)).mtimeMs,
		}))
	);

	withStats.sort((left, right) => right.mtimeMs - left.mtimeMs);
	return withStats[0]?.path ?? candidates[0];
}

export async function loadJobCannonReport(): Promise<JobCannonReport> {
	const sourcePath = await resolveJobCannonSourcePath();
	const markdown = await fs.readFile(sourcePath, 'utf8');
	const { exportedAt, totalTests } = parseIntro(markdown);
	const studies = parseStudies(markdown);
	const insights = await generateJobCannonInsights(studies);

	return {
		sourcePath,
		exportedAt,
		totalTests,
		studies: studies.map(study => ({
			...study,
			insight: insights[study.slug],
		})),
	};
}