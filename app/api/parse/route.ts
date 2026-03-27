import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: '텍스트가 없습니다' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `다음 텍스트는 이력서에서 OCR로 추출한 내용입니다.
아래 항목들을 JSON 형태로 추출해주세요. 정보가 없는 항목은 빈 문자열로 남겨주세요.

추출할 항목:
- name: 이름
- birthDate: 생년월일 (YYYY-MM-DD 형식)
- phone: 전화번호
- email: 이메일
- address: 주소
- experiences: 경력사항 (배열, 각 항목은 {company: 회사명, position: 직위, period: 기간, duties: 담당업무})
- education: 학력 (배열, 각 항목은 {school: 학교명, major: 전공, period: 기간, degree: 학위})
- introduction: 자기소개

텍스트:
${text}

반드시 JSON 형식으로만 응답하세요. 다른 설명 없이 JSON만 출력하세요.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json(
        { error: 'AI 처리 중 오류가 발생했습니다' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    const responseText = result.choices[0].message.content;
    
    let parsedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return NextResponse.json(
        { error: 'AI 응답을 파싱할 수 없습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Parse Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
