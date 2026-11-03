import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { IndustrialImage } from './IndustrialImage';

export interface MediaLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  titleAr?: string;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  titleAr,
  onClose,
}) => {
  const validImages = images.length > 0 ? images : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const safeIndex =
        initialIndex >= 0 && initialIndex < validImages.length ? initialIndex : 0;
      setCurrentIndex(safeIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, validImages.length]);

  // Lock background scroll while Lightbox is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const goPrev = () => {
    if (validImages.length <= 1) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goNext = () => {
    if (validImages.length <= 1) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(3, +(z + 0.5).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, +(z - 0.5).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goNext();
      } else if (e.key === 'ArrowRight') {
        goPrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, validImages.length]);

  if (!isOpen || validImages.length === 0) return null;

  const currentSrc = validImages[currentIndex] || validImages[0];

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#040D1A]/95 backdrop-blur-md flex flex-col justify-between select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titleAr || 'معاينة الصورة'}
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#071A33]/90 border-b border-white/10 text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-3 py-1 rounded-lg bg-[#1769E8] text-white text-xs font-black shrink-0">
            {currentIndex + 1} / {validImages.length}
          </span>
          {titleAr && (
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
              {titleAr}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
            title="تصغير (-)"
            aria-label="تصغير الصورة"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-200 min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-colors cursor-pointer"
            title="تكبير (+)"
            aria-label="تكبير الصورة"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="إعادة ضبط الحجم"
            aria-label="إعادة ضبط الحجم"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ms-1 p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
            title="إغلاق (Esc)"
            aria-label="إغلاق المعاينة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8"
        onClick={onClose}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            touchStartXRef.current = e.touches[0].clientX;
          }
        }}
        onTouchEnd={(e) => {
          if (
            zoom === 1 &&
            touchStartXRef.current !== null &&
            e.changedTouches.length === 1
          ) {
            const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
            if (Math.abs(deltaX) > 50) {
              if (deltaX > 0) goPrev();
              else goNext();
            }
          }
          touchStartXRef.current = null;
        }}
      >
        {/* Previous Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="الصورة السابقة"
            className="absolute end-3 sm:end-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#071A33]/90 hover:bg-[#1769E8] text-white border border-white/20 shadow-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Zoomable & Pannable Image Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => {
            if (zoom > 1) handleResetZoom();
            else setZoom(2);
          }}
          onMouseDown={(e) => {
            if (zoom <= 1) return;
            setIsDragging(true);
            dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          }}
          onMouseMove={(e) => {
            if (!isDragging || zoom <= 1) return;
            setPan({
              x: e.clientX - dragStartRef.current.x,
              y: e.clientY - dragStartRef.current.y,
            });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          className="max-w-5xl max-h-[72vh] w-full h-full flex items-center justify-center"
        >
          <IndustrialImage
            src={currentSrc}
            alt={titleAr || `صورة ${currentIndex + 1}`}
            aspectRatio="aspect-auto"
            fit="contain"
            variant="clean"
            className="max-h-[70vh] w-auto max-w-full rounded-2xl bg-white/95 p-3 shadow-2xl border border-white/20"
          />
        </div>

        {/* Next Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="الصورة التالية"
            className="absolute start-3 sm:start-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#071A33]/90 hover:bg-[#1769E8] text-white border border-white/20 shadow-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {validImages.length > 1 && (
        <div
          className="px-4 py-3 bg-[#071A33]/90 border-t border-white/10 flex items-center justify-center gap-2.5 overflow-x-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {validImages.map((imgUrl, idx) => (
            <button
              key={`${imgUrl}-${idx}`}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                idx === currentIndex
                  ? 'border-[#FF8A2A] scale-105 shadow-lg'
                  : 'border-white/20 opacity-65 hover:opacity-100'
              }`}
            >
              <IndustrialImage
                src={imgUrl}
                alt={`صورة مصغرة ${idx + 1}`}
                aspectRatio="aspect-square"
                fit="cover"
                variant="clean"
                className="w-full h-full bg-white"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LightboxTriggerBadge: React.FC<{
  count?: number;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ count = 1, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#071A33]/85 hover:bg-[#1769E8] text-white text-[11px] font-extrabold shadow-md backdrop-blur-xs transition-colors cursor-pointer"
    title="تكبير ومعاينة الصور"
  >
    <Maximize2 className="w-3.5 h-3.5" />
    <span>{count > 1 ? `${count} صور` : 'تكبير'}</span>
  </button>
);

export default MediaLightbox;
