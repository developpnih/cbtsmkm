// ===== Daftar Hadir & Berita Acara (dipakai halaman admin dan pengawas; butuh config.js) =====
const DOC={tok:0};
const wib=ms=>{const d=new Date(ms),f=o=>new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',...o}).format(d);return{hari:f({weekday:'long'}),tgl:f({day:'numeric'}),bln:f({month:'numeric'}),blnNama:f({month:'long'}),thn:f({year:'numeric'}),jam:f({hour:'2-digit',minute:'2-digit',hour12:false}).replace('.',':')}};
const SAT=['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan'],tb2=n=>n<10?SAT[n]:n==10?'sepuluh':n==11?'sebelas':n<20?SAT[n-10]+' belas':SAT[Math.floor(n/10)]+' puluh'+(n%10?' '+SAT[n%10]:''),
 tahunTb=y=>+y>=2000&&+y<2100?'dua ribu'+(y%100?' '+tb2(y%100):''):String(y);
const rng=a=>{a=[...a];if(!a.length)return '-';if(!a.every(x=>/^\d+$/.test(String(x))))return a.join(', ');a=a.map(Number).sort((p,q)=>p-q);const o=[];let s=a[0],p=a[0];for(let i=1;i<=a.length;i++){if(a[i]==p+1){p=a[i];continue}o.push(s==p?s:s+'-'+p);s=p=a[i]}return o.join(', ')};
const inp=(k,l,v,t)=>`<label>${l}${t=='ta'?`<textarea name="${k}" rows="3">${esc(v)}</textarea>`:`<input name="${k}" value="${esc(v)}">`}</label>`;
DOC.dlg=()=>{let d=$('#ddlg');if(!d){d=document.createElement('dialog');d.id='ddlg';document.body.append(d)}return d};
DOC.print=async html=>{let p=$('#pa');if(!p){p=document.createElement('div');p.id='pa';document.body.append(p)}p.innerHTML=html;
 await Promise.race([Promise.all([...p.querySelectorAll('img')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))),new Promise(r=>setTimeout(r,2500))]);
 document.body.classList.add('printing');window.onafterprint=()=>{document.body.classList.remove('printing');p.innerHTML=''};setTimeout(()=>window.print(),60)};
DOC.kop=c=>{const L=s=>String(s||'').split('\n').filter(Boolean).map(esc).join('<br>'),lg=u=>u?`<img src="${esc(u)}" alt="">`:'<span class="lgs"></span>';
 return `<div class="kop">${lg(c.logo)}<div class="kt"><div>${L(c.kop1)}</div><div class="kn">${esc(c.kop2||c.sekolah||'')}</div><div>${esc(c.kop3||'')}</div><div>${esc(c.kop4||'')}</div>${c.kop5?`<div>Website : ${esc(c.kop5)}</div>`:''}${c.kop6?`<div>Email : ${esc(c.kop6)}</div>`:''}</div>${lg(c.logo2)}</div><div class="gr"></div>`};

// ---------- Daftar hadir (format tanda tangan) ----------
DOC.hd=(d,ruang)=>{const c=d.cfg||{},m=d.mapel,w=wib(m.jd||Date.now()),e=m.jd?wib(m.jd+m.durasi*6e4):null;
 return{j1:'DAFTAR HADIR PESERTA',j2:c.judulHadir2||'PENILAIAN SUMATIF AKHIR SEMESTER GASAL',j3:c.judulHadir3||'TAHUN '+w.thn,kab:c.kab||'',kodeKab:c.kodeKab||'',sekolah:c.sekolah||'',kodeSek:c.kodeSekolah||'',ruang,sesi:'1',hari:w.hari,tanggal:`${w.tgl} ${w.blnNama} ${w.thn}`,pukul:m.jd?`${w.jam}-${e.jam}`:'',proktor:'',nipP:'',pengawas:'',nipW:'',
  notes:'Dibuat rangkap 3 (tiga), masing-masing untuk sekolah, panitia dan arsip.\nPengawas ruang menyilang Nama Peserta yang tidak hadir.\nDaftar hadir diserahkan kepada panitia ujian.',...(d.hd||{})}};
