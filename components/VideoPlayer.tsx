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
  const playerRef = useRef<ReactPlayer>(null);

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

  return (
    <div className="relative">
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
              controlsList: 'nodownload',
            },
          },
        }}
      />
      {hasEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-2xl">Video Ended</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;