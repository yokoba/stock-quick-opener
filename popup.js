document.getElementById('open').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { type: 'getInfo' }, (info) => {
        console.log('popup.js: content_scriptからの応答', info);
        if (!info) {
            alert('content_scriptから応答がありません');
            return;
        }
        if (!info.ticker) {
            alert('ティッカーが取得できません: ' + JSON.stringify(info));
            return;
        }
        alert('取得結果: ' + JSON.stringify(info));
        chrome.runtime.sendMessage({ type: 'openTabs', info });
    });
});
