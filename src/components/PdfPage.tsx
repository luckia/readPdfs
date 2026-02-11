/* ========================================
   FREE PDF TTS READER — PDF Page
   by Analyst Sandeep
   
   Renders a single PDF page:
   - Canvas layer (accurate visual rendering)
   - Text layer (clickable words with highlighting)
   
   UPGRADED: 
   - Reports measured height for virtualized rendering
   - Debounced rendering to prevent fast-zoom corruption
   - Cancels in-progress renders before starting new ones
   ======================================== */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
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

  // ---- Refs for render lifecycle management ----
  const activeRenderTaskRef = useRef<RenderTask | null>(null);
  const renderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRenderedScaleRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

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
   * Cancel any in-progress render task safely.
   */
  const cancelActiveRender = useCallback(() => {
    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel();
      } catch {
        // Ignore — render may have already completed
      }
      activeRenderTaskRef.current = null;
    }
  }, []);

  /**
   * Render the PDF page to canvas.
   * This function cancels any previous render before starting.
   */
  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    // Cancel any in-progress render first
    cancelActiveRender();

    // Capture the scale we're rendering at
    const renderScale = scale;

    try {
      const page = await pdfDoc.getPage(pageData.pageNumber);

      // Check if component unmounted or scale changed during getPage()
      if (!isMountedRef.current) {
        page.cleanup();
        return;
      }

      const viewport = page.getViewport({ scale: renderScale });

      // Set canvas dimensions (use devicePixelRatio for sharp rendering)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        page.cleanup();
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear the canvas before rendering to prevent ghosting
      ctx.clearRect(0, 0, viewport.width, viewport.height);

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
        canvas: canvas,
      } as any);

      // Store the active render task so it can be cancelled
      activeRenderTaskRef.current = renderTask;

      await renderTask.promise;

      // Render completed successfully
      activeRenderTaskRef.current = null;

      // Only mark as rendered if this render is still for the current scale
      // (prevents stale render from marking as complete)
      if (isMountedRef.current) {
        lastRenderedScaleRef.current = renderScale;
        setIsRendered(true);
      }

      // Clean up page resources after successful rendering
      page.cleanup();
    } catch (err) {
      // RenderingCancelled is expected when we cancel — not an error
      if (err instanceof Error && err.message.includes('Rendering cancelled')) {
        return;
      }
      // Also handle the DOMException from cancel()
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error(`Error rendering page ${pageData.pageNumber}:`, err);
    }
  }, [pdfDoc, pageData.pageNumber, scale, cancelActiveRender]);

  /**
   * Debounced render trigger.
   * When scale changes rapidly (fast zoom), this waits until
   * the user stops clicking before rendering.
   * 
   * Key behaviors:
   * - First render (no previous render): renders immediately
   * - Subsequent scale changes: debounces by 150ms
   * - Keeps the previous canvas visible during debounce (no skeleton flash)
   */
  useEffect(() => {
    // Clear any pending debounce
    if (renderDebounceRef.current) {
      clearTimeout(renderDebounceRef.current);
      renderDebounceRef.current = null;
    }

    // If this is the very first render (never rendered before), render immediately
    if (lastRenderedScaleRef.current === null) {
      setIsRendered(false);
      renderPage();
      return;
    }

    // For subsequent renders (zoom changes):
    // Cancel any in-progress render immediately to free resources
    cancelActiveRender();

    // DON'T set isRendered to false here — keep showing the old canvas
    // This prevents the skeleton flash during fast zoom

    // Debounce the actual render — wait for user to stop clicking
    renderDebounceRef.current = setTimeout(() => {
      renderDebounceRef.current = null;
      // Now start the new render
      // Only show skeleton if the scale difference is very large
      // (small zoom steps: keep old canvas visible)
      const scaleDiff = Math.abs(scale - (lastRenderedScaleRef.current || scale));
      if (scaleDiff > 0.5) {
        setIsRendered(false);
      }
      renderPage();
    }, 150);

    // Cleanup debounce on unmount or next trigger
    return () => {
      if (renderDebounceRef.current) {
        clearTimeout(renderDebounceRef.current);
        renderDebounceRef.current = null;
      }
    };
  }, [scale, renderPage, cancelActiveRender]);

  /**
   * Cleanup on unmount — cancel everything.
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Cancel any in-progress render
      cancelActiveRender();

      // Cancel any pending debounce
      if (renderDebounceRef.current) {
        clearTimeout(renderDebounceRef.current);
        renderDebounceRef.current = null;
      }
    };
  }, [cancelActiveRender]);

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
            gap: '10px',
            padding: '40px 48px',
            justifyContent: 'flex-start',
            paddingTop: '60px',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '10px',
                width: i === 0 ? '45%' : i === 7 ? '55%' : `${70 + (i * 3) % 25}%`,
                borderRadius: '4px',
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
                userSelect: 'none',
                WebkitUserSelect: 'none',
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