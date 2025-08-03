const q = s => document.querySelector(s);
function add(data = { enabled: true, name: '', template: 'https://kabutan.jp/stock/?code={TICKER}' }) {
    const t = q('#row').content.cloneNode(true);
    const r = t.querySelector('.row');
    r.querySelector('.enabled').checked = data.enabled;
    r.querySelector('.name').value = data.name;
    r.querySelector('.tpl').value = data.template;
    r.querySelector('.del').onclick = () => r.remove();
    q('#list').append(r);
}
document.getElementById('add').onclick = () => add();
document.getElementById('save').onclick = async () => {
    const rows = [...document.querySelectorAll('.row')];
    const sites = rows.map(r => ({
        enabled: r.querySelector('.enabled').checked,
        name: r.querySelector('.name').value.trim(),
        template: r.querySelector('.tpl').value.trim()
    }));
    await chrome.storage.sync.set({ sites });
    alert('保存しました');
};
(async () => {
    const { sites = [] } = await chrome.storage.sync.get({ sites: [] });
    if (sites.length === 0) {
        // Add default templates for first-time users
        const defaultSites = [
            { enabled: true, name: '株探', template: 'https://kabutan.jp/stock/?code={TICKER_NUM}' },
            { enabled: true, name: 'バフェット・コード', template: 'https://www.buffett-code.com/company/{TICKER_NUM}/' },
            { enabled: true, name: 'IRバンク', template: 'https://irbank.net/{TICKER_NUM}' },
            { enabled: true, name: '株予報（レポート）', template: 'https://kabuyoho.jp/reportTop?bcode={TICKER_NUM}' },
            { enabled: true, name: '株予報（IFIS）', template: 'https://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report_top&bcode={TICKER_NUM}' },
            { enabled: true, name: '空売りネット', template: 'https://karauri.net/{TICKER_NUM}/' },
            { enabled: true, name: 'TradingView', template: 'https://jp.tradingview.com/chart/?symbol={TICKER_NUM}' }
        ];
        defaultSites.forEach(add);
        // 初回のみ即保存
        await chrome.storage.sync.set({ sites: defaultSites });
    } else {
        sites.forEach(add);
    }
})();
