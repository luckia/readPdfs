/* ========================================
   FREE PDF TTS READER — Controls Panel (Right Drawer)
   by Analyst Sandeep

   Redesign: Editorial Minimal Reader
   Desktop: right-side drawer overlay (380px)
   Mobile: bottom sheet
   ======================================== */

import { useState } from 'react';
import { X, Gauge, Mic, Type, ChevronRight, Highlighter, Focus } from 'lucide-react';
import type { SpeechStatus, PdfDocumentData, VoiceInfo } from '../types';

interface ControlsPanelProps {
  status: SpeechStatus;
  currentIndex: number;
  rate: number;
  highlightMode: 'word' | 'sentence';
  pdfData: PdfDocumentData;
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
  isOpen: boolean;
  onClose: () => void;
}

const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

/* ---- Section Label ---- */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-soft)',
          color: 'var(--accent)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ControlsPanel({
  rate,
  highlightMode,
  pdfData,
  selectedVoice,
  onRateChange,
  onHighlightModeChange,
  onToggleVoicePicker,
  blurMode,
  onBlurModeToggle,
  isOpen,
  onClose,
}: ControlsPanelProps) {
  const [activeTab, setActiveTab] = useState<'playback' | 'voice' | 'reading'>('playback');

  if (!isOpen) return null;

  const totalWords = pdfData.allWords.length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 49,
          animation: 'overlay-in 0.2s ease forwards',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          maxWidth: '100vw',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Controls
          </h2>
          <button
            onClick={onClose}
            aria-label="Close controls"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-sunken)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            gap: '4px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          {[
            { key: 'playback' as const, label: 'Speed', icon: <Gauge size={14} /> },
            { key: 'voice' as const, label: 'Voice', icon: <Mic size={14} /> },
            { key: 'reading' as const, label: 'Reading', icon: <Type size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
          }}
        >
          {/* ---- SPEED TAB ---- */}
          {activeTab === 'playback' && (
            <div>
              <SectionLabel icon={<Gauge size={14} />} label="Reading Speed" />

              {/* Current speed display */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                  {rate}×
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {rate <= 0.75 ? 'Slow' : rate <= 1.25 ? 'Normal' : rate <= 2 ? 'Fast' : 'Very Fast'}
                </div>
              </div>

              {/* Speed chips */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {SPEED_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onRateChange(s)}
                    className={`speed-chip${rate === s ? ' is-active' : ''}`}
                    style={{
                      height: '36px',
                      fontSize: '13px',
                    }}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {/* Reading stats */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Document Info
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Word count</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalWords.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Est. read time</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pdfData.estimatedReadTime} min</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total pages</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pdfData.totalPages}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- VOICE TAB ---- */}
          {activeTab === 'voice' && (
            <div>
              <SectionLabel icon={<Mic size={14} />} label="Voice Selection" />

              {/* Current voice card */}
              <button
                onClick={onToggleVoicePicker}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <Mic size={18} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedVoice?.name || 'Default Voice'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedVoice?.langDisplay || 'System default'}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  <ChevronRight size={16} />
                </div>
              </button>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>
                Click above to browse and preview available voices. Voice availability depends on your browser and operating system.
              </p>
            </div>
          )}

          {/* ---- READING TAB ---- */}
          {activeTab === 'reading' && (
            <div>
              {/* Highlight Mode */}
              <SectionLabel icon={<Highlighter size={14} />} label="Highlight Mode" />

              <div
                style={{
                  display: 'flex',
                  padding: '3px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  marginBottom: '8px',
                }}
              >
                {(['word', 'sentence'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onHighlightModeChange(mode)}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: highlightMode === mode ? 'var(--accent)' : 'transparent',
                      color: highlightMode === mode ? 'white' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {mode === 'word' ? '🔤 Word' : '📋 Sentence'}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                {highlightMode === 'word'
                  ? 'Highlights each word as it is read aloud.'
                  : 'Highlights the full sentence being read.'}
              </p>

              {/* Focus Mode */}
              <SectionLabel icon={<Focus size={14} />} label="Focus Mode" />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Dim surroundings
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Dims text around the current line while reading.
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={onBlurModeToggle}
                  role="switch"
                  aria-checked={blurMode}
                  aria-label="Toggle focus mode"
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: blurMode ? 'var(--accent)' : 'var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: blurMode ? '22px' : '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4, fontStyle: 'italic' }}>
                Best with sentence highlighting for a focused reading experience.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}