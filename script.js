const nav=document.getElementById('mainNav'),toggle=document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

let slideIndex=0;
const slides=document.querySelectorAll('.slide');
function showSlide(i){slideIndex=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===slideIndex))}
function changeSlide(dir){showSlide(slideIndex+dir)}
setInterval(()=>changeSlide(1),5000);

document.getElementById('year').textContent=new Date().getFullYear();
const topBtn=document.getElementById('topBtn');
window.addEventListener('scroll',()=>topBtn.style.display=scrollY>500?'block':'none');
topBtn.onclick=()=>scrollTo({top:0,behavior:'smooth'});

const canvas=document.getElementById('signature'),ctx=canvas.getContext('2d');
ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#183126';
let drawing=false,hasSignature=false;
function point(e){const r=canvas.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*canvas.width/r.width,y:(p.clientY-r.top)*canvas.height/r.height}}
function start(e){drawing=true;hasSignature=true;const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}
function move(e){if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}
function end(){drawing=false}
canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
document.getElementById('clearSign').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasSignature=false};

const guestForm=document.getElementById('guestForm'),guestList=document.getElementById('guestList'),status=document.getElementById('guestStatus');
function renderGuests(){
  const data=JSON.parse(localStorage.getItem('wiangchaiGuests')||'[]');
  guestList.innerHTML=data.length?data.map(x=>`<div class="guest-entry"><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.org||'')} · ${escapeHtml(x.date)}</small><p>${escapeHtml(x.message)}</p>${x.signature?`<img class="signature-preview" src="${x.signature}" alt="ลายเซ็น">`:''}</div>`).join(''):'<div class="guest-entry">ยังไม่มีรายการเยี่ยมชม</div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
guestForm.addEventListener('submit',e=>{
  e.preventDefault();
  const data=JSON.parse(localStorage.getItem('wiangchaiGuests')||'[]');
  data.unshift({name:guestName.value,org:guestOrg.value,message:guestMessage.value,date:new Date().toLocaleDateString('th-TH'),signature:hasSignature?canvas.toDataURL('image/png'):''});
  localStorage.setItem('wiangchaiGuests',JSON.stringify(data.slice(0,30)));
  status.textContent='บันทึกข้อมูลในเครื่องนี้แล้ว (โหมดตัวอย่าง)';
  guestForm.reset();ctx.clearRect(0,0,canvas.width,canvas.height);hasSignature=false;renderGuests();
});
renderGuests();
