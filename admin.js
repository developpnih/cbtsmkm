// ====== HALAMAN ADMIN (butuh config.js & JSZip) ======
// ====== PANEL ADMIN CBT ======
const H={Nilai:['nis','nama','kelas','mapel','benar','salah','nilai','waktu']};
const TPL={Kelas:['nama'],Siswa:['nis','nama','kelas','password','ruang'],Ruang:['ruang','password'],Mapel:['kode','nama','durasi','kelas']};
const EX={Kelas:[['X TSM 1'],['X TSM 2'],['X PSPT']],Siswa:[['1001','Budi Santoso','X TSM 1','abc123','R1']],Ruang:[['R1','pengawas1'],['R2','pengawas2']],Mapel:[['MTK-X','Matematika','90','X'],['PKK-TSM','Produktif TSM','90','X TSM 1;X TSM 2']]};
const K={Ruang:'ruang',Kelas:'nama',Siswa:'nis',Mapel:'kode',Soal:'id'},TL={Ruang:'Ruang',Kelas:'Kelas',Siswa:'Siswa',Mapel:'Mapel / Ujian',Soal:'Soal'};
const COLS={Ruang:['ruang','password','_siswa'],Kelas:['nama','_siswa'],Siswa:['nis','nama','kelas','ruang','password','status','pelanggaran','alarm'],Mapel:['kode','nama','durasi','jadwal','kelas','_soal','status'],Soal:['_no','soal','kunci','status'],Nilai:['nis','nama','kelas','mapel','benar','salah','nilai','waktu']};
const LB={ruang:'Ruang',_siswa:'Jml Siswa',nis:'NIS',nama:'Nama',kelas:'Kelas',password:'Password',status:'Status',pelanggaran:'Pelanggaran',alarm:'Alarm',kode:'Kode',jadwal:'Jadwal Mulai',durasi:'Durasi (mnt)',_soal:'Jml Soal',_no:'No',soal:'Soal',kunci:'Kunci',mapel:'Mapel',benar:'Benar',salah:'Salah',nilai:'Nilai',waktu:'Waktu'};
const FD={
 Ruang:[['ruang','Nama Ruang = Username pengawas (contoh: R1)'],['password','Password pengawas ruang']],
 Kelas:[['nama','Nama Kelas (contoh: X TSM 1)']],
 Siswa:[['nis','NIS / Username'],['nama','Nama Lengkap'],['kelas','Kelas (pilih / ketik)','kls'],['ruang','Ruang ujian (pilih / ketik)','rg'],['password','Password'],['status','Status','sel:aktif,blokir']],
 Mapel:[['kode','Kode (contoh: MTK-X)'],['nama','Nama Mapel / Ujian'],['durasi','Durasi (menit)','num'],['jadwal','Jadwal mulai (kosongkan = bebas kapan saja). Siswa yang terlambat otomatis dikurangi durasinya','dt'],['kelas','','kelas'],['status','Status','sel:aktif,nonaktif']],
 Soal:[['soal','Soal','img'],['a','Opsi A','img'],['b','Opsi B','img'],['c','Opsi C','img'],['d','Opsi D','img'],['e','Opsi E (kosongkan jika hanya 4 opsi)','imgopt'],['kunci','Kunci Jawaban','sel:A,B,C,D,E'],['status','Status','sel:aktif,nonaktif']]};
