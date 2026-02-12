/* ========================================
   FREE PDF TTS READER — Welcome Modal
   by Analyst Sandeep
   ======================================== */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  MousePointer,
  Keyboard,
  BookOpen,
  Wifi,
  Volume2,
  FileText,
  Shield,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY = 'pdf-tts-welcome-dismissed';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function shouldShowWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

function Section({
  id,
  icon,
  title,
  children,
  openSectionId,
  previousSectionId,
  onToggle,
  scrollContainerRef,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  openSectionId: string | null;
  previousSectionId: string | null;
  onToggle: (id: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const headingRef = useRef<HTMLButtonElement>(null);
  const isOpen = openSectionId === id;

  useEffect(() => {
    if (!isOpen || !headingRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const heading = headingRef.current;

    // Determine delay: if switching from another section, wait for collapse
    // If opening fresh (no previous), scroll quickly
    const hadPreviousSection = previousSectionId !== null && previousSectionId !== id;
    const delay = hadPreviousSection ? 350 : 50;

    const timer = setTimeout(() => {
      const containerRect = container.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const headingTopInContainer = headingRect.top - containerRect.top + scrollTop;
      const targetScroll = headingTopInContainer - 20;

      // Use requestAnimationFrame for buttery smooth scroll
      requestAnimationFrame(() => {
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isOpen, previousSectionId, scrollContainerRef, id]);

  return (
    <div
      style={{
        backgroundColor: isOpen
          ? 'rgba(238, 242, 255, 0.55)'
          : 'rgba(255, 255, 255, 0.35)',
        border: isOpen
          ? '1px solid rgba(199, 210, 254, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.45)',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '8px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isOpen
          ? '0 4px 24px rgba(79, 70, 229, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          : '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      <button
        ref={headingRef}
        onClick={() => onToggle(id)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          textAlign: 'left',
          color: '#0f172a',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isOpen
              ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
              : 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            color: 'white',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {icon}
        </span>
        <span style={{ flex: 1, fontWeight: 600, color: isOpen ? '#4f46e5' : '#0f172a', transition: 'color 0.3s ease' }}>
          {title}
        </span>
        <span
          style={{
            color: isOpen ? '#8b5cf6' : '#94a3b8',
            transition: 'transform 0.3s ease, color 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? '2000px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: isOpen
            ? 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease 0.05s'
            : 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease',
        }}
      >
        <div
          style={{
            padding: '0 16px 16px 16px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#475569',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
      <span
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          color: 'white',
        }}
      >
        {number}
      </span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
          {title}
        </div>
        <div style={{ marginTop: '4px', color: '#475569', fontSize: '13px', lineHeight: '1.6' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <kbd
        style={{
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          color: '#0f172a',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {keys}
      </kbd>
      <span style={{ fontSize: '13px', color: '#475569' }}>
        {action}
      </span>
    </div>
  );
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [previousSectionId, setPreviousSectionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOpenSectionId(null);
      setPreviousSectionId(null);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  const handleToggle = useCallback((id: string) => {
    setOpenSectionId((prev) => {
      setPreviousSectionId(prev);
      return prev === id ? null : id;
    });
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignore
      }
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '24px 24px 16px 24px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(248, 250, 252, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🎧</span>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FREE PDF TTS READER
            </h1>
          </div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>
            by Analyst Sandeep
          </p>
          <p style={{ fontSize: '13px', marginTop: '8px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', color: '#475569' }}>
            Your free, private PDF reader with text-to-speech.
            Everything runs locally — no data leaves your computer.
          </p>
          <p style={{ fontSize: '11px', marginTop: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
            👇 Click any section below to learn more
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            scrollBehavior: 'smooth',
          }}
        >
          <Section id="how-to-use" icon={<BookOpen size={16} />} title="How to Use" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px' }}>
              <Step number={1} title="Upload Your PDF">
                Drag and drop a PDF file onto the upload area, or click the
                <strong> &quot;Choose PDF&quot;</strong> button to browse your files.
                The entire PDF will load with all pages visible.
              </Step>
              <Step number={2} title="Choose a Voice">
                Open the <strong>Voice Panel</strong> on the right side.
                Search by typing language, country, or name
                (e.g., &quot;US&quot;, &quot;English&quot;, &quot;Indian&quot;, &quot;Female&quot;).
                Click the 🔊 icon to preview any voice, then click the
                voice name to select it.
              </Step>
              <Step number={3} title="Start Reading">
                <strong>Single-click</strong> any word in the PDF — reading
                begins from that exact word. The current word will glow
                with a highlight as it is read aloud.
              </Step>
              <Step number={4} title="Control Playback">
                Use the <strong>Star Button</strong> to Play, Pause, or
                Resume. Press <strong>Space bar</strong> to pause/resume, or
                <strong> Esc</strong> to stop completely.
                Adjust reading speed with the speed slider
                (0.5x slow to 1x normal to 3x fast).
              </Step>
              <Step number={5} title="Get Word Definitions">
                <strong>Right-click</strong> any word to see its meaning.
                Definitions come from a free online dictionary.
                Internet connection is required for this feature.
              </Step>
              <Step number={6} title="Navigate Your PDF">
                Use <strong>+ / -</strong> buttons to zoom, or
                <strong> Ctrl + scroll</strong> wheel.
                Type a page number to jump directly.
                Scroll freely while reading — the app will not force you back.
                Click <strong>&quot;Go to Current Word&quot;</strong> to jump back
                to the active reading position.
              </Step>
            </div>
          </Section>

          <Section id="mouse" icon={<MousePointer size={16} />} title="Mouse Controls" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f0e7ff', color: '#8b5cf6' }}>Left Click</span>
                <span style={{ color: '#475569', fontSize: '13px' }}>Start reading from that word</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f0e7ff', color: '#8b5cf6' }}>Double Click</span>
                <span style={{ color: '#475569', fontSize: '13px' }}>Instantly pause reading</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f0e7ff', color: '#8b5cf6' }}>Right Click</span>
                <span style={{ color: '#475569', fontSize: '13px' }}>Show word definition</span>
              </div>
            </div>
          </Section>

          <Section id="keyboard" icon={<Keyboard size={16} />} title="Keyboard Shortcuts" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px' }}>
              <Shortcut keys="Space" action="Pause / Resume" />
              <Shortcut keys="Escape" action="Stop and clear highlights" />
              <Shortcut keys="?" action="Show shortcuts panel" />
              <Shortcut keys="Ctrl + =" action="Zoom in" />
              <Shortcut keys="Ctrl + -" action="Zoom out" />
              <Shortcut keys="Ctrl + 0" action="Fit to width" />
            </div>
          </Section>

          <Section id="internet" icon={<Wifi size={16} />} title="Internet Connection" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>🌐 <strong>Word definitions</strong> require an active internet connection. If definitions do not appear, please check your internet and try again.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🔊 <strong>Reading aloud works 100% offline</strong> — no internet needed for text-to-speech.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🔒 No data is sent to any server except dictionary lookups (just the single word being looked up).</p>
            </div>
          </Section>

          <Section id="voices" icon={<Volume2 size={16} />} title="Voice Availability" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>Available voices depend on your <strong>operating system</strong> and <strong>browser</strong>. For the best experience, use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on Windows.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>Voice gender labels are <strong>best-effort estimates</strong> based on voice names and may not always be accurate.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>You can <strong>preview any voice</strong> before selecting it by clicking the speaker icon next to each voice.</p>
            </div>
          </Section>

          <Section id="pdf" icon={<FileText size={16} />} title="PDF Compatibility" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>✅ Works best with <strong>text-based PDFs</strong> (most PDFs).</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>⚠️ <strong>Scanned PDFs</strong> (image-only) cannot be read aloud because they contain no extractable text.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>⚠️ Complex layouts like <strong>multi-column documents</strong> or <strong>tables</strong> may have slightly different reading order.</p>
            </div>
          </Section>

          <Section id="privacy" icon={<Shield size={16} />} title="Privacy and Security" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>🔒 Your PDF <strong>never leaves your computer</strong>.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>📡 No files are uploaded to any server.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🚫 No login, signup, tracking, or analytics.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🍪 No cookies — only localStorage for your preferences.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🌐 The only network request is for word definitions (optional).</p>
            </div>
          </Section>

          <Section id="tips" icon={<Lightbulb size={16} />} title="Tips for Best Experience" openSectionId={openSectionId} previousSectionId={previousSectionId} onToggle={handleToggle} scrollContainerRef={scrollRef}>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>💻 Use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for the most voices and best speech quality.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🎙️ Try different voices — some sound much more natural than others.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>🏎️ Start with <strong>1x speed</strong>, then adjust to your liking.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>⏸️ <strong>Double-click</strong> any word to instantly pause.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>📍 Use the <strong>&quot;Go to Current Word&quot;</strong> button if you lose your place after scrolling.</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>📝 <strong>Select text</strong> and click &quot;Read Selection&quot; to read only a specific portion.</p>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(248, 250, 252, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            flexShrink: 0,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              cursor: 'pointer',
              userSelect: 'none',
              color: '#475569',
              fontSize: '14px',
            }}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#8b5cf6' }}
            />
            <span>Do not show this again</span>
          </label>

          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(59, 130, 246, 0.85))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>✨</span>
            <span>Get Started</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '12px', color: '#94a3b8' }}>
            Developed by Analyst Sandeep · 📧 itbusinessanalystsandeep@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}