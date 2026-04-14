
const DEFAULT_STATE = {
  systemStatus: 'active',
  alertCount: 2,
  detectedCount: 18,
  current: {
    distance: '2.5',
    angle: '45',
    type: 'إنسان',
    risk: 'متوسط',
    zone: 'البوابة الرئيسية',
    recommendation: 'يفضّل التوجه عبر المسار الجنوبي المضاء.'
  },
  alerts: [
    { time: '22:14', title: 'حركة غير معتادة قرب البوابة الرئيسية', level: 'danger', zone: 'البوابة الرئيسية', action: 'تم اقتراح مسار بديل وإرسال تنبيه مرئي.' },
    { time: '22:10', title: 'جسم متحرك قرب المسار الشمالي', level: 'warn', zone: 'المسار الشمالي', action: 'المراقبة مستمرة مع تحذير متوسط.' },
    { time: '22:06', title: 'المنطقة الجنوبية آمنة', level: 'safe', zone: 'الممر الجنوبي', action: 'تم اعتمادها كمسار آمن.' }
  ]
};

const RADAR_TARGETS = [
  { angle: 28, distance: 2.1, type: 'حيوان', risk: 'مرتفع', zone: 'المسار الشمالي', label: 'كلب قريب' },
  { angle: 45, distance: 2.5, type: 'إنسان', risk: 'متوسط', zone: 'البوابة الرئيسية', label: 'شخص متحرك' },
  { angle: 74, distance: 3.9, type: 'جسم', risk: 'منخفض', zone: 'المكتبة المركزية', label: 'جسم ثابت' },
  { angle: 112, distance: 2.8, type: 'إنسان', risk: 'متوسط', zone: 'موقف السيارات', label: 'مرور قريب' },
  { angle: 142, distance: 4.3, type: 'حيوان', risk: 'منخفض', zone: 'المدخل الجانبي', label: 'حركة بعيدة' }
];

const STATE_KEY = 'safepath-ai-state-v1';

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefaultState(),
      ...parsed,
      current: { ...DEFAULT_STATE.current, ...(parsed.current || {}) },
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : JSON.parse(JSON.stringify(DEFAULT_STATE.alerts))
    };
  } catch (error) {
    return cloneDefaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    // ignore storage errors in file mode
  }
}

let appState = loadState();

function riskClassFromArabic(level) {
  if (level === 'مرتفع') return 'danger';
  if (level === 'متوسط') return 'warn';
  return 'safe';
}

function levelLabel(className) {
  if (className === 'danger') return 'خطر مرتفع';
  if (className === 'warn') return 'خطر متوسط';
  return 'آمن';
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setHTML(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.innerHTML = value;
  });
}

function applyStatusVisuals() {
  const statusText = appState.systemStatus === 'danger' ? 'خطر مكتشف' : 'النظام نشط';
  setText('[data-system-status-text]', statusText);
  const dotClass = appState.systemStatus === 'danger' ? 'danger' : 'safe';
  document.querySelectorAll('[data-system-status-dot]').forEach((element) => {
    element.className = 'dot ' + dotClass;
  });

  setText('[data-alert-count]', String(appState.alertCount));
  setText('[data-detected-count]', String(appState.detectedCount));
  setText('[data-current-distance]', appState.current.distance + ' م');
  setText('[data-current-angle]', appState.current.angle + '°');
  setText('[data-current-type]', appState.current.type);
  setText('[data-current-zone]', appState.current.zone);
  setText('[data-current-recommendation]', appState.current.recommendation);
  setText('[data-current-risk-label]', appState.current.risk);

  document.querySelectorAll('[data-risk-badge]').forEach((element) => {
    const cls = riskClassFromArabic(appState.current.risk);
    element.className = 'badge ' + cls;
    element.textContent = levelLabel(cls);
  });

  const bar = document.querySelector('[data-risk-progress]');
  if (bar) {
    const width = appState.current.risk === 'مرتفع' ? '92%' : appState.current.risk === 'متوسط' ? '63%' : '28%';
    bar.style.width = width;
  }
}

