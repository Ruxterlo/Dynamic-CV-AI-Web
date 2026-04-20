'use client';

import { useState } from 'react';

export type WorkTimelineItem = {
  date: string;
  role: string;
  company: string;
  location: string;
  bullets: string[];
};

type WorkTimelineProps = {
  items: WorkTimelineItem[];
  startYear?: number;
  endYear?: number;
};

type ItemLayout = {
  itemIndex: number;
  startYear: number;
  endYear: number;
  startPercent: number;
  endPercent: number;
  widthPercent: number;
  centerPercent: number;
};

const getItemYearBounds = (date: string) => {
  const yearMatches = date.match(/(\d{4})/g) ?? [];
  const startCandidate = yearMatches[0] ? Number(yearMatches[0]) : NaN;
  const endCandidate = yearMatches[1] ? Number(yearMatches[1]) : startCandidate;

  return {
    startYear: Number.isFinite(startCandidate) ? startCandidate : NaN,
    endYear: Number.isFinite(endCandidate) ? endCandidate : NaN,
    isPresent: /\bpresent\b/i.test(date),
  };
};

const getInitialActiveItemIndex = (items: WorkTimelineItem[]) => {
  if (items.length === 0) {
    return 0;
  }

  const currentYear = new Date().getFullYear();

  // Filter out items with "(Part-Time)" in the date
  const isPartTime = (date: string) => /\(part-time\)/i.test(date);
  const nonPartTimeIndices = items
    .map((item, index) => (isPartTime(item.date) ? -1 : index))
    .filter(index => index !== -1);

  // Use non-part-time items if available, otherwise fall back to all items
  const indicesToConsider = nonPartTimeIndices.length > 0 ? nonPartTimeIndices : items.map((_, i) => i);

  let bestIndex = indicesToConsider[0] ?? 0;
  let bestEndYear = -Infinity;
  let bestStartYear = -Infinity;

  indicesToConsider.forEach(index => {
    const item = items[index];
    const bounds = getItemYearBounds(item.date);
    const startYear = Number.isFinite(bounds.startYear) ? bounds.startYear : -Infinity;
    const endYear = bounds.isPresent
      ? currentYear + 1
      : (Number.isFinite(bounds.endYear) ? bounds.endYear : startYear);

    if (endYear > bestEndYear || (endYear === bestEndYear && startYear >= bestStartYear)) {
      bestIndex = index;
      bestEndYear = endYear;
      bestStartYear = startYear;
    }
  });

  return bestIndex;
};

