/* ===================================================================
   CLIMATEVERSE — CLIMATE LAB SIMULATION ENGINES
   Mô hình vật lý khoa học: Cân bằng bức xạ, Băng quyển & Nước biển,
   Hạn hán & Độ ẩm đất, Mưa cực đoan & Ngập lụt đô thị
   =================================================================== */

class ClimateLabEngine {
  constructor() {
    this.currentMode = 'ghg'; // 'ghg', 'sea', 'drought', 'flood'
    this.canvas = document.getElementById('sim-chart-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Presets khoa học chuẩn IPCC
    this.presets = {
      preindustrial: { co2: 280, emissivity: 0.75, albedo: 0.31, tempDelta: 0.0, label: 'Tiền công nghiệp (1850)' },
      current: { co2: 423, emissivity: 0.785, albedo: 0.298, tempDelta: 1.18, label: 'Hiện tại (Năm 2026)' },
      netzero15: { co2: 440, emissivity: 0.795, albedo: 0.302, tempDelta: 1.5, label: 'Kịch bản 1.5°C (SSP1-1.9)' },
      extreme: { co2: 680, emissivity: 0.84, albedo: 0.27, tempDelta: 3.8, label: 'Phát thải cực đại (SSP5-8.5)' }
    };

    // State hiện tại của 4 mô hình
    this.state = {
      // Mô hình A: GHG & Radiation
      co2: 423,
      emissivity: 0.785,
      albedo: 0.30,

      // Mô hình B: Sea Level
      tempRise: 1.2,
      greenlandMelt: 270, // Gt/yr
      antarcticMelt: 150, // Gt/yr
      thermalExpansion: 1.4, // mm/yr

      // Mô hình C: Drought & Soil
      droughtTemp: 1.2,
      rainChange: -10, // %
      soilType: 'loam',

      // Mô hình D: Extreme Rain & Flood
      rainTemp: 1.2,
      urbanization: 65, // %
      drainageCapacity: 50 // mm/h
    };

    this.init();
  }

  init() {
    this.bindTabEvents();
    this.bindControlEvents();
    this.render();
  }

  bindTabEvents() {
    document.querySelectorAll('.lab-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lab-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.updateViewControls();
        this.render();
      });
    });
  }

  bindControlEvents() {
    // Mode A Sliders
    const bindSlider = (id, key, formatFn) => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(id + '-val');
      if (el) {
        el.addEventListener('input', (e) => {
          this.state[key] = parseFloat(e.target.value);
          if (valEl) valEl.textContent = formatFn(this.state[key]);
          this.render();
        });
      }
    };

    bindSlider('slider-co2', 'co2', v => v + ' ppm');
    bindSlider('slider-emissivity', 'emissivity', v => (v * 100).toFixed(1) + '%');
    bindSlider('slider-albedo', 'albedo', v => (v * 100).toFixed(1) + '%');

    bindSlider('slider-sea-temp', 'tempRise', v => '+' + v.toFixed(1) + ' °C');
    bindSlider('slider-greenland', 'greenlandMelt', v => v + ' Gt/năm');

    bindSlider('slider-drought-temp', 'droughtTemp', v => '+' + v.toFixed(1) + ' °C');
    bindSlider('slider-rain-change', 'rainChange', v => (v >= 0 ? '+' : '') + v + '%');

    bindSlider('slider-flood-temp', 'rainTemp', v => '+' + v.toFixed(1) + ' °C');
    bindSlider('slider-urban-pct', 'urbanization', v => v + '%');

    // Preset buttons
    document.querySelectorAll('.preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const pKey = pill.dataset.preset;
        if (this.presets[pKey]) {
          this.applyPreset(this.presets[pKey]);
        }
      });
    });
  }

  applyPreset(preset) {
    this.state.co2 = preset.co2;
    this.state.emissivity = preset.emissivity;
    this.state.albedo = preset.albedo;

    const co2El = document.getElementById('slider-co2');
    if (co2El) co2El.value = preset.co2;
    const co2Val = document.getElementById('slider-co2-val');
    if (co2Val) co2Val.textContent = preset.co2 + ' ppm';

    const emEl = document.getElementById('slider-emissivity');
    if (emEl) emEl.value = preset.emissivity;
    const emVal = document.getElementById('slider-emissivity-val');
    if (emVal) emVal.textContent = (preset.emissivity * 100).toFixed(1) + '%';

    const alEl = document.getElementById('slider-albedo');
    if (alEl) alEl.value = preset.albedo;
    const alVal = document.getElementById('slider-albedo-val');
    if (alVal) alVal.textContent = (preset.albedo * 100).toFixed(1) + '%';

    this.render();
  }

  updateViewControls() {
    // Ẩn hiện các panel điều khiển tương ứng với mode được chọn
    ['ghg', 'sea', 'drought', 'flood'].forEach(m => {
      const ctrl = document.getElementById(`lab-controls-${m}`);
      const info = document.getElementById(`lab-info-${m}`);
      if (ctrl) ctrl.style.display = (m === this.currentMode) ? 'block' : 'none';
      if (info) info.style.display = (m === this.currentMode) ? 'block' : 'none';
    });
  }

  // --- 1. MÔ PHỎNG A: HIỆU ỨNG NHÀ KÍNH & CÂN BẰNG BỨC XẠ ---
  calculateGHGModel() {
    const S0 = 1361; // Hằng số Mặt Trời (W/m2)
    const sigma = 5.67e-8; // Hằng số Stefan-Boltzmann (W/m2.K4)
    const alpha = this.state.albedo;
    const eps = this.state.emissivity;
    const C = this.state.co2;

    // Bức xạ tới có hiệu dụng: (S0 * (1 - alpha)) / 4
    const Fin = (S0 * (1 - alpha)) / 4; // ~ 238 W/m2

    // Độ cưỡng bức bức xạ do CO2: ΔF = 5.35 * ln(C / 280)
    const deltaF_CO2 = 5.35 * Math.log(C / 280);

    // Nhiệt độ cân bằng bức xạ không khí quyển (Te)
    const Te = Math.pow(Fin / sigma, 0.25); // ~ 254.6 K (-18.5 °C)

    // Nhiệt độ bề mặt có khí quyển hấp thụ (Ts = Te * (2 / (2 - eps))^0.25)
    // Kết hợp hiệu chỉnh độ ấm tăng thêm do cưỡng bức bức xạ: ΔT = λ * ΔF (λ ~ 0.8 K/(W/m2))
    const Ts_K = Te * Math.pow(2 / (2 - eps), 0.25) + (deltaF_CO2 * 0.75);
    const Ts_C = Ts_K - 273.15;
    const Ts_Anomaly = Ts_C - 15.0; // So với nền 15.0 °C thời tiền công nghiệp

    // Tỷ lệ bức xạ thoát ra vũ trụ
    const F_escape = Fin * (1 - eps * 0.5);

    return {
      surfaceTemp: Ts_C,
      anomaly: Ts_Anomaly,
      forcing: deltaF_CO2,
      escapeRad: F_escape
    };
  }

  // --- 2. MÔ PHỎNG B: BĂNG NƯỚC BIỂN DÂNG ---
  calculateSeaLevelModel() {
    const dT = this.state.tempRise;
    const greenland = this.state.greenlandMelt; // Gt/yr (360 Gt = 1mm sea level)

    // Đóng góp từ giãn nở nhiệt: ~ 1.5 - 2.5 mm / năm / °C
    const thermalContrib = dT * 2.2; // mm/yr

    // Đóng góp từ tan băng Greenland: 270 Gt/yr / 361.8 ~ 0.75 mm/yr
    const greenlandContrib = (greenland / 361.8);

    // Đóng góp từ sông băng miền núi & Nam Cực:
    const otherIceContrib = dT * 1.8;

    // Tốc độ dâng hiện tại (mm/năm)
    const ratePerYear = thermalContrib + greenlandContrib + otherIceContrib;

    // Dự báo tích lũy mực nước biển dâng đến năm 2100 (cm)
    const yearsRemaining = 2100 - 2026;
    const totalRiseCm = (ratePerYear * yearsRemaining) / 10;

    // Nguy cơ ngập ĐBSCL: Cứ mỗi 10cm nước dâng, khoảng 4.5% diện tích chịu nguy cơ mặn
    const mddFloodedAreaPct = Math.min(100, Math.max(0, totalRiseCm * 0.55));

    return {
      rateMmPerYear: ratePerYear,
      totalRise2100Cm: totalRiseCm,
      mddAreaRisk: mddFloodedAreaPct
    };
  }

  // --- 3. MÔ PHỎNG C: HẠN HÁN & ĐỘ ẨM ĐẤT ---
  calculateDroughtModel() {
    const dT = this.state.droughtTemp;
    const dP = this.state.rainChange; // %

    // Tỷ lệ bốc thoát hơi nước tiềm năng (PET tăng khoảng 5-8% cho mỗi 1°C ấm lên)
    const petIncrease = dT * 6.5; // %
    // Chỉ số thâm hụt độ ẩm đất (Soil Moisture Deficit)
    const moistureDeficit = Math.min(100, Math.max(0, petIncrease - dP));

    let status = 'Bình thường';
    let statusColor = '#10b981';
    if (moistureDeficit > 15) { status = 'Khô hạn nhẹ'; statusColor = '#f59e0b'; }
    if (moistureDeficit > 30) { status = 'Hạn hán nghiêm trọng'; statusColor = '#ea580c'; }
    if (moistureDeficit > 50) { status = 'Khô kiệt cực đoan'; statusColor = '#ef4444'; }

    return {
      deficitPct: moistureDeficit,
      status: status,
      statusColor: statusColor,
      cropYieldLoss: Math.min(80, moistureDeficit * 0.65)
    };
  }

  // --- 4. MÔ PHỎNG D: MƯA CỰC ĐOAN & NGẬP ĐÔ THỊ ---
  calculateFloodModel() {
    const dT = this.state.rainTemp;
    const urban = this.state.urbanization; // % bê tông hóa

    // Clausius-Clapeyron: +7% hơi nước / 1°C
    const moistureCapacity = dT * 7.0; // %
    const peakRainfall = 60 * (1 + moistureCapacity / 100); // mm/h

    // Hệ số dòng chảy bề mặt Runoff Coefficient C: đất tự nhiên ~ 0.2, bê tông ~ 0.9
    const runoffCoef = 0.2 + (urban / 100) * 0.7;
    const runoffFlow = peakRainfall * runoffCoef; // mm/h thoát nước mặt

    // Ngập úng khi dòng chảy vượt quá cống thoát nước (drainage = 50 mm/h)
    const floodDepthCm = Math.max(0, (runoffFlow - 35) * 0.8);

    return {
      extraMoisture: moistureCapacity,
      peakRain: peakRainfall,
      floodDepth: floodDepthCm
    };
  }

  render() {
    if (this.currentMode === 'ghg') {
      const res = this.calculateGHGModel();
      this.updateTelemetryVal('tele-temp', res.surfaceTemp.toFixed(1) + ' °C');
      this.updateTelemetryVal('tele-anomaly', (res.anomaly >= 0 ? '+' : '') + res.anomaly.toFixed(2) + ' °C');
      this.updateTelemetryVal('tele-forcing', '+' + res.forcing.toFixed(2) + ' W/m²');
      this.updateTelemetryVal('tele-escape', res.escapeRad.toFixed(0) + ' W/m²');

      this.drawGHGChart(res);
    } else if (this.currentMode === 'sea') {
      const res = this.calculateSeaLevelModel();
      this.updateTelemetryVal('tele-sea-rate', '+' + res.rateMmPerYear.toFixed(1) + ' mm/năm');
      this.updateTelemetryVal('tele-sea-2100', '+' + res.totalRise2100Cm.toFixed(1) + ' cm');
      this.updateTelemetryVal('tele-sea-mdd', res.mddAreaRisk.toFixed(1) + '% diện tích');

      this.drawSeaChart(res);
    } else if (this.currentMode === 'drought') {
      const res = this.calculateDroughtModel();
      this.updateTelemetryVal('tele-drought-def', '-' + res.deficitPct.toFixed(1) + '%');
      this.updateTelemetryVal('tele-drought-status', res.status);
      this.updateTelemetryVal('tele-drought-crop', '-' + res.cropYieldLoss.toFixed(1) + '%');

      this.drawDroughtChart(res);
    } else if (this.currentMode === 'flood') {
      const res = this.calculateFloodModel();
      this.updateTelemetryVal('tele-flood-cap', '+' + res.extraMoisture.toFixed(1) + '%');
      this.updateTelemetryVal('tele-flood-peak', res.peakRain.toFixed(1) + ' mm/h');
      this.updateTelemetryVal('tele-flood-depth', res.floodDepth > 0 ? res.floodDepth.toFixed(1) + ' cm' : 'Không ngập');

      this.drawFloodChart(res);
    }
  }

  updateTelemetryVal(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Vẽ biểu đồ Canvas phân tích tương tác
  drawGHGChart(res) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(123, 231, 255, 0.12)' : 'rgba(2, 132, 199, 0.15)';
    const textColor = isDark ? '#94a3b8' : '#334155';

    ctx.clearRect(0, 0, w, h);

    // Nền biểu đồ lưới khoa học
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 20; y < h - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(40, y); ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // Vẽ đường cong hàm số nhiệt độ theo nồng độ CO2
    ctx.beginPath();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 3;

    for (let ppm = 280; ppm <= 800; ppm += 10) {
      const x = 40 + ((ppm - 280) / (800 - 280)) * (w - 60);
      const deltaT = 5.35 * Math.log(ppm / 280) * 0.75;
      const y = (h - 40) - (deltaT / 5.0) * (h - 70);

      if (ppm === 280) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Điểm mốc hiện tại
    const currX = 40 + ((this.state.co2 - 280) / (800 - 280)) * (w - 60);
    const currY = (h - 40) - (res.anomaly / 5.0) * (h - 70);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(currX, currY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Nhãn trục
    ctx.fillStyle = textColor;
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText('280 ppm', 40, h - 10);
    ctx.fillText('800 ppm', w - 65, h - 10);
    ctx.fillText('+5°C', 5, 30);
    ctx.fillText('0°C', 10, h - 40);
  }

  drawSeaChart(res) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const mainTextColor = isDark ? '#ffffff' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#475569';

    ctx.clearRect(0, 0, w, h);

    // Cột nước biển dâng
    const barW = 80;
    const maxCm = 150;
    const barH = (res.totalRise2100Cm / maxCm) * (h - 60);

    ctx.fillStyle = isDark ? 'rgba(2, 132, 199, 0.3)' : 'rgba(2, 132, 199, 0.15)';
    ctx.fillRect(w / 2 - barW / 2, 20, barW, h - 60);

    // Mức nước dâng hiện tại
    const grad = ctx.createLinearGradient(0, h - 40 - barH, 0, h - 40);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(w / 2 - barW / 2, h - 40 - barH, barW, barH);

    ctx.fillStyle = mainTextColor;
    ctx.font = 'bold 15px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('+' + res.totalRise2100Cm.toFixed(1) + ' cm', w / 2, h - 50 - barH);

    ctx.fillStyle = subTextColor;
    ctx.font = '600 12px Plus Jakarta Sans';
    ctx.fillText('Mực nước dâng năm 2100', w / 2, h - 12);
  }

  drawDroughtChart(res) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const mainTextColor = isDark ? '#ffffff' : '#0f172a';
    const trackColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';

    ctx.clearRect(0, 0, w, h);

    // Vòng cung đo độ ẩm đất
    const cx = w / 2, cy = h / 2 + 10, r = 70;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 2.2);
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = 14;
    ctx.stroke();

    const pct = Math.min(1, res.deficitPct / 100);
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 0.8 + (Math.PI * 1.4 * pct));
    ctx.strokeStyle = res.statusColor;
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = mainTextColor;
    ctx.font = 'bold 22px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('-' + res.deficitPct.toFixed(0) + '%', cx, cy - 5);
    ctx.font = 'bold 12px Plus Jakarta Sans';
    ctx.fillStyle = res.statusColor;
    ctx.fillText(res.status, cx, cy + 18);
  }

  drawFloodChart(res) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#334155';

    ctx.clearRect(0, 0, w, h);

    // Biểu đồ lượng mưa và ngập úng
    const rainHeight = (res.peakRain / 120) * (h - 60);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w / 3 - 35, h - 35 - rainHeight, 70, rainHeight);

    ctx.fillStyle = res.floodDepth > 0 ? '#ea580c' : '#059669';
    const floodH = (res.floodDepth / 60) * (h - 60);
    ctx.fillRect(2 * w / 3 - 35, h - 35 - floodH, 70, Math.max(4, floodH));

    ctx.fillStyle = textColor;
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('Mưa: ' + res.peakRain.toFixed(0) + ' mm/h', w / 3, h - 15);
    ctx.fillText('Ngập: ' + (res.floodDepth > 0 ? res.floodDepth.toFixed(1) + ' cm' : '0 cm'), 2 * w / 3, h - 15);
  }
    ctx.fillText('Ngập: ' + (res.floodDepth > 0 ? res.floodDepth.toFixed(1) + ' cm' : '0 cm'), 2 * w / 3, h - 15);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.climateLab = new ClimateLabEngine();
});
