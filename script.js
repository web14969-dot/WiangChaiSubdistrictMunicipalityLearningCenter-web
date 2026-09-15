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

const GUEST_API_URL='https://script.google.com/macros/s/AKfycbzj3LmnjvCFQbWj9loPdf4PXhqzdS2ilDFVjDt7YNn9h4d_zlO-wYKSJTCTGOKtibdOdQ/exec';
const guestForm=document.getElementById('guestForm');
const guestList=document.getElementById('guestList');
const status=document.getElementById('guestStatus');
const guestName=document.getElementById('guestName');
const guestOrg=document.getElementById('guestOrg');
const guestMessage=document.getElementById('guestMessage');

function renderGuests(){
  guestList.innerHTML='<div class="guest-entry">กำลังโหลดข้อมูล...</div>';

  const callbackName='guestCallback_'+Date.now();

  window[callbackName]=function(response){
    try{
      if(!response || !response.success){
        throw new Error('โหลดข้อมูลไม่สำเร็จ');
      }

      const data=response.data||[];

      guestList.innerHTML=data.length
      ? data.map(x=>`
        <div class="guest-entry">
          <b>${escapeHtml(x.name)}</b>
          <small>${escapeHtml(x.organization||'')} · ${escapeHtml(x.date)}</small>
          <p>${escapeHtml(x.message||'')}</p>
          ${x.signature
            ? `<img class="signature-preview" src="${x.signature}" alt="ลายเซ็น">`
            : ''}
        </div>
      `).join('')
      : '<div class="guest-entry">ยังไม่มีรายการเยี่ยมชม</div>';

    }catch(error){
      console.error(error);
      guestList.innerHTML='<div class="guest-entry">ไม่สามารถโหลดข้อมูลได้</div>';
    }

    delete window[callbackName];
    const script=document.getElementById(callbackName);
    if(script) script.remove();
  };

  const script=document.createElement('script');
  script.id=callbackName;
  script.src=
    GUEST_API_URL+
    '?action=guests&callback='+callbackName;

  document.body.appendChild(script);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[m]));
}

guestForm.addEventListener('submit',async e=>{
  e.preventDefault();

  const guestData={
    name:guestName.value.trim(),
    organization:guestOrg.value.trim(),
    message:guestMessage.value.trim(),
    signature:hasSignature ? canvas.toDataURL('image/png') : ''
  };

 status.textContent='บันทึกข้อมูลแล้ว กำลังส่งเข้าระบบ...';

fetch(GUEST_API_URL,{
  method:'POST',
  mode:'no-cors',
  headers:{
    'Content-Type':'text/plain;charset=utf-8'
  },
  body:JSON.stringify(guestData)
}).catch(error=>{
  console.error('ส่งข้อมูลไม่สำเร็จ:',error);
});

    const data=JSON.parse(localStorage.getItem('wiangchaiGuests')||'[]');

    data.unshift({
      name:guestData.name,
      org:guestData.organization,
      message:guestData.message,
      date:new Date().toLocaleDateString('th-TH'),
      signature:guestData.signature
    });

    localStorage.setItem(
      'wiangchaiGuests',
      JSON.stringify(data.slice(0,30))
    );

    guestForm.reset();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    hasSignature=false;
    renderGuests();

  }catch(error){
    console.error(error);
    status.textContent='ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
  }
});

renderGuests();
