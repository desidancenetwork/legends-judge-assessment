import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  onPlay: () => void;
  onEnded: () => void;
  onProgress: (progress: number) => void;
  maxHeight?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onPlay, onEnded, onProgress, maxHeight = '70vh' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleProgress = (state: { played: number }) => {
    onProgress(state.played);
  };

  const handlePlay = () => {
    if (!hasStarted) {
      setIsPlaying(true);
      setHasStarted(true);
      onPlay();
    } else {
      setIsPlaying(true);
    }
    // Force play to prevent auto-pause
    playerRef.current?.getInternalPlayer()?.play();
  };

  const handlePause = () => {
    // Prevent pausing
    handlePlay();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    onEnded();
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative group">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls={false}
        onPlay={handlePlay}
        onProgress={handleProgress}
        onPause={handlePause}
        onEnded={handleEnded}
        playsinline
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload nofullscreen noremoteplayback',
              disablePictureInPicture: true,
              playsInline: true,
            },
            forceVideo: true,
          },
        }}
      />
      {!isPlaying && !hasEnded && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Play size={64} className="text-white" />
        </button>
      )}
      <div className="absolute bottom-0 right-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={handleFullscreenToggle}
          className="bg-white bg-opacity-25 text-white p-2 rounded-full hover:bg-opacity-50 transition-colors duration-300"
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>
      {hasEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-2xl">Video Ended</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;