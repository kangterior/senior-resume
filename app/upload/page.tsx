'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('파일을 먼저 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('이력서를 읽고 있어요...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR 처리 실패');
      }

      const ocrResult = await ocrResponse.json();
      
      setStatusMessage('똑순이가 정리하고 있어요...');

      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: ocrResult.text })
      });

      if (!parseResponse.ok) {
        throw new Error('분석 처리 실패');
      }

      const parseResult = await parseResponse.json();

      setStatusMessage('거의 다 됐어요...');

      if (parseResult.success && parseResult.data) {
        localStorage.setItem('resumeFormData', JSON.stringify(parseResult.data));
        localStorage.setItem('fromUpload', 'true');
        localStorage.removeItem('currentResumeId');
        
        setStatusMessage('완료! 이동 중...');
        
        setTimeout(() => {
          router.push('/write');
        }, 500);
      } else {
        throw new Error('분석 결과가 없습니다.');
      }

    } catch (error) {
      console.error('처리 오류:', error);
      setIsProcessing(false);
      setStatusMessage('');
      alert('이력서 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleBack = () => {
    router.push('/start');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#3B82F6' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: '#3B82F6'
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
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginLeft: '12px' }}>
          기존 이력서 불러오기
        </h1>
      </div>

      <div style={{
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        minHeight: 'calc(100vh - 70px)',
        padding: '24px 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#EFF6FF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <FileText size={40} color="#3B82F6" />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', marginBottom: '12px' }}>
            이력서 파일 업로드
          </h2>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px', lineHeight: '1.6' }}>
            기존에 작성한 이력서 파일을 선택하면<br />
            똑순이가 자동으로 내용을 정리해드려요
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isProcessing ? '#E5E7EB' : '#F3F4F6',
              border: '2px dashed #D1D5DB',
              borderRadius: '12px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            <Upload size={24} color="#6B7280" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
              {selectedFile ? selectedFile.name : '파일 선택하기'}
            </p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
              PDF, 이미지, Word 파일 지원
            </p>
          </button>

          {isProcessing ? (
            <div style={{
              width: '100%',
              padding: '18px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              {statusMessage}
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: selectedFile ? '#3B82F6' : '#D1D5DB',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: selectedFile ? 'pointer' : 'not-allowed'
              }}
            >
              이력서 분석하기
            </button>
          )}
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
            이렇게 진행돼요
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#DBEAFE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#3B82F6'
              }}>1</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>파일에서 글자를 읽어요</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#DBEAFE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#3B82F6'
              }}>2</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>똑순이가 항목별로 정리해요</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#DBEAFE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#3B82F6'
              }}>3</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>자동으로 입력창에 채워져요</span>
            </div>
          </div>
        </div>
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
