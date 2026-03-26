'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Edit, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function PreviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('resumeFormData');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">저장된 이력서가 없습니다</p>
          <Link href="/write" className="btn-primary inline-block px-8">
            이력서 작성하기
          </Link>
        </div>
      </div>
    );
  }

  const { formData, experiences, photo } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-4 flex items-center gap-4">
        <Link href="/write" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">이력서 미리보기</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* 이력서 카드 */}
        <div className="card-senior bg-white">
          {/* 헤더 부분 */}
          <div className="flex gap-4 pb-4 border-b-2 border-blue-600">
            {photo && (
              <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 border">
                <img src={photo} alt="증명사진" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-800">
                {formData.name || '이름'}
              </h2>
              {formData.birthDate && (
                <p className="text-gray-600 mt-1">{formData.birthDate}</p>
              )}
              {formData.phone && (
                <p className="text-gray-600">{formData.phone}</p>
              )}
              {formData.email && (
                <p className="text-gray-600 text-sm">{formData.email}</p>
              )}
              {formData.address && (
                <p className="text-gray-500 text-sm mt-1">{formData.address}</p>
              )}
            </div>
          </div>

          {/* 경력 */}
          {experiences && experiences.some((e: any) => e.company) && (
            <div className="py-4 border-b">
              <h3 className="font-bold text-lg text-blue-800 mb-3">경력 사항</h3>
              {experiences.map((exp: any, i: number) => (
                exp.company && (
                  <div key={i} className="mb-3 pl-3 border-l-2 border-blue-200">
                    <p className="font-semibold">{exp.company}</p>
                    <p className="text-gray-600 text-sm">
                      {exp.position} {exp.period && `| ${exp.period}`}
                    </p>
                    {exp.duties && (
                      <p className="text-gray-700 text-sm mt-1">{exp.duties}</p>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* 자기소개 */}
          {formData.introduction && (
            <div className="pt-4">
              <h3 className="font-bold text-lg text-blue-800 mb-2">자기소개</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.introduction}
              </p>
            </div>
          )}
        </div>

        {/* 버튼들 */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => alert('PDF 다운로드 기능은 추후 추가됩니다')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            PDF로 저장하기
          </button>

          <Link href="/write" className="btn-secondary flex items-center justify-center gap-2">
            <Edit className="w-5 h-5" />
            수정하기
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: '이력서',
                  text: `${formData.name}의 이력서`
                });
              } else {
                alert('공유 기능을 지원하지 않는 브라우저입니다');
              }
            }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            공유하기
          </button>
        </div>
      </main>
    </div>
  );
}
