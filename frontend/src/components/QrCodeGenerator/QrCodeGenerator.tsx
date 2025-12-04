import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QrCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  url,
  size = 128,
  className = ''
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setError('');
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError('Erro ao gerar QR Code');
      setQrCodeDataUrl('');
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded p-3 text-center ${className}`}>
        <p className="text-red-600">{error}</p>
        <button
          onClick={generateQRCode}
          className="mt-2 text-sm text-red-700 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!qrCodeDataUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={qrCodeDataUrl}
        alt="QR Code"
        className="border border-gray-300 rounded-lg"
        style={{ width: size, height: size }}
      />
      <button
        onClick={handleDownload}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Baixar QR Code
      </button>
      <p className="text-xs text-gray-500 mt-1">
        Escaneie para acessar o link
      </p>
    </div>
  );
};

export default QrCodeGenerator;