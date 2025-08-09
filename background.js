// 既定サイト配列を一元管理
const DEFAULT_SITES = [
  { enabled: true, name: '株探', template: 'https://kabutan.jp/stock/?code={TICKER_NUM}' },
  { enabled: true, name: 'バフェット・コード', template: 'https://www.buffett-code.com/company/{TICKER_NUM}/' },
  { enabled: true, name: 'IRバンク', template: 'https://irbank.net/{TICKER_NUM}' },
  { enabled: true, name: '株予報（レポート）', template: 'https://kabuyoho.jp/reportTop?bcode={TICKER_NUM}' },
  { enabled: true, name: '株予報（IFIS）', template: 'https://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report_top&bcode={TICKER_NUM}' },
  { enabled: true, name: '空売りネット', template: 'https://karauri.net/{TICKER_NUM}/' },
  { enabled: true, name: 'TradingView', template: 'https://jp.tradingview.com/chart/?symbol={TICKER_NUM}' }
];

async function ensureDefaultSites() {
  const { sites = [] } = await chrome.storage.sync.get({ sites: [] });
  console.log('[Stock Quick Opener] ensureDefaultSites: 現在 length=', sites.length);
  if (!sites || sites.length === 0) {
    await chrome.storage.sync.set({ sites: DEFAULT_SITES });
    // 書き込み確認
    const verify = await chrome.storage.sync.get({ sites: [] });
    chrome.storage.sync.getBytesInUse(null, bytes => {
      console.log('[Stock Quick Opener] ensureDefaultSites: bytesInUse=', bytes);
    });
    console.log('[Stock Quick Opener] デフォルト sites をセットしました (ensureDefaultSites) length=', verify.sites.length);
    return true;
  }
  return false;
}

// 起動直後（Service Worker 起動時）にも一度確認しておく（onInstalled が飛ばなかった/逃した場合の保険）
(async () => {
  try {
    const created = await ensureDefaultSites();
    console.log('[Stock Quick Opener] startup ensureDefaultSites 実行 created=', created);
  } catch (e) {
    console.error('[Stock Quick Opener] startup ensureDefaultSites エラー', e);
  }
})();

function sub(tpl, data) {
  const ticker = data.ticker || '';
  const name = data.name || '';
  // 4桁数字のみ抽出
  const tickerNum = (ticker.match(/^([0-9]{4})/) || [])[1] || ticker.replace(/\.T$/, '');
  // .T付き（なければ付与）
  const tickerWithT = ticker.match(/\.T$/) ? ticker : tickerNum + '.T';
  return tpl
    .replace(/\{TICKER\}/gi, encodeURIComponent(ticker))         // 元のまま
    .replace(/\{TICKER_NUM\}/gi, encodeURIComponent(tickerNum))  // 4桁数字
    .replace(/\{TICKER_T\}/gi, encodeURIComponent(tickerWithT))  // .T付き
    .replace(/\{NAME\}/gi, encodeURIComponent(name))
    .replace(/%code/gi, encodeURIComponent(ticker))
    .replace(/%name/gi, encodeURIComponent(name));
}


// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background.js: onMessage received', message);
  if (message.type === 'openTabs' && message.info) {
    const info = message.info;
    if (!info || !info.ticker) {
      console.warn('コード取得失敗 (from onMessage)');
      return;
    }
    chrome.storage.sync.get({ sites: [] }).then(({ sites }) => {
      console.log('background.js: sites loaded from storage', sites);
      for (const s of sites) {
        if (!s.enabled) continue;
        const url = sub(s.template, info);
        console.log('background.js: creating tab with url:', url);
        chrome.tabs.create({ url });
      }
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('background.js: action.onClicked triggered for tab:', tab.id);
  // クリック時にもフォールバックでデフォルト投入（初回インストールイベント取り逃し対策）
  await ensureDefaultSites();
  chrome.tabs.sendMessage(tab.id, { type: 'getInfo' }, (info) => {
    if (chrome.runtime.lastError) {
      console.warn('background.js: sendMessage failed:', chrome.runtime.lastError.message);
      // フォールバック: URL から直接ティッカーを推測
      const m = tab.url && tab.url.match(/\/quote\/([^/?#]+)/);
      if (!m) return; // 取得不可
      info = { ticker: m[1], name: '' };
    }
    console.log('background.js: getInfo response (or fallback) received:', info);
    if (!info || !info.ticker) {
      console.warn('background.js: ティッカー取得失敗:', info);
      return;
    }
    chrome.storage.sync.get({ sites: [] }).then(({ sites }) => {
      console.log('background.js: sites loaded from storage', sites);
      if (!sites || sites.length === 0) {
        console.warn('background.js: sites が空です');
        return;
      }
      for (const s of sites) {
        if (!s.enabled) continue;
        const url = sub(s.template, info);
        console.log('background.js: creating tab with url:', url);
        chrome.tabs.create({ url });
      }
    });
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Stock Quick Opener] onInstalled:', details.reason, 'previousVersion=', details.previousVersion);
  if (details.reason === 'install') {
    const created = await ensureDefaultSites();
    console.log('[Stock Quick Opener] onInstalled install ensureDefaultSites created=', created);
  }
  if (details.reason === 'update') {
    // アップデート時に新しいデフォルトを追加したい場合の例（既存ユーザーのカスタムは保持）
    const { sites = [] } = await chrome.storage.sync.get({ sites: [] });
    let changed = false;
    for (const def of DEFAULT_SITES) {
      if (!sites.some(s => s.template === def.template)) { // template で未登録判定
        sites.push(def);
        changed = true;
      }
    }
    if (changed) {
      await chrome.storage.sync.set({ sites });
      console.log('[Stock Quick Opener] 新デフォルトを追加反映しました');
    }
  }
});
