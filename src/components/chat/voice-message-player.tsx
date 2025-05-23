import { Person } from "@/types/types";
import { Pause, Play, UserCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "../ui/button";
import { formatTime } from "@/lib/calculateTime";

const VoiceMessagePlayer = ({
  audioUrl,
  sender,
}: {
  audioUrl: string;
  sender: Person;
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingWave, setIsLoadingWave] = useState(true);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!waveformRef.current || !audioUrl) {
      setIsLoadingWave(false);

      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      return;
    }

    setIsLoadingWave(true);

    const wsInstance = (wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#A8A8A8",
      progressColor: "#22c55e",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 1,
      height: 40,
      url: audioUrl,
    }));
    wavesurfer.current = wsInstance;

    wavesurfer.current.on("ready", () => {
      if (wavesurfer.current === wsInstance) {
        setDuration(wsInstance.getDuration() || 0);
        setIsLoadingWave(false);
      }
    });
    wavesurfer.current.on("audioprocess", () => {
      if (wavesurfer.current === wsInstance) {
        setCurrentTime(wsInstance.getCurrentTime() || 0);
      }
    });
    wavesurfer.current.on("play", () => {
      if (wavesurfer.current === wsInstance) {
        setIsPlaying(true);
      }
    });
    wavesurfer.current.on("pause", () => {
      if (wavesurfer.current === wsInstance) {
        setIsPlaying(false);
      }
    });
    wavesurfer.current.on("finish", () => {
      if (wavesurfer.current === wsInstance) {
        setIsPlaying(false);
        wsInstance.seekTo(0);
        setCurrentTime(0);
      }
    });
    wavesurfer.current.on("error", () => {
      // console.log("WaveSurfer error:", err);
      if (wavesurfer.current === wsInstance) {
        setIsLoadingWave(false);
        setDuration(0);
      }
    });

    return () => {
      wsInstance.destroy();
      if (wavesurfer.current === wsInstance) {
        wavesurfer.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 rounded-md bg-transparent relative w-80">
      {sender.avatarUrl ? (
        <Image
          src={sender.avatarUrl}
          alt={sender.name || "Sender"}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ) : (
        <UserCircle size={40} className="text-gray-500" />
      )}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePlayPause}
            disabled={isLoadingWave}
            className="w-8 h-8 hover:bg-transparent text-green-600 hover:text-green-800"
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="fill-green-600 hover:fill-green-800" />
            )}
          </Button>
          <div ref={waveformRef} className="flex-grow h-[40px] relative">
            <div
              className="absolute w-2.5 h-2.5 bg-green-600 rounded-full pointer-events-none shadow-sm"
              style={{
                left: `${progressPercentage}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        {isLoadingWave && (
          <p className="text-xs text-gray-500">Loading audio...</p>
        )}
        {!isLoadingWave && duration > 0 && (
          <div className="text-[9.5px] text-gray-500 self-end mt-1 absolute -bottom-6 left-1">
            {formatTime(duration - currentTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
