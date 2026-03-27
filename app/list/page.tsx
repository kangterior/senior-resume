'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Eye, Edit, Share2 } from 'lucide-react';

interface ResumeData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  introduction: string;
  experiences: Array<{
    company: string;
    position: string;
    period: string;
    duties: string;
  }>;
  education: Array<{
    school: string;
    major: string;
    period: string;
    degree: string;
  }>;
}

interface ResumeItem {
  id: string;
  name: string;
  data: ResumeData;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  isSaved: boolean;
}

export default function ListPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = () => {
    const savedList = localStorage.getItem('resumeList');
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        setResumes(parsed);
      } catch (e) {
        console.error('목록 로드 오류:', e);
        setResumes([]);
      }
    }
  };

  const handleView = (resume: ResumeItem) => {
    localStorage.setItem('resumeFormData', JSON.stringify(resume.data));
    if (resume.photo) {
      localStorage.setItem('resumePhoto', resume.photo);
    } else {
      localStorage.removeItem('resumePhoto');
    }
    localStorage.setItem('currentResumeId', resume.id);
    router.push('/preview');
  };

  const handleEdit = (resume: ResumeItem) => {
    localStorage.setItem('resumeFormData', JSON.stringify(resume.data));
    if (resume.photo) {
      localStorage.setItem('resumePhoto', resume.photo);
    } else {
      localStorage.removeItem('resumePhoto');
    }
    localStorage.setItem('currentResumeId', resume.id);
    router.push('/write');
  };

  const handleDelete = (id: string) => {
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem('resumeList', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleShare = async (resume: ResumeItem) => {
    const shareText = `이력서: ${resume.name}\n전화번호: ${resume.data.phone}\n이메일: ${resume.data.email}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resume.name} 이력서`,
          text: shareText,
        });
      } catch (e) {
        console.log('공유 취소');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('이력서 정보가 복사되었습니다.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginLeft: '16px', color: '#1F2937' }}>
            내 이력서 목록
          </h1>
        </div>

        {resumes.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <User size={48} color="#9CA3AF" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', color: '#6B7280' }}>저장된 이력서가 없습니다.</p>
            <button
              onClick={() => router.push('/start')}
              style={{
                marginTop: '24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              새 이력서 만들기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {resumes.map((resume) => (
              <div
                key={resume.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {resume.photo ? (
                      <img 
                        src={resume.photo} 
                        alt="프로필" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <User size={30} color="#9CA3AF" />
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>
                        {resume.name || '이름 없음'}
                      </span>
                      
                      {resume.isSaved === false ? (
                        <span style={{
                          backgroundColor: '#FEF3C7',
                          color: '#D97706',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          작성 중
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#D1FAE5',
                          color: '#059669',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          저장됨
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                      {resume.data.phone || '전화번호 없음'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {resume.updatedAt || resume.createdAt}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB'
                }}>
                  <button
                    onClick={() => handleView(resume)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={18} />
                    보기
                  </button>
                  
                  <button
                    onClick={() => handleEdit(resume)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#F0FDF4',
                      color: '#22C55E',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={18} />
                    수정
                  </button>
                  
                  <button
                    onClick={() => handleShare(resume)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#FDF4FF',
                      color: '#A855F7',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={18} />
                    공유
                  </button>
                  
                  <button
                    onClick={() => setDeleteTarget(resume.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FEF2F2',
                      color: '#EF4444',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteTarget && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center'
            }}>
              <Trash2 size={40} color="#EF4444" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#1F2937' }}>
                이력서 삭제
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>
                이 이력서를 삭제하시겠습니까?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  style={{
                    flex: 1,
                    backgroundColor: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
