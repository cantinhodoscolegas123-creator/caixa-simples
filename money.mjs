export function cents(value) {
  const s=String(value??'').trim().replace(/\s/g,'').replace(/^R\$/,'');
  if (!s) throw new Error('Preencha o valor. Se não houve movimento, informe 0.');
  const normalized=s.includes(',')?s.replace(/\./g,'').replace(',','.'):s;
  if(!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error('Use um valor como 25,50.');
  const n=Math.round(Number(normalized)*100);
  if(!Number.isSafeInteger(n))throw new Error('Valor muito alto.');
  return n;
}
export function calculate(d) {
  const keys=['cash','pix','debit','credit','seenPix','seenDebit','seenCredit','float','incoming','withdrawals','expenses','bag','drawer'];
  const v=Object.fromEntries(keys.map(k=>[k,cents(d[k])]));
  const expected=v.float+v.cash+v.incoming-v.withdrawals-v.expenses;
  return {expected, counted:v.bag+v.drawer, cash:v.bag+v.drawer-expected,pix:v.seenPix-v.pix,debit:v.seenDebit-v.debit,credit:v.seenCredit-v.credit};
}
export const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function extractTotals(group,text) {
  const labels=group==='pdv'?{cash:/dinheiro/i,pix:/pix/i,debit:/d[eé]bito/i,credit:/cr[eé]dito/i}:{seenPix:/pix/i,seenDebit:/d[eé]bito/i,seenCredit:/cr[eé]dito/i};
  const found={};
  for(const [key,label] of Object.entries(labels)) {
    const matches=String(text).split(/\r?\n/).filter(line=>label.test(line)).flatMap(line=>line.match(/\d[\d.]*,\d{2}\b/g)||[]);
    if(matches.length===1){try{cents(matches[0]);found[key]=matches[0];}catch{}}
  }
  return found;
}