function renderAlertLists() {
  const feed = document.querySelector('#eventFeed');
  const alertList = document.querySelector('#activeAlerts');
  const tableBody = document.querySelector('#alertsTableBody');
  const recentClassifications = document.querySelector('#classificationFeed');

  if (feed) {
    feed.innerHTML = appState.alerts.map((item) => `
      <div class="feed-item">
        <div class="feed-top">
          <strong>${item.title}</strong>
          <span class="badge ${item.level}">${levelLabel(item.level)}</span>
        </div>
        <span class="small">${item.time} - ${item.zone}</span>
        <span class="meta-text">${item.action}</span>
      </div>
    `).join('');
  }

  if (alertList) {
    alertList.innerHTML = appState.alerts.slice(0, 4).map((item) => `
      <div class="alert-item">
        <div class="alert-top">
          <strong>${item.title}</strong>
          <span class="badge ${item.level}">${levelLabel(item.level)}</span>
        </div>
        <span class="small">المنطقة: ${item.zone}</span>
        <span class="meta-text">${item.action}</span>
      </div>
    `).join('');
  }

  if (tableBody) {
    tableBody.innerHTML = appState.alerts.map((item) => `
      <tr>
        <td>${item.time}</td>
        <td>${item.zone}</td>
        <td>${item.title}</td>
        <td><span class="badge ${item.level}">${levelLabel(item.level)}</span></td>
        <td>${item.action}</td>
      </tr>
    `).join('');
  }

  if (recentClassifications) {
    recentClassifications.innerHTML = RADAR_TARGETS.map((item) => `
      <div class="timeline-item">
        <div class="timeline-top">
          <strong>${item.label}</strong>
          <span class="badge ${riskClassFromArabic(item.risk)}">${item.risk}</span>
        </div>
        <span class="small">الزاوية ${item.angle}° - المسافة ${item.distance} م - ${item.zone}</span>
        <span class="meta-text">التصنيف الحالي: ${item.type}</span>
      </div>
    `).join('');
  }
}

function updateClock() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now);
  setText('[data-live-clock]', parts);
}

function playAlertTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

function prependAlert(alert) {
  appState.alerts = [alert, ...appState.alerts].slice(0, 6);
}

function simulateDanger() {
  appState.systemStatus = 'danger';
  appState.alertCount += 1;
  appState.detectedCount += 1;
  appState.current = {
    distance: '1.7',
    angle: '31',
    type: 'حيوان',
    risk: 'مرتفع',
    zone: 'المسار الشمالي',
    recommendation: 'تجنّب الجهة الشمالية واتبع المسار الجنوبي المضاء فوراً.'
  };
  prependAlert({
    time: new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    title: 'خطر قريب تم اكتشافه أثناء المحاكاة',
    level: 'danger',
    zone: 'المسار الشمالي',
    action: 'تم تشغيل التنبيه وتفعيل اقتراح المسار الآمن.'
  });
  saveState(appState);
  applyStatusVisuals();
  renderAlertLists();
  playAlertTone();
}

function simulateMedium() {
  appState.systemStatus = 'active';
  appState.alertCount += 1;
  appState.detectedCount += 1;
  appState.current = {
    distance: '2.9',
    angle: '67',
    type: 'إنسان',
    risk: 'متوسط',
    zone: 'موقف السيارات',
    recommendation: 'استمر في المسار الحالي مع زيادة الانتباه وإضاءة الطريق.'
  };
  prependAlert({
    time: new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    title: 'حركة متوسطة الخطورة أثناء المحاكاة',
    level: 'warn',
    zone: 'موقف السيارات',
    action: 'تم تسجيل الحركة ومواصلة المراقبة.'
  });
  saveState(appState);
  applyStatusVisuals();
  renderAlertLists();
}

