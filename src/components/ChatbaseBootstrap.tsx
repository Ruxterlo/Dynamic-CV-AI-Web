'use client';

import { useEffect, useState } from 'react';

const CHATBOT_ID = process.env.NEXT_PUBLIC_CHATBASE_BOT_ID;
const DEFAULT_HINT_TEXT = 'Ask about my experience';
const NOT_CONFIGURED_HINT_TEXT = 'Chat is not configured';

export default function ChatbaseBootstrap() {
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
  }, []);

  const showDefaultHint = () => {
    setHintText(CHATBOT_ID ? DEFAULT_HINT_TEXT : NOT_CONFIGURED_HINT_TEXT);
    setShowHint(true);
  };

  const hideHint = () => {
    setShowHint(false);
  };

  const toggleChat = () => {
    if (!CHATBOT_ID) {
      setHintText(NOT_CONFIGURED_HINT_TEXT);
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
        onMouseEnter={showDefaultHint}
        onMouseLeave={hideHint}
        onFocus={showDefaultHint}
        onBlur={hideHint}
        aria-label={CHATBOT_ID ? 'Toggle chat to talk about my experience' : 'Chat is not configured'}
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
