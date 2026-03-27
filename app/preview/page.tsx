'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Edit, User, Share2, X, MessageCircle, Mail, Copy, Check } from 'lucide-react';

interface ResumeData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  introduction: string;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    period: string;
    duties: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    major: string;
    period: string;
    degree: string;
  }>;
}

export default function PreviewPage() {
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('resumeFormData');
    const savedPhoto = localStorage.getItem('resumePhoto');

    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('데이터 로드 오류:', e);
      }
    }

    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  const handleDownloadImage = async () => {
    if (!resumeRef.current) return;
    
    setIsDownloading(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `${data?.name || '이력서'}_이력서.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      alert('이미지 생성 중 오류가 발생했습니다.');
    }
    setIsDownloading(false);
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsDownloading(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const jsPDFModule = await import('jspdf');
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, 10, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${data?.name || '이력서'}_이력서.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
    setIsDownloading(false);
  };

  const generateShareText = () => {
    if (!data) return '';
    
    let text = `[이력서]\n\n`;
    text += `이름: ${data.name}\n`;
    if (data.birthDate) text += `생년월일: ${data.birthDate}\n`;
    text += `전화번호: ${data.phone}\n`;
    if (data.email) text += `이메일: ${data.email}\n`;
    if (data.address) text += `주소: ${data.address}\n`;
    
    if (data.experiences && data.experiences.length > 0) {
      text += `\n[경력사항]\n`;
      data.experiences.forEach(exp => {
        text += `- ${exp.company} / ${exp.position} (${exp.period})\n`;
        if (exp.duties) text += `  ${exp.duties}\n`;
      });
    }
    
    if (data.education && data.education.length > 0) {
      text += `\n[학력사항]\n`;
      data.education.forEach(edu => {
        text += `- ${edu.school} ${edu.major} (${edu.period}) ${edu.degree}\n`;
      });
    }
    
    if (data.introduction) {
      text += `\n[자기소개]\n${data.introduction}\n`;
    }
    
    return text;
  };

  const handleShareKakao = async () => {
    const text = generateShareText();
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.name || ''} 이력서`,
          text: text
        });
      } catch (e) {
        window.open(kakaoUrl, '_blank');
      }
    } else {
      window.open(kakaoUrl, '_blank');
    }
    setShowShareModal(false);
  };

  const handleShareSMS = () => {
    const text = generateShareText();
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
    setShowShareModal(false);
  };

  const handleShareEmail = () => {
    const text = generateShareText();
    const subject = `${data?.name || ''} 이력서`;
    const mailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailUrl;
    setShowShareModal(false);
  };

  const handleCopyText = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('복사에 실패했습니다.');
    }
  };

  const handleNativeShare = async () => {
    if (!resumeRef.current) return;

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `${data?.name || '이력서'}_이력서.png`, { type: 'image/png' });
          
          try {
            await navigator.share({
              title: `${data?.name || ''} 이력서`,
              text: generateShareText(),
              files: [file]
            });
          } catch (e) {
            setShowShareModal(true);
          }
        } else {
          setShowShareModal(true);
        }
      }, 'image/png');
    } catch (e) {
      setShowShareModal(true);
    }
  };

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6B7280' }}>이력서 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: '#3B82F6'
      }}>
        <button
          onClick={() => router.push('/write')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <ArrowLeft size={28} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          미리보기
        </h1>
        <button
          onClick={handleNativeShare}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <Share2 size={24} color="white" />
        </button>
      </div>

      <div style={{ padding: '20px', paddingBottom: '200px' }}>
        <div
          ref={resumeRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
            <div style={{
              width: '100px',
              height: '130px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {photo ? (
                <img src={photo} alt="증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="#9CA3AF" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937', marginBottom: '12px' }}>
                {data.name || '이름 없음'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.birthDate && (
                  <p style={{ fontSize: '15px', color: '#4B5563' }}>생년월일: {data.birthDate}</p>
                )}
                <p style={{ fontSize: '15px', color: '#4B5563' }}>전화번호: {data.phone}</p>
                {data.email && (
                  <p style={{ fontSize: '15px', color: '#4B5563' }}>이메일: {data.email}</p>
                )}
                {data.address && (
                  <p style={{ fontSize: '15px', color: '#4B5563' }}>주소: {data.address}</p>
                )}
              </div>
            </div>
          </div>

          {data.introduction && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3B82F6', marginBottom: '12px' }}>
                자기소개
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {data.introduction}
              </p>
            </div>
          )}

          {data.experiences && data.experiences.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3B82F6', marginBottom: '16px' }}>
                경력사항
              </h3>
              {data.experiences.map((exp, index) => (
                <div key={exp.id || index} style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{exp.company}</p>
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>{exp.position}</p>
                    </div>
                    <span style={{
                      backgroundColor: '#DBEAFE',
                      color: '#3B82F6',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {exp.period}
                    </span>
                  </div>
                  {exp.duties && (
                    <p style={{ fontSize: '14px', color: '#4B5563', marginTop: '8px' }}>{exp.duties}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3B82F6', marginBottom: '16px' }}>
                학력사항
              </h3>
              {data.education.map((edu, index) => (
                <div key={edu.id || index} style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{edu.school}</p>
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>{edu.major} {edu.degree}</p>
                    </div>
                    <span style={{
                      backgroundColor: '#DBEAFE',
                      color: '#3B82F6',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {edu.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '16px 20px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => router.push('/write')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
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
            <Edit size={20} />
            수정하기
          </button>
          <button
            onClick={handleNativeShare}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Share2 size={20} />
            공유하기
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#22C55E',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download size={20} />
            이미지 저장
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download size={20} />
            PDF 저장
          </button>
        </div>
      </div>

      {showShareModal && (
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
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>공유하기</h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <button
                onClick={handleShareKakao}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#FEE500',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageCircle size={28} color="#3C1E1E" />
                </div>
                <span style={{ fontSize: '13px', color: '#374151' }}>카카오톡</span>
              </button>

              <button
                onClick={handleShareSMS}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#22C55E',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageCircle size={28} color="white" />
                </div>
                <span style={{ fontSize: '13px', color: '#374151' }}>문자</span>
              </button>

              <button
                onClick={handleShareEmail}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={28} color="white" />
                </div>
                <span style={{ fontSize: '13px', color: '#374151' }}>이메일</span>
              </button>

              <button
                onClick={handleCopyText}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#6B7280',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {copied ? <Check size={28} color="white" /> : <Copy size={28} color="white" />}
                </div>
                <span style={{ fontSize: '13px', color: '#374151' }}>{copied ? '복사됨' : '복사하기'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              style={{
                width: '100%',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
