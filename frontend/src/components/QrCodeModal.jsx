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
  Sparkles,
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

// Generate single QR code card (800x940 crisp PNG)
function generateQrCardDataUrl(tableId, qrSourceCanvas) {
  const canvas = document.createElement('canvas');
  const size = 800;
  canvas.width = size;
  canvas.height = 940;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, 940);

  // Borders
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, size - 40, 900);

  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, size - 60, 880);

  // Header
  ctx.fillStyle = '#7f1d1d';
  ctx.font = '900 42px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('BIKANER EXPRESS', size / 2, 85);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('• 100% PURE VEG RESTAURANT •', size / 2, 118);

  ctx.fillStyle = '#78716c';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Aman International Mall • Roof Top Mainpuri', size / 2, 145);

  // QR pod
  const qrSize = 500;
  const qrX = (size - qrSize) / 2;
  const qrY = 175;

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
  const pillY = 730;

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 34, '#b45309', '#f59e0b', 3);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tableLabel, size / 2, pillY + 46);

  // Instructions
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Scan with Camera to View Menu & Order', size / 2, 845);

  ctx.fillStyle = '#78716c';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('No App Required • Instant Kitchen Bell', size / 2, 878);

  return canvas.toDataURL('image/png');
}

// Generate HD printable standee card (1200x1700 HD PNG)
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

  // Official Circular Logo
  if (logoImg) {
    const lSize = 150;
    const lX = (width - lSize) / 2;
    const lY = 85;

    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, lY + lSize / 2, lSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, lX, lY, lSize, lSize);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, lY + lSize / 2, lSize / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }

  // Texts
  ctx.textAlign = 'center';
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('• 100% PURE VEG RESTAURANT •', width / 2, logoImg ? 285 : 180);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 58px "Playfair Display", Georgia, serif';
  ctx.fillText('BIKANER EXPRESS', width / 2, logoImg ? 355 : 250);

  ctx.fillStyle = '#fed7aa';
  ctx.font = '26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Aman International Mall • Roof Top Mainpuri', width / 2, logoImg ? 400 : 295);

  // White Pod for QR Code
  const podW = 720;
  const podH = 720;
  const podX = (width - podW) / 2;
  const podY = logoImg ? 455 : 340;

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
  const pillY = podY + podH + 45;

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
  ctx.moveTo(width / 2 - 250, pillY + 275);
  ctx.lineTo(width / 2 + 250, pillY + 275);
  ctx.stroke();

  ctx.fillStyle = '#d6d3d1';
  ctx.font = '22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Enjoy Fresh, Authentic North & South Indian Delicacies', width / 2, pillY + 315);

  return canvas.toDataURL('image/png');
}

export default function QrCodeModal({ isOpen, onClose }) {
  const [selectedTable, setSelectedTable] = useState('T-1');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  if (!isOpen) return null;

  const currentHost = window.location.origin;
  const qrUrl = `${currentHost}/?table=${selectedTable}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Single Table QR (PNG)
  const handleDownloadQrOnly = () => {
    try {
      setIsDownloading(true);
      const qrSource = document.getElementById(`qr-canvas-source-${selectedTable}`);
      if (!qrSource) {
        alert('QR code source canvas is initializing. Please wait a moment.');
        return;
      }
      const dataUrl = generateQrCardDataUrl(selectedTable, qrSource);
      triggerDownload(dataUrl, `Bikaner_QR_${selectedTable}.png`);
    } catch (err) {
      console.error('QR download failed:', err);
      alert('QR download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download Full Acrylic Standee Card (HD PNG)
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

  // Batch download all 20 tables
  const handleDownloadAllTables = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      for (let i = 1; i <= 20; i++) {
        const tableId = `T-${i}`;
        setBatchProgress(`Downloading Table ${i} of 20...`);
        const qrSource = document.getElementById(`qr-canvas-source-${tableId}`);
        if (qrSource) {
          const dataUrl = generateQrCardDataUrl(tableId, qrSource);
          triggerDownload(dataUrl, `Bikaner_QR_${tableId}.png`);
        }
        // Small delay to prevent browser download throttling
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Hidden pre-rendered high-res canvas elements for instant, 100% reliable single & batch exports */}
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

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl z-10 border border-amber-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100 gap-2">
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
                Table QR & Standee Generator
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
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-stone-200 rounded-xl bg-stone-50/50">
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

        {/* Live Printable Standee Preview Card */}
        <div
          id="qr-standee-print"
          className="bg-linear-to-b from-red-950 via-stone-900 to-amber-950 text-white rounded-2xl p-5 text-center shadow-lg relative overflow-hidden border-2 border-amber-500/30"
        >
          <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-300 uppercase mb-1">
            • 100% PURE VEG RESTAURANT •
          </div>
          <h4 className="text-xl font-black text-amber-300 tracking-tight mb-0.5">
            BIKANER EXPRESS
          </h4>
          <p className="text-xs text-stone-300 mb-3">
            Aman International Mall • Roof Top Mainpuri
          </p>

          {/* Crisp QR Code Container */}
          <div className="bg-white p-3 rounded-2xl inline-block shadow-md border-4 border-amber-400/40">
            <QRCodeSVG
              value={qrUrl}
              size={165}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-3">
            <span className="inline-block bg-amber-400 text-stone-950 font-black text-xs sm:text-sm px-4 py-1 rounded-full uppercase tracking-wider mb-1.5 shadow-sm">
              {selectedTable.replace('T-', 'Table ')}
            </span>
            <p className="text-[11px] sm:text-xs text-stone-200 font-medium">
              Scan with phone camera to view menu & order!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          {/* Main 2 Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQrOnly}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download QR (PNG)</span>
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

          {/* Print, Copy Link, Open Link */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handlePrint}
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

          {/* Batch Download All 20 Tables */}
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
    </div>
  );
}
