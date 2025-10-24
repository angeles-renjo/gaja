'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-auto max-h-[90vh] w-auto max-w-[90vw]">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900/50 text-white transition-colors hover:bg-gray-900/70"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