const NAV=[['dash','📊','Dashboard'],['Kelas','🏫','Data Kelas'],['Siswa','👥','Data Siswa'],['Ruang','🚪','Ruang & Pengawas'],['Mapel','📚','Mapel & Ujian'],['Soal','📝','Bank Soal'],['Nilai','🏆','Nilai'],['kartu','🪪','Kartu Login'],['set','⚙️','Pengaturan']];
let AD=sessionStorage.getItem('adm')||'',T='',V='',D=[],SIS=[],MP=[],MC={},KL=[],ref;
const adm=(act,o)=>post({act,admin:AD,...o});
const CA={},CT={},NEED={dash:['Siswa','Mapel','Soal','Nilai'],Kelas:['Kelas','Siswa'],Ruang:['Ruang','Siswa'],Siswa:['Siswa','Ruang'],Mapel:['Mapel','Soal'],Soal:['Soal','Mapel'],Nilai:['Nilai','Mapel'],kartu:['Siswa'],set:[]};
async function ld(ns,q){const r=await post({act:'a_multi',admin:AD,names:ns},q);if(!r.ok)return false;ns.forEach(n=>{CA[n]=r.data[n]||[];CT[n]=Date.now();if(n=='Mapel')CA[n].forEach(x=>{if(x.kelas===undefined)x.kelas=x.jenjang})});return true}
const L=async n=>{if(!CA[n])await ld([n]);return CA[n]||[]};
async function bg(ns){ns=ns.filter(n=>Date.now()-(CT[n]||0)>8000);if(!ns.length)return;const o=JSON.stringify(ns.map(n=>CA[n]));if(await ld(ns,1)&&JSON.stringify(ns.map(n=>CA[n]))!=o&&!$('#dlg').open)go(V,1)}
function mc(){MC={};(CA.Soal||[]).forEach(x=>MC[x.mapel]=(MC[x.mapel]||0)+(x.status=='nonaktif'?0:1))}
function ui(){if(CA.Siswa)SIS=CA.Siswa;if(CA.Mapel)MP=CA.Mapel;mc();if($('#tbl')&&CA[T]){D=CA[T];draw()}else if(V=='dash')vDash()}
async function mut(n,act,o,fn,ex={}){const bak=CA[n];if(fn)CA[n]=fn((bak||[]).map(x=>({...x})));ui();
 const r=await adm(act,{name:n,obj:o,...ex});if(!r.ok){CA[n]=bak;ui();alert(r.msg||'Gagal menyimpan, coba lagi')}else setTimeout(()=>{CT[n]=0;bg([n])},2500);return r}
const norm=s=>String(s??'').toUpperCase().replace(/[\s\-_]+/g,' ').trim();
const alarmN=s=>s.filter(x=>String(x.alarm)=='1');
let PA=-1,AC;const unlockA=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}};document.addEventListener('click',unlockA,{once:true});
const beep=()=>{if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.frequency.value=880;g.gain.value=.25;o.start();setTimeout(()=>o.stop(),500)}catch(e){}};

// ---------- Login & navigasi ----------
let GB=0;const gl=async()=>{if(GB)return;GB=1;unlockA();const b=$('#gf button');b.disabled=true;b.textContent='Memeriksa...';$('#gmsg').textContent='';await enter($('#gp').value);GB=0;b.disabled=false;b.textContent='Masuk'};
$('#gf').onsubmit=e=>{e.preventDefault();gl()};$('#gp').onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();gl()}};
$('#out').onclick=()=>{sessionStorage.removeItem('adm');location.reload()};
$('#burger').onclick=()=>$('#side').classList.toggle('open');
$('#alert').onclick=()=>go('Siswa');
if(AD)enter(AD);
async function enter(p){const r=await post({act:'a_multi',admin:p,names:['Kelas','Ruang','Siswa','Mapel','Soal','Nilai']});
 if(!r.ok){sessionStorage.removeItem('adm');$('#gate').hidden=false;$('#gmsg').textContent=r.msg||'';return}
 Object.keys(r.data).forEach(n=>{CA[n]=r.data[n];CT[n]=Date.now()});(CA.Mapel||[]).forEach(x=>{if(x.kelas===undefined)x.kelas=x.jenjang});AD=p;sessionStorage.setItem('adm',p);$('#gate').hidden=true;$('#app').hidden=false;
 post({act:'cfg'},1).then(c=>{if(c.ok){$('#bn').textContent=c.sekolah||'CBT';if(c.logo)$('#blogo').src=c.logo}});
 $('#nav').innerHTML=NAV.map(([k,i,l])=>`<button data-v="${k}"><span>${i}</span>${esc(l)}<em id="bd-${k}" hidden></em></button>`).join('');
 $$('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));go('dash');setInterval(poll,5000);document.addEventListener('visibilitychange',()=>!document.hidden&&poll())}
function go(v,s){if(s){if(V!=v)return;if(['Siswa','Kelas','Mapel','Soal','Nilai'].includes(v)){if($('#tbl')){D=CA[v]||[];SIS=CA.Siswa||SIS;MP=CA.Mapel||MP;mc();draw()}}else if(v=='dash')vDash();return}
 V=v;clearInterval(ref);$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));$('#title').textContent=NAV.find(n=>n[0]==v)[2];$('#side').classList.remove('open');if(!(NEED[v]||[]).every(n=>CA[n]))$('#view').innerHTML='<p class="muted">Memuat...</p>';({dash:vDash,kartu:vKartu,set:vSet}[v]||(()=>vTable(v)))();bg(NEED[v]||[])}
