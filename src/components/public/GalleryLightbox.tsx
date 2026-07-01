import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface GalleryLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose?: () => void;
}

export default function GalleryLightbox({ images, initialIndex = 0, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(true);

  const slides = images.map((src) => ({ src }));

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <Lightbox
      slides={slides}
      open={isOpen}
      index={index}
      close={handleClose}
      on={{
        view: ({ index: newIndex }) => setIndex(newIndex),
      }}
      carousel={{ finite: true }}
      animation={{ fade: 0 }}
      controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
    />
  );
}
