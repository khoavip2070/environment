/* ===================================================================
   CLIMATEVERSE — 3D WEBGL PLANET SYSTEM
   Three.js Interactive Earth with Procedural Textures, Atmosphere Halo,
   Real-world Observation Hotspots & Cinematic Orbital Camera
   =================================================================== */

class ClimateEarthViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.earthMesh = null;
    this.cloudsMesh = null;
    this.atmosphereMesh = null;
    this.gridMesh = null;
    this.hotspotGroup = null;
    this.raycaster = null;
    this.mouse = null;
    this.hoveredHotspot = null;
    this.isRotating = true;
    this.rotationSpeed = 0.0012;
    this.targetCameraPos = null;
    this.isTransitioning = false;

    // Các điểm quan trắc thực tế toàn cầu (Vĩ độ, Kinh độ)
    // Các điểm quan trắc thực tế nổi bật (Việt Nam & Thế giới)
    this.hotspotsData = [
      {
        id: 'vn-mdd',
        name: '🌾 Đồng Bằng Sông Cửu Long (Việt Nam)',
        lat: 10.03,
        lon: 105.78,
        category: 'Hạn mặn & Nước biển dâng',
        severity: 'Báo động đỏ',
        color: '#ff5722',
        metric: 'Nước mặn lấn sâu 65–85 km • Đất sụt lún',
        desc: 'Vựa lúa lớn nhất của nước ta đang thiếu nước ngọt nghiêm trọng vào mùa khô. Nước biển dâng làm mặn tràn vào các vườn sầu riêng, ruộng lúa ở Bến Tre, Tiền Giang, Sóc Trăng, Cà Mau.'
      },
      {
        id: 'vn-bacbo',
        name: '🌀 Miền Bắc & Vịnh Bắc Bộ (Việt Nam)',
        lat: 20.86,
        lon: 106.68,
        category: 'Siêu bão & Mưa lũ lịch sử',
        severity: 'Cực kỳ nguy cấp',
        color: '#38bdf8',
        metric: 'Siêu bão Yagi giật cấp 17 • Lũ quét sạt lở',
        desc: 'Năm 2024, siêu bão Yagi đổ bộ tàn phá Quảng Ninh, Hải Phòng và gây ngập lụt diện rộng tại Hà Nội, Yên Bái, Lào Cai. Khí hậu nóng lên làm các cơn bão mạnh lên nhanh bất thường.'
      },
      {
        id: 'vn-mientrung',
        name: '🌊 Duyên Hải Miền Trung (Việt Nam)',
        lat: 16.05,
        lon: 108.2,
        category: 'Bão lũ dồn dập & Sạt lở núi',
        severity: 'Cực kỳ nguy cấp',
        color: '#f59e0b',
        metric: 'Mưa cực đoan > 1.000 mm • Ngập lụt sâu',
        desc: 'Dải đất miền Trung hẹp và dốc, thường xuyên hứng chịu "bão chồng bão, lũ chồng lũ" từ Quảng Bình, Thừa Thiên Huế đến Đà Nẵng, Quảng Nam, gây sạt lở đồi núi và chia cắt giao thông.'
      },
      {
        id: 'vn-tphcm',
        name: '🏙️ TP. Hồ Chí Minh & Cần Thơ (Việt Nam)',
        lat: 10.82,
        lon: 106.63,
        category: 'Triều cường & Ngập úng đô thị',
        severity: 'Nguy cấp',
        color: '#a855f7',
        metric: 'Triều cường vượt báo động 3 (> 1.7m)',
        desc: 'Mỗi đợt rằm và đầu tháng âm lịch, nước từ sông Sài Gòn và sông Hậu tràn lên gây ngập sâu các tuyến đường, ảnh hưởng trực tiếp đến việc đi học, đi làm của hàng triệu người dân.'
      },
      {
        id: 'arctic',
        name: '🧊 Băng Biển Bắc Cực (Bắc Băng Dương)',
        lat: 78.0,
        lon: 15.0,
        category: 'Băng tan nhanh',
        severity: 'Nguy cấp',
        color: '#a5f3fc',
        metric: 'Mất 12.6% diện tích mỗi 10 năm (NASA)',
        desc: 'Băng trắng giống như tấm gương phản chiếu bớt ánh nắng mặt trời. Khi băng tan hết, mặt biển sẫm màu sẽ hút nhiệt làm Trái Đất nóng lên nhanh gấp bội.'
      },
      {
        id: 'greenland',
        name: '🏔️ Dải Băng Khổng Lồ Greenland',
        lat: 71.7,
        lon: -42.6,
        category: 'Nguồn làm nước biển dâng',
        severity: 'Báo động đỏ',
        color: '#38bdf8',
        metric: 'Mất ~270 tỷ tấn băng mỗi năm',
        desc: 'Khối băng nằm trên đất liền này đang tan chảy đổ vào đại dương. Nếu tan hết, nước biển trên toàn thế giới (bao gồm bờ biển Việt Nam) sẽ dâng thêm hơn 7 mét!'
      },
      {
        id: 'amazon',
        name: '🌳 Rừng Rậm Amazon (Nam Mỹ)',
        lat: -3.46,
        lon: -62.21,
        category: 'Lá phổi xanh của Trái Đất',
        severity: 'Nguy cấp',
        color: '#10b981',
        metric: 'Nhiều vụ cháy rừng kỷ lục do hạn hán',
        desc: 'Rừng nhiệt đới lớn nhất hành tinh giúp hút khí CO₂ và tạo ra mưa. Hạn hán và cháy rừng đang khiến lá phổi này bị tổn thương nặng nề.'
      }
    ];

    this.init();
  }

  init() {
    try {
      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 5, 24);

      // 2. WebGL Renderer với Antialiasing & PBR ToneMapping
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.container.appendChild(this.renderer.domElement);

      // 3. OrbitControls
      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 14;
        this.controls.maxDistance = 45;
        this.controls.enablePan = false;
      }

      // 4. Lights
      this.ambientLight = new THREE.AmbientLight(0x93c5fd, 2.5);
      this.scene.add(this.ambientLight);

      // Mặt trời chính (Main Directional Light)
      this.sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
      this.sunLight.position.set(30, 15, 20);
      this.scene.add(this.sunLight);

      // Rim Light phản chiếu khí quyển
      this.rimLight = new THREE.DirectionalLight(0x0284c7, 1.6);
      this.rimLight.position.set(-30, -10, -20);
      this.scene.add(this.rimLight);

      // Cập nhật ánh sáng theo chủ đề giao diện hiện tại
      const currTheme = document.documentElement.getAttribute('data-theme') || 'light';
      this.updateThemeLighting(currTheme);

      // 5. Build Earth & Atmosphere
      this.buildEarthMesh();
      this.buildCloudsMesh();
      this.buildAtmosphereGlow();
      this.buildCoordinateGrid();
      this.buildHotspots();

      // 6. Raycasting for Mouse Interaction
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Events
      window.addEventListener('resize', () => this.onWindowResize());
      this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));

      // 7. Start Render Loop
      this.animate();
    } catch (err) {
      console.warn('WebGL initialization failed, switching to procedural fallback:', err);
      this.renderFallback();
    }
  }

  // Tạo texture bề mặt địa hình chất lượng cao bằng HTML5 Canvas thủ tục (không phụ thuộc file ngoài)
  createProceduralEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Đại dương sâu (Deep Ocean Gradient)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a2342');
    oceanGrad.addColorStop(0.5, '#071b30');
    oceanGrad.addColorStop(1, '#0a2342');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Vẽ các mảng lục địa đơn giản hóa chuẩn tọa độ địa lý
    ctx.fillStyle = '#1c4d32'; // Màu lục địa xanh sẫm khoa học

    // Hàm chuyển Lat/Lon sang Canvas X/Y (Equirectangular Projection)
    const mapPos = (lat, lon) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      return [x, y];
    };

    // Vẽ phác thảo các châu lục
    const drawLandMass = (coords) => {
      ctx.beginPath();
      coords.forEach(([lat, lon], idx) => {
        const [x, y] = mapPos(lat, lon);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    };

    // Châu Á & Châu Âu (Eurasia)
    drawLandMass([
      [70, 30], [75, 80], [70, 140], [60, 170], [40, 140], [20, 110], 
      [10, 105], [5, 100], [20, 80], [25, 60], [35, 45], [40, 30], 
      [55, 10], [60, 20], [70, 30]
    ]);

    // Châu Phi
    drawLandMass([
      [35, -5], [30, 32], [10, 50], [-10, 40], [-34, 20], 
      [-30, 15], [5, 10], [15, -15], [35, -5]
    ]);

    // Bắc Mỹ
    drawLandMass([
      [70, -160], [70, -80], [50, -60], [25, -80], [15, -90], 
      [30, -115], [50, -125], [65, -165], [70, -160]
    ]);

    // Nam Mỹ
    drawLandMass([
      [12, -75], [5, -50], [-10, -35], [-35, -55], [-55, -70], 
      [-40, -75], [-15, -80], [0, -80], [12, -75]
    ]);

    // Châu Úc
    drawLandMass([
      [-12, 130], [-15, 145], [-30, 150], [-38, 145], 
      [-35, 115], [-20, 115], [-12, 130]
    ]);

    // Băng Nam Cực & Bắc Cực
    ctx.fillStyle = '#e2f4ff';
    ctx.fillRect(0, 0, canvas.width, 40); // Bắc cực
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80); // Nam cực

    // Thêm các đường đồng mức & lưới tọa độ nhẹ tạo cảm giác bản đồ viễn thám
    ctx.strokeStyle = 'rgba(123, 231, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // Tạo texture mây khí quyển thủ tục
  createProceduralCloudsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 20 + Math.random() * 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  buildEarthMesh() {
    const geometry = new THREE.SphereGeometry(8, 64, 64);
    const texture = this.createProceduralEarthTexture();

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.75,
      metalness: 0.15,
      bumpScale: 0.05
    });

    this.earthMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.earthMesh);
  }

  buildCloudsMesh() {
    const geometry = new THREE.SphereGeometry(8.14, 48, 48);
    const cloudTexture = this.createProceduralCloudsTexture();

    const material = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.cloudsMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.cloudsMesh);
  }

  buildAtmosphereGlow() {
    // Custom Fresnel Shader Material cho lớp khí quyển phát sáng tinh tế
    const vertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        gl_FragColor = vec4(0.48, 0.90, 1.0, 1.0) * intensity;
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    const geometry = new THREE.SphereGeometry(8.7, 48, 48);
    this.atmosphereMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.atmosphereMesh);
  }

  buildCoordinateGrid() {
    const geometry = new THREE.SphereGeometry(8.25, 24, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x7be7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    this.gridMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.gridMesh);
  }

  // Chuyển Lat/Lon trên mặt cầu bán kính R sang vector 3D
  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  buildHotspots() {
    this.hotspotGroup = new THREE.Group();

    this.hotspotsData.forEach((h) => {
      const pos = this.latLonToVector3(h.lat, h.lon, 8.18);

      // Điểm mốc phát sáng
      const pinGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: h.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);

      // Vòng tròn halo xung quanh
      const ringGeo = new THREE.RingGeometry(0.24, 0.38, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: h.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      pinMesh.userData = { hotspot: h, ring: ringMesh };
      this.hotspotGroup.add(pinMesh);
      this.hotspotGroup.add(ringMesh);
    });

    this.earthMesh.add(this.hotspotGroup);
  }

  onMouseMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hotspotGroup.children.filter(c => c.userData.hotspot));

    const tooltip = document.getElementById('earth-tooltip');

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData.hotspot;
      document.body.style.cursor = 'pointer';

      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
        tooltip.innerHTML = `
          <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--cyan-glacier); text-transform: uppercase;">● Điểm quan trắc viễn thám</div>
          <div style="font-weight: 700; color: #fff; margin: 2px 0;">${data.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${data.metric}</div>
          <div style="font-size: 0.72rem; color: ${data.color}; font-weight: 600; margin-top: 4px;">Tình trạng: ${data.severity}</div>
        `;
      }
    } else {
      document.body.style.cursor = 'default';
      if (tooltip) tooltip.style.display = 'none';
    }
  }

  onMouseClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hotspotGroup.children.filter(c => c.userData.hotspot));

    if (intersects.length > 0) {
      const data = intersects[0].object.userData.hotspot;
      this.focusHotspot(data);
    }
  }

  focusHotspot(data) {
    if (typeof showHotspotDetailModal === 'function') {
      showHotspotDetailModal(data);
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  toggleRotation() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  resetCamera() {
    if (this.controls) {
      this.controls.reset();
      this.camera.position.set(0, 5, 24);
    }
  }

  updateThemeLighting(theme) {
    if (!this.ambientLight || !this.sunLight) return;
    if (theme === 'dark') {
      this.ambientLight.color.setHex(0x0a1c2e);
      this.ambientLight.intensity = 1.8;
      this.sunLight.intensity = 2.2;
      if (this.rimLight) this.rimLight.color.setHex(0x7be7ff);
    } else {
      // Sáng rực rỡ, tươi mới, hành tinh xanh nổi bật giữa bầu trời
      this.ambientLight.color.setHex(0x93c5fd);
      this.ambientLight.intensity = 2.6;
      this.sunLight.intensity = 2.5;
      if (this.rimLight) this.rimLight.color.setHex(0x0284c7);
    }
  }

  toggleGrid() {
    if (this.gridMesh) {
      this.gridMesh.visible = !this.gridMesh.visible;
      return this.gridMesh.visible;
    }
    return false;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Tự động xoay Trái Đất & Mây
    if (this.isRotating && this.earthMesh) {
      this.earthMesh.rotation.y += this.rotationSpeed;
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += this.rotationSpeed * 1.35;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  renderFallback() {
    this.container.innerHTML = `
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #0b1d2b 0%, #050b14 80%); color: var(--text-white); text-align: center; padding: 24px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🌐</div>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--cyan-glacier);">Chế Độ Trực Quan Hóa 2D</h3>
        <p style="color: var(--text-muted); max-width: 480px; font-size: 0.95rem; margin-top: 8px;">
          Trình duyệt của bạn đang hoạt động ở chế độ tiết kiệm tài nguyên hoặc không hỗ trợ WebGL. Mọi dữ liệu khoa học và phòng thí nghiệm bên dưới vẫn hoạt động hoàn toàn đầy đủ.
        </p>
      </div>
    `;
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.climateEarth = new ClimateEarthViewer('hero-webgl-container');
  window.earthViewer = window.climateEarth;
});
