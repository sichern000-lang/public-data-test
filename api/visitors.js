// Vercel 서버리스 함수: 환경변수의 키로 공공데이터 API를 대신 호출한다.
// 필요한 환경변수: DATA_GO_KR_API_KEY (Decoding 키), DATA_GO_KR_ENDPOINT (요청 URL)
export default async function handler(req, res) {
  const key = process.env.DATA_GO_KR_API_KEY;
  const endpoint = process.env.DATA_GO_KR_ENDPOINT;
  if (!key || !endpoint) {
    return res.status(500).json({ error: "DATA_GO_KR_API_KEY / DATA_GO_KR_ENDPOINT 환경변수가 설정되지 않았습니다." });
  }

  const url = new URL(endpoint);
  if (!url.searchParams.has("serviceKey")) url.searchParams.set("serviceKey", key);
  if (!url.searchParams.has("perPage") && !url.searchParams.has("numOfRows")) {
    url.searchParams.set("perPage", "1000");
  }

  try {
    const upstream = await fetch(url);
    const body = await upstream.text();
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(upstream.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: "upstream fetch failed: " + e.message });
  }
}
