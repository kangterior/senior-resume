'use client';

import { Camera, FileUp, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* 헤더 */}
      <header className="pt-12 pb-8 text-center text-white">
        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">시니어 이력서 도우미</h1>
        <p className="mt-2 text-xl opacity-90">
          쉽고 빠른 이력서 작성
        </p>
      </header>

      {/* 메인 버튼들 */}
      <main className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* 사진 촬영 버튼 */}
          <Link href="/camera" className="block">
            <div className="card-senior hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">사진 촬영하기</h2>
                  <p className="text-gray-600">증명사진을 촬영합니다</p>
                </div>
              </div>
            </div>
          </Link>

          {/* 이력서 불러오기 버튼 */}
          <Link href="/upload" className="block">
            <div className="card-senior hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FileUp className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">이력서 불러오기</h2>
                  <p className="text-gray-600">기존 파일에서 정보를 가져옵니다</p>
                </div>
              </div>
            </div>
          </Link>

          {/* 직접 작성 버튼 */}
          <Link href="/write" className="block">
            <div className="card-senior hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">직접 작성하기</h2>
                  <p className="text-gray-600">처음부터 이력서를 작성합니다</p>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* 안내 문구 */}
        <div className="max-w-md mx-auto mt-8 p-4 bg-white/20 rounded-2xl">
          <p className="text-white text-center text-lg">
            홈 화면에 추가하면<br />
            앱처럼 사용할 수 있어요
          </p>
        </div>
      </main>
    </div>
  );
}
