/* ========================================
   FREE PDF TTS READER — Zoom Controls
   by Analyst Sandeep
   
   Zoom in / out / fit-to-width controls.
   Shows current zoom percentage.
   ======================================== */

import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { ZoomMode } from '../types';

interface ZoomControlsProps {
  scale: number;
  mode: ZoomMode;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
}

/** Min and max zoom levels */
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.15;

export default function ZoomControls({
  scale,
  mode,
  onZoomIn,
  onZoomOut,
  onFitWidth,
}: ZoomControlsProps) {
  const percentage = Math.round(scale * 100);
  const canZoomIn = scale < MAX_ZOOM;
  const canZoomOut = scale > MIN_ZOOM;
  const isFitWidth = mode === 'fit-width';

  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
      }}
    >
      {/* Zoom Out */}
      <div className="tooltip-wrapper" data-tooltip="Zoom Out (Ctrl + -)">
        <button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className="btn-icon"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            opacity: canZoomOut ? 1 : 0.4,
            cursor: canZoomOut ? 'pointer' : 'not-allowed',
          }}
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Percentage Display */}
      <div
        style={{
          minWidth: '52px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          padding: '0 4px',
          userSelect: 'none',
        }}
      >
        {percentage}%
      </div>

      {/* Zoom In */}
      <div className="tooltip-wrapper" data-tooltip="Zoom In (Ctrl + =)">
        <button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className="btn-icon"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            opacity: canZoomIn ? 1 : 0.4,
            cursor: canZoomIn ? 'pointer' : 'not-allowed',
          }}
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'var(--border-color)',
          margin: '0 2px',
        }}
      />

      {/* Fit to Width */}
      <div className="tooltip-wrapper" data-tooltip="Fit to Width (Ctrl + 0)">
        <button
          onClick={onFitWidth}
          className="btn-icon"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: isFitWidth ? 'var(--accent-start)' : undefined,
            color: isFitWidth ? 'white' : undefined,
            border: isFitWidth ? '1px solid var(--accent-start)' : undefined,
          }}
          aria-label="Fit to width"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}