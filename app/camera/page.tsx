'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, User, Plus, Trash2, Save, Eye } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  duties: string;
}

interface Education {
  id: string;
  school: string;
  major: string;
  period: string;
  degree: string;
}

interface FormData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  introduction: string;
}

export default function WritePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    introduction: ''
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    const savedPhoto = localStorage.getItem('resumePhoto');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }

    const savedId = localStorage.getItem('currentResumeId');
    if (savedId) {
      setCurrentResumeId(savedId);
    } else {
      const newId = `draft-${Date.now()}`;
      setCurrentResumeId(newId);
      localStorage.setItem('currentResumeId', newId);
    }

    const savedData = localStorage.getItem('resumeFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({
          name: parsed.name || '',
          birthDate: parsed.birthDate || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          address: parsed.address || '',
          introduction: parsed.introduction || ''
        });
        if (parsed.experiences && Array.isArray(parsed.experiences)) {
          setExperiences(parsed.experiences.map((exp: Experience, idx: number) => ({
            ...exp,
            id: exp.id || `exp-${idx}`
          })));
        }
        if (parsed.education && Array.isArray(parsed.education)) {
          setEducation(parsed.education.map((edu: Education, idx: number) => ({
            ...edu,
            id: edu.id || `edu-${idx}`
          })));
        }
      } catch (e) {
        console.error('데이터 로드 오류:', e);
      }
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      period: '',
      duties: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducation(prev => [...prev, {
      id: `edu-${Date.now()}`,
      school: '',
      major: '',
      period: '',
      degree: ''
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
  };

  const hasContent = () => {
    return formData.name.trim() !== '' || 
           formData.phone.trim() !== '' || 
           formData.email.trim() !== '' ||
           formData.address.trim() !== '' ||
           experiences.length > 0 ||
           education.length > 0;
  };

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const saveAsDraft = () => {
    if (!hasContent()) return;

    const timestamp = getTimestamp();
    const resumeData = {
      ...formData,
      experiences,
      education
    };

    const existingList = localStorage.getItem('resumeList');
    let resumeList = existingList ? JSON.parse(existingList) : [];

    const existingIndex = resumeList.findIndex((r: { id: string }) => r.id === currentResumeId);

    if (existingIndex >= 0) {
      resumeList[existingIndex] = {
        ...resumeList[existingIndex],
        name: formData.name || '이름 없음',
        data: resumeData,
        photo: photo,
        updatedAt: timestamp,
        isSaved: false
      };
    } else {
      const newResume = {
        id: currentResumeId,
        name: formData.name || '이름 없음',
        data: resumeData,
        photo: photo,
        createdAt: timestamp,
        updatedAt: timestamp,
        isSaved: false
      };
      resumeList.unshift(newResume);
    }

    localStorage.setItem('resumeList', JSON.stringify(resumeList));
    localStorage.setItem('resumeFormData', JSON.stringify(resumeData));
  };

  const handleBack = () => {
    if (hasContent()) {
      saveAsDraft();
    }
    localStorage.removeItem('currentResumeId');
    localStorage.removeItem('resumeFormData');
    localStorage.removeItem('resumePhoto');
    router.push('/');
  };

  const handleSave = () => {
    const timestamp = getTimestamp();
    const resumeData = {
      ...formData,
      experiences,
      education
    };

    const existingList = localStorage.getItem('resumeList');
    let resumeList = existingList ? JSON.parse(existingList) : [];

    const existingIndex = resumeList.findIndex((r: { id: string }) => r.id === currentResumeId);

    const savedId = currentResumeId?.startsWith('draft-') 
      ? `resume-${Date.now()}` 
      : currentResumeId;

    if (existingIndex >= 0) {
      resumeList[existingIndex] = {
        ...resumeList[existingIndex],
        id: savedId,
        name: formData.name || '이름 없음',
        data: resumeData,
        photo: photo,
        updatedAt: timestamp,
        isSaved: true
      };
    } else {
      const newResume = {
        id: savedId,
        name: formData.name || '이름 없음',
        data: resumeData,
        photo: photo,
        createdAt: timestamp,
        updatedAt: timestamp,
        isSaved: true
      };
      resumeList.unshift(newResume);
    }

    localStorage.setItem('resumeList', JSON.stringify(resumeList));
    localStorage.setItem('resumeFormData', JSON.stringify(resumeData));
    localStorage.setItem('currentResumeId', savedId || '');
    setCurrentResumeId(savedId);

    if (photo) {
      localStorage.setItem('resumePhoto', photo);
    }

    alert('이력서가 저장되었습니다.');
  };

  const handlePreview = () => {
    const resumeData = {
      ...formData,
      experiences,
      education
    };
    localStorage.setItem('resumeFormData', JSON.stringify(resumeData));
    if (photo) {
      localStorage.setItem('resumePhoto', photo);
    }
    router.push('/preview');
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
          이력서 작성
        </h1>
      </div>

      <div style={{
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        minHeight: 'calc(100vh - 70px)',
        padding: '24px 20px 120px 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Camera size={20} color="#3B82F6" />
            <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
              증명사진
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '100px',
              height: '120px',
              border: '2px dashed #D1D5DB',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB'
            }}>
              {photo ? (
                <img src={photo} alt="증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="#9CA3AF" />
              )}
            </div>
            <button
              onClick={() => router.push('/camera')}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              사진 촬영
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <User size={20} color="#3B82F6" />
            <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
              기본 정보
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>생년월일</label>
            <input
              type="text"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              placeholder="예: 1990-01-01"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="010-0000-0000"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="주소를 입력하세요"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>경력 사항</span>
            <button
              onClick={addExperience}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              추가
            </button>
          </div>

          {experiences.map((exp) => (
            <div key={exp.id} style={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              position: 'relative'
            }}>
              <button
                onClick={() => removeExperience(exp.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={20} color="#EF4444" />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="회사명"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="직위"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>
              <input
                type="text"
                value={exp.period}
                onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                placeholder="근무기간 (예: 2020.01 - 2023.12)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '15px',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                value={exp.duties}
                onChange={(e) => updateExperience(exp.id, 'duties', e.target.value)}
                placeholder="담당 업무"
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '15px',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>학력 사항</span>
            <button
              onClick={addEducation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              추가
            </button>
          </div>

          {education.map((edu) => (
            <div key={edu.id} style={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              position: 'relative'
            }}>
              <button
                onClick={() => removeEducation(edu.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={20} color="#EF4444" />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  placeholder="학교명"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="text"
                  value={edu.major}
                  onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                  placeholder="전공"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  value={edu.period}
                  onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                  placeholder="재학기간"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="학위"
                  style={{
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', display: 'block', marginBottom: '16px' }}>
            자기소개
          </span>
          <textarea
            value={formData.introduction}
            onChange={(e) => handleInputChange('introduction', e.target.value)}
            placeholder="간단한 자기소개를 작성해주세요"
            rows={5}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '16px',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '16px 20px',
        display: 'flex',
        gap: '12px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={handleSave}
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
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Save size={22} />
          저장 완료
        </button>
        <button
          onClick={handlePreview}
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
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Eye size={22} />
          미리보기
        </button>
      </div>
    </div>
  );
}
