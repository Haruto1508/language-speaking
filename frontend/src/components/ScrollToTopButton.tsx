import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { ArrowUp } from 'lucide-react';

/**
 * Floating button that smoothly scrolls page to top.
 * Only appears when user scrolls UP (after passing 200px from top).
 * Automatically hides when scrolling down or when already near top.
 */
export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;

          // User must have scrolled down at least 200px
          if (currentScrollY > 200) {
            // Check scroll direction:
            // If current is less than last by threshold -> scrolling UP -> SHOW
            if (currentScrollY < lastScrollY.current - 6) {
              setIsVisible(true);
            }
            // If current is greater than last by threshold -> scrolling DOWN -> HIDE
            else if (currentScrollY > lastScrollY.current + 6) {
              setIsVisible(false);
            }
          } else {
            // Close to top -> HIDE
            setIsVisible(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Listen to scroll events on window
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Tooltip title="Cuộn lên đầu trang" placement="left">
      <button
        onClick={handleScrollToTop}
        aria-label="Cuộn lên đầu trang"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 48,
          height: 48,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #58CC02, #22C55E)',
          border: 'none',
          borderBottom: '4px solid #15803D',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(88, 204, 2, 0.42), 0 3px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 999,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.75)',
          pointerEvents: isVisible ? 'auto' : 'none',
          transition:
            'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
        }}
        className="duo-card-interactive"
      >
        <ArrowUp size={22} strokeWidth={3} />
      </button>
    </Tooltip>
  );
};
