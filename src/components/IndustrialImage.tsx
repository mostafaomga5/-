import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { Sticker3D } from './Sticker3D';
import { resolveStickerForAsset } from '../lib/domainRules';

interface IndustrialImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  aspectRatio?: string;
  badgeText?: string;
  overlayGradient?: boolean;
  show3DSticker?: boolean;
  fitMode?: 'cover' | 'contain';
  fit?: 'cover' | 'contain';
  variant?: string;
  removeGreenBg?: boolean;
}

const chromaCache = new Map<string, string>();

/**
 * Automatically detects and removes chroma-key green backgrounds (#00A82D / #00B140)
 * from raster images using HTML5 Canvas pixel processing with anti-aliased edge despill.
 */
function stripChromaGreenFromImage(srcUrl: string): Promise<string> {
  if (chromaCache.has(srcUrl)) {
    return Promise.resolve(chromaCache.get(srcUrl)!);
  }
  if (srcUrl.endsWith('.svg')) {
    return Promise.resolve(srcUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx || canvas.width === 0 || canvas.height === 0) {
          resolve(srcUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check corner pixels to see if image has a green chroma background
        let greenCorners = 0;
        const sampleCoords = [
          [2, 2],
          [canvas.width - 3, 2],
          [2, canvas.height - 3],
          [canvas.width - 3, canvas.height - 3],
        ];
        for (const [cx, cy] of sampleCoords) {
          const idx = (Math.max(0, cy) * canvas.width + Math.max(0, cx)) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (g > 110 && g > r * 1.28 && g > b * 1.25) {
            greenCorners++;
          }
        }

        if (greenCorners === 0) {
          chromaCache.set(srcUrl, srcUrl);
          resolve(srcUrl);
          return;
        }

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxRB = Math.max(r, b);

          if (g > 105 && g > r * 1.32 && g > b * 1.28) {
            const greenExcess = g - maxRB;
            if (greenExcess > 48) {
              data[i + 3] = 0; // Fully transparent
            } else {
              // Soft feather edge and despill green cast
              const alphaFactor = Math.max(0, 1 - greenExcess / 48);
              data[i + 1] = maxRB;
              data[i + 3] = Math.round(data[i + 3] * alphaFactor);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const processedDataUrl = canvas.toDataURL('image/png');
        chromaCache.set(srcUrl, processedDataUrl);
        resolve(processedDataUrl);
      } catch {
        resolve(srcUrl);
      }
    };
    img.onerror = () => resolve(srcUrl);
    img.src = srcUrl;
  });
}

export const IndustrialImage: React.FC<IndustrialImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass,
  aspectRatio,
  badgeText,
  overlayGradient = false,
  show3DSticker = false,
  fitMode,
  fit,
  removeGreenBg = true,
}) => {
  const safeSrc =
    src && src.trim().length > 0
      ? src
      : '/assets/aistudio/Meta_AI_886293190_1678830613934074_2076821796018713871_n_20261101_133112.webp_a8042563.jpg';
  const [hasError, setHasError] = useState(false);
  const [processedSrc, setProcessedSrc] = useState<string>(safeSrc);
  const stickerId = resolveStickerForAsset(safeSrc || alt);

  const isCutout =
    safeSrc.includes('-cutout') ||
    safeSrc.includes('transparent') ||
    processedSrc.startsWith('data:image/png');
  const isRoleCard = safeSrc.includes('/roles/');
  const resolvedFit = fitMode || fit || (isCutout ? 'contain' : 'cover');
  const resolvedAspect =
    aspectClass ||
    (aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio || 'aspect-[16/10]');

  useEffect(() => {
    setHasError(false);
    setProcessedSrc(safeSrc);
    if (removeGreenBg && safeSrc && !safeSrc.endsWith('.svg')) {
      let active = true;
      void stripChromaGreenFromImage(safeSrc).then((resUrl) => {
        if (active) setProcessedSrc(resUrl);
      });
      return () => {
        active = false;
      };
    }
  }, [safeSrc, removeGreenBg]);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#071A33] via-[#0D284F] to-[#13386E] ${resolvedAspect} ${className} group`}
    >
      {/* Subtle Industrial Radial Studio Lighting Behind Transparent Cutouts */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(39, 190, 214, 0.22), rgba(23, 105, 232, 0.12) 45%, transparent 75%)',
        }}
      />

      {!hasError ? (
        <img
          src={processedSrc}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
            resolvedFit === 'contain'
              ? 'object-contain object-center p-2.5 drop-shadow-[0_12px_20px_rgba(7,26,51,0.45)]'
              : isRoleCard
              ? 'object-cover object-top'
              : 'object-cover object-center'
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#071A33] via-[#0B2A5B] to-[#1769E8]/40">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#27BED6] mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white line-clamp-2">{alt}</span>
        </div>
      )}

      {show3DSticker && (
        <div className="pointer-events-none absolute bottom-2 left-2.5 z-10 flex items-center gap-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-1.5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
          <Sticker3D id={stickerId} size="sm" floating={false} />
        </div>
      )}

      {overlayGradient && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071A33]/90 via-[#071A33]/25 to-transparent" />
      )}

      {badgeText && (
        <span className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#071A33]/85 text-white border border-white/20 backdrop-blur-xs">
          {badgeText}
        </span>
      )}
    </div>
  );
};
