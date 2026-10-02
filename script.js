// ====== HALAMAN SISWA (butuh config.js) ======
const show=id=>$$('main>section').forEach(s=>s.hidden=s.id!=id);
let U,Q=[],ans={},cur=0,end=0,tm,inExam=0,cfg={sekolah:'',logo:''};

// ---------- Init ----------
(async()=>{const c=await post({act:'cfg'});if(c.ok){cfg=c;$('#sname').textContent=c.sekolah;document.title='CBT '+c.sekolah;if(c.logo)$$('.logo').forEach(i=>i.src=c.logo)}})();

// ---------- Alarm ----------
let AC,siren;
const unlock=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}};
function alarmOn(){if(siren||!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type='square';g.gain.value=1;o.connect(g);g.connect(AC.destination);o.start();let t=0;siren={o,iv:setInterval(()=>{o.frequency.value=t++%2?1400:600},350)};$('#warn').hidden=false;navigator.vibrate&&navigator.vibrate([500,200,500])}
function alarmOff(){if(!siren)return;clearInterval(siren.iv);try{siren.o.stop()}catch(e){}siren=null;$('#warn').hidden=true}
function leave(){if(!inExam)return;const was=!!siren;alarmOn();if(!was)post({act:'alarm',nis:U.nis,pw:U.pw})}
document.addEventListener('visibilitychange',()=>document.hidden&&leave());
addEventListener('blur',leave);
['contextmenu','copy','cut','paste'].forEach(e=>document.addEventListener(e,x=>inExam&&x.preventDefault()));
setInterval(async()=>{if(!U||!inExam)return;const r=await post({act:'poll',nis:U.nis,pw:U.pw});if(!r.ok)return;if(r.blokir){inExam=0;alarmOff();alert('Akses Anda diblokir oleh pengawas.');location.reload()}
 if(r.alarm)alarmOn();else alarmOff()},4000);

// ---------- Siswa ----------
$('#fl').onsubmit=async e=>{e.preventDefault();unlock();$('#lmsg').textContent='Memeriksa...';const nis=$('#nis').value.trim(),pw=$('#pw').value.trim();
 const r=await post({act:'login',nis,pw});if(!r.ok)return $('#lmsg').textContent=r.msg;$('#lmsg').textContent='';U={nis,pw,...r};menu()};
$('#logout').onclick=()=>{U=null;show('login');$('#fl').reset()};
function menu(msg){show('menu');$('#mnama').textContent=U.nama;$('#mkelas').textContent='Kelas '+U.kelas+' · NIS '+U.nis;
 $('#mlist').innerHTML=(msg?`<p class="err" style="color:var(--ok)">${msg}</p>`:'')+(U.mapel.length?U.mapel.map(m=>`<div class="ex"><div><b>${esc(m.nama)}</b><div class="muted">${m.durasi} menit</div></div>${m.done?'<span class="tag">Selesai</span>':`<button class="btn" data-k="${esc(m.kode)}">Mulai</button>`}</div>`).join(''):'<p class="muted">Belum ada ujian yang aktif.</p>');
 $$('#mlist [data-k]').forEach(b=>b.onclick=()=>start(b.dataset.k))}
async function start(k){unlock();if(!confirm('Mulai ujian? Jangan berpindah tab/aplikasi selama ujian, alarm akan berbunyi.'))return;
 const r=await post({act:'start',nis:U.nis,pw:U.pw,mapel:k});if(!r.ok)return alert(r.msg);
 U.cur=k;Q=r.soal;ans=JSON.parse(localStorage.getItem('a'+U.nis+k)||'{}');cur=0;end=Date.now()+r.sisa*1000;inExam=1;
 $('#enama').textContent=r.nama;show('exam');draw();clearInterval(tm);tm=setInterval(tick,1000);tick();
 try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}catch(e){}}
function tick(){const s=Math.max(0,Math.round((end-Date.now())/1000)),t=$('#timer');t.textContent=[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':');t.classList.toggle('low',s<300);if(!s)finish(true)}
function draw(){const q=Q[cur];if(!q)return;$('#qno').textContent=`Soal ${cur+1} dari ${Q.length}`;$('#qtext').innerHTML=rich(q.soal);
 $('#opts').innerHTML=q.opsi.map(o=>`<button class="opt ${ans[q.id]==o.k?'sel':''}" data-k="${o.k}"><b>${o.k}</b><span>${rich(o.t)}</span></button>`).join('');
 $$('#opts .opt').forEach(b=>b.onclick=()=>{ans[q.id]=b.dataset.k;localStorage.setItem('a'+U.nis+U.cur,JSON.stringify(ans));draw()});
 $('#grid').innerHTML=Q.map((x,i)=>`<button class="${ans[x.id]?'done':''} ${i==cur?'cur':''}" data-i="${i}">${i+1}</button>`).join('');
 $$('#grid button').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;draw()});
 $('#prev').disabled=!cur;$('#next').disabled=cur==Q.length-1}
$('#prev').onclick=()=>{cur--;draw()};$('#next').onclick=()=>{cur++;draw()};
$('#finish').onclick=()=>finish(false);
async function finish(auto){const n=Q.filter(q=>!ans[q.id]).length;if(!auto&&!confirm(n?`Masih ada ${n} soal belum dijawab. Kirim sekarang?`:'Kirim jawaban dan akhiri ujian?'))return;
 clearInterval(tm);const r=await post({act:'submit',nis:U.nis,pw:U.pw,mapel:U.cur,jawab:ans});
 if(!r.ok){alert(r.msg+' — mencoba lagi...');tm=setInterval(()=>finish(true),5000);return}
 clearInterval(tm);inExam=0;alarmOff();localStorage.removeItem('a'+U.nis+U.cur);document.fullscreenElement&&document.exitFullscreen();
 U.mapel.forEach(m=>{if(m.kode==U.cur)m.done=true});menu('Jawaban berhasil dikirim. Terima kasih!')}

