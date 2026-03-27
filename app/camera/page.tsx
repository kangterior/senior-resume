'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, RotateCcw, Check, Image, RefreshCw } from 'lucide-react';

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (facingMode: 'user' | 'environment') => {
    setIsLoading(true);
    setCameraError(false);
    stopAllTracks();

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 480 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setCameraError(false);
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      setCameraError(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    startCamera(currentFacingMode);
    
    return () => {
      stopAllTracks();
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
        if (currentFacingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPhoto(imageData);
        stopAllTracks();
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
        stopAllTracks();
      };
      reader.readAsDataURL(file);
    }
  };

  const switchCamera = () => {
    const newMode = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(newMode);
    startCamera(newMode);
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera(currentFacingMode);
  };

  const savePhoto = () => {
    if (photo) {
      localStorage.setItem('resumePhoto', photo);
      stopAllTracks();
      router.push('/write');
    }
  };

  const handleBack = () => {
    stopAllTracks();
    router.push('/');
  };

  const retryCamera = () => {
    startCamera(currentFacingMode);
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
                <p style={{ color: '#6B7280', textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>
                  권한을 허용하거나 사진첩에서 선택해주세요
                </p>
                <button
                  onClick={retryCamera}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={20} />
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  width: '300px',
                  height: '400px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid white',
                  backgroundColor: '#1F2937'
                }}>
                  {isLoading && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <RefreshCw size={32} color="white" style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
                      <p>카메라 로딩중...</p>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none'
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
                    disabled={isLoading}
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
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1
                    }}
                  >
                    <RefreshCw size={24} />
                  </button>

                  <button
                    onClick={capturePhoto}
                    disabled={isLoading}
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
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1
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
                  width: cameraError ? '80px' : '60px',
                  height: cameraError ? '80px' : '60px',
                  backgroundColor: cameraError ? '#3B82F6' : '#374151',
                  color: 'white',
                  border: cameraError ? '4px solid white' : 'none',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <Image size={cameraError ? 32 : 24} />
              </button>
            </div>

            <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>
              {cameraError ? '사진첩에서 사진을 선택하세요' : '카메라로 촬영하거나 사진첩에서 선택하세요'}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
