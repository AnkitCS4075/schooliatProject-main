"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

interface TeamImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function TeamImage({ src, alt, priority = false }: TeamImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  // Preload and verify image exists
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setError(false);
    img.onerror = () => {
      // Try alternative casing
      const fileName = src.split("/").pop() || "";
      const alternatives = [
        `/team/${fileName.toLowerCase()}`,
        `/team/${fileName.charAt(0).toUpperCase() + fileName.slice(1).toLowerCase()}`,
      ];
      
      let tried = 0;
      const tryNext = () => {
        if (tried < alternatives.length && alternatives[tried] !== src) {
          const altImg = new window.Image();
          altImg.onload = () => {
            setImgSrc(alternatives[tried]);
            setError(false);
          };
          altImg.onerror = () => {
            tried++;
            tryNext();
          };
          altImg.src = alternatives[tried];
        } else {
          setError(true);
        }
      };
      tryNext();
    };
    img.src = src;
  }, [src]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
        <span className="text-xs sm:text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      unoptimized
      priority={priority}
    />
  );
}
