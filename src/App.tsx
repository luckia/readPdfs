/* ========================================
   FREE PDF TTS READER
   by Analyst Sandeep
   
   Main Application Component
   Redesign: Warm Premium Reader
   ======================================== */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PdfWord } from './types';

// Hooks
import { useTheme } from './hooks/useTheme';
import { usePdfDocument } from './hooks/usePdfDocument';
import { useVoices } from './hooks/useVoices';
import { useSpeech } from './hooks/useSpeech';
import { useDictionary } from './hooks/useDictionary';
import { useToast } from './hooks/useToast';

// Components
import ThemeToggle from './components/ThemeToggle';
import WelcomeModal, { shouldShowWelcome } from './components/WelcomeModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import PdfUploader from './components/PdfUploader';
import PdfViewer from './components/PdfViewer';
import ControlsPanel from './components/ControlsPanel';
import VoicePicker from './components/VoicePicker';
import DefinitionPopup from './components/DefinitionPopup';
import ToastContainer from './components/Toast';
import FloatingActionButton from './components/FloatingActionButton';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import ZoomControls, { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from './components/ZoomControls';
import { BookOpen } from 'lucide-react';

export default function App() {
  const theme = useTheme();
  const pdf = usePdfDocument();
  const voices = useVoices();
  const speech = useSpeech();
  const dictionary = useDictionary();
  const toast = useToast();

  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

    // Zoom state
  const [scale, setScale] = useState<number | null>(null);
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'custom'>('fit-width');

  // Focus blur mode state
  const [blurMode, setBlurMode] = useState(false);

  // Jump to page state
  const [jumpToPage, setJumpToPage] = useState('');
  const [jumpError, setJumpError] = useState('');
  const jumpErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jumpToPageFnRef = useRef<(pageNum: number) => void>(() => {});
  const calculateFitWidthFnRef = useRef<() => number>(() => 1.0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => { await pdf.loadPdf(file); },
    [pdf]
  );

  useEffect(() => {
    if (pdf.pdfData) {
      toast.pdfLoaded(pdf.pdfData.totalPages, pdf.pdfData.totalWordCount, pdf.pdfData.estimatedReadTime);
      if (pdf.pdfData.totalWordCount === 0) toast.noTextFound();
    }
  }, [pdf.pdfData]);

  useEffect(() => {
    if (voices.noVoicesAvailable) toast.noVoicesFound();
  }, [voices.noVoicesAvailable]);

  const handleWordClick = useCallback(
    (globalIndex: number) => {
      if (!pdf.pdfData) return;
      speech.playFromWord(globalIndex, pdf.pdfData.allWords, voices.selectedVoice);
    },
    [pdf.pdfData, speech, voices.selectedVoice]
  );

  const handleWordDoubleClick = useCallback(() => {
    if (speech.isPlaying) speech.pause();
  }, [speech]);

  const handleWordRightClick = useCallback(
    (word: PdfWord, position: { x: number; y: number }) => {
      dictionary.lookup(word.originalText, position);
    },
    [dictionary]
  );

  const handleVoiceSelect = useCallback(
    (voiceInfo: typeof voices.selectedVoice) => {
      if (!voiceInfo) return;
      voices.selectVoice(voiceInfo);
      speech.changeVoice(voiceInfo);
      toast.voiceChanged(voiceInfo.name);
    },
    [voices, speech, toast]
  );

  const handleRateChange = useCallback(
    (newRate: number) => {
      speech.changeRate(newRate);
      toast.speedChanged(newRate);
    },
    [speech, toast]
  );

  const handleThemeCycle = useCallback(() => {
    theme.cycleTheme();
    const themeNames = { light: 'Light', dark: 'Dark', sepia: 'Sepia' };
    const cycle = ['light', 'dark', 'sepia'] as const;
    const currentIdx = cycle.indexOf(theme.theme);
    const nextTheme = cycle[(currentIdx + 1) % 3];
    toast.themeChanged(themeNames[nextTheme]);
  }, [theme, toast]);

 
  const handleHighlightModeChange = useCallback(
    (mode: 'word' | 'sentence') => { speech.setHighlightMode(mode); },
    [speech]
  );

  const handleBlurModeToggle = useCallback(() => {
    setBlurMode((prev) => !prev);
  }, []);

  useEffect(() => {
    speech.onComplete(() => { toast.readingComplete(); });
  }, [speech, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        speech.togglePauseResume();
        return;
      }

      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (showVoicePicker) { setShowVoicePicker(false); return; }
        if (dictionary.isOpen) { dictionary.close(); return; }
        speech.stop();
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speech, dictionary, showShortcuts, showVoicePicker]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomMode('custom');
    setScale((prev) => Math.min((prev || 1) + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomMode('custom');
    setScale((prev) => Math.max((prev || 1) - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleFitWidth = useCallback(() => {
    setZoomMode('fit-width');
    const fitScale = calculateFitWidthFnRef.current();
    setScale(fitScale);
  }, []);

  // Jump to page handler
  const handleJumpToPage = useCallback(
    (pageNum: number) => {
      if (jumpErrorTimeoutRef.current) {
        clearTimeout(jumpErrorTimeoutRef.current);
      }

      if (!pdf.pdfData) return;

      if (isNaN(pageNum) || pageNum < 1) {
        setJumpError('Min page is 1');
        jumpErrorTimeoutRef.current = setTimeout(() => setJumpError(''), 2500);
        return;
      }
      if (pageNum > pdf.pdfData.totalPages) {
        setJumpError(`Max is ${pdf.pdfData.totalPages}`);
        jumpErrorTimeoutRef.current = setTimeout(() => setJumpError(''), 2500);
        return;
      }

      setJumpError('');
      jumpToPageFnRef.current(pageNum);
    },
    [pdf.pdfData]
  );

  // Keyboard zoom shortcuts
  useEffect(() => {
    if (!pdf.pdfData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); handleZoomIn(); }
        else if (e.key === '-') { e.preventDefault(); handleZoomOut(); }
        else if (e.key === '0') { e.preventDefault(); handleFitWidth(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdf.pdfData, handleZoomIn, handleZoomOut, handleFitWidth]);

  useEffect(() => {
    return () => {
      if (jumpErrorTimeoutRef.current) clearTimeout(jumpErrorTimeoutRef.current);
    };
  }, []);

  const showPdfViewer = pdf.pdfData && pdf.getPdfDoc();
  const showUploader = !pdf.pdfData;

  // Reading progress
  const totalWords = pdf.pdfData?.allWords.length || 0;
  const readingProgressPercent =
    totalWords > 0 && speech.currentIndex >= 0
      ? (speech.currentIndex / totalWords) * 100
      : 0;
  const showProgressBar = pdf.pdfData && speech.currentIndex >= 0 && totalWords > 0;

  const currentScale = scale || 1.0;

  return (
    <ErrorBoundary>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          position: 'relative',
        }}
      >
        {/* ---- Header ---- */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
            zIndex: 20,
            minHeight: '60px',
            gap: '12px',
          }}
        >
          {/* LEFT: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '22px' }}>🎧</span>
            <div>
              <h1
                className="gradient-text"
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                }}
              >
                PDF TTS READER
              </h1>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                Free · Private · Local
              </p>
            </div>
          </div>

          {/* CENTER: Zoom Controls — shifted left to center over PDF area */}
          {showPdfViewer && (
            <div
              style={{
                flex: '1 1 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                /* Offset left by ~120px (half of sidebar width 240px) to center over PDF content */
                marginLeft: '-120px',
              }}
            >
              <ZoomControls
                scale={currentScale}
                mode={zoomMode}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitWidth={handleFitWidth}
              />
            </div>
          )}

          {/* Spacer when no PDF */}
          {!showPdfViewer && <div style={{ flex: '1 1 auto' }} />}

          {/* RIGHT: Page nav + Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Go to Page + Page indicator (only when PDF loaded) */}
            {showPdfViewer && pdf.pdfData && (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '2px',
                    marginRight: '4px',
                  }}
                >
                  {/* Row 1: Go to input */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Go to:
                    </span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min={1}
                        max={pdf.pdfData.totalPages}
                        value={jumpToPage}
                        onChange={(e) => {
                          setJumpToPage(e.target.value);
                          if (jumpError) setJumpError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const num = parseInt(jumpToPage, 10);
                            handleJumpToPage(num);
                            if (num >= 1 && num <= pdf.pdfData!.totalPages) {
                              setJumpToPage('');
                              (e.target as HTMLInputElement).blur();
                            }
                          }
                        }}
                        onFocus={(e) => {
                          e.target.select();
                          e.target.style.borderColor = 'var(--accent-start)';
                          e.target.style.boxShadow = '0 0 0 2px var(--focus-ring)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = jumpError ? 'var(--error)' : 'var(--border-color)';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder={`1-${pdf.pdfData.totalPages}`}
                        style={{
                          width: '58px',
                          padding: '3px 6px',
                          borderRadius: '6px',
                          border: `1.5px solid ${jumpError ? 'var(--error)' : 'var(--border-color)'}`,
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: 500,
                          outline: 'none',
                          textAlign: 'center',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                          fontFamily: 'var(--font-ui)',
                        }}
                      />
                      {jumpError && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#fff',
                            backgroundColor: 'var(--error)',
                            whiteSpace: 'nowrap',
                            zIndex: 9999,
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                            animation: 'jump-error-in 0.2s ease forwards',
                            pointerEvents: 'none',
                          }}
                        >
                          {jumpError}
                          <div
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '12px',
                              transform: 'rotate(45deg)',
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'var(--error)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Page indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      opacity: 0.9,
                    }}
                  >
                    <BookOpen size={11} style={{ opacity: 0.6 }} />
                    <span>
                      Page{' '}
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {currentPage}
                      </strong>{' '}
                      of {pdf.pdfData.totalPages}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <span
                  style={{
                    width: '1px',
                    height: '28px',
                    backgroundColor: 'var(--border-color)',
                    flexShrink: 0,
                  }}
                />
              </>
            )}

            {/* Upload New PDF */}
            {pdf.pdfData && (
              <div className="tooltip-wrapper tooltip-bottom" data-tooltip="Upload New PDF">
                <button
                  onClick={() => { speech.stop(); pdf.clearPdf(); setScale(null); setZoomMode('fit-width'); }}
                  className="btn-icon"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--error)',
                  }}
                  aria-label="Upload new PDF"
                >
                  <span style={{ fontSize: '13px' }}>📄</span>
                </button>
              </div>
            )}

            {/* Help */}
            <div className="tooltip-wrapper tooltip-bottom" data-tooltip="How to Use">
              <button
                onClick={() => setShowWelcome(true)}
                className="btn-icon"
                style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)' }}
                aria-label="Show instructions"
              >
                <span style={{ fontSize: '15px' }}>❓</span>
              </button>
            </div>

            {/* Shortcuts */}
            <div className="tooltip-wrapper tooltip-bottom" data-tooltip="Shortcuts (?)">
              <button
                onClick={() => setShowShortcuts(true)}
                className="btn-icon"
                style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)' }}
                aria-label="Show keyboard shortcuts"
              >
                <span style={{ fontSize: '13px' }}>⌨️</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme.theme} onCycleTheme={handleThemeCycle} />
          </div>
        </header>

        {/* ---- READING PROGRESS BAR ---- */}
        {showPdfViewer && (
          <div
            style={{
              flexShrink: 0,
              height: '4px',
              backgroundColor: showProgressBar ? 'var(--progress-track)' : 'transparent',
              position: 'relative',
              zIndex: 19,
              transition: 'background-color 0.3s ease',
            }}
          >
            <div
              className={showProgressBar ? 'global-progress-fill' : ''}
              style={{
                height: '100%',
                width: showProgressBar ? `${readingProgressPercent}%` : '0%',
                background: showProgressBar
                  ? 'linear-gradient(90deg, var(--accent-start), var(--accent-end))'
                  : 'transparent',
                borderRadius: '0 3px 3px 0',
                transition: 'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: showProgressBar
                  ? '0 0 10px rgba(79, 70, 229, 0.4), 0 0 4px rgba(79, 70, 229, 0.2)'
                  : 'none',
              }}
            />
          </div>
        )}

        {/* ---- Main Content ---- */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {showPdfViewer && pdf.pdfData && (
            <ControlsPanel
              status={speech.status}
              currentIndex={speech.currentIndex}
              rate={speech.rate}
              highlightMode={speech.highlightMode}
              pdfData={pdf.pdfData}
              currentPage={currentPage}
              selectedVoice={voices.selectedVoice}
              onTogglePauseResume={speech.togglePauseResume}
              onStop={speech.stop}
              onRateChange={handleRateChange}
              onHighlightModeChange={handleHighlightModeChange}
              onToggleVoicePicker={() => setShowVoicePicker((prev) => !prev)}
              isVoicePickerOpen={showVoicePicker}
              blurMode={blurMode}
              onBlurModeToggle={handleBlurModeToggle}
            />
          )}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {showUploader && (
              <PdfUploader
                onFileSelect={handleFileSelect}
                isLoading={pdf.isLoading}
                loadingMessage={pdf.loadingMessage}
                loadingProgress={pdf.loadingProgress}
                error={pdf.loadingError}
              />
            )}

            {showPdfViewer && pdf.pdfData && pdf.getPdfDoc() && (
              <PdfViewer
                pdfDoc={pdf.getPdfDoc()!}
                pdfData={pdf.pdfData}
                currentWordIndex={speech.currentIndex}
                highlightMode={speech.highlightMode}
                isPlaying={speech.isPlaying}
                selectedVoice={voices.selectedVoice}
                onWordClick={handleWordClick}
                onWordDoubleClick={handleWordDoubleClick}
                onWordRightClick={handleWordRightClick}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                scale={scale}
                setScale={setScale}
                zoomMode={zoomMode}
                setZoomMode={setZoomMode}
                jumpToPageFnRef={jumpToPageFnRef}
                calculateFitWidthFnRef={calculateFitWidthFnRef}
                blurMode={blurMode}
                speechStatus={speech.status}
              />
            )}
          </div>

          {showVoicePicker && (
            <VoicePicker
              voices={voices.voices}
              filteredVoices={voices.filteredVoices}
              selectedVoice={voices.selectedVoice}
              isLoading={voices.isLoading}
              noVoicesAvailable={voices.noVoicesAvailable}
              searchQuery={voices.searchQuery}
              genderFilter={voices.genderFilter}
              onSearchChange={voices.setSearchQuery}
              onGenderChange={voices.setGenderFilter}
              onSelectVoice={handleVoiceSelect}
              onPreviewVoice={voices.previewVoice}
              isOpen={showVoicePicker}
              onClose={() => setShowVoicePicker(false)}
            />
          )}
        </div>

        {/* ---- Footer ---- */}
        <Footer />

        {/* ---- Modals & Overlays ---- */}
        <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
        <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
        <DefinitionPopup state={dictionary.state} isOpen={dictionary.isOpen} onClose={dictionary.close} />
        <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
        <FloatingActionButton
          status={speech.status}
          onTogglePauseResume={speech.togglePauseResume}
          onStop={speech.stop}
          visible={isMobile}
        />
      </div>
    </ErrorBoundary>
  );
}