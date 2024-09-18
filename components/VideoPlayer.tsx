import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Play, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  youtubeVideoId: string;
  onPlay: () => void;
  onEnded: () => void;
  onProgress: (progress: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ youtubeVideoId, onPlay, onEnded, onProgress }) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    hasStarted: false,
    hasEnded: false,
    isFullscreen: false,
  });
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      playerRef.current?.getInternalPlayer().playVideo();
    }
  }, [playerState.hasEnded]);

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

  return (
    <div ref={containerRef} className="relative group w-full aspect-video">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
        width="100%"
        height="100%"
        playing={playerState.isPlaying && !playerState.hasEnded}
        controls={false}
        onPlay={handlePlay}
        onProgress={handleProgress}
        onPause={handlePause}
        onEnded={handleEnded}
        config={{
          youtube: {
            playerVars: {
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              iv_load_policy: 3,
              playsinline: 1,
            },
            embedOptions: {
              preventFullScreen: true,
            },
          }
        }}
      />
      {!playerState.isPlaying && !playerState.hasEnded && (
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