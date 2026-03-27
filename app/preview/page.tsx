'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, FileText, Image, X, MessageCircle, Mail, Copy, Check } from 'lucide-react';

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

const templates = [
  { id: 'basic', name: '기본', primary: '#3B82F6', secondary: '#EFF6FF', accent: '#1D4ED8' },
  { id: 'modern', name: '모던', primary: '#8B5CF6', secondary: '#F3E8FF', accent: '#7C3AED' },
  { id: 'warm', name: '따뜻한', primary: '#F59E0B', secondary: '#FEF3C7', accent: '#D97706' },
  { id: 'nature', name: '자연', primary: '#10B981', secondary: '#D1FAE5', accent: '#059669' },
  { id: 'elegant', name: '우아한', primary: '#6366F1', secondary: '#E0E7FF', accent: '#4F46E5' },
  { id: 'rose', name: '로즈', primary: '#EC4899', secondary: '#FCE7F3', accent: '#DB2777' },
];

export default function PreviewPage() {
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('resumeFormData');
    const savedPhoto = localStorage.getItem('resumePhoto');
    const savedTemplate = localStorage.getItem('selectedTemplate');

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

    if (savedTemplate) {
      const template = templates.find(t => t.id === savedTemplate);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, []);

  const handleTemplateChange = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
    localStorage.setItem('selectedTemplate', template.id);
  };

  const handleDownloadImage = async () => {
    if (!resumeRef.current) return;
    setIsLoading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${data?.name || '이력서'}_이력서.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('이미지 저장 오류:', e);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsLoading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data?.name || '이력서'}_이력서.pdf`);
    } catch (e) {
      console.error('PDF 저장 오류:', e);
      alert('PDF 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (method: string) => {
    const shareText = `${data?.name || ''} 이력서\n\n이름: ${data?.name || ''}\n생년월일: ${data?.birthDate || ''}\n전화번호: ${data?.phone || ''}\n이메일: ${data?.email || ''}\n주소: ${data?.address || ''}\n\n자기소개:\n${data?.introduction || ''}`;

    switch (method) {
      case 'kakao':
        const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
        window.open(kakaoUrl, '_blank');
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(`${data?.name || ''} 이력서`)}&body=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareModal(false);
  };

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>이력서 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        backgroundColor: 'white', 
        padding: '16px 20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.back()}
            style={{ 
              backgroundColor: '#F3F4F6',
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
            <ArrowLeft size={24} color="#374151" />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>미리보기</h1>
          <button
            onClick={() => setShowShareModal(true)}
            style={{ 
              backgroundColor: '#F3F4F6',
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
            <Share2 size={24} color="#374151" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>템플릿 선택</p>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateChange(template)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: selectedTemplate.id === template.id ? `2px solid ${template.primary}` : '2px solid #E5E7EB',
                  backgroundColor: selectedTemplate.id === template.id ? template.secondary : 'white',
                  color: selectedTemplate.id === template.id ? template.primary : '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <div 
          ref={resumeRef}
          style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ 
            backgroundColor: selectedTemplate.primary,
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '80px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {photo ? (
                  <img src={photo} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    사진
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{data.name || '이름'}</h2>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>{data.birthDate}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: selectedTemplate.primary, marginBottom: '12px', borderBottom: `2px solid ${selectedTemplate.secondary}`, paddingBottom: '8px' }}>
                연락처
              </h3>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '6px' }}>전화: {data.phone}</p>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '6px' }}>이메일: {data.email}</p>
              <p style={{ fontSize: '14px', color: '#374151' }}>주소: {data.address}</p>
            </div>

            {data.introduction && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: selectedTemplate.primary, marginBottom: '12px', borderBottom: `2px solid ${selectedTemplate.secondary}`, paddingBottom: '8px' }}>
                  자기소개
                </h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{data.introduction}</p>
              </div>
            )}

            {data.experiences && data.experiences.length > 0 && data.experiences[0].company && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: selectedTemplate.primary, marginBottom: '12px', borderBottom: `2px solid ${selectedTemplate.secondary}`, paddingBottom: '8px' }}>
                  경력사항
                </h3>
                {data.experiences.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: `3px solid ${selectedTemplate.secondary}` }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{exp.company}</p>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>{exp.position} | {exp.period}</p>
                    <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>{exp.duties}</p>
                  </div>
                ))}
              </div>
            )}

            {data.education && data.education.length > 0 && data.education[0].school && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: selectedTemplate.primary, marginBottom: '12px', borderBottom: `2px solid ${selectedTemplate.secondary}`, paddingBottom: '8px' }}>
                  학력사항
                </h3>
                {data.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: `3px solid ${selectedTemplate.secondary}` }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>{edu.school}</p>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>{edu.major} | {edu.degree} | {edu.period}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDownloadImage}
            disabled={isLoading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: selectedTemplate.secondary,
              color: selectedTemplate.primary,
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <Image size={20} />
            이미지 저장
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: selectedTemplate.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <FileText size={20} />
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
            borderRadius: '20px 20px 0 0',
            padding: '24px',
            width: '100%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>공유하기</h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
    </div>
  );
}