DOC.hdForm=(ctx,ruang,mapel,d,done)=>{const s=DOC.hd(d,ruang),dl=DOC.dlg();
 dl.innerHTML=`<form method="dialog" id="hf"><h3>Judul & Data Cetak Daftar Hadir</h3>${[['j1','Judul baris 1'],['j2','Judul baris 2'],['j3','Judul baris 3'],['kab','Kota/Kabupaten'],['kodeKab','Kode Kota/Kab'],['sekolah','Sekolah/Madrasah'],['kodeSek','Kode Sekolah'],['ruang','ID Server / Ruang'],['sesi','Sesi'],['hari','Hari'],['tanggal','Tanggal'],['pukul','Pukul'],['proktor','Nama Pengawas 1'],['nipP','NIP Pengawas 1'],['pengawas','Nama Pengawas 2'],['nipW','NIP Pengawas 2']].map(([k,l])=>inp(k,l,s[k])).join('')}${inp('notes','Keterangan di bawah tabel (satu baris per poin)',s.notes,'ta')}<div class="row" style="justify-content:flex-end"><button class="btn ghost" value="x" formnovalidate>Batal</button><button class="btn" value="ok">Simpan</button></div></form>`;
 dl.showModal();$('#hf').onsubmit=async e=>{if(e.submitter.value!='ok')return;const o=Object.fromEntries(new FormData($('#hf')));const r=await ctx.save(ruang,mapel,'hd',o);if(!r.ok)alert(r.msg);done()}};
DOC.printHadir=async(ctx,ruang,mapel)=>{const d=await ctx.get(ruang,mapel,1);if(!d.ok)return alert(d.msg);const s=DOC.hd(d,ruang),c=d.cfg||{},S=d.siswa,H=S.filter(x=>x.hadir).length;
 const rows=S.map((x,i)=>`<tr><td class="c">${i+1}</td><td>${esc(x.nis)}</td><td>${esc(x.nama)}</td><td class="c">${esc(x.kelas)}</td><td class="c">${esc(x.nilai)}</td><td class="tt ${i%2?'r':'l'}">${x.img?`<img src="data:image/png;base64,${x.img}">`:(x.hadir?`${i+1}.`:'')}</td><td>${esc(x.ket||(x.hadir?'':'Tidak hadir'))}</td></tr>`).join('');
 DOC.print(`<div class="pg hdp"><div class="hh">${c.logo?`<img src="${esc(c.logo)}" alt="">`:'<span class="lgs"></span>'}<div class="ht"><b>${esc(s.j1)}</b><b>${esc(s.j2)}</b><b>${esc(s.j3)}</b></div>${c.logo2?`<img src="${esc(c.logo2)}" alt="">`:'<span class="lgs"></span>'}</div>
 <table class="inf"><tr><td>KOTA/KABUPATEN</td><td>:</td><td class="u">${esc(s.kab)}</td><td>KODE</td><td>:</td><td class="u">${esc(s.kodeKab)}</td></tr><tr><td>SEKOLAH/MADRASAH</td><td>:</td><td class="u">${esc(s.sekolah)}</td><td>KODE</td><td>:</td><td class="u">${esc(s.kodeSek)}</td></tr>
 <tr><td>ID SERVER / RUANG</td><td>:</td><td class="u">${esc(s.ruang)}</td><td>SESI</td><td>:</td><td class="u">${esc(s.sesi)}</td></tr><tr><td>HARI</td><td>:</td><td class="u">${esc(s.hari)} &nbsp; TANGGAL : ${esc(s.tanggal)}</td><td>PUKUL</td><td>:</td><td class="u">${esc(s.pukul)}</td></tr></table>
 <p class="mp">Mata Pelajaran: <b>${esc(d.mapel.nama)}</b></p>
 <table class="tb"><tr><th style="width:30px">No.</th><th style="width:100px">Username</th><th>Nama Peserta</th><th style="width:62px">Kelas</th><th style="width:42px">Nilai</th><th style="width:115px">Tanda Tangan</th><th style="width:90px">Keterangan</th></tr>${rows}</table>
 <div class="nt"><i>Keterangan :</i><ol>${String(s.notes||'').split('\n').filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>
 <div class="bt2"><table class="sum"><tr><td>Jumlah Peserta yang Seharusnya Hadir</td><td>:</td><td><b>${S.length}</b> peserta</td></tr><tr><td>Jumlah Peserta yang Tidak Hadir</td><td>:</td><td><b>${S.length-H}</b> peserta</td></tr><tr><td>Jumlah Peserta Hadir</td><td>:</td><td><b>${H}</b> peserta</td></tr></table>
 <div class="sg"><div>Pengawas 1<br><br><br><br>( ${esc(s.proktor)||'&nbsp;'.repeat(18)} )<br>NIP. ${esc(s.nipP)}</div><div>Pengawas 2<br><br><br><br>( ${esc(s.pengawas)||'&nbsp;'.repeat(18)} )<br>NIP. ${esc(s.nipW)}</div></div></div></div>`)};

