# دليل التخزين المؤقت للصور

## 📦 الحل المقترح: ImageKit

### لماذا ImageKit؟
- **مجاني حتى 20GB شهرياً**
- موجود بالفعل في مشروعك
- CDN سريع عالمي
- تحويل تلقائي للصور (resize, optimize)
- Watermark مدمج
- API بسيط وسهل الاستخدام

## 🚀 كيفية الاستخدام

### 1. تفعيل ImageKit

اذهب إلى: https://imagekit.io/dashboard
1. سجل حساب جديد (مجاني)
2. احصل على:
   - URL Endpoint
   - Public Key
   - Private Key

### 2. إعداد المتغيرات البيئية

أضف في `.env`:
```env
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/YOUR_ID
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
```

### 3. استخدام النظام المؤقت

```typescript
import { tempStorage } from './services/tempStorage';

// رفع صورة واحدة
const result = await tempStorage.uploadImage(file, 'clients/ahmed');
console.log(result.url); // رابط الصورة

// رفع صور متعددة
const results = await tempStorage.uploadMultipleImages(
  files,
  'clients/ahmed/wedding',
  (progress) => console.log(`${progress}%`)
);

// الحصول على رابط مصغر
const thumbnail = tempStorage.getThumbnailUrl(result.url, 300);

// الحصول على رابط معاينة
const preview = tempStorage.getPreviewUrl(result.url, 800);

// الحذف
await tempStorage.deleteImage(result.fileId);
```

## 📊 المقارنة مع البدائل

| الخدمة | المجاني | السرعة | المميزات |
|--------|---------|--------|----------|
| **ImageKit** | 20GB/شهر | سريع جداً | تحويل تلقائي، CDN |
| Cloudinary | 25GB | سريع | تحويل قوي، Watermark |
| AWS S3 | 5GB | سريع | موثوق، قابل للتوسع |
| ImgBB | غير محدود | متوسط | API بسيط فقط |

## 🔄 الانتقال إلى Firebase Storage

عندما تشتري مساحة Firebase Storage:

1. تفعيل Firebase Storage في Console
2. إعداد Security Rules
3. استخدام `clientGallery.ts` بدلاً من `tempStorage.ts`

الانتقال سيكون سهل لأن الواجهة متشابهة.

## 💡 نصائح

- استخدم المجلدات المنظمة: `clients/{name}/{event}/{type}`
- احذف الصور القديمة لتوفير المساحة
- استخدم Watermark للصور المعروضة
- استخدم التحويل التلقائي لتقليل الحجم

## 🔗 روابط مفيدة

- ImageKit Dashboard: https://imagekit.io/dashboard
- Firebase Storage Pricing: https://firebase.google.com/pricing
- Cloudinary Pricing: https://cloudinary.com/pricing
