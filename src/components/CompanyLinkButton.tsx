'use client';

import { CSSProperties } from 'react';

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" width="16" height="16">
    <path
      d="M10 13a5 5 0 0 1 0-7.07l1.06-1.06a5 5 0 0 1 7.07 7.07L17 13"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 11a5 5 0 0 1 0 7.07l-1.06 1.06a5 5 0 0 1-7.07-7.07L7 11"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type CompanyLinkButtonProps = {
  href: string;
  companyName: string;
};

export default function CompanyLinkButton({ href, companyName }: CompanyLinkButtonProps) {
  const baseStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '999px',
    border: '1px solid #d6dbe3',
    backgroundColor: '#ffffff',
    color: '#0f4c81',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    opacity: 0.5,
    transition: 'opacity 140ms ease, box-shadow 140ms ease',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Open ${companyName} website`}
      title={`Open ${companyName} website`}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 76, 129, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.05)';
      }}
    >
      <LinkIcon />
    </a>
  );
}
