/* ===================================================================
   CLIMATEVERSE — SCIENTIFIC GEO-CLIMATIC MAP
   Bản đồ quan trắc biến đổi khí hậu chuyên sâu & Dữ liệu viễn thám
   =================================================================== */

class ClimateGeoMap {
  constructor() {
    this.currentLayer = 'temp'; // 'temp', 'salinity', 'drought', 'storm'
    this.selectedRegion = 'mdd';

    this.regionsData = {
      mdd: {
        name: 'Đồng Bằng Sông Cửu Long (Châu Thổ Phía Nam)',
        vulnerability: 'Cực kỳ nguy cấp',
        vulnerabilityColor: '#ef4444',
        tempAnomaly: '+1.35 °C',
        seaLevelTrend: '+3.8 mm/năm (kèm sụt lún đất 1.5–2.5 cm/năm)',
        keyRisk: 'Xâm nhập mặn ranh 4g/lít ăn sâu 60–85 km trên các nhánh sông Tiền và sông Hậu; xói lở bờ sông, bờ biển nghiêm trọng.',
        actions: [
          'Chuyển đổi mô hình luân canh thích ứng "lúa - tôm", "lúa - sen".',
          'Xây dựng các công trình trữ nước ngọt phân tán tự nhiên.',
          'Phục hồi và trồng mới đai rừng ngập mặn chắn sóng ven biển.',
          'Giảm triệt để việc khai thác nước ngầm tầng nông.'
        ]
      },
      mountains: {
        name: 'Vùng Núi Phía Bắc (Bắc Bộ & Tây Bắc)',
        vulnerability: 'Nguy cấp cao',
        vulnerabilityColor: '#ea580c',
        tempAnomaly: '+1.15 °C',
        seaLevelTrend: 'Không áp dụng (Vùng cao độ)',
        keyRisk: 'Mưa cực đoan gây lũ quét và sạt lở đất sườn dốc (điển hình như các đợt mưa hoàn lưu siêu bão Yagi 2024); rét đậm rét hại dị thường.',
        actions: [
          'Lắp đặt mạng lưới cảm biến đo mưa và cảnh báo sớm sạt lở thời gian thực.',
          'Quy hoạch sắp xếp lại các điểm dân cư tránh chân sườn dốc ngậm nước.',
          'Bảo vệ nghiêm ngặt diện tích rừng phòng hộ đầu nguồn.'
        ]
      },
      central: {
        name: 'Duyên Hải Miền Trung (Bắc Trung Bộ & Nam Trung Bộ)',
        vulnerability: 'Nguy cấp cao',
        vulnerabilityColor: '#ea580c',
        tempAnomaly: '+1.25 °C',
        seaLevelTrend: '+3.1 mm/năm',
        keyRisk: 'Chịu bão mạnh dồn dập vào mùa thu đông; nắng nóng gay gắt kéo dài kết hợp gió phơn Tây Nam vào mùa hè gây kiệt quệ nguồn nước.',
        actions: [
          'Nâng cấp hệ thống hồ chứa thủy lợi liên hồ điều tiết lũ và cắt hạn.',
          'Xây dựng công trình nhà cộng đồng tránh bão vượt lũ.',
          'Trồng dải rừng phi lao cố định đụn cát chắn gió cát ven biển.'
        ]
      },
      highlands: {
        name: 'Tây Nguyên (Vùng Cao Nguyên Ba-zan)',
        vulnerability: 'Trung bình đến Cao',
        vulnerabilityColor: '#f59e0b',
        tempAnomaly: '+1.40 °C',
        seaLevelTrend: 'Không áp dụng',
        keyRisk: 'Mùa khô kéo dài khiến mực nước ngầm sụt giảm 2–5m; hạn hán đe dọa sinh kế các vùng chuyên canh cà phê, hồ tiêu, sầu riêng.',
        actions: [
          'Nhân rộng công nghệ tưới tiết kiệm nhỏ giọt và cảm biến ẩm kế đất.',
          'Trồng xen canh cây che bóng và duy trì thảm phủ sinh học giữ ẩm.',
          'Phục hồi rừng tự nhiên đầu nguồn các lưu vực sông Sê San, Srêpôk.'
        ]
      },
      urban: {
        name: 'Đô Thị Trọng Điểm (TP.HCM & Hà Nội)',
        vulnerability: 'Nguy cấp',
        vulnerabilityColor: '#ff5722',
        tempAnomaly: '+1.85 °C (Hiệu ứng đảo nhiệt đô thị UHI)',
        seaLevelTrend: '+4.0 mm/năm (TP.HCM chịu thêm triều cường)',
        keyRisk: 'Đảo nhiệt làm nhiệt độ ban đêm cao hơn vùng ven 3–5°C; ngập úng đô thị do bê tông hóa cao vượt công suất thoát nước.',
        actions: [
          'Phát triển mô hình "Thành phố bọt biển" (Sponge City) với hồ điều hòa ngầm.',
          'Mở rộng diện tích vỉa hè, công viên và mặt đường thấm nước.',
          'Quy định công trình xanh và mái phủ năng lượng mặt trời.'
        ]
      }
    };

    this.init();
  }

