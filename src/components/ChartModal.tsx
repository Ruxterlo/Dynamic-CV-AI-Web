"use client";

import React, { useEffect, useRef, useState } from 'react';

function useKeyClose(onClose: () => void) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
}

export default function ChartModal({
    title,
    previewLabel = 'Open chart',
    children,
    triggerId,
}: {
    title: string;
    previewLabel?: string;
    children: React.ReactNode;
    triggerId?: string;
}) {
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement | null>(null);
    useKeyClose(() => setOpen(false));

    useEffect(() => {
        if (open) setTimeout(() => closeRef.current?.focus(), 20);
    }, [open]);

    if (triggerId) {
        return (
            <>
                <button
                    id={triggerId}
                    type="button"
                    style={{ display: 'none' }}
                    onClick={() => setOpen(true)}
                    aria-hidden="true"
                />

                {open && (
                    <div className="modalBackdrop" role="presentation" onClick={() => setOpen(false)}>
                        <div className="modalDialog" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h3>{title}</h3>
                                <button ref={closeRef} className="modalClose" onClick={() => setOpen(false)} aria-label="Close dialog">
                                    ✕
                                </button>
                            </div>

                            <div className="modalBody">{children}</div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="jobCannonChartCard">
            <button
                type="button"
                className="jobCannonEnneagramTrigger"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={previewLabel}
                title={previewLabel}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M11 9h2V7h-2v2zm1-7C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6z" />
                </svg>
            </button>

            {open && (
                <div className="modalBackdrop" role="presentation" onClick={() => setOpen(false)}>
                    <div className="modalDialog" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h3>{title}</h3>
                            <button ref={closeRef} className="modalClose" onClick={() => setOpen(false)} aria-label="Close dialog">
                                ✕
                            </button>
                        </div>

                        <div className="modalBody">{children}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
