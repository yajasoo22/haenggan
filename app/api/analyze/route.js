export async function POST(request) {
  const { text } = await request.json();

  if (!text || text.trim().length < 40) {
    return Response.json({ error: "기사 본문이 너무 짧습니다." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서버에 API 키가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system:
          "당신은 신문사의 데스크 편집자입니다. 사용자가 붙여넣은 뉴스 기사 본문을 읽고, 오직 아래 JSON 형식으로만 응답하세요. 코드블록이나 다른 설명 없이 순수 JSON 객체 하나만 출력합니다.\n\n{\n  \"keyPoints\": [\"핵심 사항을 한 문장으로, 4~6개\"],\n  \"angleTag\": \"기사의 성격을 2~5자 내외 짧은 단어로 (예: 사실전달, 옹호, 비판, 해설, 홍보성)\",\n  \"intent\": \"이 기사가 무엇을 전달하려 하며 어떤 시각이나 의도, 프레이밍을 갖고 있는지 3~4문장으로 설명. 표현이나 인용 선택, 정보 배치가 특정 관점을 만드는 지점이 있다면 짚어줄 것.\"\n}\n\nkeyPoints의 각 항목은 15~40자 내외로 간결하게 작성하세요. 기사에 없는 내용은 추측해서 만들지 마세요.",
        messages: [{ role: "user", content: text.trim() }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `분석 요청이 실패했습니다 (${response.status})`, detail: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const block = data.content?.find((b) => b.type === "text");
    if (!block) {
      return Response.json({ error: "응답을 읽을 수 없습니다." }, { status: 502 });
    }

    const cleaned = block.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.keyPoints) || !parsed.intent) {
      return Response.json({ error: "응답 형식이 올바르지 않습니다." }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: err.message || "알 수 없는 오류" }, { status: 500 });
  }
}
