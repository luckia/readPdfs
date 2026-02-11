/* ========================================
   FREE PDF TTS READER — PDF Page
   by Analyst Sandeep
   
   Renders a single PDF page:
   - Canvas layer (accurate visual rendering)
   - Text layer (clickable words with highlighting)
   
   UPGRADED: Reports measured height for
   virtualized rendering performance.
   ======================================== */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PdfPageData, PdfWord } from '../types';
import { getSentenceRange } from '../utils/textProcessing';

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageData: PdfPageData;
  scale: number;
  currentWordIndex: number;
  highlightMode: 'word' | 'sentence';
  allWords: PdfWord[];
  onWordClick: (globalIndex: number) => void;
  onWordDoubleClick: () => void;
  onWordRightClick: (word: PdfWord, position: { x: number; y: number }) => void;
  onPageMeasured?: (pageIndex: number, height: number) => void;
}

export default function PdfPage({
  pdfDoc,
  pageData,
  scale,
  currentWordIndex,
  highlightMode,
  allWords,
  onWordClick,
  onWordDoubleClick,
  onWordRightClick,
  onPageMeasured,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  // Calculate display dimensions
  const displayWidth = pageData.originalWidth * scale;
  const displayHeight = pageData.originalHeight * scale;

  /**
   * Report measured height to parent for virtualization.
   */
  useEffect(() => {
    if (pageContainerRef.current && onPageMeasured) {
      const height = pageContainerRef.current.offsetHeight;
      if (height > 0) {
        onPageMeasured(pageData.pageIndex, height);
      }
    }
  }, [displayHeight, onPageMeasured, pageData.pageIndex]);

  /**
   * Render the PDF page to canvas.
   */
  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const page = await pdfDoc.getPage(pageData.pageNumber);
      const viewport = page.getViewport({ scale });

      // Set canvas dimensions (use devicePixelRatio for sharp rendering)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
        canvas: canvas,
      } as any);

      await renderTask.promise;
      setIsRendered(true);

      // Clean up page resources after rendering
      page.cleanup();
    } catch (err) {
      if (err instanceof Error && err.message.includes('Rendering cancelled')) {
        return;
      }
      console.error(`Error rendering page ${pageData.pageNumber}:`, err);
    }
  }, [pdfDoc, pageData.pageNumber, scale]);

  // Render page when scale changes
  useEffect(() => {
    setIsRendered(false);
    renderPage();
  }, [renderPage]);

  /**
   * Calculate sentence range for sentence highlighting.
   */
  const sentenceRange =
    highlightMode === 'sentence' && currentWordIndex >= 0
      ? getSentenceRange(allWords, currentWordIndex)
      : null;

  /**
   * Check if a word should be highlighted.
   */
  const isWordHighlighted = (word: PdfWord): boolean => {
    if (currentWordIndex < 0) return false;
    return word.globalIndex === currentWordIndex;
  };

  /**
   * Check if a word is in the highlighted sentence.
   */
  const isInSentence = (word: PdfWord): boolean => {
    if (!sentenceRange) return false;
    return (
      word.globalIndex >= sentenceRange.start &&
      word.globalIndex <= sentenceRange.end
    );
  };

  return (
    <div
      ref={pageContainerRef}
      data-page={pageData.pageNumber}
      style={{
        position: 'relative',
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        margin: '0 auto 12px auto',
        backgroundColor: 'white',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Canvas Layer — Accurate PDF Rendering */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      />

      {/* Loading Skeleton (shown before canvas renders) */}
      {!isRendered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '32px',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '14px',
                width: `${60 + Math.random() * 35}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Text Layer — Clickable Words */}
      <div
        className="pdf-text-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      >
        {pageData.words.map((word) => {
          const highlighted = isWordHighlighted(word);
          const inSentence = isInSentence(word);

          // Scale word position
          const left = word.rect.left * scale;
          const top = word.rect.top * scale;
          const width = word.rect.width * scale;
          const height = word.rect.height * scale;
          const fontSize = word.fontSize * scale;

          return (
            <span
              key={word.id}
              id={word.id}
              data-global-index={word.globalIndex}
              className={[
                'pdf-word',
                highlighted ? 'word-highlight' : '',
                inSentence && !highlighted ? 'sentence-highlight' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                fontSize: `${fontSize}px`,
                lineHeight: `${height}px`,
                fontFamily: word.fontFamily,
                cursor: 'pointer',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                color: 'transparent',
                zIndex: highlighted ? 5 : 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(word.globalIndex);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWordDoubleClick();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWordRightClick(word, { x: e.clientX, y: e.clientY });
              }}
              title={word.originalText}
            >
              {word.originalText}
            </span>
          );
        })}
      </div>

      {/* Page Number Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {pageData.pageNumber}
      </div>
    </div>
  );
}