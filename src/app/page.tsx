'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type ChatbaseMethodCall = [string, ...unknown[]];
type ChatbaseFunction = ((method: string, ...args: unknown[]) => unknown) & {
  q?: ChatbaseMethodCall[];
};

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}

export default function Home() {

  useEffect(() => {
    const onLoad = function () {
      if (document.getElementById('poxQPHRMuAbl7easbR0Mk')) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = 'poxQPHRMuAbl7easbR0Mk'; // tu chatbotId
      script.setAttribute('domain', 'www.chatbase.co');
      document.body.appendChild(script);
    };

    (function () {
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {

        const chatbaseStub: ChatbaseFunction = (method: string, ...args: unknown[]) => {
          if (!chatbaseStub.q) {
            chatbaseStub.q = [];
          }
          chatbaseStub.q.push([method, ...args]);
          return undefined;
        };

        window.chatbase = new Proxy(chatbaseStub, {
          get(target: ChatbaseFunction, prop: string | symbol) {
            if (prop === "q") return target.q;
            return (...args: unknown[]) => target(String(prop), ...args);
          },
        });
      }

      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();

    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, []);

  const routes = [
    { href: '/professional-summary', label: 'Professional Summary' },
    { href: '/technology-skills', label: 'Technology Skills' },
    { href: '/education', label: 'Education' },
    { href: '/work-experience', label: 'Work Experience' },
    { href: '/projects', label: 'Projects' },
    { href: '/languages', label: 'Languages' },
    { href: '/flexibility-mobility', label: 'Flexibility & Mobility' },
    { href: '/hobbies-interests', label: 'Hobbies & Interests' },
    { href: '/clients-companies', label: 'Clients & Companies' },
    { href: '/portfolio-profiles', label: 'Portfolio & Professional Profiles' },
  ];

  return (
    <main>
      <h1>Welcome to My Dynamic CV</h1>
      <p>Select a section to view:</p>

      <ul className="homeGrid">
        {routes.map(route => (
          <li key={route.href}>
            <Link href={route.href} className="homeCard">
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