// ---------- Berita acara ----------
DOC.baAuto=d=>{const S=d.siswa,H=S.filter(x=>x.hadir),T=S.filter(x=>!x.hadir);return{seharusnya:String(S.length),hadir:String(H.length),tidak:String(T.length),nmrHadir:rng(H.map(x=>x.nis)),nmrTidak:T.length?rng(T.map(x=>x.nis)):'-',kelas:[...new Set(S.map(x=>x.kelas))].join(', ')}};
DOC.baVal=(d,ruang)=>{const c=d.cfg||{},m=d.mapel,w=wib(m.jd||Date.now()),e=m.jd?wib(m.jd+m.durasi*6e4):null;
 return{judul2:c.judulBA2||'PENILAIAN SUMATIF AKHIR SEMESTER GASAL',judul3:c.judulBA3||'TAHUN PELAJARAN '+w.thn+'/'+(+w.thn+1),mapel:m.nama,hari:w.hari,tgl:w.tgl,bln:w.bln,thn:tahunTb(w.thn),kegiatan:'Sumatif Akhir Semester Ganjil',pukul:m.jd?w.jam.replace(':','.'):'',sampai:e?e.jam.replace(':','.'):'',sekolah:c.sekolah||'',ruang,alamat:c.kop4||'',...DOC.baAuto(d),catatan:'',p1:'',nbm1:'',p2:'',nbm2:'',...(d.ba||{})}};
const BAF=[['judul2','Judul baris 2'],['judul3','Judul baris 3'],['mapel','Mata Pelajaran'],['hari','Hari'],['tgl','Tanggal'],['bln','Bulan (angka)'],['thn','Tahun (terbilang)'],['kegiatan','Telah diselenggarakan'],['pukul','Pukul mulai'],['sampai','Sampai pukul'],['sekolah','Sekolah'],['ruang','Ruang'],['kelas','Kelas'],['alamat','Alamat'],['seharusnya','Peserta seharusnya'],['hadir','Peserta hadir'],['nmrHadir','Yakni nomor (hadir)'],['tidak','Peserta tidak hadir'],['nmrTidak','Yakni nomor (tidak hadir)'],['p1','Nama Pengawas I'],['nbm1','NBM Pengawas I'],['p2','Nama Pengawas II'],['nbm2','NBM Pengawas II']];
DOC.printBA=(d,b)=>{const c=d.cfg||{},f=t=>`<span class="f">${esc(t)||'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</span>`;
 DOC.print(`<div class="pg bap">${DOC.kop(c)}<div class="bj"><b>BERITA ACARA</b><b>${esc(b.judul2)}</b><b>${esc(b.judul3)}</b></div>
 <p>Mata Pelajaran : ${f(b.mapel)}</p><p>Pada hari ${f(b.hari)} tanggal ${f(b.tgl)} bulan ${f(b.bln)} tahun <i>${esc(b.thn)}</i></p>
 <p>a.&nbsp; Telah diselenggarakan ${esc(b.kegiatan)}</p><p class="i1">Pukul ${f(b.pukul)} Sampai pukul ${f(b.sampai)}, pada :</p>
 <table class="kv i1"><tr><td>Sekolah</td><td>: ${esc(b.sekolah)}</td></tr><tr><td>Ruang</td><td>: ${f(b.ruang)} &nbsp; Kelas : ${f(b.kelas)}</td></tr><tr><td>Alamat</td><td>: ${esc(b.alamat)}</td></tr>
 <tr><td>Jumlah peserta</td><td><table class="kv2"><tr><td>seharusnya</td><td>: ${f(b.seharusnya)} siswa</td></tr><tr><td>yang hadir</td><td>: ${f(b.hadir)} siswa</td></tr><tr><td>yakni nomor</td><td>: ${f(b.nmrHadir)}</td></tr><tr><td>yang tidak hadir</td><td>: ${f(b.tidak)} siswa</td></tr><tr><td>yakni nomor</td><td>: ${f(b.nmrTidak)}</td></tr></table></td></tr></table>
 <p>b.&nbsp; Catatan selama pelaksanaan : <span class="cat">${esc(b.catatan).replace(/\n/g,'<br>')||'&nbsp;'}</span></p><p class="i1"><i>Berita acara ini dibuat dengan sesungguhnya.</i></p>
 <div class="bs"><div>Pengawas I,<br><br><br><br><b>${esc(b.p1)||'.'.repeat(30)}</b><br>NBM. ${esc(b.nbm1)}</div><div>Yang Membuat Berita Acara<br>Pengawas II,<br><br><br><b>${esc(b.p2)||'.'.repeat(30)}</b><br>NBM. ${esc(b.nbm2)}</div></div></div>`)};

