'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // 테스트용 시뮬레이션 (나중에 실제 OCR로 교체)
    setTimeout(() => {
      setResult(`파일 "${selectedFile.name}"에서 정보를 추출했습니다.\n\n[테스트 모드]\n실제 OCR 연동 시 여기에 추출된 텍스트가 표시됩니다.`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-4 flex items-center gap-4">
        <Link href="/" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">이력서 불러오기</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* 파일 선택 영역 */}
        <div className="card-senior">
          <h2 className="text-xl font-bold mb-4 text-center">파일 선택</h2>
          
          <label className="block">
            <div className={`
              border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.hwp,.hwpx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {selectedFile ? (
                <div>
                  <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="text-lg font-semibold text-green-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-500 mt-2">
                    다른 파일을 선택하려면 여기를 누르세요
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-lg font-semibold">
                    여기를 눌러 파일 선택
                  </p>
                  <p className="text-gray-500 mt-2">
                    PDF, Word, 한글, 이미지 파일
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* 분석 버튼 */}
        {selectedFile && !result && (
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                분석 중...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                이력서 분석하기
              </>
            )}
          </button>
        )}

        {/* 결과 표시 */}
        {result && (
          <div className="card-senior bg-green-50 border-2 border-green-200">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              분석 완료
            </h3>
            <pre className="whitespace-pre-wrap text-gray-700 text-base">
              {result}
            </pre>
            <button
              onClick={() => router.push('/write')}
              className="btn-primary mt-4"
            >
              이력서 작성하러 가기
            </button>
          </div>
        )}

        {/* 안내 */}
        <div className="card-senior bg-blue-50 mt-4">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            지원 파일 형식
          </h3>
          <ul className="text-gray-700 space-y-1">
            <li>• PDF 문서</li>
            <li>• Word 문서 (.docx)</li>
            <li>• 한글 문서 (.hwp)</li>
            <li>• 이미지 파일 (.jpg, .png)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
