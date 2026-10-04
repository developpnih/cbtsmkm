// ===== PANEL PENGAWAS RUANG: hanya untuk mematikan alarm siswa di ruangnya =====
let U=JSON.parse(sessionStorage.getItem('pgw')||'null'),S=[],prev=-1,AC,TM;
const unlock=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}};
const beep=()=>{if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.frequency.value=880;g.gain.value=.25;o.start();setTimeout(()=>o.stop(),500);navigator.vibrate&&navigator.vibrate(300)}catch(e){}};
post({act:'cfg'},1).then(c=>{if(c.ok){$('#sn').textContent='Pengawas Ruang · '+(c.sekolah||'');if(c.logo)$('.logo').src=c.logo}});
let LB=0;
async function login(){if(LB)return;const u=$('#u').value.trim(),p=$('#p').value.trim();if(!u||!p)return;LB=1;unlock();const b=$('#lf button');b.disabled=true;b.textContent='Memeriksa...';$('#lm').textContent='';
 const r=await post({act:'p_list',ruang:u,pw:p});LB=0;b.disabled=false;b.textContent='Masuk';
 if(!r.ok)return $('#lm').textContent=r.msg;U={u,p};sessionStorage.setItem('pgw',JSON.stringify(U));open_(r)}
$('#lf').onsubmit=e=>{e.preventDefault();login()};['#u','#p'].forEach(i=>$(i).onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();login()}});
let RN='',ALMOFF=false;
async function needDoc(){if(typeof DOC!='undefined')return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='dokumen.js';s.onload=ok;s.onerror=()=>no(new Error('File dokumen.js belum diupload ke hosting'));document.head.append(s)})}
const CTX=()=>({ruangs:[RN],mapels:async()=>{const r=await post({act:'p_mapel',ruang:U.u,pw:U.p});return r.ok?r.mapel:[]},get:(r,m,img)=>post({act:'p_doc',ruang:U.u,pw:U.p,mapel:m,img}),save:(r,m,t,o)=>post({act:'p_doc_save',ruang:U.u,pw:U.p,mapel:m,type:t,obj:o}),edit:(r,m,n,o)=>post({act:'p_hadir',ruang:U.u,pw:U.p,mapel:m,nis:n,...o})});
$$('.ptabs button').forEach(b=>b.onclick=()=>{$$('.ptabs button').forEach(x=>x.classList.toggle('on',x==b));const t=b.dataset.t;$('#v-alarm').hidden=t!='alarm';$('#v-doc').hidden=t=='alarm';if(t!='alarm')needDoc().then(()=>DOC.mount($('#v-doc'),t,CTX())).catch(e=>{$('#v-doc').innerHTML='<p class="err">'+esc(e.message)+'</p>'})});
function open_(r){RN=r.ruang;ALMOFF=r.alm===false;$('#lg').hidden=true;$('#pn').hidden=false;$('#rn').textContent=r.ruang;S=r.siswa;prev=-1;draw();clearInterval(TM);TM=setInterval(()=>refresh(1),5000)}
async function refresh(q){if(!U||document.hidden)return;const r=await post({act:'p_list',ruang:U.u,pw:U.p},q);if(!r.ok){if(/salah/.test(r.msg||'')){sessionStorage.removeItem('pgw');location.reload()}return}S=r.siswa;ALMOFF=r.alm===false;draw()}
function draw(){const n=S.filter(x=>x.alarm).length,f=$('#q').value.toLowerCase();
 if(n>prev&&prev>=0)beep();prev=n;
 $('#ct').textContent=n?`🔔 ${n} alarm`:`${S.length} siswa`;$('#ct').classList.toggle('al',!!n);document.title=(n?`(${n}) `:'')+'Pengawas Ruang';
 const rs=S.filter(x=>!f||String(x.nama).toLowerCase().includes(f)||String(x.nis).includes(f)).sort((a,b)=>b.alarm-a.alarm||String(a.nama).localeCompare(b.nama));
 $('#list').innerHTML=rs.map(x=>`<div class="srow ${x.alarm?'al':''}"><div class="nm"><b>${esc(x.nama)}</b><small>${esc(x.kelas)} · NIS ${esc(x.nis)}${x.pelanggaran?' · pelanggaran '+x.pelanggaran+'x':''}${x.blokir?' · diblokir':''}</small></div>${x.alarm?`<button class="btn red" data-n="${esc(x.nis)}">🔕 Matikan Alarm</button>`:'<span class="tag g">aman</span>'}</div>`).join('')||'<p class="muted">Belum ada siswa di ruang ini. Hubungi admin untuk pengaturan ruang.</p>';
 $('#upd').textContent='Diperbarui '+new Date().toLocaleTimeString('id-ID')+' · otomatis tiap 5 detik'+(ALMOFF?' · 🔕 Alarm dinonaktifkan oleh admin':'');
 $$('#list [data-n]').forEach(b=>b.onclick=()=>off(b.dataset.n))}
async function off(nis){const bak=S.map(x=>({...x}));S=S.map(x=>nis=='all'||x.nis==nis?{...x,alarm:0}:x);draw();
 const r=await post({act:'p_alarmoff',ruang:U.u,pw:U.p,nis});if(!r.ok){S=bak;draw();alert(r.msg||'Gagal mematikan alarm')}}
$('#all').onclick=()=>{if(S.some(x=>x.alarm)&&confirm('Matikan semua alarm di ruang ini?'))off('all')};
$('#q').oninput=draw;$('#out').onclick=()=>{sessionStorage.removeItem('pgw');clearInterval(TM);location.reload()};
document.addEventListener('visibilitychange',()=>!document.hidden&&refresh(1));
if(U)post({act:'p_list',ruang:U.u,pw:U.p}).then(r=>{if(r.ok)open_(r);else sessionStorage.removeItem('pgw')});
