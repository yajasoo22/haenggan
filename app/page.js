"use client";

import { useState } from "react";

const SAMPLE =
  "시 관계자는 이번 예산안이 '시민 편익을 최우선으로 고려한 결정'이라고 밝혔다. 그러나 일부 주민들은 정작 필요한 대중교통 확충 예산은 오히려 삭감됐다며 반발하고 있다. 시는 내년도 예산안에서 신규 공원 조성에 120억 원을 배정했다고 발표했다.";

export default function Haenggan() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const trimmed = text.trim();
  const isUrlInput = /^https?:\/\/\S+$/i.test(trimmed);
  const canAnalyze =
    status !== "loading" &&
    (isUrlInput ? trimmed.length > 10 : trimmed.length >= 40);

  async function handleAnalyze() {
    setStatus("loading");
    setErrorMsg("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "분석에 실패했습니다");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "분석 중 문제가 생겼습니다");
      setStatus("error");
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .hg-margin { position: relative; padding-left: 28px; }
        .hg-margin::before {
          content: "";
          position: absolute;
          left: 0;
          top: 2px;
          bottom: 2px;
          width: 1px;
          background: #D8D4C8;
        }
        .hg-textarea:focus, .hg-btn:focus-visible {
          outline: 2px solid #2E4C7A;
          outline-offset: 2px;
        }
        .hg-point {
          position: relative;
          padding-left: 16px;
          margin: 0 0 12px;
          font-size: 16px;
          line-height: 1.6;
          color: #201F1C;
        }
        .hg-point::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          width: 8px;
          height: 2px;
          background: #2E4C7A;
        }
        @media (max-width: 520px) {
          .hg-margin { padding-left: 18px; }
        }
      `}</style>

      <div style={styles.container}>
        <header style={{ marginBottom: "40px" }}>
          <h1 style={styles.title}>행간</h1>
          <p style={styles.subtitle}>기사를 붙여넣으면 핵심과 의도를 짚어드립니다.</p>
        </header>

        <div className="hg-margin">
          <label htmlFor="article" style={styles.label}>
            기사 본문 또는 기사 주소
          </label>
          <textarea
            id="article"
            className="hg-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`기사 전문을 붙여넣거나, 기사 주소(URL)를 붙여넣으세요.\n\n예: ${SAMPLE}`}
            style={styles.textarea}
            rows={10}
          />
          <div style={styles.actionRow}>
            <span style={styles.counter}>{text.trim().length}자</span>
            <button
              className="hg-btn"
              style={{
                ...styles.button,
                ...(canAnalyze ? {} : styles.buttonDisabled),
              }}
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              {status === "loading" ? "읽는 중" : "행간 읽기"}
            </button>
          </div>
        </div>

        {status === "error" && (
          <div className="hg-margin" style={{ marginTop: "32px" }}>
            <p style={styles.errorText}>분석하지 못했습니다. {errorMsg}</p>
          </div>
        )}

        {status === "done" && result && (
          <div style={{ marginTop: "48px" }}>
            <section className="hg-margin">
              <h2 style={styles.sectionHeading}>핵심 사항</h2>
              {result.keyPoints.map((point, i) => (
                <p className="hg-point" key={i}>
                  {point}
                </p>
              ))}
            </section>

            <section className="hg-margin" style={{ marginTop: "36px" }}>
              <h2 style={styles.sectionHeading}>이 기사가 말하려는 것</h2>
              <div style={styles.intentBox}>
                {result.angleTag && (
                  <span style={styles.angleTag}>{result.angleTag}</span>
                )}
                <p style={styles.intentText}>{result.intent}</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#F3F1EC",
    minHeight: "100vh",
    padding: "56px 24px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "620px",
    margin: "0 auto",
  },
  title: {
    fontFamily: "'Newsreader', serif",
    fontWeight: 600,
    fontSize: "34px",
    color: "#201F1C",
    margin: "0 0 8px",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "15px",
    color: "#55534C",
    margin: 0,
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#55534C",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    fontFamily: "'Newsreader', serif",
    fontSize: "17px",
    lineHeight: 1.6,
    color: "#201F1C",
    background: "#FBFAF7",
    border: "1px solid #D8D4C8",
    borderRadius: "2px",
    padding: "16px 18px",
    resize: "vertical",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
  },
  counter: {
    fontSize: "13px",
    color: "#8A887F",
  },
  button: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    color: "#F3F1EC",
    background: "#2E4C7A",
    border: "none",
    borderRadius: "2px",
    padding: "10px 22px",
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#B9BCC2",
    cursor: "not-allowed",
  },
  errorText: {
    fontSize: "14px",
    color: "#A32D2D",
    margin: 0,
  },
  sectionHeading: {
    fontFamily: "'Newsreader', serif",
    fontWeight: 600,
    fontSize: "19px",
    color: "#201F1C",
    margin: "0 0 16px",
  },
  intentBox: {
    background: "#E6EBF2",
    borderLeft: "2px solid #2E4C7A",
    borderRadius: "2px",
    padding: "18px 20px",
  },
  angleTag: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 500,
    color: "#2E4C7A",
    background: "#F3F1EC",
    borderRadius: "999px",
    padding: "3px 12px",
    marginBottom: "10px",
  },
  intentText: {
    fontFamily: "'Newsreader', serif",
    fontStyle: "italic",
    fontSize: "17px",
    lineHeight: 1.65,
    color: "#201F1C",
    margin: 0,
  },
};
