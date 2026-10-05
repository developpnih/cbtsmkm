// ====== HALAMAN SISWA (butuh config.js) ======
const show=id=>$$('main>section').forEach(s=>s.hidden=s.id!=id);
let U,Q=[],ans={},cur=0,end=0,tm,inExam=0,cfg={sekolah:'',logo:''};

// ---------- Init ----------
const applyCfg=c=>{cfg=c;$('#sname').textContent=c.sekolah||'';document.title='CBT '+(c.sekolah||'')};
// Nama sekolah & logo disimpan di perangkat (segar 30 menit) -> halaman login tidak membebani server saat ratusan siswa membuka bersamaan
{let cc=null;try{cc=JSON.parse(localStorage.getItem('cbt_cfg')||'null')}catch(e){}
 if(cc&&cc.c)applyCfg(cc.c);const lc=localStorage.getItem('cbt_logo');if(lc)$$('.logo').forEach(i=>i.src=lc);
 if(!cc||Date.now()-cc.t>1800000)setTimeout(async()=>{const c=await post({act:'cfg'},1,{tries:3});if(c.ok){applyCfg(c);try{localStorage.setItem('cbt_cfg',JSON.stringify({t:Date.now(),c}))}catch(e){}}
  const l=await post({act:'logo'},1,{tries:2});if(!l.ok)return;if(l.logo){try{localStorage.setItem('cbt_logo',l.logo)}catch(e){}$$('.logo').forEach(i=>i.src=l.logo)}else localStorage.removeItem('cbt_logo')},cc?Math.random()*6000:0)}

// ---------- Alarm ----------
let AC,siren;
const unlock=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}};
function alarmOn(){if(siren||!AC||!ALM)return;const o=AC.createOscillator(),g=AC.createGain();o.type='square';g.gain.value=1;o.connect(g);g.connect(AC.destination);o.start();let t=0;siren={t0:Date.now(),ack:0,o,iv:setInterval(()=>{o.frequency.value=t++%2?1400:600},350)};$('#warn').hidden=false;navigator.vibrate&&navigator.vibrate([500,200,500])}
function alarmOff(){if(!siren)return;clearInterval(siren.iv);try{siren.o.stop()}catch(e){}siren=null;$('#warn').hidden=true}
const goFull=()=>{const e=document.documentElement,f=e.requestFullscreen||e.webkitRequestFullscreen;try{const p=f&&f.call(e);p&&p.catch&&p.catch(()=>{})}catch(x){}};
const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),canFull=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);
let MAXA=0,SK=0,MSG='',MT,ALM=true,LL=0;
const hm=ms=>new Date(ms).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace('.',':'),fmtJ=ms=>new Date(ms).toLocaleString('id-ID',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).replace('.',':');
const fsCheck=()=>{if(!inExam||!canFull)return;if(isFull())$('#fs').hidden=true;else{$('#fs').hidden=false;leave()}};
['fullscreenchange','webkitfullscreenchange'].forEach(e=>document.addEventListener(e,fsCheck));$('#fsb').onclick=goFull;
addEventListener('resize',()=>{if(!inExam)return;const a=innerWidth*innerHeight;if(a>MAXA)MAXA=a;else if(a<MAXA*.8)leave()});
if(screen.addEventListener)screen.addEventListener('change',()=>{if(inExam&&screen.isExtended)leave()});
function leave(){if(!inExam)return;if(!ALM){if(Date.now()-LL>5000){LL=Date.now();post({act:'alarm',nis:U.nis,pw:U.pw},1)}return}const was=!!siren;alarmOn();if(!was)post({act:'alarm',nis:U.nis,pw:U.pw})}
document.addEventListener('visibilitychange',()=>document.hidden&&leave());
addEventListener('blur',leave);
['contextmenu','copy','cut','paste'].forEach(e=>document.addEventListener(e,x=>inExam&&x.preventDefault()));
(function pl(){setTimeout(async()=>{if(U&&inExam){const r=await post({act:'poll',nis:U.nis},1);if(r.ok){ALM=r.alm!==false;if(!ALM)alarmOff();if(r.blokir){inExam=0;alarmOff();alert('Akses Anda diblokir oleh pengawas.');location.reload()}
 if(r.alarm){alarmOn();if(siren)siren.ack=1}else if(siren&&siren.ack)alarmOff();else if(siren&&Date.now()-siren.t0>12000){siren.t0=Date.now();post({act:'alarm',again:1,nis:U.nis,pw:U.pw},1)}}}pl()},siren?4000:15000)})();

