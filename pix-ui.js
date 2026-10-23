import { buildPix } from './pix.mjs';

let loading;
function loadQr() {
  if (globalThis.qrcode) return Promise.resolve(globalThis.qrcode);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('./vendor/qrcode.js', import.meta.url).href;
    s.onload = () => (globalThis.qrcode ? resolve(globalThis.qrcode) : reject(Error('QR indisponível')));
    s.onerror = () => { loading = null; reject(Error('QR indisponível')); };
    document.head.appendChild(s);
  });
  return loading;
}

export async function renderPix(node, data) {
  const code = buildPix(data);
  const qrcode = await loadQr();
  const qr = qrcode(0, 'M');
  qr.addData(code);
  qr.make();
  if (!node.isConnected) return;
  node.innerHTML = `<div class="p-qrimg">${qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true })}</div><p class="help">Pix de ${data.amount.toFixed(2).replace('.', ',')} para ${data.name}</p><details><summary>Copiar o código Pix</summary><textarea readonly rows="4">${code}</textarea></details>`;
}