async function poll(){if(document.hidden||!AD||!await ld(['Siswa'],1))return;const s=CA.Siswa;if(!s.length)return;SIS=s;const n=alarmN(s).length,b=$('#bd-Siswa');if(n>PA&&PA>=0)beep();PA=n;document.title=(n?'('+n+') 🔔 ':'')+'Admin CBT';b.hidden=!n;b.textContent=n;$('#alert').hidden=!n;$('#alert').textContent='🔔 '+n+' siswa membunyikan alarm — klik untuk melihat';
 if(V=='dash')dashAlarm();else if(V=='Siswa'){D=s;draw()}}

// ---------- Dashboard ----------
async function vDash(){const[s,m,q,n]=await Promise.all(['Siswa','Mapel','Soal','Nilai'].map(L));SIS=s;
 const c={},d={};q.forEach(x=>c[x.mapel]=(c[x.mapel]||0)+(x.status=='nonaktif'?0:1));n.forEach(x=>d[x.mapel]=(d[x.mapel]||0)+1);
 const st=(i,v,l)=>`<div class="stat"><i>${i}</i><div><b>${v}</b><span>${l}</span></div></div>`;
 $('#view').innerHTML=`<div class="stats">${st('👥',s.length,'Siswa')}${st('📚',m.filter(x=>x.status=='aktif').length+' / '+m.length,'Ujian aktif')}${st('📝',q.length,'Bank soal')}${st('✅',n.length,'Ujian selesai')}${st('🚫',s.filter(x=>x.status=='blokir').length,'Siswa diblokir')}</div>
 <div class="panel"><h3>🔔 Alarm Aktif</h3><div id="alp"></div></div>
 <div class="panel"><h3>Ringkasan Ujian</h3><div class="tw"><table><thead><tr><th>Kode</th><th>Nama</th><th>Untuk Kelas</th><th>Soal</th><th>Selesai</th><th>Status</th></tr></thead><tbody>${m.map(x=>`<tr><td>${esc(x.kode)}</td><td>${esc(x.nama)}</td><td>${kt(x.kelas)}</td><td>${c[x.kode]||0}</td><td>${d[x.kode]||0}</td><td><span class="tag ${x.status=='aktif'?'g':'r'}">${esc(x.status)}</span></td></tr>`).join('')||'<tr><td>Belum ada mapel</td></tr>'}</tbody></table></div></div>`;dashAlarm()}
