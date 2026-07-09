export interface WatermarkOptions {
  text?: string;
  logoUrl?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  fontSize?: number;
  padding?: number;
}

export const addWatermark = async (
  imageUrl: string,
  options: WatermarkOptions = {}
): Promise<Blob> => {
  const {
    text = '© استوديو شادي حسين',
    logoUrl,
    position = 'bottom-right',
    opacity = 0.5,
    fontSize = 24,
    padding = 20
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Set opacity
        ctx.globalAlpha = opacity;
        
        // Calculate position
        let x = padding;
        let y = padding;
        
        if (position.includes('right')) {
          x = canvas.width - padding;
        }
        if (position.includes('bottom')) {
          y = canvas.height - padding;
        }
        if (position === 'center') {
          x = canvas.width / 2;
          y = canvas.height / 2;
        }
        
        // Draw logo if provided
        if (logoUrl) {
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          logo.onload = () => {
            const logoSize = Math.min(canvas.width, canvas.height) * 0.15;
            
            if (position === 'center') {
              ctx.drawImage(
                logo,
                x - logoSize / 2,
                y - logoSize / 2,
                logoSize,
                logoSize
              );
            } else if (position.includes('right')) {
              ctx.drawImage(
                logo,
                x - logoSize,
                position.includes('bottom') ? y - logoSize : y,
                logoSize,
                logoSize
              );
            } else {
              ctx.drawImage(
                logo,
                position.includes('bottom') ? x : x,
                position.includes('bottom') ? y - logoSize : y,
                logoSize,
                logoSize
              );
            }
            
            // Draw text after logo
            drawTextWatermark(ctx, text, x, y, position, fontSize);
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not create blob'));
              }
            }, 'image/jpeg', 0.95);
          };
          
          logo.onerror = () => {
            console.error('Error loading logo');
            // Draw text without logo
            drawTextWatermark(ctx, text, x, y, position, fontSize);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not create blob'));
              }
            }, 'image/jpeg', 0.95);
          };
          
          logo.src = logoUrl;
        } else {
          // Draw text watermark
          drawTextWatermark(ctx, text, x, y, position, fontSize);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create blob'));
            }
          }, 'image/jpeg', 0.95);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Error loading image'));
    };
    
    img.src = imageUrl;
  });
};

const drawTextWatermark = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  position: string,
  fontSize: number
) => {
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = position.includes('right') ? 'right' : 'left';
  ctx.textBaseline = position.includes('bottom') ? 'bottom' : 'top';
  
  if (position === 'center') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }
  
  ctx.fillText(text, x, y);
};

export const addWatermarkToMultipleImages = async (
  imageUrls: string[],
  options: WatermarkOptions = {}
): Promise<Blob[]> => {
  const results: Blob[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const watermarked = await addWatermark(imageUrl, options);
      results.push(watermarked);
    } catch (error) {
      console.error(`Error processing image ${imageUrl}:`, error);
    }
  }
  
  return results;
};