// ---------- Siswa ----------
let LB=0;const doLogin=async()=>{if(LB)return;const nis=$('#nis').value.trim(),pw=$('#pw').value.trim();if(!nis||!pw)return $('#lmsg').textContent='Isi NIS dan password';LB=1;unlock();goFull();const b=$('#fl button');b.disabled=true;b.textContent='Memeriksa...';$('#lmsg').textContent='';
 const slow=setTimeout(()=>{b.textContent='Menunggu server...'},6000);const r=await post({act:'login',nis,pw},0,{tries:3,timeout:20000});clearTimeout(slow);LB=0;b.disabled=false;b.textContent='Masuk Ujian';if(!r.ok){isFull()&&document.exitFullscreen&&document.exitFullscreen();return $('#lmsg').textContent=r.msg}
 U={nis,pw,...r};SK=r.now-Date.now();ALM=r.alm!==false;setTimeout(()=>post({act:'hadir',nis,pw},1,{tries:3}),1500+Math.random()*5000);const p=r.mapel.filter(m=>!m.done);if(p.length==1&&(!p[0].jd||Date.now()+SK>=p[0].jd))start(p[0].kode);else menu()};
$('#fl').onsubmit=e=>{e.preventDefault();doLogin()};['#nis','#pw'].forEach(i=>$(i).onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();doLogin()}});
$('#logout').onclick=()=>{U=null;show('login');$('#fl').reset()};
function menu(msg,bad){MSG=msg;show('menu');clearTimeout(MT);MT=setTimeout(()=>{if(U&&!$('#menu').hidden)menu(MSG,bad)},5000);const now=Date.now()+SK;$('#mnama').textContent=U.nama;$('#mkelas').textContent='Kelas '+U.kelas+' · NIS '+U.nis;
 $('#mlist').innerHTML=(msg?`<p class="err" style="color:var(${bad?'--er':'--ok'})">${esc(msg)}</p>`:'')+(U.mapel.length?U.mapel.map(m=>`<div class="ex"><div><b>${esc(m.nama)}</b><div class="muted">${m.durasi} menit${m.jd?' · '+fmtJ(m.jd):''}</div></div>${m.done?(m.ttd?'<span class="tag">Selesai ✔</span>':`<button class="btn" data-s="${esc(m.kode)}">✍ Tanda tangan</button>`):m.jd&&now<m.jd?`<button class="btn" disabled>Mulai ${hm(m.jd)}</button>`:`<button class="btn" data-k="${esc(m.kode)}">Mulai</button>`}</div>`).join(''):'<p class="muted">Belum ada ujian yang aktif.</p>');
 $$('#mlist [data-k]').forEach(b=>b.onclick=()=>start(b.dataset.k));$$('#mlist [data-s]').forEach(b=>b.onclick=()=>signPad(b.dataset.s))}
async function start(k){unlock();goFull();if(screen.isExtended){menu('Terdeteksi layar ganda (monitor kedua). Lepaskan monitor tambahan lalu coba lagi.',1);return}
 const r=await post({act:'start',nis:U.nis,pw:U.pw,mapel:k});if(!r.ok){if(r.jd)SK=r.now-Date.now();menu(r.msg+(r.jd?' Mulai pukul '+hm(r.jd)+'.':''),1);return}
 U.cur=k;Q=r.soal;ans=JSON.parse(localStorage.getItem('a'+U.nis+k)||'{}');cur=0;end=Date.now()+r.sisa*1000;inExam=1;
 $('#enama').textContent=r.nama;show('exam');draw();clearInterval(tm);tm=setInterval(tick,1000);tick();
 const en=$('#enote');en.hidden=!(r.telat>0);if(r.telat>0)en.textContent='Anda terlambat '+r.telat+' menit. Waktu pengerjaan Anda dikurangi menjadi '+Math.ceil(r.sisa/60)+' menit.';
 MAXA=innerWidth*innerHeight;if(canFull&&!isFull())$('#fs').hidden=false}
