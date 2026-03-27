'use client';

import { useRouter } from 'next/navigation';
import { Camera, FileText, List, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const createNew = () => {
    localStorage.removeItem('resumeFormData');
    localStorage.removeItem('resumePhoto');
    localStorage.removeItem('currentResumeId');
    router.push('/start');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)'
    }}>
      <div style={{
        padding: '48px 24px 32px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Sparkles size={40} color="white" />
        </div>
        <h1 style={{ 
          color: 'white', 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '12px'
        }}>
          똑순이 이력서
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          누구나 쉽게 만드는<br />스마트 이력서
        </p>
      </div>

      <div style={{
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        minHeight: 'calc(100vh - 240px)',
        padding: '32px 24px'
      }}>
        <p style={{
          fontSize: '15px',
          color: '#6B7280',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          무엇을 도와드릴까요?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => router.push('/camera')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'left',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Camera size={32} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
                사진 촬영하기
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                증명사진을 촬영하거나<br />사진첩에서 선택해요
              </p>
            </div>
          </button>

          <button
            onClick={createNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'left',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={32} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
                새 이력서 만들기
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                기존 이력서를 불러오거나<br />직접 새로 작성해요
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'left',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <List size={32} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
                내 이력서 목록
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                저장한 이력서를 확인하고<br />수정하거나 공유해요
              </p>
            </div>
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            이렇게 사용하세요
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                flexShrink: 0
              }}>1</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>사진 촬영 또는 이력서 파일 업로드</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                flexShrink: 0
              }}>2</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>똑순이가 자동으로 정리해드려요</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                flexShrink: 0
              }}>3</div>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>PDF로 저장하고 바로 공유하세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