function dashAlarm(){const a=alarmN(SIS),e=$('#alp');if(!e)return;e.innerHTML=a.length?`<div class="tw"><table><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Pelanggaran</th><th></th></tr>${a.map(x=>`<tr><td>${esc(x.nis)}</td><td>${esc(x.nama)}</td><td>${esc(x.kelas)}</td><td>${esc(x.pelanggaran)}</td><td><button class="btn sm red" data-n="${esc(x.nis)}">🔕 Matikan Alarm</button></td></tr>`).join('')}</table></div>`:'<p class="muted">Tidak ada alarm aktif.</p>';
 $$('#alp [data-n]').forEach(b=>b.onclick=()=>{b.disabled=true;mut('Siswa','a_alarmoff',null,l=>l.map(x=>x.nis==b.dataset.n?{...x,alarm:0}:x),{nis:b.dataset.n})})}
const isoOff=v=>{const d=new Date(v),o=-d.getTimezoneOffset(),a=Math.abs(o),p=n=>String(n).padStart(2,'0');return v+':00'+(o<0?'-':'+')+p(Math.floor(a/60))+':'+p(a%60)},
 toLocal=i=>{const d=i?new Date(i):null;return d&&!isNaN(d)?new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16):''},
 fmtJ=i=>{const d=new Date(i);return isNaN(d)?esc(i):d.toLocaleString('id-ID',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).replace('.',':')};
const kn=x=>{const n=norm(x);return n=='SEMUA'?'Semua kelas':/^(XII|XI|X)$/.test(n)?'Semua kelas '+n:x};
const kt=k=>String(k||'SEMUA').split(',').map(x=>`<span class="tag">${esc(kn(x.trim()))}</span>`).join(' ');

// ---------- Tabel Siswa / Mapel / Soal / Nilai ----------
const bar=h=>`<div class="panel"><div class="tools">${h}</div><div id="tbl" class="tw"></div><div class="cnt" id="cnt"></div></div>`;
const kopt=()=>'<option value="">Semua kelas</option>'+[...new Set(D.map(r=>r.kelas).filter(Boolean))].sort().map(k=>`<option>${esc(k)}</option>`).join('');
async function vTable(t){T=t;D=await L(t);if(t=='Siswa')SIS=D;if(t=='Kelas'||t=='Ruang')SIS=await L('Siswa');
 if(t=='Mapel'){await L('Soal');mc()}
 if(t=='Soal'||t=='Nilai')MP=await L('Mapel');
 const S='<input id="fq" placeholder="🔍 Cari..." class="grow">',A='<button class="btn" id="add">＋ Tambah</button>',C='<button class="btn ghost" id="tp">⬇ Template CSV</button><label class="btn ghost">⬆ Upload CSV<input type="file" id="up" accept=".csv,.txt" hidden></label>',
  mo=MP.map(m=>`<option value="${esc(m.kode)}">${esc(m.kode)} – ${esc(m.nama)}</option>`).join('');
 $('#view').innerHTML=bar({Ruang:`${A}${C}${S}`,Kelas:`${A}${C}<button class="btn ghost" id="sync">⟳ Ambil dari Data Siswa</button>${S}`,Siswa:`${A}${C}<button class="btn ghost" id="setrg">🚪 Atur Ruang (yang tampil)</button><button class="btn red" id="aoff">🔕 Matikan Semua Alarm</button><select id="fk">${kopt()}</select>${S}`,
  Mapel:`${A}${C}<button class="btn ghost" id="bon">✔ Aktifkan Semua</button><button class="btn ghost" id="boff">✖ Nonaktifkan Semua</button>${S}`,
  Soal:`<select id="um">${mo}</select>${A.replace('Tambah','Tambah Manual')}<button class="btn ghost" id="ek">🎯 Atur Kelas Tujuan</button><a class="btn ghost" href="template_soal.docx" download>⬇ Template Word</a><label class="btn">⬆ Upload Word (.docx)<input type="file" id="up" accept=".docx" hidden></label>${S}`,
  Nilai:`<select id="fm"><option value="">Semua ujian</option>${mo}</select><select id="fk">${kopt()}</select><button class="btn ghost" id="dl">⬇ Unduh CSV</button>${S}`}[t]);
 ['fq','fk','um','fm'].forEach(i=>$('#'+i)&&($('#'+i).oninput=draw));
 const on=(i,f)=>$('#'+i)&&($('#'+i).onclick=f);
 on('add',()=>{if(t=='Soal'&&!$('#um').value)return alert('Buat Mapel / Ujian terlebih dahulu');form()});
 on('tp',()=>dlcsv(`template_${t}.csv`,[TPL[t],...EX[t]]));if($('#up'))$('#up').onchange=imp;
 on('setrg',()=>{const q=($('#fq')?.value||'').toLowerCase(),fk=$('#fk')?.value,rs=D.filter(r=>(!q||JSON.stringify(Object.values(r)).toLowerCase().includes(q))&&(!fk||String(r.kelas)==fk));if(!rs.length)return alert('Tidak ada siswa yang tampil');const rg=prompt('Nama ruang untuk '+rs.length+' siswa yang sedang tampil (contoh: R1). Kosongkan untuk menghapus ruang.','');if(rg===null)return;const set=new Set(rs.map(x=>String(x.nis))),v=rg.trim();mut('Siswa','a_setruang',null,l=>l.map(x=>set.has(String(x.nis))?{...x,ruang:v}:x),{list:[...set],ruang:v})});
 on('aoff',()=>mut('Siswa','a_alarmoff',null,l=>l.map(x=>({...x,alarm:0})),{nis:'all'}));on('sync',async()=>{const have=new Set(D.map(x=>norm(x.nama))),nw=[...new Set(SIS.map(s=>String(s.kelas||'').trim()).filter(k=>k&&!have.has(norm(k))))];if(!nw.length)return alert('Semua kelas dari data siswa sudah ada.');for(const k of nw)await mut('Kelas','a_save',{nama:k},l=>l.concat({nama:k}))});on('bon',()=>bulk('aktif'));on('boff',()=>bulk('nonaktif'));
 on('ek',()=>{const m=MP.find(x=>x.kode==$('#um').value);m?form(m,'Mapel'):alert('Belum ada mapel')});
 on('dl',()=>dlcsv('nilai.csv',[H.Nilai,...D.map(r=>H.Nilai.map(k=>r[k]))]));
 draw()}
