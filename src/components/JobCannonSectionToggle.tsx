"use client";

import { useEffect, useState } from 'react';

export default function JobCannonSectionToggle({ targetId, defaultExpanded = false }: { targetId: string; defaultExpanded?: boolean }) {
    const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

    useEffect(() => {
        const el = document.getElementById(targetId);
        if (!el) return;
        el.style.display = expanded ? '' : 'none';
    }, [expanded, targetId]);

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
                type="button"
                aria-controls={targetId}
                aria-expanded={expanded}
                onClick={() => setExpanded(e => !e)}
                className="jobCannonSectionToggle"
                title={expanded ? 'Collapse JobCannon insights' : 'Expand JobCannon insights'}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.7a1 1 0 0 0-1.41.01z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
}
