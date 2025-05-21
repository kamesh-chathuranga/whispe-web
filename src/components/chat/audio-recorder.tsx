import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import socket from "@/lib/socket";
import { Trash2, Mic, Play, Pause, SendHorizonal } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  showAudioRecorderHandler: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioRecorder = ({ showAudioRecorderHandler }: AudioRecorderProps) => {
  const { currentUser, currentChat } = useStore();

  const [isCapturingSegment, setIsCapturingSegment] = useState(false);
  const [isPausedAwaitingResume, setIsPausedAwaitingResume] = useState(false);

  const [waveForm, setWaveForm] = useState<WaveSurfer | null>(null);
  const [recordPlugin, setRecordPlugin] = useState<RecordPlugin | null>(null);

  const [audioSegments, setAudioSegments] = useState<File[]>([]);
  const [renderedAudio, setRenderedAudio] = useState<File | null>(null);

  const [currentSegmentDuration, setCurrentSegmentDuration] = useState(0);
  const [totalAccumulatedRecordingTime, setTotalAccumulatedRecordingTime] =
    useState(0);

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const waveFormRef = useRef<HTMLDivElement>(null);

  const combineSegments = useCallback((segments: File[]): File | null => {
    if (!segments.length) return null;

    const validSegments = segments.filter(
      (segment) =>
        (segment as object) instanceof Blob ||
        (segment as object) instanceof File
    );
    if (validSegments.length === 0) return null;

    const combinedBlob = new Blob(validSegments, {
      type: validSegments[0].type,
    });
    return new File([combinedBlob], `combined_recording-${Date.now()}.ogg`, {
      type: combinedBlob.type,
    });
  }, []);

  useEffect(() => {
    if (!waveFormRef.current) return;

    const wsInstance = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#22c55e",
      cursorColor: "#000",
      barWidth: 2,
      height: 25,
      interact: true,
    });
    setWaveForm(wsInstance);

    const recInstance = wsInstance.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
        audioBitsPerSecond: 128000,
      })
    );
    setRecordPlugin(recInstance);

    recInstance.on("record-end", (blob: Blob) => {
      const newSegmentFile = new File([blob], `segment-${Date.now()}.ogg`, {
        type: blob.type,
      });
      setAudioSegments((prevSegments) => {
        const updatedSegments = [...prevSegments, newSegmentFile];
        const combined = combineSegments(updatedSegments);
        if (combined) {
          setRenderedAudio(combined);
          if (wsInstance) {
            const objectURL = URL.createObjectURL(combined);
            wsInstance.load(objectURL);
          }
        }
        return updatedSegments;
      });
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
    wsInstance.on("destroy", () => {});

    return () => {
      recInstance.destroy();
      wsInstance.destroy();
      setRecordPlugin(null);
      setWaveForm(null);
    };
  }, [combineSegments]);

  const handleStartOrResumeSegmentCapture = useCallback(async () => {
    if (!recordPlugin || !waveForm || isCapturingSegment) return;

    setIsCapturingSegment(true);
    setIsPausedAwaitingResume(false);
    setCurrentSegmentDuration(0);

    if (audioSegments.length === 0) {
      setRenderedAudio(null);
      if (waveForm) waveForm.empty();
      setTotalAccumulatedRecordingTime(0);
      setTotalDuration(0);
      setCurrentPlaybackTime(0);
    }

    try {
      await recordPlugin.startRecording();
    } catch (err) {
      console.log("Error starting segment recording:", err);
      setIsCapturingSegment(false);
    }
  }, [recordPlugin, waveForm, isCapturingSegment, audioSegments]);

  useEffect(() => {
    if (
      !hasAutoStarted &&
      recordPlugin &&
      waveForm &&
      !isCapturingSegment &&
      !isPausedAwaitingResume &&
      audioSegments.length === 0
    ) {
      handleStartOrResumeSegmentCapture();
      setHasAutoStarted(true);
    }
  }, [
    hasAutoStarted,
    recordPlugin,
    waveForm,
    isCapturingSegment,
    isPausedAwaitingResume,
    audioSegments.length,
    handleStartOrResumeSegmentCapture,
  ]);

  const handleFinalizeSegmentAndPause = useCallback(() => {
    if (recordPlugin && isCapturingSegment) {
      try {
        setTotalAccumulatedRecordingTime(
          (prevTime) => prevTime + currentSegmentDuration
        );
        recordPlugin.stopRecording();
      } catch (error) {
        console.error("Error stopping segment:", error);
      } finally {
        setIsCapturingSegment(false);
        setIsPausedAwaitingResume(true);
        setCurrentSegmentDuration(0);
      }
    }
  }, [recordPlugin, isCapturingSegment, currentSegmentDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCapturingSegment) {
      interval = setInterval(() => {
        setCurrentSegmentDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isCapturingSegment]);

  const audioPlayHandler = useCallback(() => {
    if (waveForm && renderedAudio) {
      waveForm.play();
    }
  }, [renderedAudio, waveForm]);

  const audioPauseHandler = useCallback(() => {
    if (waveForm) {
      waveForm.pause();
    }
  }, [waveForm]);

  const sendRecordedAudio = useCallback(async () => {
    if (!renderedAudio || audioSegments.length === 0 || isCapturingSegment) {
      console.log(
        "Cannot send: No audio, segments empty, or currently capturing."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);
      const response = await axios.post("/api/upload-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { from: currentUser?.id, to: currentChat?._id },
      });

      if (response.status === 200 || response.status === 201) {
        socket.emit("send-message", {
          from: currentUser?.id,
          to: currentChat?._id,
          message: response.data,
        });
        showAudioRecorderHandler(false);
        // Reset all states
        setAudioSegments([]);
        setRenderedAudio(null);
        setCurrentSegmentDuration(0);
        setTotalAccumulatedRecordingTime(0);
        if (waveForm) waveForm.empty();
        setTotalDuration(0);
        setCurrentPlaybackTime(0);
        setIsCapturingSegment(false);
        setIsPausedAwaitingResume(false);
        setHasAutoStarted(false);
      }
    } catch (error) {
      console.log("Error sending audio", error);
    }
  }, [
    audioSegments.length,
    currentChat?._id,
    currentUser?.id,
    isCapturingSegment,
    renderedAudio,
    showAudioRecorderHandler,
    waveForm,
  ]);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time) || time === Infinity || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleDeleteAudio = useCallback(() => {
    if (isCapturingSegment) {
      try {
        recordPlugin?.stopRecording();
      } catch (e) {
        console.log("Error stopping for delete", e);
      }
    }
    setIsCapturingSegment(false);
    setIsPausedAwaitingResume(false);
    setAudioSegments([]);
    setRenderedAudio(null);
    if (waveForm) waveForm.empty();
    setCurrentSegmentDuration(0);
    setTotalAccumulatedRecordingTime(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setHasAutoStarted(false);
    showAudioRecorderHandler(false);
  }, [isCapturingSegment, recordPlugin, showAudioRecorderHandler, waveForm]);

  const totalRecordedTimeForDisplay = useMemo(() => {
    if (isCapturingSegment) {
      return totalAccumulatedRecordingTime + currentSegmentDuration;
    }
    if (renderedAudio) {
      return totalDuration;
    }
    return totalAccumulatedRecordingTime;
  }, [
    isCapturingSegment,
    totalAccumulatedRecordingTime,
    currentSegmentDuration,
    renderedAudio,
    totalDuration,
  ]);

  return (
    <div className="flex items-center justify-end text-2xl w-full gap-1">
      <Button
        variant="ghost"
        onClick={handleDeleteAudio}
        size="icon"
        title="Delete Recording"
      >
        <Trash2 />
      </Button>

      <div
        className={cn(
          `flex items-center gap-x-3 px-2 text-[0.95rem]`,
          renderedAudio &&
            waveForm &&
            totalDuration > 0 &&
            !isCapturingSegment &&
            "border bg-accent rounded-full"
        )}
      >
        {isCapturingSegment ? (
          <div className="flex items-center gap-2 min-w-12">
            <div className="size-2 rounded-full bg-red-500 animate-pulse" />
            <span>
              {formatTime(
                totalAccumulatedRecordingTime + currentSegmentDuration
              )}
            </span>
          </div>
        ) : isPausedAwaitingResume || renderedAudio ? (
          <div>
            {renderedAudio && (
              <>
                {!isPlaying ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={audioPlayHandler}
                    disabled={!renderedAudio}
                    title="Play Recording"
                  >
                    <Play fill="black" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={audioPauseHandler}
                    title="Pause Playback"
                  >
                    <Pause />
                  </Button>
                )}
              </>
            )}
          </div>
        ) : null}

        <div ref={waveFormRef} className="w-20 h-[25px] relative">
          {renderedAudio &&
            waveForm &&
            totalDuration > 0 &&
            !isCapturingSegment && (
              <div
                className="absolute w-2.5 h-2.5 bg-green-600 rounded-full pointer-events-none shadow-sm"
                style={{
                  left: `${(currentPlaybackTime / totalDuration) * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
                aria-hidden="true"
              />
            )}
        </div>
        {/* Display total time or current playback time */}
        {!isCapturingSegment && (isPausedAwaitingResume || renderedAudio) && (
          <div className="flex items-center min-w-10">
            <span>
              {isPlaying
                ? formatTime(currentPlaybackTime)
                : formatTime(totalRecordedTimeForDisplay)}
            </span>
          </div>
        )}
      </div>

      <div>
        {!isCapturingSegment ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartOrResumeSegmentCapture}
            disabled={!recordPlugin}
            title={
              audioSegments.length > 0 ? "Resume Recording" : "Start Recording"
            }
          >
            <Mic />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-500"
            onClick={handleFinalizeSegmentAndPause}
            title="Pause Recording (finalize segment)"
          >
            <Pause />
          </Button>
        )}
      </div>

      <Button
        className="bg-green-500 hover:bg-green-400"
        size="icon"
        onClick={sendRecordedAudio}
        disabled={
          !renderedAudio || audioSegments.length === 0 || isCapturingSegment
        }
        title="Send Recording"
      >
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default AudioRecorder;
