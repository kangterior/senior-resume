'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, RotateCcw, Check, Image, RefreshCw } from 'lucide-react';

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 480 },
          height: { ideal: 640 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setStream(newStream);
        setIsStreaming(true);
        setCameraError(false);
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      setCameraError(true);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPhoto(imageData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhoto(result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode,
          width: { ideal: 480 },
          height: { ideal: 640 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setStream(newStream);
      }
    } catch (error) {
      console.error('카메라 전환 오류:', error);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const savePhoto = () => {
    if (photo) {
      localStorage.setItem('resumePhoto', photo);
      stopCamera();
      router.push('/write');
    }
  };

  const handleBack = () => {
    stopCamera();
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'rgba(0,0,0,0.8)'
      }}>
        <button
          onClick={handleBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <ArrowLeft size={28} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
          증명사진 촬영
        </h1>
        <div style={{ width: '44px' }}></div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {photo ? (
          <div style={{
            width: '300px',
            height: '400px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '4px solid white',
            marginBottom: '32px'
          }}>
            <img 
              src={photo} 
              alt="촬영된 사진" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ) : (
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            {cameraError ? (
              <div style={{
                width: '300px',
                height: '400px',
                borderRadius: '16px',
                border: '4px solid white',
                backgroundColor: '#1F2937',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <Camera size={48} color="#9CA3AF" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#9CA3AF', textAlign: 'center', fontSize: '16px', marginBottom: '8px' }}>
                  카메라를 사용할 수 없습니다
                </p>
                <p style={{ color: '#6B7280', textAlign: 'center', fontSize: '14px' }}>
                  아래 사진첩에서 선택해주세요
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  width: '300px',
                  height: '400px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid white'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                    }}
                  />
                </div>

                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px',
                  height: '220px',
                  border: '3px dashed rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {photo ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={retakePhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={22} />
              다시 찍기
            </button>
            <button
              onClick={savePhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#22C55E',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Check size={22} />
              사용하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {!cameraError && (
                <>
                  <button
                    onClick={switchCamera}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={24} />
                  </button>

                  <button
                    onClick={capturePhoto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'white',
                      color: '#1F2937',
                      border: '4px solid #3B82F6',
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={32} />
                  </button>
                </>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <Image size={24} />
              </button>
            </div>

            <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>
              {cameraError ? '사진첩에서 사진을 선택하세요' : '카메라로 촬영하거나 사진첩에서 선택하세요'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
