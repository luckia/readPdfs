/* ========================================
   FREE PDF TTS READER
   by Analyst Sandeep
   
   Main Application Component
   Redesign: Warm Premium Reader
   ======================================== */

import { useState, useEffect, useCallback } from 'react';
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

  const showPdfViewer = pdf.pdfData && pdf.getPdfDoc();
  const showUploader = !pdf.pdfData;

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
        }}
      >
        {/* ---- Header ---- */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            flexShrink: 0,
            zIndex: 20,
            minHeight: '56px',
          }}
        >
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          
          {/* Right: Actions */}
<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  {/* Upload New PDF — only shown when PDF is loaded */}
  {pdf.pdfData && (
    <>
      <div className="tooltip-wrapper" data-tooltip="Upload New PDF">
        <button
          onClick={() => { speech.stop(); pdf.clearPdf(); }}
          className="btn-icon"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
          }}
          aria-label="Upload new PDF"
        >
          <span style={{ fontSize: '13px' }}>📄</span>
        </button>
      </div>
      {/* Separator */}
      <span
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'var(--border-color)',
          margin: '0 2px',
        }}
      />
    </>
  )}

  {/* Help */}
  <div className="tooltip-wrapper" data-tooltip="How to Use">
    <button
      onClick={() => setShowWelcome(true)}
      className="btn-icon"
      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }}
      aria-label="Show instructions"
    >
      <span style={{ fontSize: '15px' }}>❓</span>
    </button>
  </div>

  {/* Shortcuts */}
  <div className="tooltip-wrapper" data-tooltip="Shortcuts (?)">
    <button
      onClick={() => setShowShortcuts(true)}
      className="btn-icon"
      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }}
      aria-label="Show keyboard shortcuts"
    >
      <span style={{ fontSize: '13px' }}>⌨️</span>
    </button>
  </div>

  {/* Theme Toggle — always last, always same position */}
  <ThemeToggle theme={theme.theme} onCycleTheme={handleThemeCycle} />
</div>
        </header>

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