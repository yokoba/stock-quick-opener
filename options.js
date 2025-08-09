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
    // オプション表示時は初期テンプレを自動挿入しない（空なら何も表示しない）
    if (sites.length > 0) {
        sites.forEach(add);
    }
})();
