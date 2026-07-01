export interface WatermarkConfig {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right' | 'top-left';
  opacity: number;
  fontSize: number;
  color: string;
  padding: number;
}

export async function addWatermarkToImage(
  imageUrl: string,
  config: WatermarkConfig
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Configure watermark
        ctx.globalAlpha = config.opacity;
        ctx.font = `${config.fontSize}px Arial`;
        ctx.fillStyle = config.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate position
        const padding = config.padding;
        let x, y;

        switch (config.position) {
          case 'bottom-right':
            x = canvas.width - padding;
            y = canvas.height - padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            break;
          case 'top-right':
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            break;
          case 'top-left':
            x = padding;
            y = padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            break;
          case 'center':
          default:
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
        }

        // Draw watermark
        ctx.fillText(config.text, x, y);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

export async function addLogoWatermark(
  imageUrl: string,
  logoUrl: string,
  config: {
    position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right' | 'top-left';
    opacity: number;
    size: number;
    padding: number;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const logo = new Image();
    img.crossOrigin = 'anonymous';
    logo.crossOrigin = 'anonymous';
    
    let imagesLoaded = 0;
    const checkLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Configure logo
          ctx.globalAlpha = config.opacity;
          
          const logoSize = config.size;
          let x, y;

          switch (config.position) {
            case 'bottom-right':
              x = canvas.width - logoSize - config.padding;
              y = canvas.height - logoSize - config.padding;
              break;
            case 'bottom-left':
              x = config.padding;
              y = canvas.height - logoSize - config.padding;
              break;
            case 'top-right':
              x = canvas.width - logoSize - config.padding;
              y = config.padding;
              break;
            case 'top-left':
              x = config.padding;
              y = config.padding;
              break;
            case 'center':
            default:
              x = (canvas.width - logoSize) / 2;
              y = (canvas.height - logoSize) / 2;
              break;
          }

          // Draw logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, 'image/jpeg', 0.95);
        } catch (error) {
          reject(error);
        }
      }
    };

    img.onload = checkLoaded;
    logo.onload = checkLoaded;
    
    img.onerror = () => reject(new Error('Failed to load image'));
    logo.onerror = () => reject(new Error('Failed to load logo'));

    img.src = imageUrl;
    logo.src = logoUrl;
  });
}

export async function createPreviewImage(
  imageUrl: string,
  maxWidth: number = 1200,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

export async function createThumbnail(
  imageUrl: string,
  size: number = 300,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions to maintain aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > size) {
            const ratio = size / width;
            width = size;
            height = height * ratio;
          }
        } else {
          if (height > size) {
            const ratio = size / height;
            height = size;
            width = width * ratio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw thumbnail
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

// Default watermark configuration
export const defaultWatermarkConfig: WatermarkConfig = {
  text: '© شادي حسين للتصوير',
  position: 'bottom-right',
  opacity: 0.5,
  fontSize: 24,
  color: '#ffffff',
  padding: 20
};

export const photographerWatermarkConfig: WatermarkConfig = {
  text: '© شادي حسين للتصوير',
  position: 'center',
  opacity: 0.3,
  fontSize: 48,
  color: '#ffffff',
  padding: 0
};