async function load(){await ld([T],1);D=CA[T]||[];if(T=='Siswa')SIS=D;draw()}
function bulk(s){if(confirm((s=='aktif'?'Aktifkan':'Nonaktifkan')+' semua ujian?'))mut('Mapel','a_bulk',null,l=>l.map(x=>({...x,status:s})),{status:s})}
function cell(k,r,j){const v=r[k];
 if(k=='_no')return j+1;if(k=='_siswa')return SIS.filter(s=>T=='Ruang'?String(s.ruang||'').toUpperCase().replace(/[^A-Z0-9]/g,'')==String(r.ruang||'').toUpperCase().replace(/[^A-Z0-9]/g,''):norm(s.kelas)==norm(r.nama)).length;if(k=='_soal')return MC[r.kode]||0;
 if(k=='status')return `<span class="tag ${v=='blokir'||v=='nonaktif'?'r':'g'}">${esc(v||'aktif')}</span>`;
 if(k=='alarm')return String(v)=='1'?'<span class="tag r">ALARM</span>':'–';
 if(k=='kelas'&&T=='Mapel')return kt(v);
 if(k=='jadwal')return v?esc(fmtJ(v)):'<span class="muted">Bebas</span>';
 if(k=='soal')return esc(v).replace(IM,'🖼');return esc(v)}
