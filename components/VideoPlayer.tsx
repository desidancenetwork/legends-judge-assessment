import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Play, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  onPlay: () => void;
  onEnded: () => void;
  onProgress: (progress: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ url, onPlay, onEnded, onProgress }) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    hasStarted: false,
    hasEnded: false,
    isFullscreen: false,
    progress: 0,
  });
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleProgress = useCallback((state: { played: number }) => {
    setPlayerState(prev => ({ ...prev, progress: state.played }));
    onProgress(state.played);
  }, [onProgress]);

  const handlePlay = useCallback(() => {
    if (!playerState.hasStarted && !playerState.hasEnded) {
      setPlayerState(prev => ({ ...prev, isPlaying: true, hasStarted: true }));
      onPlay();
    } else if (!playerState.hasEnded) {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playerState.hasStarted, playerState.hasEnded, onPlay]);

  const handlePause = useCallback(() => {
    if (!playerState.hasEnded) {
      handlePlay();
    }
  }, [playerState.hasEnded, handlePlay]);

  const handleEnded = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false, hasEnded: true }));
    onEnded();
  }, [onEnded]);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${playerState.progress * 100}%`;
    }
  }, [playerState.progress]);

  return (
    <div ref={containerRef} className="relative group">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playerState.isPlaying && !playerState.hasEnded}
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
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
        <div 
          ref={progressRef}
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: '0%' }}
        />
      </div>
      {!playerState.isPlaying && !playerState.hasEnded && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Play size={64} className="text-white" />
        </button>
      )}
      <div className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={handleFullscreenToggle}
          className="bg-white bg-opacity-25 text-white p-2 rounded-full hover:bg-opacity-50 transition-colors duration-300"
        >
          {playerState.isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>
      {playerState.hasEnded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-2xl">Video Ended</p>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;