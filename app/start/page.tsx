'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Edit, FileText, PenTool } from 'lucide-react';

export default function StartPage() {
  const router = useRouter();

  const handleDirectWrite = () => {
    localStorage.removeItem('resumeFormData');
    localStorage.removeItem('resumePhoto');
    localStorage.removeItem('currentResumeId');
    router.push('/write');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px'
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginLeft: '16px' 
        }}>
          새 이력서 만들기
        </h1>
      </div>

      <div style={{
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '18px',
          lineHeight: '1.6'
        }}>
          어떤 방법으로 시작할까요?
        </p>
      </div>

      <div style={{
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        minHeight: 'calc(100vh - 200px)',
        padding: '32px 24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button
            onClick={() => router.push('/upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'white',
              border: '3px solid #3B82F6',
              borderRadius: '24px',
              padding: '28px 24px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Upload size={36} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                기존 이력서 불러오기
              </p>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.6' }}>
                이미 작성된 이력서 파일을 업로드하면<br />
                똑순이가 자동으로 정리해드려요
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EFF6FF',
                padding: '6px 12px',
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <FileText size={16} color="#3B82F6" />
                <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: '500' }}>
                  PDF, 이미지, Word 지원
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={handleDirectWrite}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '24px',
              padding: '28px 24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <PenTool size={36} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                직접 작성하기
              </p>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.6' }}>
                처음부터 직접 입력해서<br />
                새로운 이력서를 만들어요
              </p>
            </div>
          </button>
        </div>

        <div style={{
          backgroundColor: '#FEF3C7',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#FCD34D',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '18px'
          }}>
            💡
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#92400E', marginBottom: '6px' }}>
              추천해요
            </p>
            <p style={{ fontSize: '14px', color: '#A16207', lineHeight: '1.6' }}>
              기존 이력서가 있다면 불러오기를 선택하세요.<br />
              직접 입력하는 것보다 훨씬 빠르고 편해요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
