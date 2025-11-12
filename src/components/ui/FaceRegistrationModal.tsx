import { useEffect, useRef, useState } from "react";
import type { Employee } from "./EmployeePage";
import { Modal } from "./Modal";
import { Button } from "./Button";

type FaceRegistrationModalProps = {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSaved?: () => void;
  onCapture?: (dataUrl: string) => void;
  onRetake?: () => void;
};

export function FaceRegistrationModal({
  open,
  onClose,
  employee,
  onSaved,
  onCapture,
  onRetake,
}: FaceRegistrationModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraReady(true);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể truy cập camera trên thiết bị này.";
        setError(message);
        setIsCameraReady(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCapturedImage(null);
      setError(null);
      setIsCameraReady(false);
    };
  }, [open]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    onCapture?.(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    onCapture?.("");
    onRetake?.();
  };

  const handleSave = () => {
    if (!capturedImage || !employee) return;
    localStorage.setItem(`faceData:${employee.id}`, capturedImage);
    onSaved?.();
  };

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose} title="Đăng ký khuôn mặt">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Vui lòng nhìn thẳng vào camera, giữ ổn định khuôn mặt trong khung và
          nhấn &ldquo;Chụp&rdquo;.
        </p>
        <div className="relative rounded-2xl bg-black/80 overflow-hidden aspect-video">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 text-sm">
                  {error ?? "Đang khởi động camera..."}
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Ảnh khuôn mặt"
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          {!capturedImage ? (
            <Button
              type="button"
              onClick={handleCapture}
              disabled={!isCameraReady || !!error}
            >
              Chụp
            </Button>
          ) : (
            <>
              <Button variant="ghost" type="button" onClick={handleRetake}>
                Chụp lại
              </Button>
              <Button type="button" onClick={handleSave}>
                Lưu khuôn mặt
              </Button>
            </>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">
            {error} Vui lòng kiểm tra quyền camera và thử lại.
          </p>
        )}
      </div>
    </Modal>
  );
}
