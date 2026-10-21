import React, { useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  ExternalLink,
  QrCode,
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Copy,
  Check,
  Layers,
  FileText,
  Sparkles,
  Scissors,
} from 'lucide-react';

// Bulletproof rounded rectangle drawing helper for cross-browser canvas support
function drawRoundRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, lineWidth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth || 1;
    ctx.stroke();
  }
  ctx.restore();
}

// Draw a circular clipped logo with gold border
function drawCircularLogo(ctx, img, cx, cy, radius) {
  if (!img) return;
  ctx.save();
  // White backing disc
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Clipped image
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  // Golden stroke ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = Math.max(2, Math.round(radius * 0.08));
  ctx.stroke();
  ctx.restore();
}

// Safe image loader helper with timeout safety
function loadLogoImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    setTimeout(() => resolve(null), 1500);
  });
}

// Cross-browser download trigger helper
function triggerDownload(dataUrl, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate single QR code card (800x980 crisp PNG) with Logo
function generateQrCardDataUrl(tableId, qrSourceCanvas, logoImg) {
  const canvas = document.createElement('canvas');
  const size = 800;
  canvas.width = size;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, 980);

  // Borders
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, size - 40, 940);

  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, size - 60, 920);

  // Circular Logo at Top
  if (logoImg) {
    drawCircularLogo(ctx, logoImg, size / 2, 75, 42);
  }

  // Header Texts
  const headerY = logoImg ? 140 : 85;
  ctx.fillStyle = '#7f1d1d';
  ctx.font = '900 40px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('BIKANER EXPRESS', size / 2, headerY);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('• 100% PURE VEG RESTAURANT •', size / 2, headerY + 30);

  ctx.fillStyle = '#78716c';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Aman International Mall • Roof Top Mainpuri', size / 2, headerY + 56);

  // QR pod
  const qrSize = 480;
  const qrX = (size - qrSize) / 2;
  const qrY = headerY + 76;

  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

  if (qrSourceCanvas) {
    ctx.drawImage(qrSourceCanvas, qrX, qrY, qrSize, qrSize);
  }

  // Table Pill
  const tableLabel = tableId.replace('T-', 'TABLE ');
  const pillW = 340;
  const pillH = 68;
  const pillX = (size - pillW) / 2;
  const pillY = qrY + qrSize + 28;

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 34, '#b45309', '#f59e0b', 3);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tableLabel, size / 2, pillY + 46);

  // Instructions
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Scan with Camera to View Menu & Order', size / 2, pillY + 115);

  ctx.fillStyle = '#78716c';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('No App Required • Instant Kitchen Bell', size / 2, pillY + 145);

  return canvas.toDataURL('image/png');
}

// Generate HD printable standee card (1200x1700 HD PNG) with Logo
function generateStandeeCardDataUrl(tableId, qrSourceCanvas, logoImg) {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1700;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#4a0404');
  grad.addColorStop(0.3, '#2b0005');
  grad.addColorStop(0.7, '#1f0003');
  grad.addColorStop(1, '#0e0002');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Gold borders
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 8;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Corner Dots
  const corners = [
    [58, 58],
    [width - 58, 58],
    [58, height - 58],
    [width - 58, height - 58],
  ];
  ctx.fillStyle = '#fbbf24';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Official Circular Logo at Top
  if (logoImg) {
    drawCircularLogo(ctx, logoImg, width / 2, 140, 68);
  }

  // Texts
  ctx.textAlign = 'center';
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('• 100% PURE VEG RESTAURANT •', width / 2, logoImg ? 260 : 180);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 58px "Playfair Display", Georgia, serif';
  ctx.fillText('BIKANER EXPRESS', width / 2, logoImg ? 330 : 250);

  ctx.fillStyle = '#fed7aa';
  ctx.font = '26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Aman International Mall • Roof Top Mainpuri', width / 2, logoImg ? 375 : 295);

  // White Pod for QR Code
  const podW = 720;
  const podH = 720;
  const podX = (width - podW) / 2;
  const podY = logoImg ? 435 : 340;

  drawRoundRect(ctx, podX, podY, podW, podH, 36, '#ffffff', '#fbbf24', 6);

  if (qrSourceCanvas) {
    const qrSize = 620;
    const qrX = (width - qrSize) / 2;
    const qrY = podY + 50;
    ctx.drawImage(qrSourceCanvas, qrX, qrY, qrSize, qrSize);
  }

  // Table Pill
  const tableLabel = tableId.replace('T-', 'TABLE ');
  const pillW = 540;
  const pillH = 100;
  const pillX = (width - pillW) / 2;
  const pillY = podY + podH + 40;

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 50, '#f59e0b', '#fef08a', 4);

  ctx.fillStyle = '#1c1917';
  ctx.font = '900 48px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(tableLabel, width / 2, pillY + 68);

  // Call to action
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Scan with Camera to View Menu & Order', width / 2, pillY + 160);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('📱 No App Required  •  ⚡ Instant Kitchen Bell', width / 2, pillY + 215);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, pillY + 270);
  ctx.lineTo(width / 2 + 250, pillY + 270);
  ctx.stroke();

  ctx.fillStyle = '#d6d3d1';
  ctx.font = '22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Enjoy Fresh, Authentic North & South Indian Delicacies', width / 2, pillY + 310);

  return canvas.toDataURL('image/png');
}