function resetSystem() {
  appState = cloneDefaultState();
  saveState(appState);
  applyStatusVisuals();
  renderAlertLists();
}

function attachButtons() {
  document.querySelectorAll('[data-action="simulate-danger"]').forEach((button) => {
    button.addEventListener('click', simulateDanger);
  });
  document.querySelectorAll('[data-action="simulate-medium"]').forEach((button) => {
    button.addEventListener('click', simulateMedium);
  });
  document.querySelectorAll('[data-action="reset-system"]').forEach((button) => {
    button.addEventListener('click', resetSystem);
  });
}

function startRadar() {
  const canvas = document.querySelector('#radarCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let sweepAngle = 0;
  let lastSwitch = 0;
  let targetIndex = 1;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, 760);
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const updateFromSweep = () => {
    const active = RADAR_TARGETS[targetIndex % RADAR_TARGETS.length];
    appState.current = {
      distance: active.distance.toFixed(1),
      angle: String(active.angle),
      type: active.type,
      risk: active.risk,
      zone: active.zone,
      recommendation:
        active.risk === 'مرتفع'
          ? 'يوصى بالتحول فوراً إلى المسار البديل الآمن.'
          : active.risk === 'متوسط'
            ? 'يفضّل الاستمرار بحذر مع مراقبة متواصلة.'
            : 'الوضع طبيعي ويمكن متابعة التنقل بأمان.'
    };
    applyStatusVisuals();
    targetIndex += 1;
  };

  const draw = (time = 0) => {
    const size = canvas.clientWidth;
    const center = size / 2;
    const radius = size * 0.42;

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#081712';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);

    for (let i = 1; i <= 4; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, (radius / 4) * i, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140,247,194,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < 180; i += 30) {
      const rad = (i * Math.PI) / 180;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(140,247,194,0.09)';
      ctx.stroke();
    }

    const sweepRad = (sweepAngle * Math.PI) / 180;
    const gradient = ctx.createLinearGradient(0, 0, Math.cos(sweepRad) * radius, Math.sin(sweepRad) * radius);
    gradient.addColorStop(0, 'rgba(46,234,138,0.02)');
    gradient.addColorStop(1, 'rgba(46,234,138,0.95)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepRad - 0.12) * radius, Math.sin(sweepRad - 0.12) * radius);
    ctx.arc(0, 0, radius, sweepRad - 0.12, sweepRad + 0.12);
    ctx.closePath();
    ctx.fillStyle = 'rgba(46,234,138,0.08)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepRad) * radius, Math.sin(sweepRad) * radius);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(46,234,138,0.75)';
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;

    RADAR_TARGETS.forEach((target) => {
      const angleRad = (target.angle * Math.PI) / 180;
      const distanceNorm = Math.min(target.distance / 5, 1);
      const r = distanceNorm * radius;
      const x = Math.cos(angleRad) * r;
      const y = Math.sin(angleRad) * r;
      const delta = Math.abs(((sweepAngle - target.angle + 540) % 360) - 180);
      const activeGlow = delta < 10;
      const color = target.risk === 'مرتفع' ? '#FF5A5F' : target.risk === 'متوسط' ? '#F5C451' : '#2EEA8A';
      ctx.beginPath();
      ctx.arc(x, y, activeGlow ? 8 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = activeGlow ? 18 : 7;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();

    sweepAngle = (sweepAngle + 1.4) % 360;
    if (time - lastSwitch > 2200) {
      updateFromSweep();
      lastSwitch = time;
    }
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

function markActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.top-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });
}

function setYear() {
  const year = new Date().getFullYear();
  setText('[data-current-year]', String(year));
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  applyStatusVisuals();
  renderAlertLists();
  attachButtons();
  startRadar();
  updateClock();
  setYear();
  setInterval(updateClock, 1000);
  window.addEventListener('storage', () => {
    appState = loadState();
    applyStatusVisuals();
    renderAlertLists();
  });
});
