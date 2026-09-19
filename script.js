 // ===============================
// เมนูมือถือ
// ===============================
const mainNav = document.getElementById('mainNav');
const toggle = document.querySelector('.menu-toggle');

if (toggle && mainNav) {
  toggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  document.querySelectorAll('.nav a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });
}


// ===============================
// Slideshow
// ===============================
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
  if (!slides.length) return;

  slideIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === slideIndex);
  });
}

function changeSlide(direction) {
  showSlide(slideIndex + direction);
}

if (slides.length) {
  showSlide(0);
  setInterval(() => {
    showSlide(slideIndex + 1);
  }, 5000);
}


// ===============================
// ปีปัจจุบัน
// ===============================
const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ===============================
// ปุ่มกลับขึ้นด้านบน
// ===============================
const topBtn = document.getElementById('topBtn');

if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.style.display = window.scrollY > 500 ? 'block' : 'none';
  });

  topBtn.onclick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
}


// ===============================
// ระบบลายเซ็น
// ===============================
const canvas = document.getElementById('signature');

let ctx = null;
let drawing = false;
let hasSignature = false;

if (canvas) {
  ctx = canvas.getContext('2d');

  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';

  // สำคัญสำหรับมือถือ/แท็บเล็ต
  canvas.style.touchAction = 'none';

  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    e.preventDefault();

    drawing = true;
    hasSignature = true;

    const p = getPoint(e);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (error) {}
  }

  function draw(e) {
    if (!drawing) return;

    e.preventDefault();

    const p = getPoint(e);

    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw(e) {
    if (!drawing) return;

    drawing = false;

    try {
      if (e && e.pointerId !== undefined) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (error) {}
  }

  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointercancel', endDraw);
  canvas.addEventListener('pointerleave', () => {
    if (drawing) {
      drawing = false;
    }
  });
}


// ===============================
// ล้างลายเซ็น
// ===============================
const clearSign = document.getElementById('clearSign');

if (clearSign && canvas && ctx) {
  clearSign.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
  });
}


// ===============================
// Google Apps Script
// ===============================
const GUEST_API_URL =
  'https://script.google.com/macros/s/AKfycbzj3LmnjvCFQbWj9loPdf4PXhqzdS2ilDFVjDt7YNn9h4d_zlO-wYKSJTCTGOKtibdOdQ/exec';

const guestForm = document.getElementById('guestForm');
const guestList = document.getElementById('guestList');
const status = document.getElementById('guestStatus');

const guestName = document.getElementById('guestName');
const guestOrg = document.getElementById('guestOrg');
const guestMessage = document.getElementById('guestMessage');


// ===============================
// ป้องกัน HTML แปลกปลอม
// ===============================
function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ===============================
// แสดงสมุดเยี่ยมชม
// ===============================
function renderGuests(guests) {

  if (!guestList) return;

  if (!guests || guests.length === 0) {
    guestList.innerHTML =
      '<div class="guest-entry">ยังไม่มีข้อมูลผู้เยี่ยมชม</div>';
    return;
  }

  guestList.innerHTML = guests.map((guest, index) => {

    const name = guest.name || guest.ชื่อ || '';
    const org =
      guest.org ||
      guest.organization ||
      guest.หน่วยงาน ||
      '';

    const message =
      guest.message ||
      guest.ข้อความ ||
      '';

    const date =
      guest.date ||
      guest.วันที่ ||
      '';

    const signature =
      guest.signature ||
      guest.ลายเซ็น ||
      '';

    return `
      <div class="guest-entry">

        <div class="guest-number">
          #${index + 1}
        </div>

        <div class="guest-info">
          <strong>${escapeHTML(name)}</strong>

          ${
            org
              ? `<div class="guest-org">${escapeHTML(org)}</div>`
              : ''
          }

          ${
            message
              ? `<div class="guest-message">${escapeHTML(message)}</div>`
              : ''
          }

          ${
            date
              ? `<div class="guest-date">${escapeHTML(date)}</div>`
              : ''
          }

          ${
            signature
              ? `<img src="${signature}" class="guest-signature" alt="ลายเซ็น">`
              : ''
          }

        </div>

      </div>
    `;
  }).join('');
}


