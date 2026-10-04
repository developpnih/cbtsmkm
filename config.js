// ====== KONFIGURASI: ganti URL Web App Google Apps Script Anda di bawah ======
const API='https://script.google.com/macros/s/AKfycbx9-HJt9lJXTuUcRknfejZrKRGqELI5k0AR1ycy1s2Q6L-rPU_L642bG6h4eEWix9JG/exec';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IM=/\[img:((?:https:\/\/|data:image\/(?:jpeg|png);base64,)[^\]\s]+)\]/g,rich=s=>esc(s).replace(IM,'<img class="qimg" src="$1" alt="gambar" draggable="false">');
let BZ=0;const RO=['cfg','login','poll','start','submit','a_list','a_multi'];
const post=async(b,quiet)=>{if(!quiet){BZ++;document.body.classList.add('busy')}
 try{for(let i=0;;i++){try{const r=await fetch(API,{method:'POST',body:JSON.stringify(b)});return await r.json()}catch(e){if(i||RO.indexOf(b.act)<0)throw e;await new Promise(r=>setTimeout(r,800))}}}
 catch(e){return{ok:0,msg:'Gagal terhubung ke server. Periksa koneksi internet.'}}
 finally{if(!quiet&&!--BZ)document.body.classList.remove('busy')}};
