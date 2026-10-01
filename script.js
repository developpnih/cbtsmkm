// ====== GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA ======
const API='GANTI_DENGAN_URL_WEB_APP';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const H={Siswa:['nis','nama','kelas','password','status','alarm','pelanggaran'],Mapel:['kode','nama','durasi','status','jenjang'],Soal:['id','mapel','soal','a','b','c','d','e','kunci','status'],Nilai:['nis','nama','kelas','mapel','benar','salah','nilai','waktu']};
const TPL={Siswa:['nis','nama','kelas','password'],Mapel:['kode','nama','durasi','jenjang'],Soal:['mapel','soal','a','b','c','d','e','kunci']};
const EX={Siswa:['1001','Budi Santoso','X-1','abc123'],Mapel:['MTK-X','Matematika','90','X'],Soal:['MTK','2+3=?','4','5','6','7','8','B']};
const IM=/\[img:(https:\/\/[^\]\s]+)\]/g,rich=s=>esc(s).replace(IM,'<img class="qimg" src="$1" alt="gambar" draggable="false">');
let IMGN=0,IMGF=0;
const prog=t=>{let e=$('#prog');if(!e){e=document.createElement('div');e.id='prog';e.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:99px;z-index:50';document.body.append(e)}e.textContent=t;e.hidden=!t};
async function up(blob){try{const bm=await createImageBitmap(blob),k=Math.min(1,900/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);const r=await adm('a_img',{data:c.toDataURL('image/jpeg',.82).split(',')[1]});return r.ok?r.url:''}catch(e){return''}}
const post=async b=>{try{const r=await fetch(API,{method:'POST',body:JSON.stringify(b)});return await r.json()}catch(e){return{ok:0,msg:'Gagal terhubung ke server'}}};
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

// ---------- Admin ----------
let AD='',T='Siswa',D=[],ref;
$('#adminLink').onclick=async()=>{const p=prompt('Password admin');if(!p)return;const r=await post({act:'a_list',admin:p,name:'Mapel'});if(!r.ok)return alert(r.msg);AD=p;show('admin');tabs();tab('Siswa')};
$('#aout').onclick=()=>{AD='';clearInterval(ref);show('login')};
const adm=(act,o)=>post({act,admin:AD,...o});
function tabs(){$('#tabs').innerHTML=['Siswa','Mapel','Soal','Nilai','Kartu','Pengaturan'].map(t=>`<button data-t="${t}">${{Kartu:'Kartu Login',Mapel:'Mapel & Ujian'}[t]||t}</button>`).join('');$$('#tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.t))}
async function tab(t){T=t;clearInterval(ref);$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
 const isT=H[t],tl=$('#tools');$('#tbl').hidden=!isT;$('#cards').hidden=t!='Kartu';$('#fset').hidden=t!='Pengaturan';tl.innerHTML='';
 if(t=='Pengaturan'){$('#fset').sekolah.value=cfg.sekolah;$('#fset').logo.value=cfg.logo;return}
 if(t=='Kartu'){tl.innerHTML='<input id="fk" placeholder="Filter kelas (mis. X-1)" style="max-width:220px;margin:0"><button class="btn" onclick="print()">🖨 Cetak Kartu</button>';$('#fk').oninput=cards;await load('Siswa');return cards()}
 if(t=='Soal'){const mp=(await adm('a_list',{name:'Mapel'})).rows||[];tl.innerHTML=`<button class="btn" id="add">+ Tambah Manual</button><a class="btn ghost" href="template_soal.docx" download style="text-decoration:none">⬇ Template Word</a><select id="um" style="width:auto;margin:0">${mp.map(m=>`<option value="${esc(m.kode)}">${esc(m.kode)} – ${esc(m.nama)}</option>`).join('')}</select><label class="btn" style="margin:0">⬆ Upload Word (.docx)<input type="file" id="up" accept=".docx" hidden></label>`}
 else if(t!='Nilai')tl.innerHTML=`<button class="btn" id="add">+ Tambah</button><button class="btn ghost" id="tp">⬇ Template CSV</button><label class="btn ghost" style="margin:0">⬆ Upload CSV<input type="file" id="up" accept=".csv,.txt" hidden></label>`;
 else tl.innerHTML='<button class="btn ghost" id="dl">⬇ Unduh Nilai (CSV)</button>';
 if(t=='Siswa'){tl.innerHTML+='<button class="btn red" id="aoff">🔕 Matikan Semua Alarm</button>';$('#aoff').onclick=async()=>{await adm('a_alarmoff',{nis:'all'});load()};ref=setInterval(()=>load(),5000)}
 if(t=='Mapel')tl.insertAdjacentHTML('beforeend','<select id="bj" style="width:auto;margin:0"><option>ALL</option><option>X</option><option>XI</option><option>XII</option></select><button class="btn" id="bon">✔ Aktifkan</button><button class="btn red" id="boff">✖ Nonaktifkan</button>');
 tl.insertAdjacentHTML('beforeend','<input id="fq" placeholder="Cari..." style="max-width:200px;margin:0">');$('#fq').oninput=render;
 if($('#bon')){$('#bon').onclick=()=>bulk('aktif');$('#boff').onclick=()=>bulk('nonaktif')}
 if($('#add'))$('#add').onclick=()=>form();if($('#tp'))$('#tp').onclick=()=>dlcsv(`template_${t}.csv`,[TPL[t],EX[t]]);
 if($('#dl'))$('#dl').onclick=()=>dlcsv('nilai.csv',[H.Nilai,...D.map(r=>H.Nilai.map(k=>r[k]))]);
 if($('#up'))$('#up').onchange=imp;await load()}
async function load(n){const r=await adm('a_list',{name:n||T});if(!r.ok)return;D=r.rows;if(!n)render()}
function render(){const c=H[T],a=r=>{const k=H[T][0],b=[];
  if(T=='Nilai')return`<button class="btn sm red" data-a="reset" data-i="${r._i}">Reset</button>`;
  if(T=='Siswa'){b.push(`<button class="btn sm ghost" data-a="blk" data-i="${r._i}">${r.status=='blokir'?'Buka':'Blokir'}</button>`);if(String(r.alarm)=='1')b.push(`<button class="btn sm red" data-a="off" data-i="${r._i}">Matikan Alarm</button>`)}
  if(T=='Mapel'||T=='Soal')b.push(`<button class="btn sm ${r.status=='nonaktif'?'':'ghost'}" data-a="tog" data-i="${r._i}">${r.status=='nonaktif'?'Aktifkan':'Nonaktifkan'}</button>`);
  return b.join(' ')+` <button class="btn sm ghost" data-a="edit" data-i="${r._i}">Edit</button> <button class="btn sm red" data-a="del" data-i="${r._i}">Hapus</button>`};
 D.forEach((r,i)=>r._i=i);
 $('#tbl').innerHTML=`<table><tr>${c.map(x=>`<th>${x}</th>`).join('')}<th>Aksi</th></tr>${D.filter(r=>!($('#fq')?.value)||JSON.stringify(Object.values(r)).toLowerCase().includes($('#fq').value.toLowerCase())).map(r=>`<tr>${c.map(k=>`<td>${k=='alarm'?(String(r[k])=='1'?'<span class="tag r">ALARM</span>':'-'):k=='status'?`<span class="tag ${r[k]=='blokir'||r[k]=='nonaktif'?'r':''}">${esc(r[k]||'aktif')}</span>`:esc(r[k]).replace(IM,'🖼')}</td>`).join('')}<td>${a(r)}</td></tr>`).join('')||'<tr><td>Belum ada data</td></tr>'}</table>`;
 $$('#tbl [data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a,D[b.dataset.i]))}
async function act(a,r){const k=H[T][0];
 if(a=='edit')return form(r);
 if(a=='del'&&confirm('Hapus data ini?'))await adm('a_del',{name:T,obj:r});
 if(a=='reset'&&confirm('Reset nilai agar siswa bisa mengulang ujian ini?'))await adm('a_del',{name:'Nilai',obj:r});
 if(a=='tog')await adm('a_save',{name:T,obj:{[k]:r[k],status:r.status=='nonaktif'?'aktif':'nonaktif'}});
 if(a=='blk')await adm('a_save',{name:'Siswa',obj:{nis:r.nis,status:r.status=='blokir'?'aktif':'blokir'}});
 if(a=='off')await adm('a_alarmoff',{nis:r.nis});
 load()}
function form(r){const c=H[T],o=r||{};$('#dlg').innerHTML=`<form method="dialog" id="df"><h2>${r?'Edit':'Tambah'} ${T}</h2>${c.filter(k=>!['alarm','pelanggaran'].includes(k)&&!(T=='Soal'&&k=='id'&&!r)).map(k=>k=='soal'?`<label>${k}<textarea name="${k}" rows="3">${esc(o[k])}</textarea></label>`:k=='jenjang'?'<label>jenjang<select name="jenjang"><option>SEMUA</option><option>X</option><option>XI</option><option>XII</option></select></label>':k=='status'?`<label>status<select name="status"><option>aktif</option>${T=='Siswa'?'<option>blokir</option>':'<option>nonaktif</option>'}</select></label>`:`<label>${k}<input name="${k}" value="${esc(o[k])}" ${r&&k==c[0]?'readonly':''}></label>`).join('')}<div class="row"><button class="btn" value="ok">Simpan</button><button class="btn ghost" value="x" formnovalidate>Batal</button></div></form>`;
 const f=$('#df');if(f.status&&o.status)f.status.value=o.status;if(f.jenjang&&o.jenjang)f.jenjang.value=o.jenjang;if(T=='Soal'){['soal','a','b','c','d','e'].forEach(k=>f.elements[k]?.closest('label').insertAdjacentHTML('afterend',`<label class="btn sm ghost" style="margin:0 0 8px;display:inline-block">🖼 Sisipkan gambar ke ${k.toUpperCase()}<input type="file" accept="image/*" data-f="${k}" hidden></label>`));
  $$('#df [data-f]').forEach(i=>i.onchange=async()=>{const fl=i.files[0];if(!fl)return;prog('Mengunggah gambar...');const u=await up(fl);prog('');if(!u)return alert('Gagal mengunggah gambar');const el=f.elements[i.dataset.f];el.value=(el.value+' [img:'+u+']').trim()})}
 $('#dlg').showModal();
 f.onsubmit=async e=>{if(e.submitter.value!='ok')return;const ob={...o};new FormData(f).forEach((v,k)=>ob[k]=v);if(ob.kunci)ob.kunci=ob.kunci.toUpperCase();delete ob._i;await adm('a_save',{name:T,obj:ob});load()}}
$('#fset').onsubmit=async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));const r=await adm('a_cfg',{obj:o});if(o.admin)AD=o.admin;cfg.sekolah=o.sekolah;cfg.logo=o.logo;$('#sname').textContent=o.sekolah;if(o.logo)$$('.logo').forEach(i=>i.src=o.logo);alert(r.ok?'Tersimpan':r.msg)};
function cards(){const f=($('#fk')?.value||'').toLowerCase(),base=location.href.split('#')[0];
 $('#cards').innerHTML=D.filter(s=>!f||String(s.kelas).toLowerCase().includes(f)).map(s=>`<div class="kt"><img src="${esc(cfg.logo||$('.logo').src)}" alt=""><b>KARTU LOGIN UJIAN</b><p>${esc(cfg.sekolah)}</p><hr style="clear:both"><p>Nama: <b>${esc(s.nama)}</b></p><p>Kelas: ${esc(s.kelas)}</p><p>Username: <b>${esc(s.nis)}</b></p><p>Password: <b>${esc(s.password)}</b></p><p style="font-size:.7rem">${esc(base)}</p></div>`).join('')}
// CSV
function dlcsv(name,rows){const t='\uFEFF'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()}
function csv(t){t=t.replace(/^\uFEFF/,'');const d=t.split('\n')[0].includes(';')&&!t.split('\n')[0].includes(',')?';':',',R=[];let r=[],c='',q=0;
 for(let i=0;i<t.length;i++){const x=t[i];if(q){if(x=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=x}else if(x=='"')q=1;else if(x==d){r.push(c);c=''}else if(x=='\n'||x=='\r'){if(x=='\r'&&t[i+1]=='\n')i++;r.push(c);c='';R.push(r);r=[]}else c+=x}
 if(c||r.length){r.push(c);R.push(r)}return R.filter(r=>r.join('').trim())}
async function bulk(s){const j=$('#bj').value;if(confirm((s=='aktif'?'Aktifkan':'Nonaktifkan')+' semua ujian jenjang '+j+'?')){await adm('a_bulk',{jenjang:j,status:s});load()}}
async function docx(f){const z=await JSZip.loadAsync(await f.arrayBuffer()),X=async p=>new DOMParser().parseFromString(await z.file(p).async('string'),'application/xml'),d=await X('word/document.xml'),rl={},num={},W='http://schemas.openxmlformats.org/wordprocessingml/2006/main',RN='http://schemas.openxmlformats.org/officeDocument/2006/relationships',g=(n,t)=>[...n.getElementsByTagNameNS(W,t)],av=(n,a)=>n?n.getAttributeNS(W,a):null,cache={};
 try{[...(await X('word/_rels/document.xml.rels')).getElementsByTagName('Relationship')].forEach(r=>rl[r.getAttribute('Id')]=r.getAttribute('Target'))}catch(e){}
 try{const n=await X('word/numbering.xml'),ab={};g(n,'abstractNum').forEach(a=>{const o={};g(a,'lvl').forEach(l=>o[av(l,'ilvl')]=av(g(l,'numFmt')[0],'val'));ab[av(a,'abstractNumId')]=o});g(n,'num').forEach(m=>num[av(m,'numId')]=ab[av(g(m,'abstractNumId')[0],'val')]||{})}catch(e){}
 const img=async id=>{if(cache[id]!==undefined)return cache[id];const t=rl[id],e=t&&z.file('word/'+t.replace(/^\/?(word\/)?/,''));let u='';if(e){IMGN++;prog('Mengunggah gambar '+IMGN+'...');u=await up(await e.async('blob'))}if(!u)IMGF++;return cache[id]=u?'[img:'+u+']':''};
 const imgs=async(c,push)=>{const seen={};for(const e of c.getElementsByTagName('*')){if(e.localName=='blip'||e.localName=='imagedata'){const id=e.getAttributeNS(RN,'embed')||e.getAttributeNS(RN,'id');if(id&&!seen[id]){seen[id]=1;push(await img(id),false)}}}};
 const tbl=g(d,'tbl')[0],r0=tbl&&g(tbl,'tr')[0];
 if(r0&&/^no/i.test(((g(r0,'tc')[0]||{}).textContent||'').trim())){ // FORMAT TABEL
  const R=[];for(const tr of g(d,'tr')){const row=[];for(const tc of g(tr,'tc')){const ps=[];for(const p of g(tc,'p')){let s='';const push=x=>s+=x;for(const el of p.getElementsByTagName('*')){if(el.localName=='t')s+=el.textContent}await imgs(p,push);ps.push(s)}row.push(ps.join('\n').trim())}R.push(row)}return R}
 // FORMAT PARAGRAF: soal bernomor, opsi A-E, kunci = teks tebal / berwarna / stabilo
 const LET='ABCDE',SUP={},SUB={};[...'0123456789+-=()n'].forEach((c,i)=>SUP[c]='⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ'[i]);[...'0123456789+-=()'].forEach((c,i)=>SUB[c]='₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎'[i]);
 const mark=r=>{const rp=[...r.children].find(c=>c.localName=='rPr');if(!rp)return false;const e=n=>[...rp.children].find(c=>c.localName==n),b=e('b'),co=e('color'),h=e('highlight');
  if(b&&!['0','false','off'].includes(av(b,'val')))return true;if(h&&av(h,'val')!='none')return true;
  if(co){const c=(av(co,'val')||'').toLowerCase();if(/^[0-9a-f]{6}$/.test(c)){const [R,G,B]=[0,2,4].map(i=>parseInt(c.substr(i,2),16));if(!(R<90&&G<90&&B<90)&&!(R>230&&G>230&&B>230))return true}}return false};
 const Qs=[];let q=null;
 for(const p of [...g(d,'body')[0].children].filter(c=>c.localName=='p')){
  const ch=[],push=(s,m)=>{for(const c of s)ch.push({c,m})};
  const np=g(p,'numPr')[0],nid=np&&av(g(np,'numId')[0],'val'),lv=np&&(av(g(np,'ilvl')[0],'val')||'0'),fmt=nid&&nid!='0'?(num[nid]||{})[lv]:null;
  for(const r of g(p,'r')){const m=mark(r),va=av(g(r,'vertAlign')[0],'val');
   for(const c of r.children){if(c.localName=='t'){let s=c.textContent;if(va=='superscript')s=[...s].map(x=>SUP[x]||x).join('');else if(va=='subscript')s=[...s].map(x=>SUB[x]||x).join('');push(s,m)}
    else if(c.localName=='tab')push('\t',m);else if(c.localName=='br')push('\n',m);else if(c.localName!='rPr')await imgs(c,push)}}
  const text=ch.map(x=>x.c).join(''),T=text.trim();if(!T)continue;
  const tq=/^\s*\d{1,3}[.)]\s+/.exec(text);
  if(tq||fmt=='decimal'){q={s:[text.slice(tq?tq[0].length:0).trim()],o:{},n:0};Qs.push(q);continue}
  if(!q)continue;
  const lead=/^\s*([A-Ea-e])[.)]\s*/.exec(text),un=!lead&&!fmt,k=Object.keys(q.o).length;
  if(un&&!q.n){q.s.push(T);continue}
  if(un&&k>=4){q={s:[T],o:{},n:0};Qs.push(q);continue}
  const ord=Math.min(q.n++,4),sl=lead?lead[1].toUpperCase():LET[ord],from=lead?lead[0].length:0,mk=[],re=/(^|[^A-Za-z0-9])([A-Ea-e])[.)](?=\s|$|[(\d\-−√])/g;re.lastIndex=from;let m,pv=sl;
  while((m=re.exec(text))){const L=m[2].toUpperCase();if(L>pv){mk.push({L,at:m.index+m[1].length,end:m.index+m[0].length});pv=L}}
  const pcs=[{L:sl,a:from,b:mk.length?mk[0].at:text.length},...mk.map((x,i)=>({L:x.L,a:x.end,b:i+1<mk.length?mk[i+1].at:text.length}))];
  for(const pc of pcs){const seg=ch.slice(pc.a,pc.b),t=seg.map(x=>x.c).join('').replace(/\s+/g,' ').trim(),mm=seg.some(x=>x.m&&x.c.trim());if(!t)continue;const o=q.o[pc.L];q.o[pc.L]=o?{t:o.t+' '+t,m:o.m||mm}:{t,m:mm}}}
 return Qs.filter(q=>q.s.join('').trim()).map((q,i)=>{const ks=[...LET].filter(L=>q.o[L]&&q.o[L].m),n=Object.keys(q.o).length;return [String(i+1),q.s.join('\n'),...[...LET].map(L=>q.o[L]?q.o[L].t:''),ks.length==1&&n>1?ks[0]:'']})}
async function imp(e){const f=e.target.files[0];if(!f)return;let list;
 if(/\.docx$/i.test(f.name)){const m=$('#um')?.value;if(!m)return alert('Buat Mapel terlebih dahulu');let R;IMGN=IMGF=0;try{R=await docx(f);prog('')}catch(x){prog('');return alert('File tidak terbaca. Simpan sebagai .docx (bukan .doc) sesuai template.')}
  if(IMGF)alert(IMGF+' gambar gagal diproses (format tidak didukung, mis. EMF/WMF). Gunakan gambar PNG/JPG.');
  list=R.filter(r=>!/^no/i.test(r[0])&&r[1]).map(r=>({mapel:m,soal:r[1],a:r[2],b:r[3],c:r[4],d:r[5],e:r[6],kunci:(r[7]||'').toUpperCase().trim()}));
  const bad=list.filter(x=>!/^[A-E]$/.test(x.kunci)).length;if(bad&&!confirm(bad+' soal kunci jawabannya tidak valid (harus A-E). Tetap impor?'))return}
 else{const R=csv(await f.text()),h=R.shift().map(x=>x.trim().toLowerCase());list=R.map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))}
 if(!list.length)return alert('File kosong');
 const r=await adm('a_import',{name:T,list});alert(r.ok?`${r.n} data berhasil diimpor`:r.msg);e.target.value='';load()}
