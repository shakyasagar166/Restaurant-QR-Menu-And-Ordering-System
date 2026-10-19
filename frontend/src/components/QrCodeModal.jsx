import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ExternalLink, QrCode, ArrowLeft } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose }) {
  const [selectedTable, setSelectedTable] = useState('T-1');

  if (!isOpen) return null;

  const currentHost = window.location.origin;
  const qrUrl = `${currentHost}/?table=${selectedTable}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 border border-amber-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
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
                Table QR Generator
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

        {/* Table Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-700 block mb-1.5">
            Select Restaurant Table:
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 border rounded-xl">
            {[...Array(20)].map((_, i) => {
              const t = `T-${i + 1}`;
              const isSelected = selectedTable === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    isSelected
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-amber-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  Table {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Printable QR Standee Card */}
        <div className="bg-linear-to-b from-red-900 via-stone-900 to-amber-950 text-white rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-black tracking-widest text-emerald-300 uppercase mb-1">
            • 100% PURE VEG RESTAURANT •
          </div>
          <h4 className="text-xl font-black text-amber-300 tracking-tight mb-0.5">
            BIKANER EXPRESS
          </h4>
          <p className="text-xs text-stone-300 mb-4">
            Aman International Mall • Roof Top Mainpuri
          </p>

          {/* QR Code SVG */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-md">
            <QRCodeSVG
              value={qrUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-4">
            <span className="inline-block bg-amber-400 text-stone-950 font-black text-sm px-4 py-1 rounded-full uppercase tracking-wider mb-2">
              {selectedTable.replace('T-', 'Table ')}
            </span>
            <p className="text-xs text-stone-300">
              Scan with camera to view menu & ring kitchen bell!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Table Link</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-red-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Standee</span>
          </button>
        </div>
      </div>
    </div>
  );
}
