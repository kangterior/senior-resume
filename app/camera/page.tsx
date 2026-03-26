'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CameraPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      localStorage.setItem('resumePhoto', capturedImage);
      alert('사진이 저장되었습니다!');
      router.push('/');
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black text-white p-4 flex items-center justify-between">
        <Link href="/" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">사진 촬영</h1>
        <button onClick={toggleCamera} className="p-2">
          <RotateCcw className="w-6 h-6" />
        </button>
      </header>

      {/* 카메라 뷰 */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {cameraError ? (
          <div className="text-white text-center p-8">
            <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p className="text-xl mb-2">카메라에 접근할 수 없습니다</p>
            <p className="text-gray-400">카메라 권한을 허용해주세요</p>
          </div>
        ) : capturedImage ? (
          <img 
            src={capturedImage} 
            alt="촬영된 사진" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
                width: { ideal: 720 },
                height: { ideal: 960 }
              }}
              onUserMediaError={() => setCameraError('카메라 접근 불가')}
              className="max-h-full max-w-full object-contain"
            />
            {/* 가이드 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-4 border-white/40 rounded-3xl" />
            </div>
          </>
        )}
      </div>

      {/* 안내 문구 */}
      <div className="bg-black text-white text-center py-4">
        <p className="text-lg">
          {capturedImage 
            ? '사진이 마음에 드시나요?' 
            : '얼굴이 가이드 안에 오도록 해주세요'}
        </p>
      </div>

      {/* 버튼 */}
      <div className="bg-black px-6 pb-8 pt-4">
        {capturedImage ? (
          <div className="flex gap-4">
            <button
              onClick={retake}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              다시 찍기
            </button>
            <button
              onClick={confirmPhoto}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              사용하기
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={capture}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center
                         border-4 border-gray-300 active:scale-95 transition-transform"
            >
              <Camera className="w-10 h-10 text-gray-800" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
