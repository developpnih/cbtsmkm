// ====== KONFIGURASI: ganti URL Web App Google Apps Script Anda di bawah ======
const API='https://script.google.com/macros/s/AKfycbzx8T-SByoxQ_GB71OxpmRzQ6gY9hVGDK93QKq1MOY2nctcNlI_OSbuNWtJJa_sO1Fe/exec';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IM=/\[img:((?:https:\/\/|data:image\/(?:jpeg|png);base64,)[^\]\s]+)\]/g,rich=s=>esc(s).replace(IM,'<img class="qimg" src="$1" alt="gambar" draggable="false">');

// ---------- Koneksi ke server: timeout + coba ulang otomatis + indikator jaringan ----------
// Semua permintaan yang mengubah data dikirim dengan "rid" unik; server mengabaikan pengulangan rid yang sama,
// sehingga aman diulang berkali-kali saat jaringan lemah (tidak ada data ganda).
let BZ=0,NBE,NBT;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const READ=/^(cfg|logo|login|poll|start|a_list|a_multi|a_preview|a_doc|p_list|p_mapel|p_doc)$/,
 SLOW=/^(a_import|a_img|submit|ttd|a_cfg|a_doc_save|p_doc_save)$/,
 TRANSIENT=/lock|time ?out|too many|many times|try again|busy|overload|quota|unavailable|temporar|server error/i;
function netNote(t,ms){ // banner status koneksi (aria-live agar terbaca pembaca layar)
 if(!NBE){if(!t)return;NBE=document.createElement('div');NBE.setAttribute('role','status');NBE.setAttribute('aria-live','polite');
  NBE.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:99999;max-width:92vw;padding:8px 14px;border-radius:10px;background:#92400e;color:#fff;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);text-align:center;pointer-events:none;display:none';document.body.appendChild(NBE)}
 clearTimeout(NBT);NBE.style.display=t?'block':'none';if(t){NBE.textContent=t;if(ms)NBT=setTimeout(()=>{NBE.style.display='none'},ms)}}
const waitOnline=ms=>new Promise(r=>{let t;const f=()=>{removeEventListener('online',f);clearTimeout(t);r()};t=setTimeout(f,ms);addEventListener('online',f)});
async function once(b,ms){const has=typeof AbortController!='undefined',c=has?new AbortController():null,t=setTimeout(()=>c&&c.abort(),ms);
 try{const r=await fetch(API,{method:'POST',body:JSON.stringify(b),signal:c?c.signal:undefined});return await r.json()}finally{clearTimeout(t)}}
// post(body, quiet, {tries,timeout}) -> selalu mengembalikan objek {ok,...}
const post=async(b,quiet,o)=>{o=o||{};
 if(!READ.test(b.act)&&!b.rid)b={...b,rid:Date.now().toString(36)+Math.random().toString(36).slice(2,9)};
 const max=o.tries||(quiet?1:4),tmo=o.timeout||(SLOW.test(b.act)?45000:quiet?15000:25000);let last=null;
 if(!quiet){BZ++;document.body.classList.add('busy')}
 try{
  for(let i=0;i<max;i++){
   if(i){if(!quiet)netNote('Koneksi lemah, mencoba lagi ('+(i+1)+'/'+max+')…');await sleep(Math.min(8000,800*2**(i-1))+Math.random()*600)}
   if(!quiet&&navigator.onLine===false){netNote('Tidak ada koneksi internet. Menunggu jaringan…');await waitOnline(20000)}
   try{const r=await once(b,tmo);if(r&&r.ok===0&&TRANSIENT.test(r.msg||'')&&i<max-1){last=r;continue}return r}
   catch(e){last=null}
  }
  return last||{ok:0,msg:'Gagal terhubung ke server. Periksa koneksi internet.'}
 }finally{if(!quiet&&!--BZ){document.body.classList.remove('busy');netNote('')}}};
