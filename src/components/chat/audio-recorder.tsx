import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AxiosProgressEvent } from "axios";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { Trash2, Mic, Play, Pause, SendHorizonal } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { Attachment, Message, Person } from "@/types/types";
import useMessageMutation from "@/hooks/use-message";
import mediaUploader from "@/lib/mediaUploader";
import { onMessageSend } from "@/lib/sendMessage";
import { formatTime } from "@/lib/calculateTime";

interface AudioRecorderProps {
  showAudioRecorderHandler: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioRecorder = ({ showAudioRecorderHandler }: AudioRecorderProps) => {
  const { currentUser, currentChat } = useStore();
  const { addNewMessage, updateMessage } = useMessageMutation();

  const [isCapturingSegment, setIsCapturingSegment] = useState(false);
  const [isPausedAwaitingResume, setIsPausedAwaitingResume] = useState(false);

  const [waveForm, setWaveForm] = useState<WaveSurfer | null>(null);
  const [recordPlugin, setRecordPlugin] = useState<RecordPlugin | null>(null);

  const [audioSegments, setAudioSegments] = useState<File[]>([]);
  const [renderedAudio, setRenderedAudio] = useState<File | null>(null);
  const [currentObjectUrl, setCurrentObjectUrl] = useState<string | null>(null);

  const [currentSegmentDuration, setCurrentSegmentDuration] = useState(0);
  const [totalAccumulatedRecordingTime, setTotalAccumulatedRecordingTime] =
    useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
            setCurrentObjectUrl((prevUrl) => {
              if (prevUrl) {
                URL.revokeObjectURL(prevUrl);
              }
              const newObjectURL = URL.createObjectURL(combined);
              wsInstance.load(newObjectURL);
              return newObjectURL;
            });
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
    wsInstance.on("destroy", () => {
      setCurrentObjectUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    });

    return () => {
      if (recInstance) {
        recInstance.destroy();
      }
      if (wsInstance) {
        wsInstance.destroy();
      }

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

      setCurrentObjectUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });

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
  }, [recordPlugin, waveForm, isCapturingSegment, audioSegments.length]);

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
    if (
      !renderedAudio ||
      audioSegments.length === 0 ||
      isCapturingSegment ||
      !currentUser ||
      !currentChat
    ) {
      return;
    }

    const tempId = uuidv4();

    const tempMessage: Message = {
      _id: tempId,
      chat: currentChat._id,
      sender: {
        _id: currentUser?.id,
        name: currentUser?.name,
        avatarUrl: currentUser?.avatarUrl,
      } as Person,
      content: "",
      attachment: {
        url: currentObjectUrl,
        filename: renderedAudio.name,
        mimeType: renderedAudio.type,
        size: renderedAudio.size,
        type: "voice",
        objectKey: "",
        uploadProgress: 0,
        duration: Math.round(totalDuration),
      } as Attachment,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    addNewMessage(tempMessage);

    try {
      setIsLoading(true);

      const onProgress = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          updateMessage(tempId, {
            ...tempMessage,
            attachment: {
              ...tempMessage.attachment,
              uploadProgress: progress,
            } as Attachment,
          });
        }
      };

      const attachmentDetails = await mediaUploader(
        renderedAudio,
        currentChat._id,
        onProgress
      );

      if (attachmentDetails) {
        onMessageSend(currentChat._id, "", tempId, {
          ...attachmentDetails,
          type: "voice",
          duration: tempMessage.attachment?.duration,
        });

        showAudioRecorderHandler(false);
        // Reset all states
        setAudioSegments([]);
        setRenderedAudio(null);

        setCurrentObjectUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return null;
        });

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
      updateMessage(tempId, {
        ...tempMessage,
        status: "failed",
        attachment: {
          ...tempMessage.attachment,
          uploadProgress: -1,
        } as Attachment,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    addNewMessage,
    audioSegments.length,
    currentChat,
    currentObjectUrl,
    currentUser,
    isCapturingSegment,
    renderedAudio,
    showAudioRecorderHandler,
    totalDuration,
    updateMessage,
    waveForm,
  ]);

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

    setCurrentObjectUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });

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
          !renderedAudio ||
          audioSegments.length === 0 ||
          isCapturingSegment ||
          isLoading
        }
        title="Send Recording"
      >
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default AudioRecorder;
