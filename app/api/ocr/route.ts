import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // 파일을 Base64로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 파일 확장자 추출
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const formatMap: { [key: string]: string } = {
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'png': 'png',
      'pdf': 'pdf',
      'tiff': 'tiff'
    };
    const format = formatMap[fileExtension] || 'jpg';

    // Clova OCR API 요청
    const requestBody = {
      version: 'V2',
      requestId: `req_${Date.now()}`,
      timestamp: Date.now(),
      lang: 'ko',
      images: [
        {
          format: format,
          name: file.name,
          data: base64Image
        }
      ]
    };

    const response = await fetch(process.env.NAVER_CLOVA_OCR_URL!, {
      method: 'POST',
      headers: {
        'X-OCR-SECRET': process.env.NAVER_CLOVA_OCR_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Clova OCR Error:', errorData);
      return NextResponse.json(
        { error: 'OCR 처리 중 오류가 발생했습니다' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // 텍스트 추출
    let extractedText = '';
    
    if (result.images && result.images.length > 0) {
      const image = result.images[0];
      
      if (image.fields) {
        extractedText = image.fields
          .map((field: any) => field.inferText)
          .join(' ');
      }
    }

    return NextResponse.json({
      success: true,
      text: extractedText
    });

  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
