'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type ChatbaseMethodCall = [string, ...unknown[]];
type ChatbaseFunction = ((method: string, ...args: unknown[]) => unknown) & {
  q?: ChatbaseMethodCall[];
};

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}

const CHATBOT_ID = process.env.NEXT_PUBLIC_CHATBASE_BOT_ID;

export default function ChatbaseBootstrap() {
  const pathname = usePathname();
  const [showHint, setShowHint] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!CHATBOT_ID) {
      return;
    }

    const setImportantStyle = (element: HTMLElement, property: string, value: string) => {
      element.style.setProperty(property, value, 'important');
    };

    const tuneChatLayout = () => {
      const frames = Array.from(document.querySelectorAll('iframe[src*="chatbase"]')) as HTMLIFrameElement[];

      if (frames.length === 0) {
        return;
      }

      const frameMetrics = frames.map(iframe => {
        const rect = iframe.getBoundingClientRect();
        return {
          iframe,
          width: Math.max(iframe.offsetWidth, rect.width),
          height: Math.max(iframe.offsetHeight, rect.height),
        };
      });

      const sortedByArea = frameMetrics.sort((a, b) => a.width * a.height - b.width * b.height);
      const launcherCandidate = sortedByArea[0]?.iframe ?? null;
      const panelCandidate = sortedByArea[sortedByArea.length - 1]?.iframe ?? null;

      if (panelCandidate && panelCandidate !== launcherCandidate) {
        const panelWidth = Math.min(360, Math.max(280, window.innerWidth - 26));
        const panelHeight = Math.min(500, Math.max(320, Math.floor(window.innerHeight * 0.62)));

        setImportantStyle(panelCandidate, 'position', 'fixed');
        setImportantStyle(panelCandidate, 'right', '14px');
        setImportantStyle(panelCandidate, 'left', 'auto');
        setImportantStyle(panelCandidate, 'top', 'auto');
        setImportantStyle(panelCandidate, 'bottom', '78px');
        setImportantStyle(panelCandidate, 'width', `${panelWidth}px`);
        setImportantStyle(panelCandidate, 'height', `${panelHeight}px`);
        setImportantStyle(panelCandidate, 'max-width', 'calc(100vw - 26px)');
        setImportantStyle(panelCandidate, 'max-height', '62vh');
        setImportantStyle(panelCandidate, 'border-radius', '14px');
        setImportantStyle(panelCandidate, 'overflow', 'hidden');
        setImportantStyle(panelCandidate, 'z-index', '41');
        setImportantStyle(panelCandidate, 'box-shadow', '0 14px 28px rgba(15, 23, 42, 0.2)');

        const parent = panelCandidate.parentElement;
        if (parent) {
          setImportantStyle(parent, 'position', 'fixed');
          setImportantStyle(parent, 'right', '14px');
          setImportantStyle(parent, 'left', 'auto');
          setImportantStyle(parent, 'top', 'auto');
          setImportantStyle(parent, 'bottom', '78px');
          setImportantStyle(parent, 'width', `${panelWidth}px`);
          setImportantStyle(parent, 'height', `${panelHeight}px`);
          setImportantStyle(parent, 'max-width', 'calc(100vw - 26px)');
          setImportantStyle(parent, 'max-height', '62vh');
          setImportantStyle(parent, 'z-index', '41');
          setImportantStyle(parent, 'border-radius', '14px');
          setImportantStyle(parent, 'overflow', 'hidden');
        }
      }
    };

    const mountScript = () => {
      if (document.getElementById(CHATBOT_ID)) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = CHATBOT_ID;
      script.setAttribute('domain', 'www.chatbase.co');
      document.body.appendChild(script);

      window.setTimeout(tuneChatLayout, 700);
    };

    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
      const chatbaseStub: ChatbaseFunction = (method: string, ...args: unknown[]) => {
        if (!chatbaseStub.q) {
          chatbaseStub.q = [];
        }
        chatbaseStub.q.push([method, ...args]);
        return undefined;
      };

      window.chatbase = new Proxy(chatbaseStub, {
        get(target: ChatbaseFunction, prop: string | symbol) {
          if (prop === 'q') return target.q;
          return (...args: unknown[]) => target(String(prop), ...args);
        },
      });
    }

    if (document.readyState === 'complete') {
      mountScript();
    } else {
      window.addEventListener('load', mountScript, { once: true });
    }

    tuneChatLayout();

    const observer = new MutationObserver(() => {
      tuneChatLayout();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', tuneChatLayout);

    const initialShow = window.setTimeout(() => {
      setShowHint(true);
    }, 600);

    const initialHide = window.setTimeout(() => {
      setShowHint(false);
    }, 5200);

    const repeatHint = window.setInterval(() => {
      setShowHint(true);
      window.setTimeout(() => {
        setShowHint(false);
      }, 3800);
    }, 26000);

    return () => {
      window.removeEventListener('load', mountScript);
      window.removeEventListener('resize', tuneChatLayout);
      observer.disconnect();
      window.clearTimeout(initialShow);
      window.clearTimeout(initialHide);
      window.clearInterval(repeatHint);
    };
  }, [pathname]);

  if (!CHATBOT_ID) {
    return null;
  }

  const triggerNativeLauncher = () => {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('button, div, iframe')).filter(
      element => {
        if (element.classList.contains('chatInviteButton')) {
          return false;
        }

        const signature = `${element.id} ${element.className} ${
          element instanceof HTMLIFrameElement ? element.src : ''
        }`.toLowerCase();

        if (!signature.includes('chatbase')) {
          return false;
        }

        const rect = element.getBoundingClientRect();
        const isLauncherSize = rect.width >= 28 && rect.height >= 28 && rect.width <= 120 && rect.height <= 120;
        const nearBottomRight = window.innerWidth - rect.right < 180 && window.innerHeight - rect.bottom < 180;

        return isLauncherSize && nearBottomRight;
      }
    );

    if (candidates.length === 0) {
      return false;
    }

    const target = candidates[0];
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    target.click();
    return true;
  };

  const inferIsOpen = (state: unknown) => {
    if (typeof state === 'string') {
      return state.toLowerCase().includes('open');
    }

    if (typeof state === 'object' && state !== null) {
      const record = state as Record<string, unknown>;
      if (typeof record.open === 'boolean') {
        return record.open;
      }
      if (typeof record.isOpen === 'boolean') {
        return record.isOpen;
      }
    }

    return chatOpen;
  };

  const toggleChat = () => {
    try {
      const state = window.chatbase?.('getState');
      const isOpen = inferIsOpen(state);

      if (isOpen) {
        window.chatbase?.('close');
        setChatOpen(false);
      } else {
        window.chatbase?.('open');
        setChatOpen(true);
      }
    } catch {
      // If direct API actions fail, fallback to native launcher click.
      const toggledByNativeLauncher = triggerNativeLauncher();
      if (toggledByNativeLauncher) {
        setChatOpen(prev => !prev);
      }
    }
  };

  return (
    <>
      {showHint && (
        <div className="chatInviteNotification" role="status" aria-live="polite">
          Ask about my experience
        </div>
      )}

      <button
        type="button"
        className="chatInviteButton"
        onClick={toggleChat}
        aria-label="Toggle chat to talk about my experience"
        title="Ask about my experience"
      >
        <span className="chatInviteIcon" aria-hidden="true">
          🤖
        </span>
      </button>
    </>
  );
}
