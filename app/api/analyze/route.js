function extractArticleText(html) {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const target = articleMatch ? articleMatch[1] : cleaned;

  let text = target.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, 8000);
}

function isUrl(str) {
  return /^https?:\/\/\S+$/i.test(str.trim());
}

export async function POST(request) {
  const { text } = await request.json();

  if (!text || !text.trim()) {
    return Response.json({ error: "내용이 비어 있습니다." }, { status: 400 });
  }

  let articleText = text.trim();

  if (isUrl(articleText)) {
    try {
      const pageRes = await fetch(articleText, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        },
      });
      if (!pageRes.ok) {
        return Response.json(
          { error: "이 주소에서 기사를 가져오지 못했습니다. 본문을 직접 붙여넣어 주세요." },
          { status: 502 }
        );
      }
      const html = await pageRes.text();
      const extracted = extractArticleText(html);
      if (extracted.length < 200) {
        return Response.json(
          {
            error:
              "이 사이트는 자동으로 기사를 가져올 수 없어요 (로그인/차단 등). 본문을 직접 복사해서 붙여넣어 주세요.",
          },
          { status: 422 }
        );
      }
      articleText = extracted;
    } catch (err) {
      return Response.json(
        { error: "주소에 접속하지 못했습니다. 본문을 직접 붙여넣어 주세요." },
        { status: 502 }
      );
    }
  } else if (articleText.length < 40) {
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
          "당신은 신문사의 데스크 편집자입니다. 사용자가 제공한 뉴스 기사 본문을 읽고, 오직 아래 JSON 형식으로만 응답하세요. 코드블록이나 다른 설명 없이 순수 JSON 객체 하나만 출력합니다.\n\n{\n  \"keyPoints\": [\"핵심 사항을 한 문장으로, 4~6개\"],\n  \"angleTag\": \"기사의 성격을 2~5자 내외 짧은 단어로 (예: 사실전달, 옹호, 비판, 해설, 홍보성)\",\n  \"intent\": \"이 기사가 무엇을 전달하려 하며 어떤 시각이나 의도, 프레이밍을 갖고 있는지 3~4문장으로 설명. 표현이나 인용 선택, 정보 배치가 특정 관점을 만드는 지점이 있다면 짚어줄 것.\"\n}\n\n입력에는 광고나 메뉴, 관련 기사 목록 같은 불필요한 텍스트가 섞여 있을 수 있으니 실제 기사 본문만 골라서 분석하세요. keyPoints의 각 항목은 15~40자 내외로 간결하게 작성하세요. 기사에 없는 내용은 추측해서 만들지 마세요.",
        messages: [{ role: "user", content: articleText }],
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
