"use client";

import React from 'react';

export default function HeaderChartTrigger({ slug, title }: { slug: string; title: string }) {
    return (
        <button
            type="button"
            className="jobCannonEnneagramTrigger"
            aria-label={`Abrir gráfico de ${title}`}
            title={`Abrir gráfico de ${title}`}
            onClick={() => {
                const id = `chart-trigger-${slug}`;
                const el = document.getElementById(id) as HTMLButtonElement | null;
                if (el) el.click();
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M11 9h2V7h-2v2zm1-7C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6z" />
            </svg>
        </button>
    );
}
