/* ========================================
   FREE PDF TTS READER — Controls Panel
   by Analyst Sandeep
   
   Premium Redesign:
   — Circular gradient play button with progress ring
   — Pill-style speed chips with gradient selection
   — Voice card with avatar icon
   — iOS segmented control for highlight
   — Polished toggle switch for focus mode
   — MOBILE: Slide-out drawer with hamburger toggle
   ======================================== */

import {
  Play,
  Pause,
  Mic,
  Type,
  Eye,
  ChevronRight,
  FileText,
  Clock,
  Focus,
  X,
  Menu,
  Gauge,
  Sparkles,
  Highlighter,
} from 'lucide-react';
import type { SpeechStatus, PdfDocumentData } from '../types';
import type { VoiceInfo } from '../types';
import Waveform from './Waveform';

interface ControlsPanelProps {
  status: SpeechStatus;
  currentIndex: number;
  rate: number;
  highlightMode: 'word' | 'sentence';
  pdfData: PdfDocumentData | null;
  currentPage: number;
  selectedVoice: VoiceInfo | null;
  onTogglePauseResume: () => void;
  onStop: () => void;
  onRateChange: (rate: number) => void;
  onHighlightModeChange: (mode: 'word' | 'sentence') => void;
  onToggleVoicePicker: () => void;
  isVoicePickerOpen: boolean;
  blurMode: boolean;
  onBlurModeToggle: () => void;
  isMobile: boolean;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
}

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
  { value: 2.0, label: '2×' },
  { value: 2.5, label: '2.5×' },
  { value: 3.0, label: '3×' },
];

/* ── Shared section label for consistency ── */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
          color: 'white',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── SVG Circular progress ring ── */
