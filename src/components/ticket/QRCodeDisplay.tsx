"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  if (!value) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] font-medium uppercase">No QR Available</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 inline-block">
      <QRCodeSVG value={value} size={size} level="H" includeMargin />
    </div>
  );
}