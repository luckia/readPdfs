/* ========================================
   FREE PDF TTS READER — Definition Popup
   by Analyst Sandeep
   
   Premium popup for word definitions.
   Appears on right-click.
   Shows phonetic, part of speech, definitions.
   Handles loading, errors, offline gracefully.
   ======================================== */

import { X, Volume2, Wifi, BookOpen, Loader } from 'lucide-react';
import type { DictionaryState } from '../types';

interface DefinitionPopupProps {
  state: DictionaryState;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Play pronunciation audio if available.
 */
function playAudio(url: string) {
  try {
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Ignore audio play errors
    });
  } catch {
    // Ignore errors
  }
}

export default function DefinitionPopup({
  state,
  isOpen,
  onClose,
}: DefinitionPopupProps) {
  if (!isOpen) return null;

  // Calculate popup position (ensure it stays within viewport)
  const popupWidth = 340;
  const popupMaxHeight = 400;
  const padding = 16;

  let left = state.position.x;
  let top = state.position.y + 10;

  // Adjust if popup would go off-screen right
  if (left + popupWidth > window.innerWidth - padding) {
    left = window.innerWidth - popupWidth - padding;
  }

  // Adjust if popup would go off-screen left
  if (left < padding) {
    left = padding;
  }

  // Adjust if popup would go off-screen bottom
  if (top + popupMaxHeight > window.innerHeight - padding) {
    top = state.position.y - popupMaxHeight - 10;
  }

  // Ensure top is not negative
  if (top < padding) {
    top = padding;
  }

  // Find audio URL from phonetics
  const audioUrl = state.result?.phonetics?.find((p) => p.audio)?.audio;

  return (
    <div
      className="definition-popup"
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`,
        maxHeight: `${popupMaxHeight}px`,
        zIndex: 45,
        animation: 'modal-in 0.2s ease forwards',
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="glass-strong"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: '0 8px 32px var(--shadow-color), 0 0 0 1px var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={14} style={{ color: 'var(--accent-start)' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              Definition
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-label="Close definition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            maxHeight: `${popupMaxHeight - 60}px`,
          }}
        >
          {/* Loading State */}
          {state.isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 0',
                gap: '12px',
              }}
            >
              <Loader
                size={24}
                style={{
                  color: 'var(--accent-start)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                Looking up "{state.word}"...
              </span>

              {/* Spinner keyframe */}
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Error State */}
          {!state.isLoading && state.error && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 0',
                gap: '8px',
                textAlign: 'center',
              }}
            >
              <Wifi
                size={24}
                style={{ color: 'var(--text-muted)' }}
              />
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                }}
              >
                {state.error}
              </p>
            </div>
          )}

          {/* Result State */}
          {!state.isLoading && state.result && (
            <div>
              {/* Word + Phonetic */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {state.result.word}
                </h3>

                {/* Phonetic */}
                {state.result.phonetic && (
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    {state.result.phonetic}
                  </span>
                )}

                {/* Audio Button */}
                {audioUrl && (
                  <button
                    onClick={() => playAudio(audioUrl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                    aria-label="Play pronunciation"
                    title="Play pronunciation"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>

              {/* Meanings */}
              {state.result.meanings.map((meaning, mIdx) => (
                <div key={mIdx} style={{ marginBottom: '16px' }}>
                  {/* Part of Speech */}
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
                      color: 'white',
                    }}
                  >
                    {meaning.partOfSpeech}
                  </div>

                  {/* Definitions */}
                  {meaning.definitions.map((def, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        marginBottom: '10px',
                        paddingLeft: '12px',
                        borderLeft: '2px solid var(--border-color)',
                      }}
                    >
                      {/* Definition text */}
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          lineHeight: '1.5',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginRight: '4px',
                          }}
                        >
                          {dIdx + 1}.
                        </span>
                        {def.definition}
                      </p>

                      {/* Example */}
                      {def.example && (
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            marginTop: '4px',
                            paddingLeft: '16px',
                          }}
                        >
                          "{def.example}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* No result, no error, not loading */}
          {!state.isLoading && !state.result && !state.error && (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              Right-click a word to see its definition.
            </div>
          )}
        </div>

        {/* Footer - Internet note */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Wifi size={10} style={{ color: 'var(--text-muted)' }} />
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}
          >
            Powered by Free Dictionary API · Requires internet
          </span>
        </div>
      </div>
    </div>
  );
}