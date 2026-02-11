/* ========================================
   FREE PDF TTS READER — Controls Panel
   by Analyst Sandeep
   — Stop button removed
   — Keyboard hints removed
   — Waveform below play button
   — Word count + read time in status
   ======================================== */

import {
  Play,
  Pause,
  Mic,
  Star,
  Type,
  Eye,
  ChevronRight,
  FileText,
  Clock,
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

  return (
    <div
      style={{
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {/* ---- Playback Section ---- */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Play/Pause Button */}
        <div className="tooltip-wrapper tooltip-right" data-tooltip={
          isPlaying ? 'Pause (Space)' :
          isPaused ? 'Resume (Space)' :
          'Click a word to start'
        }>
          <button
            className="btn-star"
            onClick={onTogglePauseResume}
            disabled={!isActive}
            style={{
              width: '52px',
              height: '52px',
              opacity: isActive ? 1 : 0.45,
              cursor: isActive ? 'pointer' : 'not-allowed',
              position: 'relative',
              fontSize: '18px',
            }}
            aria-label={isPlaying ? 'Pause' : 'Resume'}
          >
            <Star
              size={52}
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                opacity: 0.1,
                color: 'white',
              }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </span>
          </button>
        </div>

        {/* Waveform — below play button, only visible when playing */}
        <Waveform isPlaying={isPlaying} size="medium" />

        {/* Status Text */}
        <div style={{ textAlign: 'center' }}>
          {isPlaying && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-start)' }}>
                Reading… {progressPercent}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Word {currentIndex + 1} of {totalWords.toLocaleString()}
              </div>
            </div>
          )}
          {isPaused && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Paused at {progressPercent}%
            </div>
          )}
          {!isActive && hasPdf && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Click any word to start
            </div>
          )}
          {!isActive && !hasPdf && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Upload a PDF
            </div>
          )}
        </div>

        {/* Word Count + Read Time — always visible when PDF loaded */}
        {hasPdf && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              color: 'var(--text-muted)',
              opacity: 0.85,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FileText size={10} style={{ opacity: 0.6 }} />
              <span>{formatWordCount(pdfData!.totalWordCount)} words</span>
            </div>
            <span
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-muted)',
                opacity: 0.4,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={10} style={{ opacity: 0.6 }} />
              <span>~{pdfData!.estimatedReadTime} min</span>
            </div>
          </div>
        )}
      </div>

      {/* ---- Speed Section ---- */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          Speed
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
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
                  padding: '6px 2px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-start)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-primary)',
                  color: isSelected ? 'var(--accent-start)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: hasPdf ? 'pointer' : 'not-allowed',
                  opacity: hasPdf ? 1 : 0.45,
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Voice Section ---- */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          Voice
        </div>

        <button
          onClick={onToggleVoicePicker}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid',
            borderColor: isVoicePickerOpen ? 'var(--accent-start)' : 'var(--border-color)',
            backgroundColor: isVoicePickerOpen ? 'var(--accent-soft)' : 'var(--bg-primary)',
            color: isVoicePickerOpen ? 'var(--accent-start)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            textAlign: 'left',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <Mic size={13} style={{ flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedVoice
              ? selectedVoice.name.split('-')[0].trim().split('(')[0].trim()
              : 'Select Voice'}
          </span>
          <ChevronRight
            size={12}
            style={{
              flexShrink: 0,
              transform: isVoicePickerOpen ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>

      {/* ---- Highlight Section ---- */}
      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          Highlight
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
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
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-start)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-primary)',
                  color: isSelected ? 'var(--accent-start)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-ui)',
                  textTransform: 'capitalize',
                }}
              >
                <Icon size={11} />
                {mode}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}