const acts=r=>{const b=[],i=r._i,x=(a,l,c)=>`<button class="btn sm ${c}" data-a="${a}" data-i="${i}">${l}</button>`;
 if(T=='Nilai')return x('reset','Reset','red');
 if(T=='Siswa'){b.push(x('blk',r.status=='blokir'?'Buka Akses':'Blokir','ghost'));if(String(r.alarm)=='1')b.push(x('off','🔕 Matikan','red'))}
 else if(T!='Kelas'&&T!='Ruang')b.push(x('tog',r.status=='nonaktif'?'Aktifkan':'Nonaktifkan',r.status=='nonaktif'?'':'ghost'));
 if(T!='Kelas')b.push(x('edit','Edit','ghost'));b.push(x('del','Hapus','red'));return b.join(' ')};
function draw(){const c=COLS[T],q=($('#fq')?.value||'').toLowerCase(),fk=$('#fk')?.value,um=$('#um')?.value,fm=$('#fm')?.value;if(!$('#tbl'))return;
 D.forEach((r,i)=>r._i=i);
 const rs=D.filter(r=>(!q||JSON.stringify(Object.values(r)).toLowerCase().includes(q))&&(!fk||String(r.kelas)==fk)&&(T!='Soal'||r.mapel==um)&&(T!='Nilai'||!fm||r.mapel==fm));
 $('#tbl').innerHTML=`<table><thead><tr>${c.map(k=>`<th>${LB[k]||k}</th>`).join('')}${T=='Nilai'?'<th></th>':'<th>Aksi</th>'}</tr></thead><tbody>${rs.map((r,j)=>`<tr>${c.map(k=>`<td class="${k=='soal'?'q':''}">${cell(k,r,j)}</td>`).join('')}<td>${acts(r)}</td></tr>`).join('')||`<tr><td colspan="${c.length+1}" class="muted">Belum ada data</td></tr>`}</tbody></table>`;
 let n=rs.length+' data';if(T=='Soal'){const m=MP.find(x=>x.kode==um);n+=m?` · Ujian: ${m.nama} · Untuk kelas: ${String(m.kelas||'SEMUA').split(',').map(kn).join(', ')}`:' · Belum ada mapel'}$('#cnt').textContent=n;
 $$('#tbl [data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a,D[b.dataset.i]))}
async function act(a,r){const k=K[T],ns=r.status=='nonaktif'||r.status=='blokir'?'aktif':(T=='Siswa'?'blokir':'nonaktif');
 if(a=='edit')return form(r);
 if(a=='del'&&confirm('Hapus data ini?'))await mut(T,'a_del',r,l=>l.filter(x=>x[k]!=r[k]));
 if(a=='reset'&&confirm('Reset nilai agar siswa bisa mengulang ujian ini?'))await mut('Nilai','a_del',r,l=>l.filter(x=>!(x.nis==r.nis&&x.mapel==r.mapel)));
 if(a=='tog')await mut(T,'a_save',{[k]:r[k],status:ns},l=>l.map(x=>x[k]==r[k]?{...x,status:ns}:x));
 if(a=='blk')await mut('Siswa','a_save',{nis:r.nis,status:ns},l=>l.map(x=>x.nis==r.nis?{...x,status:ns}:x));
 if(a=='off')await mut('Siswa','a_alarmoff',null,l=>l.map(x=>x.nis==r.nis?{...x,alarm:0}:x),{nis:r.nis})}

// ---------- Form tambah/edit ----------
async function form(r,t=T){const o=r||{},fd=FD[t];let kp='';
 if(t=='Siswa')await L('Ruang');
 if(t=='Mapel'||t=='Siswa'){KL=[...new Set([...(await L('Kelas')).map(x=>x.nama),...(SIS.length?SIS:(SIS=await L('Siswa'))).map(s=>s.kelas)].map(x=>String(x||'').trim()).filter(Boolean))].sort()}
 if(t=='Mapel'){const cur=String(o.kelas||'SEMUA').split(',').map(norm).filter(Boolean),extra=cur.filter(c=>!['SEMUA','X','XI','XII'].includes(c)&&!KL.some(k=>norm(k)==c)),
   chk=(v,l)=>`<label class="chk"><input type="checkbox" name="kel" value="${esc(v)}" ${cur.includes(norm(v))?'checked':''}>${esc(l||v)}</label>`;
  kp=`<div class="kp"><b>Ujian / soal ini untuk kelas:</b><div class="kg"><small>Semua</small>${chk('SEMUA','Semua kelas')}</div><div class="kg"><small>Semua kelas per jenjang</small>${['X','XI','XII'].map(x=>chk(x,'Semua kelas '+x)).join('')}</div><div class="kg"><small>Per kelas (tambah kelas lewat menu Data Kelas)</small>${KL.concat(extra).map(k=>chk(k)).join('')||'<i class="muted">Belum ada kelas. Tambahkan di menu Data Kelas.</i>'}</div></div>`}
 const fld=([k,l,ty=''])=>{const v=o[k]??'';
  if(ty=='dt')return `<label>${l}<input type="datetime-local" name="${k}" value="${toLocal(v)}"></label>`;
  if(ty=='kelas')return kp;
  if(ty=='rg')return `<label>${l}<input name="${k}" value="${esc(v)}" list="rl" autocomplete="off"></label><datalist id="rl">${(CA.Ruang||[]).map(x=>`<option value="${esc(x.ruang)}">`).join('')}</datalist>`;
  if(ty=='kls')return `<label>${l}<input name="${k}" value="${esc(v)}" list="kl" autocomplete="off" required></label><datalist id="kl">${KL.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`;
  if(ty.startsWith('sel:')){const op=ty.slice(4).split(',');return `<label>${l}<select name="${k}">${op.map(x=>`<option ${(v||op[0])==x?'selected':''}>${x}</option>`).join('')}</select></label>`}
  if(ty.startsWith('img'))return `<label>${l}<textarea name="${k}" rows="${k=='soal'?4:2}" ${ty=='img'?'required':''}>${esc(v)}</textarea></label><label class="btn sm ghost imgb">🖼 Sisipkan gambar<input type="file" accept="image/*" data-f="${k}" hidden></label>`;
  return `<label>${l}<input name="${k}" value="${esc(v)}" ${r&&K[t]==k?'readonly':''} ${ty=='num'?'type="number" min="1"':''} required></label>`};
 $('#dlg').innerHTML=`<form method="dialog" id="df"><h3>${r?'Edit':'Tambah'} ${TL[t]}</h3>${fd.map(fld).join('')}<div class="end"><button class="btn ghost" value="x" formnovalidate>Batal</button><button class="btn" value="ok">Simpan</button></div></form>`;
 const f=$('#df');
 f.addEventListener('change',e=>{if(e.target.name!='kel'||!e.target.checked)return;[...f.querySelectorAll('[name=kel]')].forEach(x=>{if(x!==e.target&&(e.target.value=='SEMUA'||x.value=='SEMUA'))x.checked=false})});
 $$('#df [data-f]').forEach(i=>i.onchange=async()=>{const fl=i.files[0];if(!fl)return;prog('Mengunggah gambar...');const u=await up(fl);prog('');if(!u)return alert('Gagal mengunggah gambar');const el=f.elements[i.dataset.f];el.value=(el.value+' [img:'+u+']').trim()});
 $('#dlg').showModal();
 f.onsubmit=async e=>{if(e.submitter.value!='ok')return;const ob={...o};new FormData(f).forEach((v,k)=>{if(k!='kel'&&k!='extra')ob[k]=v});if(t=='Mapel')ob.jadwal=ob.jadwal?isoOff(ob.jadwal):'';
  if(t=='Mapel'){let ks=[...f.querySelectorAll('[name=kel]:checked')].map(x=>x.value);if(!ks.length||ks.includes('SEMUA'))ks=['SEMUA'];ob.kelas=ks.join(',')}
  if(t=='Soal')ob.mapel=o.mapel||$('#um').value;
  delete ob._i;const key=K[t];if(t=='Soal'&&!ob.id)ob.id=Math.random().toString(36).slice(2,10);if(t=='Siswa'){if(r){delete ob.alarm;delete ob.pelanggaran}else{ob.alarm=0;ob.pelanggaran=0}}
  mut(t,'a_save',ob,l=>{const i=l.findIndex(x=>String(x[key])==String(ob[key]));if(i>=0)l[i]={...l[i],...ob};else l.push({...ob});return l})}}

// ---------- Kartu login ----------
async function vKartu(){SIS=await L('Siswa');D=SIS;
 $('#view').innerHTML=`<div class="panel noprint"><div class="tools"><select id="fk">${kopt()}</select><button class="btn" id="pr">🖨 Cetak Kartu</button><span class="muted">Pilih kelas lalu cetak.</span></div></div><div id="cards"></div>`;
 const base=location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/,''),sn=$('#bn').textContent,lg=$('#blogo').src;
 const rd=()=>{const f=$('#fk').value;$('#cards').innerHTML=SIS.filter(s=>!f||s.kelas==f).map(s=>`<div class="kt"><img src="${esc(lg)}" alt=""><b>KARTU LOGIN UJIAN</b><p>${esc(sn)}</p><hr style="clear:both"><p>Nama: <b>${esc(s.nama)}</b></p><p>Kelas: ${esc(s.kelas)}</p>${s.ruang?`<p>Ruang: <b>${esc(s.ruang)}</b></p>`:''}<p>Username: <b>${esc(s.nis)}</b></p><p>Password: <b>${esc(s.password)}</b></p><p style="font-size:.7rem;word-break:break-all">${esc(base)}</p></div>`).join('')};
 $('#fk').onchange=rd;$('#pr').onclick=()=>print();rd()}

// ---------- Pengaturan ----------
async function vSet(){const c=await post({act:'cfg'});
 $('#view').innerHTML=`<form class="panel" id="fset" style="max-width:520px"><h3>Pengaturan Sekolah</h3><label>Nama Sekolah<input name="sekolah" value="${esc(c.sekolah)}"></label><label>URL Logo (link gambar langsung)<input name="logo" value="${esc(c.logo)}"></label><label>Password Admin Baru (kosongkan jika tidak diganti)<input name="admin" type="password" autocomplete="new-password"></label><button class="btn">Simpan</button></form>`;
 $('#fset').onsubmit=async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target)),r=await adm('a_cfg',{obj:o});if(!r.ok)return alert(r.msg);if(o.admin){AD=o.admin;sessionStorage.setItem('adm',AD)}$('#bn').textContent=o.sekolah||'CBT';if(o.logo)$('#blogo').src=o.logo;alert('Tersimpan')}}

// ---------- CSV, Word & impor ----------
let IMGN=0,IMGF=0;
const prog=t=>{let e=$('#prog');if(!e){e=document.createElement('div');e.id='prog';e.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:99px;z-index:50';document.body.append(e)}e.textContent=t;e.hidden=!t};
async function up(blob){try{const bm=await createImageBitmap(blob),k=Math.min(1,900/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);const r=await adm('a_img',{data:c.toDataURL('image/jpeg',.82).split(',')[1]});return r.ok?r.url:''}catch(e){return''}}
function dlcsv(name,rows){const t='\uFEFF'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()}
function csv(t){t=t.replace(/^\uFEFF/,'');const d=t.split('\n')[0].includes(';')&&!t.split('\n')[0].includes(',')?';':',',R=[];let r=[],c='',q=0;
 for(let i=0;i<t.length;i++){const x=t[i];if(q){if(x=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=x}else if(x=='"')q=1;else if(x==d){r.push(c);c=''}else if(x=='\n'||x=='\r'){if(x=='\r'&&t[i+1]=='\n')i++;r.push(c);c='';R.push(r);r=[]}else c+=x}
 if(c||r.length){r.push(c);R.push(r)}return R.filter(r=>r.join('').trim())}
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
