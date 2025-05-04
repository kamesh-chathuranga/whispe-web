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
import { useStore } from "@/store";
import axios from "axios";
import socket from "@/lib/socket";

interface AudioRecorderProps {
  showAudioRecorderHandler: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioRecorder = ({ showAudioRecorderHandler }: AudioRecorderProps) => {
  const { currentUser, currentChat } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [waveForm, setWaveForm] = useState<WaveSurfer | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState<File | null>(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const waveFormRef = useRef<HTMLDivElement>(null);

  const recordingStartHandler = useCallback(() => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        if (audioRef.current) {
          (audioRef.current as HTMLAudioElement).srcObject = stream;
        }

        const audioChunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, {
            type: "audio/ogg; codecs=opus",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          setRecordedAudio(audio);

          waveForm?.load(audioUrl);
        };

        mediaRecorder.start();
      })
      .catch((err) => {
        console.error("Error with microphone", err);
      });
  }, [waveForm]);

  const recordingPauseHandler = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveForm?.stop();

      const audioChunks: BlobPart[] = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        audioChunks.push(e.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current as HTMLElement,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#000",
      barWidth: 2,
      height: 30,
    });

    setWaveForm(wavesurfer);

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (waveForm) recordingStartHandler();
  }, [waveForm, recordingStartHandler]);

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };

      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);

      return () => {
        recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  const audioPlayHandler = () => {
    if (recordedAudio) {
      waveForm?.stop();
      waveForm?.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const audioPauseHandler = () => {
    waveForm?.stop();
    recordedAudio?.pause();
    setIsPlaying(false);
  };

  const sendRecordedAudio = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio as Blob);
      const response = await axios.post("", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: currentUser?.id,
          to: currentChat?._id,
        },
      });

      if (response.status == 200) {
        socket.emit("send-message", {
          from: currentUser?.id,
          to: currentChat?._id,
          message: response.data,
        });
      }
    } catch (error) {
      console.log("Error sending audio", error);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-end text-2xl w-full ">
      <Button
        variant="ghost"
        onClick={() => showAudioRecorderHandler(false)}
        size="icon"
      >
        <Trash2 />
      </Button>

      <div className="flex items-center gap-x-3 py-1 px-3 text-base border rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-500 animate-pulse" />
            <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <Fragment>
                {!isPlaying ? (
                  <Button variant="link" size="icon" onClick={audioPlayHandler}>
                    <Play />
                  </Button>
                ) : (
                  <Button
                    variant="link"
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

        <div ref={waveFormRef} hidden={isRecording} className="w-40" />

        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}

        <audio ref={audioRef} hidden />
      </div>

      <div className="mr-4">
        {!isRecording ? (
          <Button variant="ghost" size="icon" onClick={recordingStartHandler}>
            <Mic />
          </Button>
        ) : (
          <Button
            variant="link"
            size="icon"
            className="text-red-500"
            onClick={recordingPauseHandler}
          >
            <Pause />
          </Button>
        )}
      </div>

      <Button className="bg-primary" size="icon" onClick={sendRecordedAudio}>
        {" "}
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default AudioRecorder;
