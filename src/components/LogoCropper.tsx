import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Crosshair } from 'lucide-react';

interface LogoCropperProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const LogoCropper: React.FC<LogoCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Aspect ratio for logo: 200x60 = 3.33:1
  const LOGO_ASPECT = 200 / 60;

  const onCropCompleteInternal = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCenter = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const getCroppedImg = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const imageElement = document.createElement('img');
    imageElement.src = image;
    await new Promise((resolve) => { imageElement.onload = resolve; });
    
    const canvas = document.createElement('canvas');
    // Output size: 200x60
    canvas.width = 200;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      200,
      60
    );
    
    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, 'image/png');
  }, [croppedAreaPixels, image, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Beskär logotyp</h3>
        <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={LOGO_ASPECT}
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        <div className="flex gap-4 mt-4 w-full items-center">
          <span className="text-xs text-muted-foreground">Zoom ut</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">Zoom in</span>
          <button
            onClick={handleCenter}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300 flex items-center gap-1"
            title="Centrera"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dra för att flytta, scrolla för att zooma</p>
        <div className="flex gap-4 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Avbryt</button>
          <button onClick={getCroppedImg} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90">Spara</button>
        </div>
      </div>
    </div>
  );
};

export default LogoCropper;