export default function WorkTimeline({ items, startYear: timelineStartYear, endYear: timelineEndYear }: WorkTimelineProps) {
  const timelineItems = items ?? [];
  const [activeItemIndex, setActiveItemIndex] = useState(() => getInitialActiveItemIndex(timelineItems));
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = timelineItems.flatMap(item => {
    const match = item.date.match(/(\d{4})/g);
    return match ? match.map(Number) : [];
  });

  const extractedMinYear = years.length > 0 ? Math.min(...years) : currentYear - 10;
  const extractedMaxYear = years.length > 0 ? Math.max(...years) : currentYear;
  const minYear = Number.isFinite(timelineStartYear ?? NaN) ? (timelineStartYear as number) : extractedMinYear;
  const maxYearCandidate = Number.isFinite(timelineEndYear ?? NaN) ? (timelineEndYear as number) : extractedMaxYear;
  const maxYear = Math.max(maxYearCandidate, minYear + 1);
  const totalYears = Math.max(maxYear - minYear, 1);

  if (timelineItems.length === 0) return null;

  const yearToPercent = (year: number): number => {
    const computed = ((year - minYear) / totalYears) * 100;
    return Math.min(98, Math.max(2, computed));
  };

  const itemRanges = timelineItems.map((item, index): ItemLayout => {
    const bounds = getItemYearBounds(item.date);
    const startCandidate = bounds.startYear;
    const endCandidate = bounds.isPresent ? maxYear : bounds.endYear;
    const fallbackYear = minYear + (index / Math.max(timelineItems.length - 1, 1)) * totalYears;
    const rawStart = Number.isFinite(startCandidate) ? startCandidate : Math.round(fallbackYear);
    const rawEnd = Number.isFinite(endCandidate) ? endCandidate : rawStart;
    const normalizedStart = Math.min(rawStart, rawEnd);
    const normalizedEnd = Math.max(rawStart, rawEnd);

    const clampedStart = Math.max(minYear, Math.min(maxYear, normalizedStart));
    const clampedEnd = Math.max(minYear, Math.min(maxYear, normalizedEnd));
    const startPercent = yearToPercent(clampedStart);
    const endPercent = yearToPercent(clampedEnd);
    const widthPercent = Math.max(endPercent - startPercent, 2.2);

    return {
      itemIndex: index,
      startYear: clampedStart,
      endYear: clampedEnd,
      startPercent,
      endPercent,
      widthPercent,
      centerPercent: startPercent + widthPercent / 2,
    };
  });

  const coverage = [...itemRanges]
    .sort((a, b) => a.startYear - b.startYear)
    .reduce<Array<{ startYear: number; endYear: number }>>((acc, current) => {
      const last = acc[acc.length - 1];
      if (!last) {
        acc.push({ startYear: current.startYear, endYear: current.endYear });
        return acc;
      }

      if (current.startYear <= last.endYear + 1) {
        last.endYear = Math.max(last.endYear, current.endYear);
      } else {
        acc.push({ startYear: current.startYear, endYear: current.endYear });
      }

      return acc;
    }, []);

  type VisualSegment = {
    startYear: number;
    endYear: number;
    isGap: boolean;
    compressed: boolean;
    visualStart: number;
    visualEnd: number;
  };

  const baseSegments: Array<{ startYear: number; endYear: number; isGap: boolean }> = [];
  let cursor = minYear;

  for (const block of coverage) {
    if (block.startYear > cursor) {
      baseSegments.push({
        startYear: cursor,
        endYear: block.startYear,
        isGap: true,
      });
    }

    baseSegments.push({
      startYear: Math.max(minYear, block.startYear),
      endYear: Math.min(maxYear, block.endYear),
      isGap: false,
    });

    cursor = Math.max(cursor, block.endYear);
  }

  if (cursor < maxYear) {
    baseSegments.push({
      startYear: cursor,
      endYear: maxYear,
      isGap: true,
    });
  }

  if (baseSegments.length === 0) {
    baseSegments.push({
      startYear: minYear,
      endYear: maxYear,
      isGap: true,
    });
  }

  let visualCursor = 0;
  const visualSegments: VisualSegment[] = baseSegments.map(segment => {
    const realLength = Math.max(segment.endYear - segment.startYear, 0.001);
    const compressed = segment.isGap && realLength > 3;
    const visualLength = compressed ? 2 : realLength;
    const mapped: VisualSegment = {
      ...segment,
      compressed,
      visualStart: visualCursor,
      visualEnd: visualCursor + visualLength,
    };
    visualCursor += visualLength;
    return mapped;
  });

  const totalVisualLength = Math.max(visualCursor, 0.001);

  const yearToCompressedPercent = (year: number): number => {
    const clampedYear = Math.max(minYear, Math.min(maxYear, year));
    const segment =
      visualSegments.find(s => clampedYear >= s.startYear && clampedYear <= s.endYear) ??
      visualSegments[visualSegments.length - 1];

    const segmentSpan = Math.max(segment.endYear - segment.startYear, 0.001);
    const ratio = (clampedYear - segment.startYear) / segmentSpan;
    const visualValue = segment.visualStart + ratio * (segment.visualEnd - segment.visualStart);
    const percent = (visualValue / totalVisualLength) * 100;

    return Math.min(98, Math.max(2, percent));
  };

  const compressedGaps = visualSegments
    .filter(segment => segment.compressed)
    .map(segment => ({
      startYear: segment.startYear,
      endYear: segment.endYear,
      startPercent: yearToCompressedPercent(segment.startYear),
      endPercent: yearToCompressedPercent(segment.endYear),
      centerPercent: yearToCompressedPercent((segment.startYear + segment.endYear) / 2),
    }));

  const rangedLayouts: ItemLayout[] = itemRanges.map(range => {
    const startPercent = yearToCompressedPercent(range.startYear);
    const endPercent = yearToCompressedPercent(range.endYear);
    const widthPercent = Math.max(endPercent - startPercent, 2.6);

    return {
      ...range,
      startPercent,
      endPercent,
      widthPercent,
      centerPercent: startPercent + widthPercent / 2,
    };
  });

  const laneEnds: number[] = [];
  const itemLanes = Array.from({ length: timelineItems.length }, () => 0);
  const laneStepRem = 2.55;

  const sortedLayouts = [...rangedLayouts].sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear);

  for (const layout of sortedLayouts) {
    const laneIndex = laneEnds.findIndex(endYear => layout.startYear > endYear + 1);

    if (laneIndex === -1) {
      itemLanes[layout.itemIndex] = laneEnds.length;
      laneEnds.push(layout.endYear);
    } else {
      itemLanes[layout.itemIndex] = laneIndex;
      laneEnds[laneIndex] = layout.endYear;
    }
  }

  const laneCount = Math.max(laneEnds.length, 1);

  const safeActiveItemIndex = Math.min(Math.max(activeItemIndex, 0), Math.max(timelineItems.length - 1, 0));
  const activeItem = timelineItems[safeActiveItemIndex] ?? timelineItems[0];
  const activeLayout = rangedLayouts[safeActiveItemIndex] ?? rangedLayouts[0] ?? {
    centerPercent: yearToCompressedPercent(minYear),
    startPercent: yearToCompressedPercent(minYear),
    endPercent: yearToCompressedPercent(minYear),
    widthPercent: 2.6,
    startYear: minYear,
    endYear: minYear,
  };

  const timelineStartPercent = yearToCompressedPercent(minYear);
  const activeProgressWidth = Math.max(activeLayout.centerPercent - timelineStartPercent, 0.6);

  const yearTicks: number[] = [];
  for (let year = minYear; year <= maxYear; year += 1) {
    yearTicks.push(year);
  }

  return (
    <div className="educationTimelineShell">
      <div className="educationTimelineRail" aria-hidden="true" />
      <div
        className="educationTimelineActiveProgress"
        aria-hidden="true"
        style={{ left: `${timelineStartPercent}%`, width: `${activeProgressWidth}%` }}
      />

      <div className="educationTimelineYearDots" aria-hidden="true">
        {yearTicks.map(year => (
          <span
            key={`year-dot-${year}`}
            className="educationTimelineYearDot"
            style={{ left: `${yearToPercent(year)}%` }}
          />
        ))}
      </div>

      <div className="educationTimelineEndpoints" aria-hidden="true">
        <div className="educationTimelineEndpoint is-start" style={{ left: `${yearToCompressedPercent(minYear)}%` }}>
          <span className="educationTimelineEndpointDot" />
          <span className="educationTimelineEndpointLabel">{minYear}</span>
        </div>
        <div className="educationTimelineEndpoint is-end" style={{ left: `${yearToCompressedPercent(maxYear)}%` }}>
          <span className="educationTimelineEndpointDot" />
          <span className="educationTimelineEndpointLabel">{maxYear}</span>
        </div>
      </div>

      {compressedGaps.length > 0 && (
        <div className="educationTimelineBreaks" aria-hidden="true">
          {compressedGaps.map((gap, index) => (
            <div key={`timeline-break-${gap.startYear}-${gap.endYear}-${index}`}>
              <span className="educationTimelineBreakSlash" style={{ left: `${gap.centerPercent}%` }}>
                {'//'}
              </span>
              <span className="educationTimelineBreakLabel is-start" style={{ left: `${gap.startPercent}%` }}>
                {gap.startYear}
              </span>
              <span className="educationTimelineBreakLabel is-end" style={{ left: `${gap.endPercent}%` }}>
                {gap.endYear}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className="educationTimelineNodes"
        role="tablist"
        aria-label="Work experience timeline"
        style={{ minHeight: `${6.2 + Math.max(laneCount - 1, 0) * laneStepRem}rem` }}
      >
        {rangedLayouts.map(layout => {
          const item = timelineItems[layout.itemIndex];
          const laneIndex = itemLanes[layout.itemIndex] ?? 0;
          const isActive = layout.itemIndex === safeActiveItemIndex;
          const nodeStyle = {
            left: `${layout.startPercent}%`,
            width: `${layout.widthPercent}%`,
            top: `calc(var(--education-rail-top) + ${laneIndex * laneStepRem}rem)`,
          } as const;

          return (
            <button
              key={`work-range-${layout.itemIndex}-${item.date}-${item.role}`}
              type="button"
              className={`educationTimelineNode${isActive ? ' is-active' : ''}`}
              style={nodeStyle}
              role="tab"
              aria-selected={isActive}
              aria-label={`${item.date} ${item.role}${item.company ? ` ${item.company}` : ''}`}
              onClick={() => {
                if (layout.itemIndex === safeActiveItemIndex) {
                  setIsPanelOpen(previous => !previous);
                  return;
                }

                setActiveItemIndex(layout.itemIndex);
                setIsPanelOpen(true);
              }}
            >
              <span className="educationTimelineRangeBar" aria-hidden="true" />
              <span className="educationTimelineDot" aria-hidden="true" />
              <span className="educationTimelineConnector" aria-hidden="true" />
              <span className="educationTimelineNodeCaption">
                <span className="educationTimelineNodeDate">{item.date}</span>
                <span className="educationTimelineNodeTitle">{item.role}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isPanelOpen && activeItem && (
        <div className="educationTimelinePanel" role="tabpanel" aria-label="Selected work experience details">
          <div className="educationTimelinePanelHeader">
            <div className="educationTimelinePanelDate">{activeItem.date}</div>
            <div className="educationTimelinePanelTitle">{activeItem.role}</div>
            <div className="educationTimelinePanelSchool">{activeItem.company}</div>
            {activeItem.location && <div className="educationTimelinePanelLocation">{activeItem.location}</div>}
          </div>

          {activeItem.bullets.length > 0 && (
            <ul className="educationTimelineModuleList">
              {activeItem.bullets.map((line, index) => (
                <li key={`${activeItem.role}-bullet-${index}`} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