function tick(){const s=Math.max(0,Math.round((end-Date.now())/1000)),t=$('#timer');t.textContent=[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':');t.classList.toggle('low',s<300);if(!s)finish(true)}
function draw(){const q=Q[cur];if(!q)return;$('#qno').textContent=`Soal ${cur+1} dari ${Q.length}`;$('#qtext').innerHTML=rich(q.soal);
 $('#opts').innerHTML=q.opsi.map(o=>`<button class="opt ${ans[q.id]==o.k?'sel':''}" data-k="${o.k}"><b>${o.k}</b><span>${rich(o.t)}</span></button>`).join('');
 $$('#opts .opt').forEach(b=>b.onclick=()=>{ans[q.id]=b.dataset.k;localStorage.setItem('a'+U.nis+U.cur,JSON.stringify(ans));draw()});
 $('#grid').innerHTML=Q.map((x,i)=>`<button class="${ans[x.id]?'done':''} ${i==cur?'cur':''}" data-i="${i}">${i+1}</button>`).join('');
 $$('#grid button').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;draw()});
 $('#prev').disabled=!cur;$('#next').disabled=cur==Q.length-1}
$('#prev').onclick=()=>{cur--;draw()};$('#next').onclick=()=>{cur++;draw()};
$('#finish').onclick=()=>finish(false);
let FIN=0;
async function finish(auto){if(FIN)return;const n=Q.filter(q=>!ans[q.id]).length;if(!auto&&!confirm(n?`Masih ada ${n} soal belum dijawab. Kirim sekarang?`:'Kirim jawaban dan akhiri ujian?'))return;
 FIN=1;clearInterval(tm);const r=await post({act:'submit',nis:U.nis,pw:U.pw,mapel:U.cur,jawab:ans},0,{tries:8});FIN=0;
 if(!r.ok){netNote('Jawaban belum terkirim ('+(r.msg||'koneksi bermasalah')+'). Jawaban Anda aman di perangkat ini, mencoba lagi otomatis…');tm=setInterval(()=>finish(true),5000);return}
 netNote('');clearInterval(tm);inExam=0;$('#fs').hidden=true;alarmOff();localStorage.removeItem('a'+U.nis+U.cur);document.fullscreenElement&&document.exitFullscreen();
 U.mapel.forEach(m=>{if(m.kode==U.cur)m.done=true});signPad(U.cur)}


// ---------- Tanda tangan kehadiran ----------
let SIGK='';
function signPad(k){SIGK=k;show('ttd');const m=U.mapel.find(x=>x.kode==k)||{};$('#tnama').textContent=U.nama+' · '+(m.nama||k);$('#sigmsg').textContent='';sigClear()}
const sigC=$('#sig'),sigX=sigC.getContext('2d');let sigD=0;
function sigClear(){sigX.fillStyle='#fff';sigX.fillRect(0,0,sigC.width,sigC.height);sigX.strokeStyle='#000';sigX.lineWidth=3;sigX.lineCap='round';sigX.lineJoin='round';$('#sigsave').disabled=true}
const sigPos=e=>{const r=sigC.getBoundingClientRect();return[(e.clientX-r.left)*sigC.width/r.width,(e.clientY-r.top)*sigC.height/r.height]};
sigC.onpointerdown=e=>{e.preventDefault();try{sigC.setPointerCapture(e.pointerId)}catch(x){}sigD=1;const[p,q]=sigPos(e);sigX.beginPath();sigX.moveTo(p,q);sigX.lineTo(p+.1,q+.1);sigX.stroke()};
sigC.onpointermove=e=>{if(!sigD)return;e.preventDefault();const[p,q]=sigPos(e);sigX.lineTo(p,q);sigX.stroke();$('#sigsave').disabled=false};
sigC.onpointerup=sigC.onpointercancel=()=>{sigD=0};
$('#sigclr').onclick=sigClear;
$('#sigsave').onclick=async()=>{const b=$('#sigsave');b.disabled=true;b.textContent='Menyimpan...';let d=sigC.toDataURL('image/png').split(',')[1];if(d.length>44000)d=sigC.toDataURL('image/jpeg',.6).split(',')[1];
 const r=await post({act:'ttd',nis:U.nis,pw:U.pw,mapel:SIGK,data:d});b.textContent='Simpan Tanda Tangan';b.disabled=false;
 if(!r.ok)return $('#sigmsg').textContent=r.msg||'Gagal menyimpan, coba lagi';
 const m=U.mapel.find(x=>x.kode==SIGK);if(m)m.ttd=true;menu('Terima kasih. Jawaban dan kehadiran Anda sudah tercatat.')};

// kembali online saat waktu sudah habis & jawaban belum terkirim -> kirim segera
addEventListener('online',()=>{if(U&&inExam&&!FIN&&Date.now()>=end)finish(true)});
