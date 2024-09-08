// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Volume2, Mic2, Share2 } from 'lucide-react';

const lyrics = [
  { time: 0, text: "Aku terjatuh dan tak bisa bangkit lagi" },
  { time: 5, text: "Aku tenggelam dalam lautan luka dalam" },
  { time: 10, text: "Aku tersesat dan tak tahu arah jalan pulang" },
  { time: 15, text: "Aku tanpamu butiran debu" },
  { time: 20, text: "Aku terjatuh dan tak bisa bangkit lagi" },
  { time: 25, text: "Aku tenggelam dalam lautan luka dalam" },
  { time: 30, text: "Aku tersesat dan tak tahu arah jalan pulang" },
  { time: 35, text: "Aku tanpamu butiran debu" },
  { time: 40, text: "Terpuruk aku dalam kesedihan" },
  { time: 45, text: "Terluka aku dalam kesendirian" },
  { time: 50, text: "Tersesat aku tak tahu arah jalan pulang" },
  { time: 55, text: "Aku tanpamu butiran debu" },
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const lyricContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef(new Audio('/AUD-20240827-WA0440.mp3'));

  const totalDuration = 260; // 4:20 in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && !isDragging) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1;
          updateLyricIndex(newTime);
          return newTime > totalDuration ? 0 : newTime;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isDragging]);

  useEffect(() => {
    if (lyricContainerRef.current) {
      const activeElement = lyricContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    isPlaying ? audio.play() : audio.pause();
    
    audio.ontimeupdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        updateLyricIndex(audio.currentTime);
      }
    };

    return () => {
      audio.pause();
      audio.ontimeupdate = null;
    };
  }, [isPlaying, isDragging]);

  const updateLyricIndex = (time: number) => {
    const index = lyrics.findIndex((lyric, i) => 
      lyric.time <= time && (lyrics[i + 1]?.time > time || i === lyrics.length - 1)
    );
    setCurrentLyricIndex(index !== -1 ? index : lyrics.length - 1);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = (x / rect.width) * totalDuration;
      setCurrentTime(newTime);
      updateLyricIndex(newTime);
      audioRef.current.currentTime = newTime;
    }
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleDrag = (e: React.MouseEvent) => {
    if (isDragging && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min((x / rect.width) * totalDuration, totalDuration));
      setCurrentTime(newTime);
      updateLyricIndex(newTime);
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleLike = () => setIsLiked(!isLiked);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="flex-none p-4 flex items-start space-x-4">
        <img
          src="https://telegra.ph/file/0040830439a546771eb47.jpg"
          alt="Album cover"
          className="w-24 h-24 rounded-lg shadow-lg"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold mb-1">Serpihan Hati</h2>
          <p className="text-sm text-gray-400">UTOPIA</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-2" ref={lyricContainerRef}>
        {lyrics.map((line, index) => (
          <p
            key={index}
            className={`text-center text-base mb-2 transition-colors duration-300 ${
              index === currentLyricIndex ? 'text-green-400 font-bold' : 'text-gray-400'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
      <div className="flex-none px-4 pb-4 z-10">
        <div className="w-full max-w-md mx-auto mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
            <span>4:20</span>
          </div>
          <div 
            className="h-1 bg-gray-600 rounded-full relative cursor-pointer"
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onMouseMove={handleDrag}
          >
            <div
              className="h-1 bg-white rounded-full absolute top-0 left-0"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            ></div>
            <div 
              className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2"
              style={{ left: `calc(${(currentTime / totalDuration) * 100}% - 6px)` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button className={`text-gray-400 hover:text-white ${isShuffle ? 'text-green-400' : ''}`} onClick={toggleShuffle}>
              <Shuffle size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <SkipBack size={20} />
            </button>
            <button
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
            </button>
            <button className="text-gray-400 hover:text-white">
              <SkipForward size={20} />
            </button>
            <button className={`text-gray-400 hover:text-white ${isRepeat ? 'text-green-400' : ''}`} onClick={toggleRepeat}>
              <Repeat size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <Mic2 size={20} />
            </button>
            <button className={`text-gray-400 hover:text-white ${isLiked ? 'text-green-400' : ''}`} onClick={toggleLike}>
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