// ===============================
// โหลดข้อมูลจากเครื่อง
// ===============================
function loadLocalGuests() {

  try {
    const saved = JSON.parse(
      localStorage.getItem('guestbook') || '[]'
    );

    renderGuests(saved);

    return saved;

  } catch (error) {

    console.error('อ่านข้อมูลในเครื่องไม่ได้:', error);

    renderGuests([]);

    return [];
  }
}


// ===============================
// บันทึกข้อมูลลงเครื่อง
// ===============================
function saveLocalGuest(guestData) {

  try {

    let guests = JSON.parse(
      localStorage.getItem('guestbook') || '[]'
    );

    guests.unshift(guestData);

    // เก็บล่าสุดไม่เกิน 50 รายการ
    guests = guests.slice(0, 50);

    localStorage.setItem(
      'guestbook',
      JSON.stringify(guests)
    );

    renderGuests(guests);

  } catch (error) {

    console.error('บันทึกข้อมูลในเครื่องไม่ได้:', error);
  }
}


// ===============================
// โหลดข้อมูลจาก Google Sheets
// แบบ JSONP
// ===============================
function loadGuestsFromServer() {

  const callbackName =
    'guestCallback_' + Date.now();

  const script = document.createElement('script');

  let finished = false;

  function cleanup() {

    if (finished) return;

    finished = true;

    try {
      delete window[callbackName];
    } catch (error) {}

    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  window[callbackName] = function(response) {

    try {

      if (
        response &&
        response.success &&
        Array.isArray(response.data)
      ) {

        const serverGuests =
          response.data.map(item => ({
            id: item.id || '',
            date: item.date || '',
            name: item.name || '',
            org: item.organization || '',
            message: item.message || '',
            signature: ''
          }));

        if (response.success) {

          localStorage.setItem(
            'guestbook',
            JSON.stringify(serverGuests)
          );

          renderGuests(serverGuests);
        }
      }

    } catch (error) {

      console.error(
        'ประมวลผลข้อมูลจากเซิร์ฟเวอร์ไม่ได้:',
        error
      );

    } finally {

      cleanup();
    }
  };

  script.src =
    GUEST_API_URL +
    '?action=guests&callback=' +
    callbackName +
    '&t=' +
    Date.now();

  script.onerror = function() {

    console.warn(
      'ไม่สามารถโหลดข้อมูลสมุดเยี่ยมชมจากเซิร์ฟเวอร์ได้'
    );

    cleanup();
  };

  document.body.appendChild(script);

  // ไม่ปล่อยให้การโหลดเซิร์ฟเวอร์ค้างจนทำให้เว็บใช้งานไม่ได้
  setTimeout(cleanup, 10000);
}


// ===============================
// ส่งแบบฟอร์มสมุดเยี่ยมชม
// ===============================
if (guestForm) {

  guestForm.addEventListener('submit', function(e) {

    e.preventDefault();

    const name =
      guestName ? guestName.value.trim() : '';

    const org =
      guestOrg ? guestOrg.value.trim() : '';

    const message =
      guestMessage ? guestMessage.value.trim() : '';

    if (!name) {

      if (status) {
        status.textContent =
          'กรุณากรอกชื่อ';
      }

      if (guestName) {
        guestName.focus();
      }

      return;
    }

    if (!message) {

      if (status) {
        status.textContent =
          'กรุณากรอกข้อความ';
      }

      if (guestMessage) {
        guestMessage.focus();
      }

      return;
    }


    // เอาลายเซ็นจาก Canvas
    let signature = '';

    if (canvas && hasSignature) {
      signature = canvas.toDataURL('image/png');
    }


    const guestData = {

      id: Date.now(),

      date: new Date().toLocaleString(
        'th-TH',
        {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      ),

      name: name,

      org: org,

      message: message,

      signature: signature
    };


    // ===============================
    // แสดงผลทันที
    // ไม่ต้องรอ Google
    // ===============================
    saveLocalGuest(guestData);


    if (status) {
      status.textContent =
        '✓ บันทึกข้อมูลแล้ว กำลังส่งเข้าระบบ...';
    }


    // ===============================
    // ส่ง Google Sheets แบบเบื้องหลัง
    // ===============================
    fetch(GUEST_API_URL, {

      method: 'POST',

      mode: 'no-cors',

      headers: {
        'Content-Type':
          'text/plain;charset=utf-8'
      },

      body: JSON.stringify(guestData)

    }).then(() => {

      if (status) {
        status.textContent =
          '✓ บันทึกสมุดเยี่ยมชมเรียบร้อยแล้ว';
      }

    }).catch(error => {

      console.error(
        'ส่งข้อมูลไป Google Sheets ไม่สำเร็จ:',
        error
      );

      // ข้อมูลยังอยู่ในเครื่อง
      if (status) {
        status.textContent =
          '✓ บันทึกข้อมูลแล้ว';
      }
    });


    // ===============================
    // ล้างแบบฟอร์มทันที
    // ===============================
    guestForm.reset();

    if (canvas && ctx) {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      hasSignature = false;
    }

  });
}


// ===============================
// เริ่มต้นระบบ
// ===============================
loadLocalGuests();

// โหลดจาก Google Sheets แบบเบื้องหลัง
setTimeout(() => {
  loadGuestsFromServer();
}, 500);
// ========================================
// ระบบข่าว / กิจกรรม
// ========================================

function loadNewsFromServer() {
  const newsList = document.getElementById('newsList');

  if (!newsList) return;

  const callbackName = 'showNews_' + Date.now();

  window[callbackName] = function(response) {
    try {
      if (!response || !response.success) {
        newsList.innerHTML = '<p>ไม่สามารถโหลดข่าวได้</p>';
        return;
      }

      const news = response.data || [];

      const publishedNews = news.filter(item => {
        return item.status === 'เผยแพร่';
      });

      if (publishedNews.length === 0) {
        newsList.innerHTML = '<p>ยังไม่มีข่าวหรือกิจกรรม</p>';
        return;
      }

      newsList.innerHTML = publishedNews.map(item => {
        return `
          <article class="news-card">
            <div class="news-image">
            &{item.image1 ?`<img src="${escapeNewsHTML(item.image1)}" alt="ภาพข่าว">` : '📰'}
</div>
            <div>
              <small>${formatNewsDate(item.date)}</small>
              <h3>${escapeNewsHTML(item.title)}</h3>
              <p>${escapeNewsHTML(item.detail)}</p>
            </div>
          </article>
        `;
      }).join('');

    } catch (error) {
      console.error('โหลดข่าวไม่สำเร็จ:', error);
      newsList.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข่าว</p>';
    } finally {
      delete window[callbackName];
      const script = document.getElementById(callbackName);

      if (script) {
        script.remove();
      }
    }
  };

  const script = document.createElement('script');

  script.id = callbackName;

  script.src =
    GUEST_API_URL +
    '?action=news&callback=' +
    callbackName +
'&t=' +
Date.now();

  script.onerror = function() {
    newsList.innerHTML = '<p>ไม่สามารถเชื่อมต่อระบบข่าวได้</p>';

    delete window[callbackName];
    script.remove();
  };

  document.body.appendChild(script);
}

function formatNewsDate(dateValue) {
  if (!dateValue) return '';

  let value = String(dateValue);

  // Google Apps Script ส่งวันที่ พ.ศ. มาในรูปแบบ ISO
  // เช่น 2569-09-15T17:00:00.000Z
  // JavaScript จะมอง 2569 เป็น ค.ศ.
  // จึงต้องแปลงกลับเป็น ค.ศ. ก่อน
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);

  if (match) {
    const year = Number(match[1]);

    if (year > 2400) {
      value =
        (year - 543) +
        '-' +
        match[2] +
        '-' +
        match[3] +
        match[4];
    }
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  });
}


// ป้องกันข้อความข่าวทำให้ HTML เสีย
function escapeNewsHTML(text) {
  if (text === null || text === undefined) {
    return '';
  }

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
// โหลดข่าวเมื่อเปิดเว็บไซต์
loadNewsFromServer();
