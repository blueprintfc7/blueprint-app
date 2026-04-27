import React, { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Renders a drill demo video.
 * Supports direct mp4 URLs and YouTube embed URLs.
 * Shows a play-button thumbnail until tapped.
 */
export default function DrillVideo({ url, className = '' }) {
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

  // Normalise YouTube URL to embed format
  const embedUrl = isYoutube
    ? url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1&playsinline=1'
    : null;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-black ${className}`} style={{ aspectRatio: '16/9' }}>
      {playing ? (
        isYoutube ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Drill video"
          />
        ) : (
          <video
            src={url}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            controls
          />
        )
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="w-full h-full flex items-center justify-center bg-black/70 group"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center group-active:scale-95 transition-transform">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </button>
      )}
    </div>
  );
}
