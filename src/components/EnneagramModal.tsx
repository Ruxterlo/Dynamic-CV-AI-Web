"use client";

import React, { useEffect, useRef, useState } from 'react';

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
    if (maxValue <= 0) return 0;
    return Math.max(0, Math.min(100, (value / maxValue) * 100));
};

function useKeyClose(onClose: () => void) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
}

export default function EnneagramModal({ study, triggerId }: { study: any; triggerId?: string }) {
    const entries: Array<[string, number]> = ENNEAGRAM_TYPES.map(t => [t, study.scores[t] ?? 0]);
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement | null>(null);
    useKeyClose(() => setOpen(false));

    useEffect(() => {
        if (open) {
            // focus close button when opened
            setTimeout(() => closeRef.current?.focus(), 20);
        }
    }, [open]);

    const size = 360;
    const center = size / 2;
    const radius = 120;
    const maxValue = Math.max(...entries.map(([, v]) => v), 1);
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

    if (triggerId) {
        return (
            <>
                <button id={triggerId} type="button" style={{ display: 'none' }} onClick={() => setOpen(true)} aria-hidden="true" />

                {open && (
                    <div className="modalBackdrop" role="presentation" onClick={() => setOpen(false)}>
                        <div
                            className="modalDialog"
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Enneagram radar for ${study.title}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modalHeader">
                                <h3>Enneagram radar</h3>
                                <button ref={closeRef} className="modalClose" onClick={() => setOpen(false)} aria-label="Close dialog">
                                    ✕
                                </button>
                            </div>

                            <div className="modalBody">
                                <svg className="jobCannonRadar jobCannonEnneagramRadar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Enneagram radar chart">
                                    {[0.3, 0.55, 0.8, 1].map(level => (
                                        <polygon key={level} points={pointsFor(level)} className="jobCannonRadarRing" />
                                    ))}
                                    {entries.map(([, value], index) => {
                                        const angle = -Math.PI / 2 + (index / entries.length) * Math.PI * 2;
                                        const x = center + Math.cos(angle) * radius;
                                        const y = center + Math.sin(angle) * radius;
                                        const labelX = center + Math.cos(angle) * (radius + 28);
                                        const labelY = center + Math.sin(angle) * (radius + 28);

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
                                        return <circle key={`${index}-${value}-dot`} cx={x} cy={y} r="4" className="jobCannonRadarDot" />;
                                    })}
                                </svg>

                                <div className="jobCannonEnneagramModalBars">
                                    <div className="jobCannonChartHeader">
                                        <p>Score breakdown</p>
                                    </div>
                                    <div className="jobCannonBars">
                                        {entries.map(([key, value]) => {
                                            const width = normalizeScore(value, 100);
                                            const label = ENNEAGRAM_LABELS[key] ?? `Type ${key}`;

                                            return (
                                                <div key={key} className={`jobCannonBarRow${study.topResult === key ? ' is-highlighted' : ''}`}>
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
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="jobCannonChartCard jobCannonEnneagramCard">

            <button
                id={triggerId}
                type="button"
                className="jobCannonEnneagramTrigger"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label="Abrir radar de eneagrama"
                title="Abrir radar"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-2.07c1.17-.08 2.07-.99 2.07-2.16 0-1.21-.98-2.19-2.19-2.19-1.17 0-2.08.9-2.16 2.07H9.5V7h5v9.5z" />
                </svg>
            </button>

            {open && (
                <div className="modalBackdrop" role="presentation" onClick={() => setOpen(false)}>
                    <div
                        className="modalDialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Enneagram radar for ${study.title}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modalHeader">
                            <h3>Enneagram radar</h3>
                            <button ref={closeRef} className="modalClose" onClick={() => setOpen(false)} aria-label="Close dialog">
                                ✕
                            </button>
                        </div>

                        <div className="modalBody">
                            <svg className="jobCannonRadar jobCannonEnneagramRadar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Enneagram radar chart">
                                {[0.3, 0.55, 0.8, 1].map(level => (
                                    <polygon key={level} points={pointsFor(level)} className="jobCannonRadarRing" />
                                ))}
                                {entries.map(([, value], index) => {
                                    const angle = -Math.PI / 2 + (index / entries.length) * Math.PI * 2;
                                    const x = center + Math.cos(angle) * radius;
                                    const y = center + Math.sin(angle) * radius;
                                    const labelX = center + Math.cos(angle) * (radius + 28);
                                    const labelY = center + Math.sin(angle) * (radius + 28);

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
                                    return <circle key={`${index}-${value}-dot`} cx={x} cy={y} r="4" className="jobCannonRadarDot" />;
                                })}
                            </svg>

                            <div className="jobCannonEnneagramModalBars">
                                <div className="jobCannonChartHeader">
                                    <p>Score breakdown</p>
                                </div>
                                <div className="jobCannonBars">
                                    {entries.map(([key, value]) => {
                                        const width = normalizeScore(value, 100);
                                        const label = ENNEAGRAM_LABELS[key] ?? `Type ${key}`;

                                        return (
                                            <div key={key} className={`jobCannonBarRow${study.topResult === key ? ' is-highlighted' : ''}`}>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
