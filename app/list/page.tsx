'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Trash2, Eye, Edit, Share2, Download, X, FileText, Image } from 'lucide-react';

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
  const [downloadTarget, setDownloadTarget] = useState<ResumeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

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

  const createResumeCanvas = async (resume: ResumeItem): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    canvas.width = 800;
    canvas.height = 1200;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(0, 0, canvas.width, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(resume.data.name || '이름', 40, 80);

    ctx.font = '24px sans-serif';
    ctx.fillText(resume.data.birthDate || '', 40, 120);
    ctx.fillText(resume.data.phone || '', 40, 160);

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('연락처', 40, 260);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText(`전화: ${resume.data.phone || ''}`, 40, 300);
    ctx.fillText(`이메일: ${resume.data.email || ''}`, 40, 340);
    ctx.fillText(`주소: ${resume.data.address || ''}`, 40, 380);

    if (resume.data.introduction) {
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('자기소개', 40, 460);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#374151';
      
      const words = resume.data.introduction.split('');
      let line = '';
      let y = 500;
      const maxWidth = 720;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 40, y);
          line = words[i];
          y += 32;
          if (y > 700) break;
        } else {
          line = testLine;
        }
      }
      if (line && y <= 700) {
        ctx.fillText(line, 40, y);
      }
    }

    if (resume.data.experiences && resume.data.experiences.length > 0 && resume.data.experiences[0].company) {
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('경력사항', 40, 780);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#374151';
      let expY = 820;
      
      for (const exp of resume.data.experiences) {
        if (expY > 950) break;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(exp.company || '', 40, expY);
        ctx.font = '18px sans-serif';
        ctx.fillText(`${exp.position || ''} | ${exp.period || ''}`, 40, expY + 30);
        expY += 80;
      }
    }

    if (resume.data.education && resume.data.education.length > 0 && resume.data.education[0].school) {
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('학력사항', 40, 1020);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#374151';
      let eduY = 1060;
      
      for (const edu of resume.data.education) {
        if (eduY > 1150) break;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(edu.school || '', 40, eduY);
        ctx.font = '18px sans-serif';
        ctx.fillText(`${edu.major || ''} | ${edu.degree || ''}`, 40, eduY + 30);
        eduY += 70;
      }
    }

    return canvas;
  };

  const handleShare = async (resume: ResumeItem) => {
    setIsLoading(true);
    setLoadingText('이력서 이미지 생성 중...');

    try {
      const canvas = await createResumeCanvas(resume);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Blob 생성 실패'));
        }, 'image/png');
      });

      const file = new File([blob], `${resume.data.name || '이력서'}_이력서.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${resume.data.name || ''} 이력서`,
          text: `${resume.data.name || ''} 이력서입니다.`
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resume.data.name || '이력서'}_이력서.png`;
        link.click();
        URL.revokeObjectURL(url);
        alert('이 브라우저에서는 파일 공유가 지원되지 않아 이미지를 다운로드했습니다. 다운로드된 이미지를 직접 공유해주세요.');
      }
    } catch (e) {
      console.error('공유 오류:', e);
      if ((e as Error).name !== 'AbortError') {
        alert('공유에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleDownload = async (type: 'image' | 'pdf') => {
    if (!downloadTarget) return;
    setIsLoading(true);
    setLoadingText(type === 'image' ? '이미지 생성 중...' : 'PDF 생성 중...');

    try {
      const canvas = await createResumeCanvas(downloadTarget);

      if (type === 'image') {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${downloadTarget.data.name || '이력서'}_이력서.png`;
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
      setLoadingText('');
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
                  gap: '6px',
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
                      padding: '12px 6px',
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
                      padding: '12px 6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                    수정
                  </button>
                  <button
                    onClick={() => handleShare(resume)}
                    disabled={isLoading}
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
                      padding: '12px 6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1
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
                      padding: '12px 6px',
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

        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'white', marginTop: '16px', fontSize: '16px' }}>{loadingText}</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

      </div>
    </div>
  );
}