function ProgressRing({ percent, size = 68, stroke = 3 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-90deg)',
        pointerEvents: 'none',
      }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progress-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-start)" />
          <stop offset="100%" stopColor="var(--accent-end)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ControlsPanel({
  status,
  currentIndex,
  rate,
  highlightMode,
  pdfData,
  selectedVoice,
  onTogglePauseResume,
  onRateChange,
  onHighlightModeChange,
  onToggleVoicePicker,
  isVoicePickerOpen,
  blurMode,
  onBlurModeToggle,
  isMobile,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
}: ControlsPanelProps) {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isActive = isPlaying || isPaused;
  const hasPdf = pdfData !== null;

  const totalWords = pdfData?.allWords.length || 0;
  const progressPercent =
    totalWords > 0 && currentIndex >= 0
      ? Math.round((currentIndex / totalWords) * 100)
      : 0;

  const formatWordCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  // ── Playback glow animation (injected once) ──
  const glowKeyframes = `
    @keyframes play-glow {
      0%, 100% { box-shadow: 0 0 16px rgba(79, 70, 229, 0.25), 0 4px 12px rgba(79, 70, 229, 0.15); }
      50% { box-shadow: 0 0 28px rgba(79, 70, 229, 0.4), 0 4px 20px rgba(79, 70, 229, 0.25); }
    }
    @keyframes status-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;

  // The panel content — shared between desktop and mobile
  const panelContent = (
    <>
      <style>{glowKeyframes}</style>

      {/* ── Mobile Close Button ── */}
      {isMobile && (
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-start)' }} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Controls
            </span>
          </div>
          <button
            onClick={onToggleMobileDrawer}
            className="btn-icon"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Close controls"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════
          SECTION 1: Playback Hero
          ════════════════════════════════════════════ */}
      <div
        style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Play/Pause — circular gradient with progress ring */}
        <div
          style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Progress ring behind button */}
          {hasPdf && <ProgressRing percent={progressPercent} />}

          <button
            onClick={onTogglePauseResume}
            disabled={!isActive}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                : 'var(--bg-tertiary)',
              color: isActive ? 'white' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isActive ? 'pointer' : 'not-allowed',
              opacity: isActive ? 1 : 0.5,
              transition: 'all 0.25s ease',
              boxShadow: isPlaying
                ? undefined
                : isActive
                  ? '0 4px 16px rgba(79, 70, 229, 0.25)'
                  : 'none',
              animation: isPlaying ? 'play-glow 2s ease-in-out infinite' : 'none',
              position: 'relative',
              zIndex: 1,
            }}
            aria-label={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>
        </div>

        {/* Waveform */}
        <Waveform isPlaying={isPlaying} size="medium" />

        {/* Status pill */}
        <div
          style={{
            textAlign: 'center',
            minHeight: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isPlaying && (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-medium)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-start)',
                    animation: 'status-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent-start)',
                  }}
                >
                  Reading… {progressPercent}%
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Word {currentIndex + 1} of {totalWords.toLocaleString()}
              </span>
            </>
          )}
          {isPaused && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-muted)',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Paused · {progressPercent}%
              </span>
            </div>
          )}
          {!isActive && hasPdf && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Click any word to start
            </span>
          )}
          {!isActive && !hasPdf && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Upload a PDF to begin
            </span>
          )}
        </div>

        {/* Word Count + Read Time — compact stats */}
        {hasPdf && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={10} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {formatWordCount(pdfData!.totalWordCount)}
              </span>
            </div>
            <span
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                backgroundColor: 'var(--border-color)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ~{pdfData!.estimatedReadTime} min
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          SECTION 2: Speed
          ════════════════════════════════════════════ */}
      <div
        style={{
          margin: '0 12px',
          padding: '14px',
          borderRadius: '14px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}
      >
        <SectionLabel icon={<Gauge size={10} />} label="Speed" />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '5px',
          }}
        >
          {SPEED_PRESETS.map((preset) => {
            const isSelected = Math.abs(rate - preset.value) < 0.03;
            return (
              <button
                key={preset.value}
                onClick={() => hasPdf && onRateChange(preset.value)}
                disabled={!hasPdf}
                style={{
                  padding: '7px 2px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                    : 'var(--bg-secondary)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: hasPdf ? 'pointer' : 'not-allowed',
                  opacity: hasPdf ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  fontFamily: 'var(--font-ui)',
                  boxShadow: isSelected
                    ? '0 2px 8px rgba(79, 70, 229, 0.25)'
                    : '0 1px 2px rgba(0,0,0,0.04)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  letterSpacing: isSelected ? '0.01em' : '0',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 3: Voice
          ════════════════════════════════════════════ */}
      <div
        style={{
          margin: '0 12px',
          padding: '14px',
          borderRadius: '14px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}
      >
        <SectionLabel icon={<Mic size={10} />} label="Voice" />

        <button
          onClick={onToggleVoicePicker}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: isVoicePickerOpen ? 'var(--accent-start)' : 'var(--border-color)',
            backgroundColor: isVoicePickerOpen ? 'var(--accent-soft)' : 'var(--bg-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-ui)',
            boxShadow: isVoicePickerOpen
              ? '0 2px 8px rgba(79, 70, 229, 0.12)'
              : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Avatar icon */}
          <span
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '10px',
              background: isVoicePickerOpen
                ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                : 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              color: isVoicePickerOpen ? 'white' : 'var(--text-muted)',
            }}
          >
            <Mic size={13} />
          </span>

          {/* Voice info */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.3',
              }}
            >
              {selectedVoice
                ? selectedVoice.name.split('-')[0].trim().split('(')[0].trim()
                : 'Select Voice'}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginTop: '1px',
              }}
            >
              {selectedVoice ? selectedVoice.langDisplay : 'Tap to browse'}
            </div>
          </div>

          {/* Change label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: isVoicePickerOpen ? 'var(--accent-start)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
            >
              Change
            </span>
            <ChevronRight
              size={12}
              style={{
                color: isVoicePickerOpen ? 'var(--accent-start)' : 'var(--text-muted)',
                transform: isVoicePickerOpen ? 'rotate(90deg)' : 'none',
                transition: 'all 0.2s ease',
              }}
            />
          </div>
        </button>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 4: Highlight Mode — Segmented Control
          ════════════════════════════════════════════ */}
      <div
        style={{
          margin: '0 12px',
          padding: '14px',
          borderRadius: '14px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}
      >
        <SectionLabel icon={<Highlighter size={10} />} label="Highlight" />

        {/* iOS-style segmented control */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            padding: '3px',
            borderRadius: '10px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
          }}
        >
          {(['word', 'sentence'] as const).map((mode) => {
            const isSelected = highlightMode === mode;
            const Icon = mode === 'word' ? Type : Eye;
            return (
              <button
                key={mode}
                onClick={() => onHighlightModeChange(mode)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                    : 'transparent',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'var(--font-ui)',
                  textTransform: 'capitalize',
                  boxShadow: isSelected
                    ? '0 2px 6px rgba(79, 70, 229, 0.2)'
                    : 'none',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Icon size={11} />
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 5: Focus Mode
          ════════════════════════════════════════════ */}
      <div
        style={{
          margin: '0 12px',
          padding: '14px',
          borderRadius: '14px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px',
        }}
      >
        <SectionLabel icon={<Focus size={10} />} label="Focus Mode" />

        <button
          onClick={onBlurModeToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: blurMode ? 'var(--accent-start)' : 'var(--border-color)',
            backgroundColor: blurMode ? 'var(--accent-soft)' : 'var(--bg-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-ui)',
            boxShadow: blurMode
              ? '0 2px 8px rgba(79, 70, 229, 0.12)'
              : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Focus
              size={13}
              style={{
                color: blurMode ? 'var(--accent-start)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: blurMode ? 'var(--accent-start)' : 'var(--text-secondary)',
                transition: 'color 0.2s ease',
              }}
            >
              Reading Focus
            </span>
          </div>

          {/* iOS-style Toggle Switch */}
          <div
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '11px',
              backgroundColor: blurMode ? 'var(--accent-start)' : 'var(--bg-sunken)',
              border: `1.5px solid ${blurMode ? 'var(--accent-start)' : 'var(--border-color)'}`,
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              boxShadow: blurMode
                ? 'inset 0 0 0 1px rgba(255,255,255,0.15)'
                : 'inset 0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '1.5px',
                left: blurMode ? '20px' : '1.5px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        </button>

        {/* Footnote */}
        <p
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginTop: '8px',
            lineHeight: '1.5',
            opacity: 0.65,
            paddingLeft: '2px',
          }}
        >
          {blurMode
            ? '✨ Active — surrounding text is dimmed to help you focus.'
            : 'Blurs surrounding lines while reading aloud.'}
        </p>
      </div>
    </>
  );

  // ════════════════════════════════════════════
  // MOBILE LAYOUT: Slide-out drawer
  // ════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        {/* Hamburger Button */}
        {!isMobileDrawerOpen && (
          <button
            onClick={onToggleMobileDrawer}
            style={{
              position: 'fixed',
              top: '60px',
              left: '8px',
              zIndex: 30,
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Open controls"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Backdrop overlay */}
        {isMobileDrawerOpen && (
          <div
            onClick={onToggleMobileDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 39,
              animation: 'overlay-in 0.2s ease forwards',
            }}
          />
        )}

        {/* Drawer panel */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: isMobileDrawerOpen ? '0px' : '-290px',
            width: '272px',
            height: '100dvh',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            boxShadow: isMobileDrawerOpen ? '8px 0 32px rgba(0,0,0,0.12)' : 'none',
            zIndex: 40,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            transition: 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {panelContent}
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════
  // DESKTOP LAYOUT: Normal sidebar
  // ════════════════════════════════════════════
  return (
    <div
      style={{
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {panelContent}
    </div>
  );
}