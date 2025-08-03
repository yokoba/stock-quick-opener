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

chrome.action.onClicked.addListener((tab) => {
  console.log('background.js: action.onClicked triggered for tab:', tab.id);
  chrome.tabs.sendMessage(tab.id, { type: 'getInfo' }, (info) => {
    if (chrome.runtime.lastError) {
      console.error('background.js: sendMessage failed:', chrome.runtime.lastError.message);
      alert('background.js: sendMessage failed: ' + chrome.runtime.lastError.message);
      return;
    }
    console.log('background.js: getInfo response received:', info);
    if (!info) {
      alert('background.js: infoがundefinedです');
      return;
    }
    if (!info.ticker) {
      alert('background.js: ティッカーが取得できません: ' + JSON.stringify(info));
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
  });
});
