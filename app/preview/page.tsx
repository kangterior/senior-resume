'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Edit, User, Share2, X, MessageCircle, Mail, Copy, Check, Palette, QrCode } from 'lucide-react';

interface ResumeData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  introduction: string;
  experiences?: Array<{
    id?: string;
    company: string;
    position: string;
    period: string;
    duties: string;
  }>;
  education?: Array<{
    id?: string;
    school: string;
    major: string;
    period: string;
    degree: string;
  }>;
}

const templates = [
  { id: 'basic', name: '기본', primary: '#3B82F6', secondary: '#EFF6FF', accent: '#DBEAFE' },
  { id: 'modern', name: '모던', primary: '#8B5CF6', secondary: '#F5F3FF', accent: '#EDE9FE' },
  { id: 'warm', name: '따뜻한', primary: '#F97316', secondary: '#FFF7ED', accent: '#FFEDD5' },
  { id: 'nature', name: '자연', primary: '#22C55E', secondary: '#F0FDF4', accent: '#DCFCE7' },
  { id: 'elegant', name: '우아한', primary: '#64748B', secondary: '#F8FAFC', accent: '#F1F5F9' },
  { id: 'rose', name: '로즈', primary: '#EC4899', secondary: '#FDF2F8', accent: '#FCE7F3' },
];

