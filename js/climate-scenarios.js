/* ===================================================================
   CLIMATEVERSE — SCENARIOS & SOLUTIONS CALCULATOR
   Interactive Split-Screen Drag Slider (SSP1 vs SSP5) &
   Carbon Mitigation Solutions Matrix
   =================================================================== */

class ScenarioSlider {
  constructor() {
    this.container = document.getElementById('scenario-slider-box');
    this.handle = document.getElementById('slider-handle');
    this.rightSide = document.getElementById('scenario-side-high');
    this.isDragging = false;
    this.currentYear = '2050';

    this.scenarioData = {
      '2030': {
        ssp1: { temp: '+1.5 °C', sea: '+12 cm', ice: '4.1 triệu km²', heatDays: '28 ngày' },
        ssp5: { temp: '+1.7 °C', sea: '+16 cm', ice: '3.2 triệu km²', heatDays: '45 ngày' }
      },
      '2050': {
        ssp1: { temp: '+1.6 °C (Đạt đỉnh & hạ nhiệt)', sea: '+24 cm', ice: '3.8 triệu km²', heatDays: '35 ngày' },
        ssp5: { temp: '+2.4 °C (Gia tốc)', sea: '+38 cm', ice: '1.2 triệu km²', heatDays: '82 ngày' }
      },
      '2100': {
        ssp1: { temp: '+1.4 °C (Kiểm soát thành công)', sea: '+42 cm', ice: '4.5 triệu km²', heatDays: '30 ngày' },
        ssp5: { temp: '+4.4 °C (Thảm họa khí hậu)', sea: '+102 cm', ice: '0.0 triệu km² (Không còn băng)', heatDays: '160 ngày' }
      }
    };

    this.init();
  }

  init() {
    if (!this.container || !this.handle || !this.rightSide) return;

    const startDrag = (e) => {
      this.isDragging = true;
      document.body.style.userSelect = 'none';
    };

    const stopDrag = () => {
      this.isDragging = false;
      document.body.style.userSelect = 'auto';
    };

    const doDrag = (clientX) => {
      if (!this.isDragging) return;
      const rect = this.container.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0.08, Math.min(0.92, pos)); // Giới hạn biên 8% - 92%

      const pct = (pos * 100).toFixed(2);
      this.handle.style.left = pct + '%';
      this.rightSide.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };

    // Mouse events
    this.handle.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mousemove', (e) => doDrag(e.clientX));

    // Touch events
    this.handle.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) doDrag(e.touches[0].clientX);
    }, { passive: true });

    // Year selector buttons
    document.querySelectorAll('.year-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentYear = btn.dataset.year;
        this.updateScenarioDisplay();
      });
    });

    this.updateScenarioDisplay();
  }

  updateScenarioDisplay() {
    const data = this.scenarioData[this.currentYear];
    if (!data) return;

    // Cập nhật các chỉ số hiển thị ở 2 bên kịch bản
    this.setText('scen-ssp1-temp', data.ssp1.temp);
    this.setText('scen-ssp1-sea', data.ssp1.sea);
    this.setText('scen-ssp1-ice', data.ssp1.ice);
    this.setText('scen-ssp1-heat', data.ssp1.heatDays);

    this.setText('scen-ssp5-temp', data.ssp5.temp);
    this.setText('scen-ssp5-sea', data.ssp5.sea);
    this.setText('scen-ssp5-ice', data.ssp5.ice);
    this.setText('scen-ssp5-heat', data.ssp5.heatDays);
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Bộ tính toán giải pháp cắt giảm carbon
class SolutionsCalculator {
  constructor() {
    this.solutions = [
      { id: 'sol-energy', name: 'Năng lượng tái tạo (Điện gió & Mặt trời)', reduction: 14.5, enabled: true },
      { id: 'sol-forest', name: 'Bảo tồn & Tái sinh rừng tự nhiên', reduction: 7.2, enabled: true },
      { id: 'sol-transport', name: 'Giao thông xanh & Xe điện', reduction: 5.8, enabled: false },
      { id: 'sol-industry', name: 'Tiết kiệm năng lượng công nghiệp', reduction: 6.4, enabled: false },
      { id: 'sol-agri', name: 'Nông nghiệp sinh thái bền vững', reduction: 4.5, enabled: false },
      { id: 'sol-circular', name: 'Kinh tế tuần hoàn & Giảm rác nhựa', reduction: 3.6, enabled: false }
    ];

    this.targetReduction = 42.0; // Gt CO2 cần cắt giảm hàng năm để đạt mục tiêu 1.5°C vào năm 2050
    this.init();
  }

  init() {
    this.solutions.forEach(sol => {
      const checkbox = document.getElementById(sol.id);
      if (checkbox) {
        checkbox.checked = sol.enabled;
        checkbox.addEventListener('change', (e) => {
          sol.enabled = e.target.checked;
          this.recalculate();
        });
      }
    });

    this.recalculate();
  }

  recalculate() {
    const totalCut = this.solutions
      .filter(s => s.enabled)
      .reduce((sum, s) => sum + s.reduction, 0);

    const progressPct = Math.min(100, (totalCut / this.targetReduction) * 100);

    // Tính toán nhiệt độ ước lượng vào năm 2100 dựa trên lượng cắt giảm
    // 0 Gt cut -> +4.4°C | 42 Gt cut -> +1.5°C
    const projectedTemp = 4.4 - (totalCut / this.targetReduction) * 2.9;

    const totalEl = document.getElementById('calc-total-cut');
    if (totalEl) totalEl.textContent = totalCut.toFixed(1) + ' Gt CO₂/năm';

    const progEl = document.getElementById('calc-progress-bar');
    if (progEl) progEl.style.width = progressPct + '%';

    const pctEl = document.getElementById('calc-progress-pct');
    if (pctEl) pctEl.textContent = progressPct.toFixed(0) + '% mục tiêu Net Zero';

    const tempEl = document.getElementById('calc-projected-temp');
    if (tempEl) {
      tempEl.textContent = '+' + projectedTemp.toFixed(1) + ' °C';
      if (projectedTemp <= 1.6) tempEl.style.color = '#10b981';
      else if (projectedTemp <= 2.5) tempEl.style.color = '#f59e0b';
      else tempEl.style.color = '#ef4444';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.scenarioSlider = new ScenarioSlider();
  window.solutionsCalculator = new SolutionsCalculator();
});
