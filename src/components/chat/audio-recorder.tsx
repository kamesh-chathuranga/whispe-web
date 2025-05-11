import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Trash2, Mic, Play, Pause, SendHorizonal } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { useStore } from "@/store";
import axios from "axios";
import socket from "@/lib/socket";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  showAudioRecorderHandler: React.Dispatch<React.SetStateAction<boolean>>;
  startRecordingOnMount?: boolean;
}

const AudioRecorder = ({
  showAudioRecorderHandler,
  startRecordingOnMount,
}: AudioRecorderProps) => {
  const { currentUser, currentChat } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [waveForm, setWaveForm] = useState<WaveSurfer | null>(null);
  const [recordPlugin, setRecordPlugin] = useState<RecordPlugin | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState<File | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false); // New state variable

  const waveFormRef = useRef<HTMLDivElement>(null);

  const recordingStartHandler = useCallback(
    async (pluginParam?: RecordPlugin, wfParam?: WaveSurfer) => {
      const currentRecordPlugin = pluginParam || recordPlugin;
      const currentWaveForm = wfParam || waveForm;

      if (!currentRecordPlugin || !currentWaveForm || isRecording) {
        return;
      }

      setRenderedAudio(null);
      setRecordingDuration(0);
      setCurrentPlaybackTime(0);
      setTotalDuration(0);
      setIsPlaying(false);

      currentWaveForm.empty();

      try {
        setIsRecording(true);
        await currentRecordPlugin.startRecording();
      } catch (err) {
        console.error("Error starting recording:", err);
        setIsRecording(false);
      }
    },
    [recordPlugin, waveForm, isRecording]
  );

  const recordingStopHandler = useCallback(() => {
    if (recordPlugin && isRecording) {
      recordPlugin.stopRecording();
      setIsRecording(false);
    }
  }, [recordPlugin, isRecording]);

  const recordingResumeHandler = useCallback(() => {
    if (recordPlugin && !isRecording) {
      recordPlugin.resumeRecording();
      setIsRecording(true);
    }
  }, [recordPlugin, isRecording]);

  // Effect for initializing WaveSurfer and RecordPlugin
  useEffect(() => {
    if (!waveFormRef.current) return;

    const wsInstance = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#000",
      barWidth: 2,
      height: 30,
    });
    setWaveForm(wsInstance);

    const recInstance = wsInstance.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      })
    );
    setRecordPlugin(recInstance);

    recInstance.on("record-end", (blob: Blob) => {
      const audioUrl = URL.createObjectURL(blob);
      const audioFile = new File([blob], "recording.ogg", { type: blob.type });
      setRenderedAudio(audioFile);
      if (wsInstance) {
        wsInstance.load(audioUrl);
      }
    });

    wsInstance.on("play", () => setIsPlaying(true));
    wsInstance.on("pause", () => setIsPlaying(false));
    wsInstance.on("finish", () => {
      setIsPlaying(false);
      wsInstance.seekTo(0);
    });
    wsInstance.on("timeupdate", (currentTime) =>
      setCurrentPlaybackTime(currentTime)
    );
    wsInstance.on("decode", (duration) => {
      setTotalDuration(duration);
      setCurrentPlaybackTime(0);
    });

    return () => {
      recInstance.destroy();
      wsInstance.destroy();
      setRecordPlugin(null);
      setWaveForm(null);
    };
  }, []);

  // Effect for handling startRecordingOnMount
  useEffect(() => {
    if (
      startRecordingOnMount &&
      !hasAutoStarted && // Check if auto-start hasn't happened yet
      recordPlugin &&
      waveForm &&
      !isRecording
    ) {
      recordingStartHandler(recordPlugin, waveForm);
      setHasAutoStarted(true); // Mark that auto-start has occurred
    }
  }, [
    startRecordingOnMount,
    hasAutoStarted, // Add to dependency array
    recordPlugin,
    waveForm,
    isRecording,
    recordingStartHandler,
  ]);

  // Effect for recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (!renderedAudio) setTotalDuration(recordingDuration);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording, recordingDuration, renderedAudio]);

  const audioPlayHandler = () => {
    if (waveForm && renderedAudio) {
      waveForm.play();
    }
  };

  const audioPauseHandler = () => {
    if (waveForm) {
      waveForm.pause();
    }
  };

  const sendRecordedAudio = async () => {
    if (!renderedAudio) return;
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);
      const response = await axios.post("/api/upload-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: currentUser?.id,
          to: currentChat?._id,
        },
      });

      if (response.status === 200 || response.status === 201) {
        socket.emit("send-message", {
          from: currentUser?.id,
          to: currentChat?._id,
          message: response.data,
        });
        showAudioRecorderHandler(false);
      }
    } catch (error) {
      console.log("Error sending audio", error);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-end text-2xl w-full gap-2">
      <Button
        variant="ghost"
        onClick={() => {
          if (isRecording) recordingStopHandler();
          showAudioRecorderHandler(false);
        }}
        size="icon"
      >
        <Trash2 />
      </Button>

      <div
        className={cn(
          `flex items-center gap-x-3 px-2 text-[0.95rem]`,
          renderedAudio && "border bg-accent rounded-full"
        )}
      >
        {isRecording ? (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-500 animate-pulse" />
            <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : (
          <div>
            {renderedAudio && (
              <Fragment>
                {!isPlaying ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={audioPlayHandler}
                    disabled={!renderedAudio}
                  >
                    <Play fill="black" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={audioPauseHandler}
                  >
                    <Pause />
                  </Button>
                )}
              </Fragment>
            )}
          </div>
        )}
        <div ref={waveFormRef} className="w-40 min-w-[10rem] h-[25px]" />
        {!isRecording && renderedAudio && (
          <div className="flex items-center size-10">
            <span>
              {isPlaying
                ? formatTime(currentPlaybackTime)
                : formatTime(totalDuration)}
            </span>
          </div>
        )}
        {/* {isRecording && !renderedAudio && <span className="w-12"></span>} */}
      </div>

      <div>
        {!isRecording ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={recordingResumeHandler}
            disabled={!recordPlugin}
          >
            <Mic />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={recordingStopHandler}
          >
            <Pause />
          </Button>
        )}
      </div>

      <Button
        className="bg-green-500 hover:bg-green-400"
        size="icon"
        onClick={sendRecordedAudio}
        disabled={!renderedAudio || isRecording}
      >
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default AudioRecorder;
