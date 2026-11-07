import React from 'react';
import './MediaFigure.css';

export type MediaFigureProps = {
  /** Path lokal (mis. /media/images/...) atau URL https */
  src?: string;
  alt: string;
  caption?: string;
  kind?: 'image' | 'video' | 'embed';
  /** Untuk kind video: poster opsional */
  poster?: string;
  /** Untuk kind embed: judul iframe */
  title?: string;
  className?: string;
};

function isAllowedEmbed(url: string): boolean {
  try {
    const u = new URL(url);
    return ['www.youtube.com', 'youtube.com', 'youtu.be', 'player.vimeo.com', 'vimeo.com'].includes(u.hostname);
  } catch {
    return false;
  }
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
  } catch {
    /* keep */
  }
  return url;
}

export const MediaFigure: React.FC<MediaFigureProps> = ({
  src,
  alt,
  caption,
  kind = 'image',
  poster,
  title,
  className = '',
}) => {
  const showPlaceholder = !src || !src.trim();

  return (
    <figure className={`media-figure ${className}`.trim()}>
      <div className="media-frame">
        {showPlaceholder ? (
          <div className="media-placeholder" role="img" aria-label={alt}>
            <span className="media-placeholder-icon" aria-hidden="true">🖼️</span>
            <span className="media-placeholder-text">Aset media menyusul</span>
            <span className="media-placeholder-hint">Letakkan file di <code>public/media/...</code> dan isi prop <code>src</code>.</span>
          </div>
        ) : kind === 'video' ? (
          <video className="media-el" controls preload="metadata" poster={poster}>
            <source src={src} />
            Browser Anda tidak mendukung pemutaran video.
          </video>
        ) : kind === 'embed' && isAllowedEmbed(src) ? (
          <iframe
            className="media-el media-embed"
            src={toEmbedUrl(src)}
            title={title || alt}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img className="media-el" src={src} alt={alt} loading="lazy" decoding="async" />
        )}
      </div>
      {caption ? <figcaption className="media-caption">{caption}</figcaption> : null}
    </figure>
  );
};

export default MediaFigure;
