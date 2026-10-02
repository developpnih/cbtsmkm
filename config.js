// ====== KONFIGURASI: ganti URL Web App Google Apps Script Anda di bawah ======
const API='https://script.google.com/macros/s/AKfycbzQcokH8dqfTkbkb3b60H85fx8idzFm6PJYXJKI4KFTVew4_AB_bd6hwbbPMWB4XSTT/exec';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IM=/\[img:(https:\/\/[^\]\s]+)\]/g,rich=s=>esc(s).replace(IM,'<img class="qimg" src="$1" alt="gambar" draggable="false">');
const post=async b=>{try{const r=await fetch(API,{method:'POST',body:JSON.stringify(b)});return await r.json()}catch(e){return{ok:0,msg:'Gagal terhubung ke server'}}};