// Generate HD A4 Sheet containing 4 Royal Standee Cards with Logo
function generateA4SheetDataUrl(pageNumber, logoImg) {
  const startT = (pageNumber - 1) * 4 + 1;
  const tableIds = [
    `T-${startT}`,
    `T-${startT + 1}`,
    `T-${startT + 2}`,
    `T-${startT + 3}`,
  ];

  const canvas = document.createElement('canvas');
  const width = 1654;
  const height = 2339;
  const ctx = canvas.getContext('2d');

  // Clean White Sheet Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Sheet Top Info Header
  ctx.fillStyle = '#7f1d1d';
  ctx.font = '900 28px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `BIKANER EXPRESS — TABLE QR STANDS (PAGE ${pageNumber} OF 3)`,
    width / 2,
    46
  );

  ctx.fillStyle = '#57534e';
  ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Tables ${startT} to ${startT + 3} • Cut along dotted lines for 4 individual table standees`,
    width / 2,
    74
  );

  // Card Grid Layout (2 columns x 2 rows)
  const cardW = 735;
  const cardH = 1080;
  const gapX = 84;
  const gapY = 40;
  const startX = 50;
  const startY = 98;

  tableIds.forEach((tId, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cardX = startX + col * (cardW + gapX);
    const cardY = startY + row * (cardH + gapY);

    // 1. Dotted Cutting Line
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.restore();

    // Scissor label
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('✂ Cut line', cardX + cardW - 10, cardY + 16);

    // 2. Standee Card Container
    const innerX = cardX + 10;
    const innerY = cardY + 22;
    const innerW = cardW - 20;
    const innerH = cardH - 32;
    const cardCenterX = innerX + innerW / 2;

    // Royal Maroon Gradient Background
    const cardGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    cardGrad.addColorStop(0, '#4a0404');
    cardGrad.addColorStop(0.35, '#2b0005');
    cardGrad.addColorStop(0.7, '#1f0003');
    cardGrad.addColorStop(1, '#0e0002');
    drawRoundRect(ctx, innerX, innerY, innerW, innerH, 24, cardGrad, '#d97706', 5);

    // Inner subtle gold border
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(innerX + 8, innerY + 8, innerW - 16, innerH - 16);

    // 4 Corner Gold Dots
    const cardCorners = [
      [innerX + 16, innerY + 16],
      [innerX + innerW - 16, innerY + 16],
      [innerX + 16, innerY + innerH - 16],
      [innerX + innerW - 16, innerY + innerH - 16],
    ];
    ctx.fillStyle = '#fbbf24';
    cardCorners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Circular Logo at Top of Card
    if (logoImg) {
      drawCircularLogo(ctx, logoImg, cardCenterX, innerY + 65, 38);
    }

    // Texts
    const textStartY = logoImg ? innerY + 125 : innerY + 45;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('• 100% PURE VEG RESTAURANT •', cardCenterX, textStartY);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 38px "Playfair Display", Georgia, serif';
    ctx.fillText('BIKANER EXPRESS', cardCenterX, textStartY + 40);

    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Aman International Mall • Roof Top Mainpuri', cardCenterX, textStartY + 68);

    // White Pod for QR Code with Gold Border
    const podSize = 460;
    const podX = cardCenterX - podSize / 2;
    const podY = textStartY + 92;

    drawRoundRect(ctx, podX, podY, podSize, podSize, 24, '#ffffff', '#fbbf24', 5);

    // Draw QR from pre-rendered source canvas
    const qrSource = document.getElementById(`qr-canvas-source-${tId}`);
    if (qrSource) {
      const qrDrawSize = 400;
      const qrDrawX = cardCenterX - qrDrawSize / 2;
      const qrDrawY = podY + 30;
      ctx.drawImage(qrSource, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);
    }

    // Table Badge Pill
    const pillW = 380;
    const pillH = 72;
    const pillX = cardCenterX - pillW / 2;
    const pillY = podY + podSize + 30;

    drawRoundRect(ctx, pillX, pillY, pillW, pillH, 36, '#f59e0b', '#fef08a', 3);

    const tableNum = tId.replace('T-', '');
    ctx.fillStyle = '#1c1917';
    ctx.font = '900 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`TABLE ${tableNum}`, cardCenterX, pillY + 50);

    // Card Footer Call to Action
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Scan with Camera to View Menu & Order', cardCenterX, pillY + 120);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('📱 No App Required  •  ⚡ Instant Kitchen Bell', cardCenterX, pillY + 155);
  });

  return canvas.toDataURL('image/png');
}

export default function QrCodeModal({ isOpen, onClose }) {
  const [viewMode, setViewMode] = useState('a4_sheets');
  const [activeA4Page, setActiveA4Page] = useState(1);
  const [selectedTable, setSelectedTable] = useState('T-1');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  if (!isOpen) return null;

  const currentHost = window.location.origin;
  const qrUrl = `${currentHost}/?table=${selectedTable}`;

  // Print all 3 A4 Pages with 4 QRs each (Tables 1-12)
  const handlePrintSheets = () => {
    document.body.classList.add('print-sheets');
    document.body.classList.remove('print-single');
    const cleanup = () => {
      document.body.classList.remove('print-sheets');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2000);
  };

  // Print Single Standee Card
  const handlePrintSingle = () => {
    document.body.classList.add('print-single');
    document.body.classList.remove('print-sheets');
    const cleanup = () => {
      document.body.classList.remove('print-single');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Single Table QR (PNG) with Logo
  const handleDownloadQrOnly = async () => {
    try {
      setIsDownloading(true);
      const qrSource = document.getElementById(`qr-canvas-source-${selectedTable}`);
      if (!qrSource) {
        alert('QR code source canvas is initializing. Please wait a moment.');
        return;
      }
      const logoImg = await loadLogoImage('/bikaner-logo.jpg');
      const dataUrl = generateQrCardDataUrl(selectedTable, qrSource, logoImg);
      triggerDownload(dataUrl, `Bikaner_QR_${selectedTable}.png`);
    } catch (err) {
      console.error('QR download failed:', err);
      alert('QR download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download Full Acrylic Standee Card (HD PNG) with Logo
  const handleDownloadFullStandee = async () => {
    try {
      setIsDownloading(true);
      const qrSource = document.getElementById(`qr-canvas-source-${selectedTable}`);
      if (!qrSource) {
        alert('QR code source canvas is initializing. Please wait a moment.');
        return;
      }
      const logoImg = await loadLogoImage('/bikaner-logo.jpg');
      const dataUrl = generateStandeeCardDataUrl(selectedTable, qrSource, logoImg);
      triggerDownload(dataUrl, `Bikaner_Standee_${selectedTable}.png`);
    } catch (err) {
      console.error('Standee download failed:', err);
      alert('Standee download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download 1 A4 Page with Logo
  const handleDownloadA4Page = async (pageNum) => {
    try {
      setIsDownloading(true);
      const startT = (pageNum - 1) * 4 + 1;
      const endT = startT + 3;
      const logoImg = await loadLogoImage('/bikaner-logo.jpg');
      const dataUrl = generateA4SheetDataUrl(pageNum, logoImg);
      triggerDownload(
        dataUrl,
        `Bikaner_A4_Sheet_Page_${pageNum}_Tables_${startT}_to_${endT}.png`
      );
    } catch (err) {
      console.error('A4 sheet download error:', err);
      alert('A4 Sheet download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download All 3 A4 Sheets in sequence with Logo
  const handleDownloadAllA4Sheets = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const logoImg = await loadLogoImage('/bikaner-logo.jpg');
      for (let p = 1; p <= 3; p++) {
        const startT = (p - 1) * 4 + 1;
        const endT = startT + 3;
        setBatchProgress(`Generating A4 Sheet Page ${p} of 3 (Tables ${startT}-${endT})...`);
        const dataUrl = generateA4SheetDataUrl(p, logoImg);
        triggerDownload(
          dataUrl,
          `Bikaner_A4_Sheet_Page_${p}_Tables_${startT}_to_${endT}.png`
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      setBatchProgress('All 3 A4 Sheets Downloaded! ✓');
      setTimeout(() => setBatchProgress(''), 3500);
    } catch (err) {
      console.error('Batch A4 download error:', err);
      setBatchProgress('Download interrupted');
    } finally {
      setIsDownloading(false);
    }
  };

  // Batch download all 20 individual table QRs with Logo
  const handleDownloadAllTables = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const logoImg = await loadLogoImage('/bikaner-logo.jpg');
      for (let i = 1; i <= 20; i++) {
        const tableId = `T-${i}`;
        setBatchProgress(`Downloading Table ${i} of 20...`);
        const qrSource = document.getElementById(`qr-canvas-source-${tableId}`);
        if (qrSource) {
          const dataUrl = generateQrCardDataUrl(tableId, qrSource, logoImg);
          triggerDownload(dataUrl, `Bikaner_QR_${tableId}.png`);
        }
        await new Promise((r) => setTimeout(r, 260));
      }
      setBatchProgress('All 20 Tables Downloaded! ✓');
      setTimeout(() => setBatchProgress(''), 3500);
    } catch (err) {
      console.error('Batch download interrupted:', err);
      setBatchProgress('Download interrupted');
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate the 4 tables on current A4 page
  const currentA4Start = (activeA4Page - 1) * 4 + 1;
  const currentA4Tables = [
    currentA4Start,
    currentA4Start + 1,
    currentA4Start + 2,
    currentA4Start + 3,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden pre-rendered high-res canvas elements for instant exports */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {[...Array(20)].map((_, i) => {
          const t = `T-${i + 1}`;
          const url = `${currentHost}/?table=${t}`;
          return (
            <QRCodeCanvas
              key={t}
              id={`qr-canvas-source-${t}`}
              value={url}
              size={600}
              level="H"
              includeMargin={true}
            />
          );
        })}
      </div>

      {/* Dedicated 3-Page A4 Sheet Print DOM Container (Only visible during print) */}
      <div id="qr-multi-page-print" className="qr-print-only-container">
        {[1, 2, 3].map((pageNum) => {
          const startT = (pageNum - 1) * 4 + 1;
          const pageTables = [startT, startT + 1, startT + 2, startT + 3];
          return (
            <div key={pageNum} className="a4-sheet-page">
              {pageTables.map((num) => {
                const tableId = `T-${num}`;
                const url = `${currentHost}/?table=${tableId}`;
                return (
                  <div key={tableId} className="a4-standee-card-wrapper">
                    <div className="a4-standee-card">
                      <div>
                        {/* Circular Logo at top of printed card */}
                        <img
                          src="/bikaner-logo.jpg"
                          alt="Bikaner Express Logo"
                          className="a4-card-logo"
                        />
                        <div className="a4-veg-badge">• 100% PURE VEG RESTAURANT •</div>
                        <h4 className="a4-brand-title">BIKANER EXPRESS</h4>
                        <p className="a4-location">Aman International Mall • Roof Top Mainpuri</p>
                      </div>

                      <div className="a4-qr-container">
                        <QRCodeSVG
                          value={url}
                          size={150}
                          level="H"
                          includeMargin={false}
                        />
                      </div>

                      <div>
                        <div className="a4-table-pill">
                          TABLE {num}
                        </div>
                        <div className="a4-instructions">
                          Scan with camera to view menu & order!
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl z-10 border border-amber-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back</span>
            </button>
            <div className="flex items-center gap-1.5 truncate">
              <QrCode className="w-4 h-4 text-red-700 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">
                Restaurant QR Code Generator
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-4 gap-1">
          <button
            onClick={() => setViewMode('a4_sheets')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              viewMode === 'a4_sheets'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3 Pages A4 Format (Table 1-12)</span>
          </button>

          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              viewMode === 'single'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Single Table QR (1-20)</span>
          </button>
        </div>

        {/* TAB 1: 3-PAGE A4 FORMAT (TABLE 1 TO 12 • 4 QRs PER PAGE) */}
        {viewMode === 'a4_sheets' && (
          <div>
            {/* Explanatory Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3 text-xs text-amber-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Official Logo & Standee Design:</strong> Har page par 4 Royal Standees Official Logo ke sath hain.
                </span>
              </div>
              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md font-black text-[11px] shrink-0">
                With Logo
              </span>
            </div>

            {/* Page Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { page: 1, label: 'Page 1 (Tables 1-4)', tables: 'T-1 to T-4' },
                { page: 2, label: 'Page 2 (Tables 5-8)', tables: 'T-5 to T-8' },
                { page: 3, label: 'Page 3 (Tables 9-12)', tables: 'T-9 to T-12' },
              ].map((p) => {
                const isActive = activeA4Page === p.page;
                return (
                  <button
                    key={p.page}
                    onClick={() => setActiveA4Page(p.page)}
                    className={`py-2 px-1 text-center rounded-xl transition border text-xs font-bold ${
                      isActive
                        ? 'bg-red-700 text-white border-red-800 shadow-sm'
                        : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div>{p.label}</div>
                    <div className={`text-[10px] font-normal ${isActive ? 'text-amber-200' : 'text-stone-500'}`}>
                      {p.tables}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live 2x2 Interactive Preview of Selected A4 Page (With Official Circular Logo) */}
            <div className="bg-stone-100 border-2 border-stone-300 rounded-2xl p-3 mb-4 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-2 px-1">
                <span className="flex items-center gap-1 text-red-800">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>A4 Sheet Preview (Page {activeA4Page} of 3)</span>
                </span>
                <span className="text-stone-500">
                  4 Royal Standees (✂ Cut & Place)
                </span>
              </div>

              {/* 2x2 Grid of 4 Standee Cards with Logo */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentA4Tables.map((num) => {
                  const tId = `T-${num}`;
                  const tUrl = `${currentHost}/?table=${tId}`;
                  return (
                    <div
                      key={tId}
                      className="border-2 border-dashed border-stone-400/80 rounded-xl p-1 bg-white relative shadow-xs"
                    >
                      <div className="text-[8px] font-bold text-stone-400 text-right pr-1 pt-0.5">
                        ✂ Cut line
                      </div>

                      {/* Royal Standee with Logo at top and in QR */}
                      <div className="bg-linear-to-b from-red-950 via-stone-900 to-amber-950 text-white rounded-xl p-2.5 text-center border-2 border-amber-500/40 shadow-sm flex flex-col items-center">
                        {/* Circular Logo at Top */}
                        <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-red-600 to-amber-300 shadow-xs mb-1">
                          <img
                            src="/bikaner-logo.jpg"
                            alt="Logo"
                            className="w-full h-full rounded-full object-cover bg-white"
                          />
                        </div>

                        <div className="text-[7.5px] font-black tracking-widest text-emerald-300 uppercase mb-0.5">
                          • 100% PURE VEG RESTAURANT •
                        </div>
                        <h4 className="text-xs font-black text-amber-300 tracking-tight mb-0.5">
                          BIKANER EXPRESS
                        </h4>
                        <p className="text-[8.5px] text-stone-300 mb-1 truncate w-full">
                          Aman International Mall • Roof Top
                        </p>

                        {/* Crisp QR Code */}
                        <div className="bg-white p-1 rounded-xl border-2 border-amber-400 inline-block shadow-xs my-0.5">
                          <QRCodeSVG
                            value={tUrl}
                            size={78}
                            level="H"
                            includeMargin={false}
                          />
                        </div>

                        <div className="mt-1 w-full">
                          <span className="inline-block bg-amber-400 text-stone-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider mb-0.5 shadow-xs">
                            TABLE {num}
                          </span>
                          <p className="text-[8px] text-stone-200 font-medium">
                            Scan with phone to order!
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* A4 Sheet Action Buttons */}
            <div className="space-y-2">
              {/* Primary Print All 3 Pages */}
              <button
                onClick={handlePrintSheets}
                className="w-full bg-red-700 hover:bg-red-800 active:scale-98 text-white text-xs font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-red-200"
              >
                <Printer className="w-4 h-4 text-amber-300 shrink-0" />
                <span>🖨️ Print / Save as PDF (All 3 Pages with Logo)</span>
              </button>

              {/* Download Current Page & Download All 3 Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadA4Page(activeA4Page)}
                  disabled={isDownloading}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download Page {activeA4Page} (A4 PNG with Logo)</span>
                </button>

                <button
                  onClick={handleDownloadAllA4Sheets}
                  disabled={isDownloading}
                  className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 disabled:opacity-50"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>
                    {batchProgress ? batchProgress : 'Download All 3 A4 Sheets (PNG with Logo)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SINGLE TABLE QR (1 TO 20) */}
        {viewMode === 'single' && (
          <div>
            {/* Table Selector (T-1 to T-20) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Select Restaurant Table:
                </label>
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  Selected: {selectedTable.replace('T-', 'Table ')}
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1.5 border border-stone-200 rounded-xl bg-stone-50/50">
                {[...Array(20)].map((_, i) => {
                  const t = `T-${i + 1}`;
                  const isSelected = selectedTable === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTable(t)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition active:scale-95 ${
                        isSelected
                          ? 'bg-red-700 text-white shadow-sm ring-2 ring-red-400'
                          : 'bg-white hover:bg-amber-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      Table {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standee Preview Card (With Official Circular Logo) */}
            <div
              id="qr-standee-print"
              className="bg-linear-to-b from-red-950 via-stone-900 to-amber-950 text-white rounded-2xl p-4 text-center shadow-lg relative overflow-hidden border-2 border-amber-500/30 mb-4"
            >
              {/* Circular Logo at Top */}
              <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-red-600 to-amber-300 shadow-md mx-auto mb-1.5">
                <img
                  src="/bikaner-logo.jpg"
                  alt="Bikaner Express Logo"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>

              <div className="text-[10px] font-black tracking-widest text-emerald-300 uppercase mb-0.5">
                • 100% PURE VEG RESTAURANT •
              </div>
              <h4 className="text-lg font-black text-amber-300 tracking-tight mb-0.5">
                BIKANER EXPRESS
              </h4>
              <p className="text-[11px] text-stone-300 mb-2">
                Aman International Mall • Roof Top Mainpuri
              </p>

              {/* Crisp QR Code Container */}
              <div className="bg-white p-2 rounded-2xl inline-block shadow-md border-4 border-amber-400/40">
                <QRCodeSVG
                  value={qrUrl}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-2.5">
                <span className="inline-block bg-amber-400 text-stone-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-wider mb-1 shadow-sm">
                  {selectedTable.replace('T-', 'Table ')}
                </span>
                <p className="text-[11px] text-stone-200 font-medium">
                  Scan with phone camera to view menu & order!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadQrOnly}
                  disabled={isDownloading}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download QR (PNG with Logo)</span>
                </button>

                <button
                  onClick={handleDownloadFullStandee}
                  disabled={isDownloading}
                  className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Download Standee Card (HD)</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={handlePrintSingle}
                  className="bg-stone-800 hover:bg-stone-900 active:scale-98 text-white text-xs font-bold py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">Print Standee</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 text-xs font-bold py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-stone-200"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-bold truncate">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                      <span className="truncate">Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 text-xs font-bold py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-stone-200 text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span className="truncate">Open Link</span>
                </a>
              </div>

              <div className="pt-1.5 border-t border-stone-100">
                <button
                  onClick={handleDownloadAllTables}
                  disabled={isDownloading}
                  className="w-full bg-stone-50 hover:bg-amber-50 active:scale-98 text-stone-700 hover:text-amber-900 border border-stone-200 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {batchProgress ? batchProgress : '📦 Download All 20 Table QRs (1-Click)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
