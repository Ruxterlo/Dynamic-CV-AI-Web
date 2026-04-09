'use client';

import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import EducationTimeline, { type EducationTimelineItem } from '@/components/EducationTimeline';
import WorkTimeline, { type WorkTimelineItem } from '@/components/WorkTimeline';

export const PREVIEW_MAX_LINES = 5;

type StoryChapter = {
  id: string;
  href: string;
  title: string;
  previewLines: string[];
  hasOverflow: boolean;
  educationTimelineItems?: EducationTimelineItem[];
  educationTimelineStartYear?: number;
  educationTimelineEndYear?: number;
  workTimelineItems?: WorkTimelineItem[];
  workTimelineStartYear?: number;
  workTimelineEndYear?: number;
};

type StoryFlowProps = {
  chapters: StoryChapter[];
  backgroundImage: string;
};

type TimelineParts = {
  date: string;
  role: string;
  company: string;
  location?: string;
};

const renderTimelinePart = (value: string, className: string) => {
  const hasHtml = /<[^>]+>/.test(value);
  if (!hasHtml) {
    return <span className={className}>{value}</span>;
  }

  return <span className={className} dangerouslySetInnerHTML={{ __html: value }} />;
};

const tryParseTimeline = (line: string): TimelineParts | null => {
  const parts = line
    .split(/\s*\|\s*/)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length < 3 || parts.length > 4) {
    return null;
  }

  return {
    date: parts[0],
    role: parts[1],
    company: parts[2],
    location: parts[3],
  };
};

const PROFESSIONAL_SUMMARY_VISIBLE_LINES = 3;
const TECHNOLOGY_SKILLS_VISIBLE_LINES = 3;
const HOBBIES_VISIBLE_LINES = 6;
const CLIENTS_VISIBLE_LINES = 6;

const normalizeChapterTitle = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getChapterRailIcon = (title: string): string => {
  const normalized = normalizeChapterTitle(title);

  if (normalized.includes('professional summary')) return '🧭';
  if (normalized.includes('technology skills')) return '💻';
  if (normalized.includes('education')) return '🎓';
  if (normalized.includes('work experience')) return '💼';
  if (normalized.includes('projects')) return '🛠️';
  if (normalized.includes('languages')) return '🗣️';
  if (normalized.includes('flexibility') || normalized.includes('mobility')) return '✈️';
  if (normalized.includes('hobbies') || normalized.includes('interests')) return '🎯';
  if (normalized.includes('clients') || normalized.includes('companies')) return '🤝';
  if (normalized.includes('portfolio') || normalized.includes('profiles')) return '🔗';

  return '•';
};

