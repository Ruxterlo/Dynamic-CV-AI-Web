import { loadJobCannonReport } from '@/lib/jobcannon';
import EnneagramModal from './EnneagramModal';
import ChartModal from './ChartModal';
import HeaderChartTrigger from './HeaderChartTrigger';
import JobCannonSectionToggle from './JobCannonSectionToggle';

const MULTIPLE_INTELLIGENCE_LABELS: Record<string, string> = {
	bodily: 'Bodily',
	logical: 'Logical',
	musical: 'Musical',
	spatial: 'Spatial',
	linguistic: 'Linguistic',
	naturalist: 'Naturalist',
	interpersonal: 'Interpersonal',
	intrapersonal: 'Intrapersonal',
};

const LEADERSHIP_LABELS: Record<string, string> = {
	AUT: 'Autocratic',
	DEM: 'Democratic',
	LAI: 'Laissez-faire',
	TRA: 'Transformational',
};

const DISC_LABELS: Record<string, string> = {
	D: 'Dominance',
	I: 'Influence',
	S: 'Steadiness',
	C: 'Conscientiousness',
};

const EQ_LABELS: Record<string, string> = {
	empathy: 'Empathy',
	social_skills: 'Social skills',
	self_awareness: 'Self-awareness',
	self_regulation: 'Self-regulation',
};

const BIG_FIVE_LABELS: Record<string, string> = {
	O: 'Openness',
	C: 'Conscientiousness',
	E: 'Extraversion',
	A: 'Agreeableness',
	N: 'Emotional stability',
};

const ENNEAGRAM_TYPES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const ENNEAGRAM_LABELS: Record<string, string> = {
	1: 'Type 1',
	2: 'Type 2',
	3: 'Type 3',
	4: 'Type 4',
	5: 'Type 5',
	6: 'Type 6',
	7: 'Type 7',
	8: 'Type 8',
	9: 'Type 9',
};

const normalizeScore = (value: number, maxValue: number): number => {
	if (maxValue <= 0) {
		return 0;
	}

	return Math.max(0, Math.min(100, (value / maxValue) * 100));
};

const formatSignedValue = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const BarChart = ({
	title,
	entries,
	labelMap,
	maxValue,
	highlight,
}: {
	title: string;
	entries: Array<[string, number]>;
	labelMap: Record<string, string>;
	maxValue: number;
	highlight?: string;
}) => (
	<div className="jobCannonChartCard">
		<div className="jobCannonBars">
			{entries.map(([key, value]) => {
				const label = labelMap[key] ?? key;
				const width = normalizeScore(value, maxValue);

				return (
					<div key={key} className={`jobCannonBarRow${highlight === key ? ' is-highlighted' : ''}`}>
						<div className="jobCannonBarMeta">
							<span>{label}</span>
							<strong>{Math.round(value)}</strong>
						</div>
						<div className="jobCannonBarTrack" aria-hidden="true">
							<span style={{ width: `${width}%` }} />
						</div>
					</div>
				);
			})}
		</div>
	</div>
);

