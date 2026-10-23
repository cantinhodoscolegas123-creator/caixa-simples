const ascii = (s, max) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').trim().toUpperCase().slice(0, max);
const field = (id, value) => id + String(value.length).padStart(2, '0') + value;

export function crc16(text) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function normalizeKey(key, keyType) {
  const raw = String(key ?? '').trim();
  if (!raw) throw Error('Falta a chave Pix.');
  if (keyType === 'cpf' || keyType === 'cnpj') {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== (keyType === 'cpf' ? 11 : 14)) throw Error('Confira o número da chave Pix.');
    return digits;
  }
  if (keyType === 'phone') {
    const digits = raw.replace(/\D/g, '');
    const national = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
    if (national.length < 10 || national.length > 11) throw Error('Confira o celular da chave Pix.');
    return '+55' + national;
  }
  if (keyType === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw Error('Confira o e-mail da chave Pix.');
    return raw.toLowerCase();
  }
  if (/^\d+$/.test(raw) || raw.includes('@')) throw Error('Escolha o tipo da chave Pix no cadastro (CPF, CNPJ, e-mail ou celular).');
  return raw;
}

export function buildPix({ key, keyType, name, city, amount, id }) {
  const k = normalizeKey(key, keyType);
  const n = ascii(name, 25), c = ascii(city, 15);
  if (!n || !c) throw Error('Falta o nome ou a cidade de quem recebe o Pix.');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999.99) throw Error('Valor do Pix inválido.');
  const txid = ascii(id, 25).replace(/ /g, '') || '***';
  const body =
    field('00', '01') + field('01', '11') +
    field('26', field('00', 'br.gov.bcb.pix') + field('01', k)) +
    field('52', '0000') + field('53', '986') + field('54', amount.toFixed(2)) +
    field('58', 'BR') + field('59', n) + field('60', c) + field('62', field('05', txid)) + '6304';
  return body + crc16(body);
}
