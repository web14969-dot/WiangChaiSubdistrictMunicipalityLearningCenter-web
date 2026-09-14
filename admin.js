// DEMO ONLY: credentials are intentionally simple for the static prototype.
// Do not use real credentials here. Real authentication should be handled by a backend.
const DEMO_USER="admin", DEMO_PASS="Admin1234";
const loginView=document.getElementById('loginView'),app=document.getElementById('adminApp');
function isLogged(){return sessionStorage.getItem('wc_admin')==='1'}
function showApp(){loginView.classList.add('hidden');app.classList.remove('hidden');refreshAll()}
if(isLogged())showApp();

document.getElementById('loginForm').addEventListener('submit',e=>{
 e.preventDefault();
 if(document.getElementById('username').value===DEMO_USER && document.getElementById('password').value===DEMO_PASS){
   sessionStorage.setItem('wc_admin','1');showApp();
 }else document.getElementById('loginError').textContent='ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
});
document.getElementById('logoutBtn').onclick=()=>{sessionStorage.removeItem('wc_admin');location.reload()};
document.querySelectorAll('.sidebar nav button').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.sidebar nav button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));document.getElementById(btn.dataset.section).classList.add('active');
 document.querySelector('.sidebar').classList.remove('open');
});
document.getElementById('mobileMenu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');

function guests(){return JSON.parse(localStorage.getItem('wiangchaiGuests')||'[]')}
function refreshAll(){
 const g=guests();document.getElementById('guestCount').textContent=g.length;
 document.getElementById('signedCount').textContent=g.filter(x=>x.signature).length;
 const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
 const now=new Date(), counts=months.map((m,i)=>g.filter(x=>{const d=new Date(x.date);return !isNaN(d)&&d.getMonth()===i}).length);
 document.getElementById('monthlyChart').innerHTML=counts.map((n,i)=>`<div class="bar" style="height:${Math.max(20,n*30)}px"><span>${n}</span></div>`).join('');
 renderGuests();
 document.getElementById('recentGuests').innerHTML=g.slice(0,5).map(x=>`<p><b>${esc(x.name)}</b><br><small>${esc(x.org||'')} · ${esc(x.date)}</small></p>`).join('')||'<p>ยังไม่มีข้อมูล</p>';
}
function renderGuests(){
 const q=(document.getElementById('guestSearch')?.value||'').toLowerCase();
 const g=guests().filter(x=>(x.name+' '+(x.org||'')+' '+x.message).toLowerCase().includes(q));
 document.getElementById('guestTable').innerHTML=g.map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.name)}</b></td><td>${esc(x.org||'-')}</td><td>${esc(x.message)}</td><td>${x.signature?`<img class="sig" src="${x.signature}">`:'-'}</td></tr>`).join('')||'<tr><td colspan="5">ไม่พบข้อมูล</td></tr>';
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function printHTML(title,body){const area=document.getElementById('printArea');area.innerHTML=`<div class="print-title"><b>${title}</b><br><small>ศูนย์เรียนรู้ฯ เทศบาลตำบลเวียงชัย · ${new Date().toLocaleString('th-TH')}</small></div>${body}`;window.print()}
function exportGuestsPDF(){const g=guests();printHTML('รายงานสมุดเยี่ยมชม',`<table><thead><tr><th>วันที่</th><th>ชื่อ</th><th>หน่วยงาน</th><th>ข้อความ</th></tr></thead><tbody>${g.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${esc(x.org||'-')}</td><td>${esc(x.message)}</td></tr>`).join('')}</tbody></table>`)}
function exportDashboardPDF(){const g=guests();printHTML('รายงานแดชบอร์ดศูนย์เรียนรู้ฯ',`<p>ผู้เยี่ยมชมทั้งหมด: <b>${g.length}</b> ราย</p><p>รายการมีลายเซ็น: <b>${g.filter(x=>x.signature).length}</b> ราย</p><p>ฐานการเรียนรู้: <b>13</b> ฐาน</p><p>การจัดสรรพื้นที่: 30% แหล่งน้ำ / 30% นาข้าว / 30% พืชสวนพืชไร่ / 10% ที่อยู่อาศัยและอื่น ๆ</p>`)}
function downloadGuestsCSV(){const rows=[['วันที่','ชื่อ','หน่วยงาน','ข้อความ'],...guests().map(x=>[x.date,x.name,x.org||'',x.message])];const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='guestbook.csv';a.click()}
function clearGuests(){if(confirm('ล้างข้อมูลตัวอย่างสมุดเยี่ยมชมจากเบราว์เซอร์นี้หรือไม่?')){localStorage.removeItem('wiangchaiGuests');refreshAll()}}