DOC.baDialog=async(ctx,ruang,mapel,done)=>{const d=await ctx.get(ruang,mapel,2);if(!d.ok)return alert(d.msg);const D=d,dl=DOC.dlg();
 const draw=over=>{const b={...DOC.baVal(D,ruang),...(over||{})};
  dl.innerHTML=`<form id="bdf" class="ba"><h3>Berita Acara · ${esc(ruang)} · ${esc(D.mapel.nama)}</h3><p class="muted">Terisi otomatis dari daftar hadir. Periksa dan ubah bila perlu.</p><div class="grid2">${BAF.map(([k,l])=>inp(k,l,b[k])).join('')}</div>${inp('catatan','Catatan selama pelaksanaan',b.catatan,'ta')}<div class="row" style="justify-content:flex-end"><button class="btn ghost" type="button" id="bdx">Tutup</button><button class="btn ghost" type="button" id="bdr">↻ Hitung Ulang</button><button class="btn ghost" type="button" id="bdp">🖨 Cetak</button><button class="btn" type="submit">💾 Simpan</button></div></form>`;
  const cur=()=>Object.fromEntries(new FormData($('#bdf')));
  $('#bdx').onclick=()=>dl.close();$('#bdr').onclick=()=>draw({...cur(),...DOC.baAuto(D)});
  $('#bdp').onclick=async()=>{const o=cur();await ctx.save(ruang,mapel,'ba',o);D.ba=o;done&&done();DOC.printBA(D,o)};
  $('#bdf').onsubmit=async e=>{e.preventDefault();const o=cur(),r=await ctx.save(ruang,mapel,'ba',o);if(!r.ok)return alert(r.msg);D.ba=o;dl.close();done&&done()}};
 draw();dl.showModal()};
