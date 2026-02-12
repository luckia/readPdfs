/* ========================================
   FREE PDF TTS READER — PDF Uploader
   by Analyst Sandeep
   Redesign: Warm Premium Reader
   MOBILE: Compact layout
   ======================================== */

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  error: string | null;
  isMobile?: boolean;
}

export default function PdfUploader({
  onFileSelect,
  isLoading,
  loadingMessage,
  loadingProgress,
  error,
  isMobile = false,
}: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }, []);

  const handleFile = useCallback(
    (file: File) => { if (validateFile(file)) onFileSelect(file); },
    [onFileSelect, validateFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation(); setIsDragging(false);
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFile]
  );

  // ---- Loading ----
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: isMobile ? '24px 16px' : '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}><span style={{ fontSize: isMobile ? '36px' : '48px' }}>🎧</span></div>
          <h2 className="gradient-text" style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Loading PDF…
          </h2>
          <div style={{ width: '100%', height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: '12px' }}>
            <div className="progress-bar" style={{ width: `${loadingProgress}%`, height: '100%', transition: 'width 0.3s ease' }} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{loadingMessage}</p>
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[100, 85, 92, 78, 88].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: isMobile ? '24px 16px' : '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--error)' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Failed to Load PDF</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>{error}</p>
          <button onClick={handleClick} className="btn-gradient" style={{ padding: '10px 24px', fontSize: '14px' }}>Try Another File</button>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleInputChange} style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

  // ---- Default Upload ----
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: isMobile ? '16px 12px' : '32px',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '520px',
          padding: isMobile ? '32px 20px' : '48px 40px',
          borderRadius: 'var(--radius-xl)',
          border: isDragging ? '2px solid var(--accent-start)' : '1px solid var(--border-color)',
          backgroundColor: isDragging ? 'var(--accent-soft)' : 'var(--bg-secondary)',
          boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          textAlign: 'center',
          transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <div
          style={{
            width: isMobile ? '56px' : '72px',
            height: isMobile ? '56px' : '72px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            background: isDragging
              ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
              : 'var(--bg-tertiary)',
            color: isDragging ? 'white' : 'var(--text-muted)',
            transition: 'all 0.25s ease',
          }}
        >
          {isDragging ? <FileText size={isMobile ? 24 : 32} /> : <Upload size={isMobile ? 24 : 32} />}
        </div>

        <h2 style={{
          fontSize: isMobile ? '18px' : '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          {isDragging ? 'Drop your PDF here!' : 'Upload a PDF'}
        </h2>

        <p style={{
          fontSize: isMobile ? '13px' : '14px',
          color: 'var(--text-secondary)',
          marginBottom: isMobile ? '16px' : '24px',
          lineHeight: '1.5',
        }}>
          {isDragging ? 'Release to start loading…' : isMobile ? 'Tap to browse files' : 'Drag & drop a PDF file here, or click to browse'}
        </p>

        {!isDragging && (
          <div className="btn-gradient" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '0 20px' : '0 24px',
            height: isMobile ? '40px' : '44px',
            fontSize: '14px',
          }}>
            <Upload size={16} />
            <span>Choose PDF</span>
          </div>
        )}

        <p style={{
          fontSize: isMobile ? '11px' : '12px',
          color: 'var(--text-muted)',
          marginTop: isMobile ? '14px' : '20px',
        }}>
          Supports .pdf files · Text-based PDFs work best
        </p>
      </div>

      {/* Feature pills */}
      <div style={{
        marginTop: isMobile ? '16px' : '28px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: isMobile ? '6px' : '8px',
        justifyContent: 'center',
        maxWidth: isMobile ? '100%' : '520px',
      }}>
        {[
          { icon: '🔊', label: 'Read Aloud' },
          { icon: '🎯', label: 'Word Highlight' },
          { icon: '📖', label: 'Definitions' },
          { icon: '🎙️', label: 'Voice Picker' },
          { icon: '🔒', label: '100% Private' },
          { icon: '✨', label: '100% Free' },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: isMobile ? '4px 8px' : '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleInputChange} style={{ display: 'none' }} />
    </div>
  );
}