export default function PreviewPage() {
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('resumeFormData');
      const savedPhoto = localStorage.getItem('resumePhoto');
      const savedTemplate = localStorage.getItem('selectedTemplate');

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setData(parsed);
        } catch (e) {
          console.error('데이터 로드 오류:', e);
        }
      }

      if (savedPhoto) {
        setPhoto(savedPhoto);
      }

      if (savedTemplate) {
        const template = templates.find(t => t.id === savedTemplate);
        if (template) {
          setSelectedTemplate(template);
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
    localStorage.setItem('selectedTemplate', template.id);
    setShowTemplateModal(false);
  };

  const generateShareText = () => {
    if (!data) return '';
    
    let text = `[이력서]\n\n`;
    text += `이름: ${data.name || ''}\n`;
    if (data.birthDate) text += `생년월일: ${data.birthDate}\n`;
    if (data.phone) text += `전화번호: ${data.phone}\n`;
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

  const generateQRCode = async () => {
    try {
      const QRCode = await import('qrcode');
      const text = generateShareText();
      const url = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: selectedTemplate.primary,
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR 생성 오류:', error);
      alert('QR코드 생성에 실패했습니다.');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${data?.name || '이력서'}_QR코드.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

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

  const handleShareWithImage = async () => {
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
        if (blob && navigator.share && navigator.canShare) {
          const file = new File([blob], `${data?.name || '이력서'}_이력서.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `${data?.name || ''} 이력서`,
                files: [file]
              });
              return;
            } catch (e) {
              console.log('파일 공유 실패, 텍스트로 전환');
            }
          }
        }
        setShowShareModal(true);
      }, 'image/png');
    } catch (e) {
      setShowShareModal(true);
    }
  };

  const handleShareKakao = async () => {
    const text = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.name || ''} 이력서`,
          text: text
        });
      } catch (e) {
        console.log('공유 취소');
      }
    } else {
      const kakaoUrl = `https://story.kakao.com/share?text=${encodeURIComponent(text)}`;
      window.open(kakaoUrl, '_blank');
    }
    setShowShareModal(false);
  };

  const handleShareSMS = () => {
    const text = generateShareText();
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
    setShowShareModal(false);
  };

  const handleShareEmail = () => {
    const text = generateShareText();
    const subject = `${data?.name || ''} 이력서`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    setShowShareModal(false);
  };

  const handleCopyText = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareModal(false);
      }, 1500);
    } catch (e) {
      alert('복사에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6B7280' }}>이력서를 불러오는 중...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '20px' }}>이력서 데이터가 없습니다.</p>
        <button
          onClick={() => router.push('/write')}
          style={{
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
          이력서 작성하기
        </button>
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
        backgroundColor: selectedTemplate.primary
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
          onClick={() => setShowTemplateModal(true)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <Palette size={24} color="white" />
        </button>
      </div>

      <div style={{ padding: '20px', paddingBottom: '220px' }}>
        <div
          ref={resumeRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '28px', 
            paddingBottom: '24px', 
            borderBottom: `3px solid ${selectedTemplate.accent}` 
          }}>
            <div style={{
              width: '100px',
              height: '130px',
              backgroundColor: selectedTemplate.secondary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: `2px solid ${selectedTemplate.accent}`
            }}>
              {photo ? (
                <img src={photo} alt="증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color={selectedTemplate.primary} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: selectedTemplate.primary, marginBottom: '12px' }}>
                {data.name || '이름 없음'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.birthDate && (
                  <p style={{ fontSize: '15px', color: '#4B5563' }}>생년월일: {data.birthDate}</p>
                )}
                {data.phone && (
                  <p style={{ fontSize: '15px', color: '#4B5563' }}>전화번호: {data.phone}</p>
                )}
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
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: selectedTemplate.primary, 
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${selectedTemplate.accent}`
              }}>
                자기소개
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {data.introduction}
              </p>
            </div>
          )}

          {data.experiences && data.experiences.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: selectedTemplate.primary, 
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${selectedTemplate.accent}`
              }}>
                경력사항
              </h3>
              {data.experiences.map((exp, index) => (
                <div key={exp.id || index} style={{
                  backgroundColor: selectedTemplate.secondary,
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: `4px solid ${selectedTemplate.primary}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{exp.company}</p>
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>{exp.position}</p>
                    </div>
                    {exp.period && (
                      <span style={{
                        backgroundColor: selectedTemplate.accent,
                        color: selectedTemplate.primary,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {exp.period}
                      </span>
                    )}
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
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: selectedTemplate.primary, 
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${selectedTemplate.accent}`
              }}>
                학력사항
              </h3>
              {data.education.map((edu, index) => (
                <div key={edu.id || index} style={{
                  backgroundColor: selectedTemplate.secondary,
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: `4px solid ${selectedTemplate.primary}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{edu.school}</p>
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>{edu.major} {edu.degree}</p>
                    </div>
                    {edu.period && (
                      <span style={{
                        backgroundColor: selectedTemplate.accent,
                        color: selectedTemplate.primary,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {edu.period}
                      </span>
                    )}
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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <button
            onClick={() => router.push('/write')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Edit size={18} />
            수정
          </button>
          <button
            onClick={handleShareWithImage}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: selectedTemplate.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Share2 size={18} />
            공유
          </button>
          <button
            onClick={generateQRCode}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <QrCode size={18} />
            QR
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#22C55E',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download size={18} />
            이미지
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {showQRModal && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '340px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>QR코드</h3>
              <button
                onClick={() => setShowQRModal(false)}
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

            {qrCodeUrl && (
              <div style={{ marginBottom: '24px' }}>
                <img 
                  src={qrCodeUrl} 
                  alt="이력서 QR코드" 
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    margin: '0 auto',
                    borderRadius: '12px',
                    border: `4px solid ${selectedTemplate.accent}`
                  }} 
                />
                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '16px' }}>
                  QR코드를 스캔하면<br />이력서 정보를 확인할 수 있어요
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={downloadQRCode}
                style={{
                  flex: 1,
                  backgroundColor: selectedTemplate.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                저장하기
              </button>
              <button
                onClick={() => setShowQRModal(false)}
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
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
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
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>템플릿 선택</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: selectedTemplate.id === template.id ? template.secondary : 'white',
                    border: selectedTemplate.id === template.id ? `3px solid ${template.primary}` : '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: template.primary,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedTemplate.id === template.id && <Check size={24} color="white" />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{template.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTemplateModal(false)}
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
              닫기
            </button>
          </div>
        </div>
      )}

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