// ---------- Tampilan (dipasang di admin & pengawas) ----------
DOC.mount=async(box,mode,ctx)=>{const tok=++DOC.tok;clearInterval(DOC.tm);box.innerHTML='<p class="muted">Memuat...</p>';
 const mp=(await ctx.mapels())||[];if(tok!=DOC.tok)return;
 if(!mp.length)return box.innerHTML='<div class="panel"><p class="muted">Belum ada mapel/ujian untuk ruang ini.</p></div>';
 box.innerHTML=`<div class="panel dk"><div class="row dkf">${ctx.ruangs.length>1?`<label>Ruang<select id="dr">${ctx.ruangs.map(r=>`<option>${esc(r)}</option>`).join('')}</select></label>`:`<input type="hidden" id="dr" value="${esc(ctx.ruangs[0]||'')}">`}<label>Mapel / Ujian<select id="dm">${mp.map(m=>`<option value="${esc(m.kode)}">${esc(m.nama)} (${esc(m.kode)})</option>`).join('')}</select></label><button class="btn ghost" id="dgo" type="button">↻ Muat</button></div><div id="dc"></div></div>`;
 let D=null;const R=()=>$('#dr').value,M=()=>$('#dm').value;
 const drawH=()=>{const S=D.siswa,H=S.filter(x=>x.hadir).length;
  $('#dc').innerHTML=`<div class="dsum"><span class="pill2">Seharusnya <b>${S.length}</b></span><span class="pill2 ok">Hadir <b>${H}</b></span><span class="pill2 bad">Belum/Tidak hadir <b>${S.length-H}</b></span></div>
  <div class="row"><button class="btn" id="dpr" type="button">🖨 Cetak Daftar Hadir (Tanda Tangan)</button><button class="btn ghost" id="dst" type="button">⚙ Judul & Data Cetak</button><button class="btn ghost" id="dcv" type="button">⬇ CSV</button></div>
  <div class="tw"><table><tr><th>No</th><th>Username</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Login</th><th>Nilai</th><th>TTD</th><th>Hadir manual</th><th>Keterangan</th></tr>${S.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.nis)}</td><td>${esc(x.nama)}</td><td>${esc(x.kelas)}</td><td>${x.hadir?'<span class="tag g">Hadir</span>':'<span class="tag r">Belum hadir</span>'}</td><td>${x.login?wib(x.login).jam:'-'}</td><td>${esc(x.nilai)||'-'}</td><td>${x.ttd?'✔':'—'}</td><td><input type="checkbox" data-m="${esc(x.nis)}" ${x.manual?'checked':''}></td><td><input data-k="${esc(x.nis)}" value="${esc(x.ket)}" placeholder="..." style="min-width:140px"></td></tr>`).join('')||'<tr><td colspan="10">Tidak ada siswa di ruang ini untuk ujian tersebut. Pastikan ruang & kelas tujuan ujian sudah diatur.</td></tr>'}</table></div>`;
  $$('#dc [data-k]').forEach(i=>i.onchange=()=>ctx.edit(R(),M(),i.dataset.k,{ket:i.value}));
  $$('#dc [data-m]').forEach(i=>i.onchange=async()=>{await ctx.edit(R(),M(),i.dataset.m,{manual:i.checked?1:0});load()});
  $('#dpr').onclick=()=>DOC.printHadir(ctx,R(),M());$('#dst').onclick=()=>DOC.hdForm(ctx,R(),M(),D,load);
  $('#dcv').onclick=()=>{const t='\uFEFF'+[['No','Username','Nama','Kelas','Status','Login','Nilai','TTD','Keterangan'],...S.map((x,i)=>[i+1,x.nis,x.nama,x.kelas,x.hadir?'Hadir':'Tidak hadir',x.login?wib(x.login).jam:'',x.nilai,x.ttd?'Ya':'',x.ket])].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=`daftar_hadir_${R()}_${M()}.csv`;a.click()}};
 const drawB=(over)=>{const b={...DOC.baVal(D,R()),...(over||{})};
  $('#dc').innerHTML=`<form id="bf" class="ba"><p class="muted">Data terisi otomatis dari daftar hadir. Periksa, ubah bila perlu, lalu simpan atau cetak.</p><div class="grid2">${BAF.map(([k,l])=>inp(k,l,b[k])).join('')}</div>${inp('catatan','Catatan selama pelaksanaan',b.catatan,'ta')}<div class="row"><button class="btn" type="submit">💾 Simpan</button><button class="btn ghost" type="button" id="bre">↻ Hitung Ulang Kehadiran</button><button class="btn ghost" type="button" id="bpr">🖨 Cetak Berita Acara</button></div></form>`;
  const cur=()=>Object.fromEntries(new FormData($('#bf')));
  $('#bf').onsubmit=async e=>{e.preventDefault();const r=await ctx.save(R(),M(),'ba',cur());if(r.ok){D.ba=cur();alert('Berita acara tersimpan')}else alert(r.msg)};
  $('#bre').onclick=()=>drawB({...cur(),...DOC.baAuto(D)});
  $('#bpr').onclick=async()=>{const o=cur();await ctx.save(R(),M(),'ba',o);D.ba=o;DOC.printBA(D,o)}};
 const load=async()=>{const d=await ctx.get(R(),M(),mode=='ba'?2:0);if(tok!=DOC.tok)return;if(!d.ok){$('#dc').innerHTML=`<p class="err">${esc(d.msg)}</p>`;return}D=d;mode=='hadir'?drawH():drawB()};
 $('#dgo').onclick=load;$('#dr').onchange=$('#dm').onchange=load;await load();
 if(mode=='hadir')DOC.tm=setInterval(()=>{if(!$('#dc')){clearInterval(DOC.tm);return}if(tok!=DOC.tok||document.hidden)return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName)&&$('#dc').contains(a))return;load()},10000)};