  init() {
    this.bindLayerButtons();
    this.bindRegionClicks();
    this.renderRegionDetails('mdd');
  }

  bindLayerButtons() {
    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLayer = btn.dataset.layer;
        this.updateMapLayerVisuals();
      });
    });
  }

  bindRegionClicks() {
    document.querySelectorAll('.map-zone-path, .region-select-btn').forEach(el => {
      el.addEventListener('click', () => {
        const rId = el.dataset.region;
        if (rId && this.regionsData[rId]) {
          this.selectedRegion = rId;
          this.highlightRegion(rId);
          this.renderRegionDetails(rId);
        }
      });
    });
  }

  highlightRegion(regionId) {
    document.querySelectorAll('.map-zone-path').forEach(p => {
      p.classList.toggle('active-zone', p.dataset.region === regionId);
    });
    document.querySelectorAll('.region-select-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.region === regionId);
    });
  }

  updateMapLayerVisuals() {
    const layerColors = {
      temp: '#ff5722',
      salinity: '#0284c7',
      drought: '#f59e0b',
      storm: '#38bdf8'
    };

    const color = layerColors[this.currentLayer] || '#7be7ff';
    document.documentElement.style.setProperty('--map-active-glow', color);
    const legendEl = document.getElementById('map-layer-legend');
    if (legendEl) {
      const descriptions = {
        temp: 'Lớp dữ liệu: Dị thường nhiệt độ bề mặt đất liền và biển (+1.0°C đến +2.0°C)',
        salinity: 'Lớp dữ liệu: Ranh mặn 4‰ và vùng đất thấp ven biển (< 1m so với mực nước biển)',
        drought: 'Lớp dữ liệu: Chỉ số khô hạn PDSI và mức độ thâm hụt nước ngầm tầng nông',
        storm: 'Lớp dữ liệu: Tần suất bão, dải mây hoàn lưu mưa lớn và nguy cơ trượt lở'
      };
      legendEl.textContent = descriptions[this.currentLayer];
    }
  }

  renderRegionDetails(regionId) {
    const data = this.regionsData[regionId];
    if (!data) return;

    const panel = document.getElementById('geo-details-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <span class="section-eyebrow" style="margin: 0;">Trạm quan trắc địa phương</span>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: ${data.vulnerabilityColor}; background: rgba(255, 87, 34, 0.12); padding: 3px 10px; border-radius: 99px; border: 1px solid ${data.vulnerabilityColor};">
          ${data.vulnerability}
        </span>
      </div>

      <h3 style="font-size: 1.3rem; margin-bottom: 12px; color: #fff;">${data.name}</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
        <div style="background: rgba(7, 17, 31, 0.7); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--space-border);">
          <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase;">Dị thường nhiệt độ</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--data-heat);" class="mono-num">${data.tempAnomaly}</div>
        </div>
        <div style="background: rgba(7, 17, 31, 0.7); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--space-border);">
          <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase;">Mực nước biển / Xu thế</div>
          <div style="font-size: 0.92rem; font-weight: 600; color: var(--cyan-glacier); margin-top: 3px;">${data.seaLevelTrend}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.88rem; color: #fff; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--data-warning);">⚠️</span> Thách thức khí hậu trọng yếu:
        </h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
          ${data.keyRisk}
        </p>
      </div>

      <div>
        <h4 style="font-size: 0.88rem; color: var(--data-vegetation); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🌱</span> Giải pháp thích ứng chiến lược:
        </h4>
        <ul style="padding-left: 18px; font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">
          ${data.actions.map(act => `<li style="margin-bottom: 6px;">${act}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.climateGeoMap = new ClimateGeoMap();
});