export default function StoryFlow({ chapters, backgroundImage }: StoryFlowProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chapterIds = useMemo(() => chapters.map(chapter => chapter.id), [chapters]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const container = sectionRef.current;
    if (!container || chapterIds.length === 0) {
      return;
    }

    const elements = chapterIds
      .map(id => container.querySelector<HTMLElement>(`#${CSS.escape(id)}`))
      .filter((item): item is HTMLElement => !!item);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.35, 0.55],
        rootMargin: '-12% 0px -45% 0px',
      }
    );

    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, [chapterIds]);

  return (
    <section
      ref={sectionRef}
      className="storyInformation"
      style={{ position: 'relative', backgroundImage: `url(${backgroundImage})` }}
      aria-label="Narrative chapters"
    >
      <div className="storyInformationOverlay" />
      <button
        type="button"
        className="storyMobileMenuButton"
        aria-label={isMobileMenuOpen ? 'Close section menu' : 'Open section menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="story-chapter-navigation"
        onClick={() => setIsMobileMenuOpen(value => !value)}
      >
        <span aria-hidden="true">☰</span>
        <span>Menu</span>
      </button>

      <div
        className={`storyMobileNavBackdrop${isMobileMenuOpen ? ' is-visible' : ''}`}
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="storyLayout">
        <aside
          id="story-chapter-navigation"
          className={`storyChaptersRail${isMobileMenuOpen ? ' is-open' : ''}`}
          aria-label="Story chapter navigation"
        >
          <div className="storyRailProgressTrack" aria-hidden="true">
            <motion.div className="storyRailProgressFill" style={{ scaleY: scrollYProgress }} />
          </div>

          <nav>
            <ul className="storyRailList">
              {chapters.map(chapter => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    className={`storyRailLink${activeId === chapter.id ? ' is-active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="storyRailLinkIcon" aria-hidden="true">
                      {getChapterRailIcon(chapter.title)}
                    </span>
                    <span className="storyRailLinkLabel">{chapter.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="storyContentStack">
          {chapters.map((chapter, chapterIndex) => (
            <section
              key={chapter.id}
              id={chapter.id}
              className={`storyChapterPlain${activeId === chapter.id ? ' is-active' : ''}`}
              aria-labelledby={`${chapter.id}-title`}
            >
              <h2 id={`${chapter.id}-title`} className="storyDisplayHeading">
                <span className="storyChapterIndex" aria-hidden="true">{String(chapterIndex + 1).padStart(2, '0')}</span>
                <span className="storyChapterHeadingText">{chapter.title}</span>
              </h2>

              {chapter.id === 'chapter-education' && chapter.educationTimelineItems?.length ? (
                <div className="storyChapterPreview storyEducationTimelineWrap" aria-label={`${chapter.title} timeline`}>
                  <EducationTimeline
                    items={chapter.educationTimelineItems}
                    startYear={chapter.educationTimelineStartYear}
                    endYear={chapter.educationTimelineEndYear}
                  />
                </div>
              ) : chapter.id === 'chapter-work-experience' && chapter.workTimelineItems?.length ? (
                <div className="storyChapterPreview storyEducationTimelineWrap" aria-label={`${chapter.title} timeline`}>
                  <WorkTimeline
                    items={chapter.workTimelineItems}
                    startYear={chapter.workTimelineStartYear}
                    endYear={chapter.workTimelineEndYear}
                  />
                </div>
              ) : (
                <div className="storyChapterPreview" aria-label={`${chapter.title} preview`}>
                {chapter.previewLines
                  .slice(
                    0,
                    chapter.id === 'chapter-professional-summary'
                      ? PROFESSIONAL_SUMMARY_VISIBLE_LINES
                      : chapter.id === 'chapter-technology-skills'
                        ? TECHNOLOGY_SKILLS_VISIBLE_LINES
                        : chapter.id === 'chapter-hobbies-interests'
                          ? HOBBIES_VISIBLE_LINES
                        : chapter.id === 'chapter-clients-companies'
                          ? CLIENTS_VISIBLE_LINES
                        : PREVIEW_MAX_LINES
                  )
                  .map((line, index, visibleLines) => {
                  const isProfessionalSummary = chapter.id === 'chapter-professional-summary';
                  const isTechnologySkills = chapter.id === 'chapter-technology-skills';
                  const isHobbies = chapter.id === 'chapter-hobbies-interests';
                  const isClients = chapter.id === 'chapter-clients-companies';
                  const visibleLimit = isProfessionalSummary
                    ? PROFESSIONAL_SUMMARY_VISIBLE_LINES
                    : isTechnologySkills
                      ? TECHNOLOGY_SKILLS_VISIBLE_LINES
                      : isHobbies
                        ? HOBBIES_VISIBLE_LINES
                        : isClients
                          ? CLIENTS_VISIBLE_LINES
                      : PREVIEW_MAX_LINES;
                  const isLastVisibleLine = index === visibleLines.length - 1;
                  const shouldAppendEllipsis = (isProfessionalSummary || isTechnologySkills)
                    && chapter.previewLines.length > visibleLimit
                    && isLastVisibleLine;
                  const displayLine = shouldAppendEllipsis ? `${line} ...` : line;
                  const timeline = tryParseTimeline(line);

                  if (!timeline) {
                    // Detect whether the line contains HTML tags
                    const hasHtml = /<[^>]+>/.test(displayLine);
                    if (hasHtml) {
                      return (
                        <p
                          key={`${chapter.id}-line-${index}`}
                          dangerouslySetInnerHTML={{ __html: displayLine }}
                          style={{ margin: '0.5rem 0' }}
                        />
                      );
                    }
                    return <p key={`${chapter.id}-line-${index}`}>{displayLine}</p>;
                  }

                  return (
                    <div key={`${chapter.id}-line-${index}`} className="storyTimelineLine">
                      {renderTimelinePart(timeline.date, 'storyTimelineDate')}
                      {renderTimelinePart(timeline.role, 'storyTimelineRole')}
                      {renderTimelinePart(timeline.company, 'storyTimelineCompany')}
                      {timeline.location && renderTimelinePart(timeline.location, 'storyTimelineLocation')}
                    </div>
                  );
                })}
                </div>
              )}

              <Link href={chapter.href} className="storyChapterCta">
                {chapter.hasOverflow ? 'Read more ...' : 'View full section'}
              </Link>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
