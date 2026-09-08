async function loadPrices(){
  const box=document.getElementById('prices');
  try{
    const res=await fetch('/api/prices');
    if(!res.ok) throw new Error('API unavailable');
    const data=await res.json();
    const items=Array.isArray(data.items)?data.items:[];
    document.getElementById('updated').textContent=data.updatedAt?`آخرین بروزرسانی: ${new Date(data.updatedAt).toLocaleString('fa-IR')}`:'آخرین بروزرسانی نامشخص';
    if(!items.length){box.innerHTML='<div class="loading">هنوز قیمت معتبر برای نمایش ثبت نشده است.</div>';return}
    box.innerHTML=items.map(x=>`<article class="card"><div class="name">${escapeHtml(x.name||'کالا')}</div><div class="price">${formatPrice(x.price)}</div><div class="unit">${escapeHtml(x.unit||'')}</div><div class="source">منبع: ${escapeHtml(x.source||'نامشخص')}</div></article>`).join('');
  }catch(e){box.innerHTML='<div class="loading">در حال حاضر دریافت قیمت‌ها ممکن نیست.</div>';document.getElementById('updated').textContent='خطا در دریافت آخرین بروزرسانی';}
}
function formatPrice(v){const n=Number(v);return Number.isFinite(n)?n.toLocaleString('fa-IR'):'—'}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
loadPrices();
