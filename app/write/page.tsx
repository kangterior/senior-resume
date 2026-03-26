'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Experience {
  company: string;
  position: string;
  period: string;
  duties: string;
}

export default function WritePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    introduction: ''
  });
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: '', position: '', period: '', duties: '' }
  ]);

  useEffect(() => {
    const savedPhoto = localStorage.getItem('resumePhoto');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
    
    const savedData = localStorage.getItem('resumeFormData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData || formData);
      setExperiences(parsed.experiences || experiences);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpChange = (index: number, field: string, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', period: '', duties: '' }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const saveData = () => {
    const data = { formData, experiences, photo };
    localStorage.setItem('resumeFormData', JSON.stringify(data));
    alert('저장되었습니다!');
  };

  const preview = () => {
    const data = { formData, experiences, photo };
    localStorage.setItem('resumeFormData', JSON.stringify(data));
    router.push('/preview');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">이력서 작성</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* 사진 */}
        <div className="card-senior">
          <h2 className="text-xl font-bold mb-4">증명사진</h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-gray-200 rounded-xl overflow-hidden border-2 border-gray-300 flex-shrink-0">
              {photo ? (
                <img src={photo} alt="증명사진" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  사진 없음
                </div>
              )}
            </div>
            <Link href="/camera" className="btn-secondary py-3 px-6 text-base">
              {photo ? '사진 변경' : '사진 촬영'}
            </Link>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="card-senior">
          <h2 className="text-xl font-bold mb-4">기본 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-semibold mb-2">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-senior"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">생년월일</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="input-senior"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input-senior"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-senior"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">주소</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="input-senior"
                placeholder="서울시 강남구"
              />
            </div>
          </div>
        </div>

        {/* 경력 사항 */}
        <div className="card-senior">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">경력 사항</h2>
            <button
              onClick={addExperience}
              className="flex items-center gap-1 text-blue-600 font-semibold"
            >
              <Plus className="w-5 h-5" />
              추가
            </button>
          </div>

          {experiences.map((exp, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-xl relative">
              {experiences.length > 1 && (
                <button
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-red-500 p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                  className="input-senior"
                  placeholder="회사명"
                />
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => handleExpChange(index, 'position', e.target.value)}
                  className="input-senior"
                  placeholder="직위 (예: 부장)"
                />
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) => handleExpChange(index, 'period', e.target.value)}
                  className="input-senior"
                  placeholder="근무기간 (예: 2010.03 - 2020.05)"
                />
                <textarea
                  value={exp.duties}
                  onChange={(e) => handleExpChange(index, 'duties', e.target.value)}
                  className="input-senior min-h-[100px]"
                  placeholder="담당 업무"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 자기소개 */}
        <div className="card-senior">
          <h2 className="text-xl font-bold mb-4">자기소개</h2>
          <textarea
            value={formData.introduction}
            onChange={(e) => handleInputChange('introduction', e.target.value)}
            className="input-senior min-h-[150px]"
            placeholder="자신을 소개해주세요"
          />
        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-3">
          <button onClick={preview} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />
            미리보기
          </button>
          <button onClick={saveData} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
