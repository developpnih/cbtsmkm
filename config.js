// ====== KONFIGURASI: ganti URL Web App Google Apps Script Anda di bawah ======
const API='GANTI_DENGAN_URL_WEB_APP';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IM=/\[img:(https:\/\/[^\]\s]+)\]/g,rich=s=>esc(s).replace(IM,'<img class="qimg" src="$1" alt="gambar" draggable="false">');
const post=async b=>{try{const r=await fetch(API,{method:'POST',body:JSON.stringify(b)});return await r.json()}catch(e){return{ok:0,msg:'Gagal terhubung ke server'}}};
