'use client';

type ProtectedImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ProtectedImage({ src, alt, className }: ProtectedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onContextMenu={event => event.preventDefault()}
      onDragStart={event => event.preventDefault()}
      onMouseDown={event => {
        if (event.button === 2) {
          event.preventDefault();
        }
      }}
    />
  );
}
