document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = document.getElementById('image').files[0];
  const progressBar = document.getElementById('progressBar');
  const resultDiv = document.getElementById('result');

  // Reset UI
  progressBar.style.width = '0%';
  resultDiv.innerHTML = '';

  if (!file) {
    resultDiv.innerHTML = '❌ Silakan pilih file gambar.';
    return;
  }

  // Baca gambar menggunakan FileReader
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;

    img.onload = () => {
      // Buat canvas untuk memproses gambar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Proses gambar pixel per pixel
      const blocks = [];
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Konversi RGB ke hex
          const hexColor = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;

          // Dapatkan jenis blok berdasarkan warna
          const blockType = getClosestBlock(hexColor);
          blocks.push({ x, y: -y, z: 0, type: blockType });
        }

        // Update progress bar
        progressBar.style.width = `${((y + 1) / canvas.height) * 100}%`;
      }

      // Hasilkan file JSON
      const structure = { origin: { x: 0, y: 0, z: 0 }, blocks };
      const json = JSON.stringify(structure, null, 2);

      // Buat file download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'structure.json';
      a.click();

      // Bersihkan URL
      URL.revokeObjectURL(url);
      resultDiv.innerHTML = '✅ File berhasil diunduh!';
    };
  };

  reader.readAsDataURL(file);
});

// Fungsi untuk mendapatkan jenis blok berdasarkan warna
function getClosestBlock(hexColor) {
  const COLOR_TO_BLOCK = {
    '#000000': 'black_concrete',
    '#ffffff': 'white_concrete',
    '#ff0000': 'red_concrete',
    '#00ff00': 'green_concrete',
    '#0000ff': 'blue_concrete',
    '#ffff00': 'yellow_concrete',
    '#ff00ff': 'magenta_concrete',
    '#00ffff': 'cyan_concrete',
    '#808080': 'stone',
  };

  // Cari warna terdekat
  const colors = Object.keys(COLOR_TO_BLOCK);
  let closest = colors[0];
  let minDiff = Infinity;

  colors.forEach((color) => {
    const diff = colorDifference(hexColor, color);
    if (diff < minDiff) {
      closest = color;
      minDiff = diff;
    }
  });

  return COLOR_TO_BLOCK[closest];
}

// Fungsi untuk menghitung perbedaan warna
function colorDifference(color1, color2) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    }

document.getElementById('image').addEventListener('change', function (e) {
  const fileLabel = document.getElementById('fileLabel');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const file = e.target.files[0];

  console.log('File yang dipilih:', file); // Debugging: Cek file yang dipilih

  if (file) {
    fileLabel.textContent = 'Ganti Gambar';
    fileNameDisplay.textContent = `File terpilih: ${file.name}`;
  } else {
    fileLabel.textContent = 'Pilih Gambar';
    fileNameDisplay.textContent = '';
  }
});
