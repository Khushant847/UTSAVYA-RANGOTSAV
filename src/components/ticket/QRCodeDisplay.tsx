"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  return (
    <div className="rounded-2xl bg-white p-4 inline-block">
      <QRCodeCanvas value={value} size={size} level="H" includeMargin />
    </div>
  );
}