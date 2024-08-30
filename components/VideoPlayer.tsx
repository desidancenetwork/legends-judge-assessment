import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onPlay: () => void;
  onEnded: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onPlay, onEnded }) => {
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

  const handlePlay = () => {
    if (!hasStarted) {
      setIsPlaying(true);
      setHasStarted(true);
      onPlay();
    }
  };

  const handlePause = () => {
    if (hasStarted && !hasEnded) {
      setIsPlaying(true);
    }
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
    <div ref={containerRef} className="relative">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="auto"
        playing={isPlaying}
        controls={!hasStarted}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload nofullscreen',
              disablePictureInPicture: true,
            },
          },
        }}
      />
      {hasStarted && !hasEnded && (
        <div className="absolute bottom-0 right-0 p-2">
          <button
            onClick={handleFullscreenToggle}
            className="bg-white text-black px-2 py-1 rounded"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      )}
      {hasEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-2xl">Video Ended</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;