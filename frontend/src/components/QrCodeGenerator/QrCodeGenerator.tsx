import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '../ui/Button/Button';

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
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((dataUrl) => {
        if (!active) return;
        setQrCodeDataUrl(dataUrl);
        setError('');
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error('Erro ao gerar QR Code:', err);
        setError('Erro ao gerar QR Code');
        setQrCodeDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [url, size, attempt]);

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
      <div className={`bg-error-50 border border-error-100 rounded p-3 text-center ${className}`}>
        <p className="text-error-600">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAttempt((current) => current + 1)}
          className="mt-2 underline"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!qrCodeDataUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={qrCodeDataUrl}
        alt="QR Code"
        className="border border-line rounded-lg"
        style={{ width: size, height: size }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="mt-2 underline"
      >
        Baixar QR Code
      </Button>
      <p className="text-xs text-ink-muted mt-1">
        Escaneie para acessar o link
      </p>
    </div>
  );
};

export default QrCodeGenerator;
