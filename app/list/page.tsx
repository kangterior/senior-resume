'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Eye, Edit, Share2, Download, X, MessageCircle, Mail, Copy, Check, FileText, Image } from 'lucide-react';

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
  const [shareTarget, setShareTarget] = useState<ResumeItem | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<ResumeItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    localStorage.setItem('returnTo', 'list');
    router.push('/write');
  };

  const handleDelete = (id: string) => {
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem('resumeList', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleShare = async (method: string) => {
    if (!shareTarget) return;

    const shareText = `${shareTarget.data.name || ''} 이력서\n\n이름: ${shareTarget.data.name || ''}\n생년월일: ${shareTarget.data.birthDate || ''}\n전화번호: ${shareTarget.data.phone || ''}\n이메일: ${shareTarget.data.email || ''}\n주소: ${shareTarget.data.address || ''}\n\n자기소개:\n${shareTarget.data.introduction || ''}`;

    switch (method) {
      case 'kakao':
        const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
        window.open(kakaoUrl, '_blank');
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(`${shareTarget.data.name || ''} 이력서`)}&body=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShareTarget(null);
  };

  const handleDownload = async (type: 'image' | 'pdf') => {
    if (!downloadTarget) return;
    setIsLoading(true);

    localStorage.setItem('resumeFormData', JSON.stringify(downloadTarget.data));
    if (downloadTarget.photo) {
      localStorage.setItem('resumePhoto', downloadTarget.photo);
    }

    try {
      const html2canvas = (await import('html2canvas')).default;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="width: 400px; background: white; padding: 24px; font-family: sans-serif;">
          <div style="background: #3B82F6; padding: 20px; color: white; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">${downloadTarget.data.name || '이름'}</h2>
            <p style="margin: 8px 0 0 0; font-size: 14px;">${downloadTarget.data.birthDate || ''}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none;">
            <p style="margin: 0 0 8px 0; font-size: 14px;">전화: ${downloadTarget.data.phone || ''}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">이메일: ${downloadTarget.data.email || ''}</p>
            <p style="margin: 0 0 16px 0; font-size: 14px;">주소: ${downloadTarget.data.address || ''}</p>
            ${downloadTarget.data.introduction ? `
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #3B82F6;">자기소개</h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${downloadTarget.data.introduction}</p>
            ` : ''}
          </div>
        </div>
      `;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `${downloadTarget.data.name || '이력서'}_이력서.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${downloadTarget.data.name || '이력서'}_이력서.pdf`);
      }
    } catch (e) {
      console.error('다운로드 오류:', e);
      alert('다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setDownloadTarget(null);
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
            }}>
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
              }}>
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
                      gap: '4px',
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                    보기
                  </button>
                  <button
                    onClick={() => handleEdit(resume)}
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      backgroundColor: '#F0FDF4',
                      color: '#22C55E',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                    수정
                  </button>
                  <button
                    onClick={() => setShareTarget(resume)}
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      backgroundColor: '#FDF4FF',
                      color: '#A855F7',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={16} />
                    공유
                  </button>
                  <button
                    onClick={() => setDownloadTarget(resume)}
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                    저장
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
                    <Trash2 size={16} />
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

        {shareTarget && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              width: '100%',
              maxWidth: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>공유하기</h3>
                <button onClick={() => setShareTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#6B7280" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <button onClick={() => handleShare('kakao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={28} color="#3C1E1E" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>카카오톡</span>
                </button>
                <button onClick={() => handleShare('sms')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={28} color="white" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>문자</span>
                </button>
                <button onClick={() => handleShare('email')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={28} color="white" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>이메일</span>
                </button>
                <button onClick={() => handleShare('copy')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#8E8E93', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {copied ? <Check size={28} color="white" /> : <Copy size={28} color="white" />}
                  </div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{copied ? '복사됨' : '복사'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {downloadTarget && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              width: '100%',
              maxWidth: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>다운로드</h3>
                <button onClick={() => setDownloadTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#6B7280" />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => handleDownload('image')} 
                  disabled={isLoading}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '24px',
                    backgroundColor: '#EFF6FF',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <Image size={40} color="#3B82F6" />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#3B82F6' }}>이미지 저장</span>
                </button>
                <button 
                  onClick={() => handleDownload('pdf')} 
                  disabled={isLoading}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '24px',
                    backgroundColor: '#FEF3C7',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <FileText size={40} color="#D97706" />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#D97706' }}>PDF 저장</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
