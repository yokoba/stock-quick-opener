function extractTicker() {
  const m = location.pathname.match(/^\/quote\/([^/?]+)/);
  if (m) return m[1];
  const h1 = document.querySelector('h1');
  if (h1) {
    const t = h1.textContent;
    const p = t.match(/\(([^)]+)\)/);
    if (p) return p[1];
  }
  return null;
}
function extractName() {
  const h1 = document.querySelector('h1');
  if (!h1) return '';
  // h1の最初の子テキストノード（通常は会社名）を取得
  if (h1.childNodes.length > 0 && h1.childNodes[0].nodeType === Node.TEXT_NODE) {
    return h1.childNodes[0].textContent.trim();
  }
  // フォールバック：括弧や【】で囲まれたティッカーと、それ以降の文字列を削除
  return h1.textContent
    .replace(/\s*（.+）.*$/, '')
    .replace(/\s*\(.+\).*$/, '')
    .replace(/\s*【.+】.*$/, '')
    .trim();
}
chrome.runtime.onMessage.addListener((msg, _, send) => {
  console.log('content_script.js: onMessage received', msg);
  if (msg.type === 'getInfo') {
    const ticker = extractTicker();
    const name = extractName();
    console.log('content_script.js: extracted info', { ticker, name });
    send({ ticker, name });
    return true; // 非同期応答を明示
  }
});
