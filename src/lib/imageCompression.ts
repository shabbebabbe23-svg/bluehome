/**
 * Utility för bildkomprimering innan uppladdning
 * Minskar filstorlek med 60-80% utan synlig kvalitetsförlust
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  mimeType: 'image/webp', // WebP är ~30% mindre än JPEG
};

/**
 * Komprimerar en bild och returnerar en ny File
 */
export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Om filen inte är en bild, returnera den oförändrad
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Om filen redan är liten nog, returnera den
  if (file.size < 200 * 1024) { // < 200KB
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Beräkna nya dimensioner med bibehållet bildförhållande
        let { width, height } = img;
        
        if (width > opts.maxWidth!) {
          height = (height * opts.maxWidth!) / width;
          width = opts.maxWidth!;
        }
        
        if (height > opts.maxHeight!) {
          width = (width * opts.maxHeight!) / height;
          height = opts.maxHeight!;
        }

        canvas.width = width;
        canvas.height = height;

        // Rita bilden på canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Konvertera till blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }

            // Skapa ny fil med komprimerad data
            const extension = opts.mimeType === 'image/webp' ? 'webp' : 'jpg';
            const newFileName = file.name.replace(/\.[^.]+$/, `.${extension}`);
            
            const compressedFile = new File([blob], newFileName, {
              type: opts.mimeType,
              lastModified: Date.now(),
            });

            // Logga komprimeringsresultat i dev-läge
            if (import.meta.env.DEV) {
              const savings = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
              console.log(`[ImageCompression] ${file.name}: ${formatBytes(file.size)} → ${formatBytes(compressedFile.size)} (-${savings}%)`);
            }

            resolve(compressedFile);
          },
          opts.mimeType,
          opts.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
  });
};

/**
 * Komprimera flera bilder parallellt
 */
export const compressImages = async (
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> => {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Komprimerar en bild med hög kvalitet för huvudbilder
 */
export const compressMainImage = (file: File): Promise<File> => {
  return compressImage(file, {
    maxWidth: 2400,
    maxHeight: 2400,
    quality: 0.85,
    mimeType: 'image/webp',
  });
};

/**
 * Komprimerar en bild för thumbnails/galleri
 */
export const compressThumbnail = (file: File): Promise<File> => {
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.75,
    mimeType: 'image/webp',
  });
};

/**
 * Formatera bytes till läsbar sträng
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validera bildfil
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Endast JPG, PNG, WebP och HEIC-bilder är tillåtna',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Bilden får max vara 10MB',
    };
  }

  return { valid: true };
};

export default compressImage;
