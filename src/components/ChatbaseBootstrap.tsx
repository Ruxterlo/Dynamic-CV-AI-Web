'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const CHATBOT_ID = process.env.NEXT_PUBLIC_CHATBASE_BOT_ID;
const DEFAULT_HINT_TEXT = 'Ask about my experience';

export default function ChatbaseBootstrap() {
  const pathname = usePathname();
  const [showHint, setShowHint] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hintText, setHintText] = useState(DEFAULT_HINT_TEXT);

  useEffect(() => {
    if (!CHATBOT_ID) {
      return;
    }

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
      window.clearTimeout(initialShow);
      window.clearTimeout(initialHide);
      window.clearInterval(repeatHint);
    };
  }, [pathname]);

  const toggleChat = () => {
    if (!CHATBOT_ID) {
      setHintText('Chat is not configured yet');
      setShowHint(true);
      window.setTimeout(() => {
        setHintText(DEFAULT_HINT_TEXT);
        setShowHint(false);
      }, 2600);
      return;
    }

    setIsOpen(prev => !prev);
  };

  return (
    <>
      {showHint && (
        <div className="chatInviteNotification" role="status" aria-live="polite">
          {hintText}
        </div>
      )}

      <button
        type="button"
        className="chatInviteButton"
        onClick={toggleChat}
        aria-label={CHATBOT_ID ? 'Toggle chat to talk about my experience' : 'Chat is not configured'}
        title={CHATBOT_ID ? 'Ask about my experience' : 'Chat is not configured'}
      >
        <span className="chatInviteIcon" aria-hidden="true">
          🤖
        </span>
      </button>

      {CHATBOT_ID && (
        <div className={`chatIframePanel ${isOpen ? 'is-open' : ''}`}>
          <iframe
            src={`https://www.chatbase.co/chatbot-iframe/${CHATBOT_ID}`}
            title="Chat about my experience"
            width="100%"
            frameBorder="0"
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}