const SpectrumChart = ({ entries }: { entries: Array<[string, number]> }) => {
	const maxAbs = Math.max(...entries.map(([, value]) => Math.abs(value)), 1);

	return (
		<div className="jobCannonChartCard">
			<div className="jobCannonSpectrumList">
				{entries.map(([key, value]) => {
					const halfWidth = normalizeScore(Math.abs(value), maxAbs);
					const isPositive = value >= 0;
					const barStyle = isPositive
						? { left: '50%', width: `${halfWidth / 2}%` }
						: { left: `${50 - halfWidth / 2}%`, width: `${halfWidth / 2}%` };

					return (
						<div key={key} className="jobCannonSpectrumRow">
							<div className="jobCannonSpectrumLabels">
								<span>{key[0] ?? ''}</span>
								<span>{key[1] ?? ''}</span>
							</div>
							<div className="jobCannonSpectrumTrack" aria-hidden="true">
								<span className="jobCannonSpectrumCenter" />
								<span className={`jobCannonSpectrumBar${isPositive ? ' is-positive' : ' is-negative'}`} style={barStyle} />
							</div>
							<div className="jobCannonSpectrumValue">{formatSignedValue(value)}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const RadarChart = ({ entries }: { entries: Array<[string, number]> }) => {
	const size = 260;
	const center = size / 2;
	const radius = 88;
	const levels = [0.3, 0.55, 0.8, 1];
	const maxValue = Math.max(...entries.map(([, value]) => value), 1);
	const pointsFor = (ratio: number) =>
		entries
			.map(([, value], index) => {
				const angle = -Math.PI / 2 + (index / entries.length) * Math.PI * 2;
				const scaled = radius * ratio * (value / maxValue);
				const x = center + Math.cos(angle) * scaled;
				const y = center + Math.sin(angle) * scaled;
				return `${x.toFixed(2)},${y.toFixed(2)}`;
			})
			.join(' ');

	return (
		<div className="jobCannonChartCard">
			<svg className="jobCannonRadar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar chart">
				{levels.map(level => (
					<polygon key={level} points={pointsFor(level)} className="jobCannonRadarRing" />
				))}
				{entries.map(([, value], index) => {
					const angle = -Math.PI / 2 + (index / entries.length) * Math.PI * 2;
					const x = center + Math.cos(angle) * radius;
					const y = center + Math.sin(angle) * radius;
					const labelX = center + Math.cos(angle) * (radius + 22);
					const labelY = center + Math.sin(angle) * (radius + 22);

					return (
						<g key={`${index}-${value}`}>
							<line x1={center} y1={center} x2={x} y2={y} className="jobCannonRadarAxis" />
							<text x={labelX} y={labelY} className="jobCannonRadarLabel" textAnchor="middle" dominantBaseline="middle">
								{entries[index]?.[0]}
							</text>
						</g>
					);
				})}
				<polygon points={pointsFor(1)} className="jobCannonRadarValue" />
				{entries.map(([, value], index) => {
					const angle = -Math.PI / 2 + (index / entries.length) * Math.PI * 2;
					const x = center + Math.cos(angle) * radius * (value / maxValue);
					const y = center + Math.sin(angle) * radius * (value / maxValue);
					return <circle key={`${index}-${value}-dot`} cx={x} cy={y} r="3.6" className="jobCannonRadarDot" />;
				})}
			</svg>
		</div>
	);
};

const StudyInsight = ({
	headline,
	summary,
	bullets,
	employerSignal,
}: {
	headline: string;
	summary: string;
	bullets: string[];
	employerSignal: string;
}) => (
	<div className="jobCannonInsightCard">
		<p className="jobCannonInsightEyebrow">AI insight</p>
		<h3>{headline}</h3>
		<p>{summary}</p>
		<ul>
			{bullets.map(bullet => (
				<li key={bullet}>{bullet}</li>
			))}
		</ul>
		<div className="jobCannonEmployerSignal">{employerSignal}</div>
	</div>
);

const buildStudyEntries = (study: Awaited<ReturnType<typeof loadJobCannonReport>>['studies'][number]) =>
	Object.entries(study.scores).sort((left, right) => right[1] - left[1]);

const buildEnneagramEntries = (study: Awaited<ReturnType<typeof loadJobCannonReport>>['studies'][number]) =>
	ENNEAGRAM_TYPES.map(type => [type, study.scores[type] ?? 0] as [string, number]);

/* EnneagramCombinedChart removed — replaced by EnneagramModal (modal-based radar) */

const renderStudyChart = (
	study: Awaited<ReturnType<typeof loadJobCannonReport>>['studies'][number],
	triggerId?: string,
) => {
	const entries = buildStudyEntries(study);

	if (study.slug === 'multiple-intelligences') {
		return (
			<ChartModal title="Multiple intelligence profile" previewLabel="Open multiple intelligences" triggerId={triggerId}>
				<BarChart title="Multiple intelligence profile" entries={entries} labelMap={MULTIPLE_INTELLIGENCE_LABELS} maxValue={100} highlight={study.topResult} />
			</ChartModal>
		);
	}

	if (study.slug === 'leadership-style') {
		return (
			<ChartModal title="Leadership style mix" previewLabel="Open leadership chart" triggerId={triggerId}>
				<BarChart title="Leadership style mix" entries={entries} labelMap={LEADERSHIP_LABELS} maxValue={100} highlight={study.topResult} />
			</ChartModal>
		);
	}

	if (study.slug === 'enneagram') {
		return <EnneagramModal study={study} triggerId={triggerId} />;
	}

	if (study.slug === 'mbti-type-indicator') {
		return (
			<ChartModal title="MBTI spectrum" previewLabel="Open MBTI spectrum" triggerId={triggerId}>
				<SpectrumChart entries={entries} />
			</ChartModal>
		);
	}

	if (study.slug === 'eq-emotional-intelligence') {
		return (
			<ChartModal title="Emotional intelligence dimensions" previewLabel="Open EQ chart" triggerId={triggerId}>
				<BarChart title="Emotional intelligence dimensions" entries={entries} labelMap={EQ_LABELS} maxValue={100} highlight={study.topResult} />
			</ChartModal>
		);
	}

	if (study.slug === 'disc') {
		return (
			<ChartModal title="DISC balance" previewLabel="Open DISC chart" triggerId={triggerId}>
				<BarChart title="DISC balance" entries={entries} labelMap={DISC_LABELS} maxValue={100} highlight={study.topResult} />
			</ChartModal>
		);
	}

	return (
		<ChartModal title="Personality radar" previewLabel="Open personality radar" triggerId={triggerId}>
			<RadarChart entries={entries.map(([key, value]) => [BIG_FIVE_LABELS[key] ?? key, value])} />
		</ChartModal>
	);
};

export default async function JobCannonInsights() {
	const report = await loadJobCannonReport();
	const studies = report.studies;

	if (studies.length === 0) {
		return null;
	}

	return (
		<section className="jobCannonSection" id="jobcannon-insights">
			<div className="portfolioSectionHeadingBlock">
				<p className="portfolioSectionEyebrow">JobCannon intelligence</p>
				<h2>Personality Assessment insights</h2>
			</div>

			{
				(() => {
					const titles = studies.map(s => s.title).filter(Boolean);
					const formatted = (() => {
						if (titles.length === 0) return 'no tests available';
						if (titles.length === 1) return titles[0];
						if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
						return `${titles.slice(0, -1).join(', ')} and ${titles[titles.length - 1]}`;
					})();

					return (
						<p className="jobCannonSourceNote">
							Personality assessment summaries and interactive profiles for {formatted}.
						</p>
					);
				})()
			}

			<div className="jobCannonSummaryGrid">
				<div className="jobCannonSummarySpacer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
					<span>Test Results Export</span>
					<JobCannonSectionToggle targetId="jobcannon-insights-body" defaultExpanded={false} />
				</div>
				<div className="jobCannonSummaryCard jobCannonSummaryCardStudies">
					<span>Studies</span>
					<strong>{report.totalTests || studies.length}</strong>
				</div>
				<div className="jobCannonSummaryCard jobCannonSummaryCardLastUpdate">
					<span>Last update</span>
					<strong>{report.exportedAt ?? 'Unknown'}</strong>
				</div>
			</div>

			<p className="jobCannonIntroSmall">Expand to view personality test results and AI insights.</p>

			<div id="jobcannon-insights-body" style={{ display: 'none' }}>
				<div className="jobCannonStudyStack">
				{studies.map(study => (
					<article key={study.slug} className="jobCannonStudy" id={`jobcannon-${study.slug}`}>
						<div className="jobCannonStudyHeader">
							<div>
								<p className="jobCannonStudyEyebrow">{study.completed || 'Assessment result'}</p>
								<h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
									{study.title}
									<HeaderChartTrigger slug={study.slug} title={study.title} />
								</h3>
							</div>
							<div className="jobCannonStudyMeta">
								<span>{study.questionsAnswered}/{study.totalQuestions} answered</span>
								<strong>Top result: {study.topResult}</strong>
							</div>
						</div>

						<div className="jobCannonStudyBody">
							{renderStudyChart(study, `chart-trigger-${study.slug}`)}
							<StudyInsight {...study.insight} />
						</div>
					</article>
				))}
				</div>
			</div>
		</section>
	);
}