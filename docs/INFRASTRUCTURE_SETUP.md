# دليل إعداد البنية التحتية (Infrastructure Setup Guide)

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إعداد وتكوين جميع الخدمات والبنية التحتية للمشروع.

---

## 🔥 Firebase Setup

### 1. Firebase Project Configuration

المشروع حالياً يستخدم Firebase Project: `photography-shady-program`

**الخطوات المطلوبة:**

#### أ. الحصول على Firebase Config
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `photography-shady-program`
3. اذهب إلى **Project Settings** → **General** → **Your apps**
4. انسخ قيم التكوين:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
   - `measurementId`

#### ب. تحديث ملف `.env`
أنشئ ملف `.env` في جذر المشروع وأضف:

```env
VITE_FIREBASE_API_KEY="your_actual_api_key"
VITE_FIREBASE_AUTH_DOMAIN="photography-shady-program.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="photography-shady-program"
VITE_FIREBASE_STORAGE_BUCKET="photography-shady-program.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
```

#### ج. نشر Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### د. نشر Storage Rules
```bash
firebase deploy --only storage:rules
```

---

## 🚀 GitHub Actions & Auto Deployment

### 2. إعداد النشر التلقائي

تم إعداد GitHub Actions للنشر التلقائي، لكن يحتاج إعداد واحد:

#### أ. الحصول على Firebase Token
```bash
firebase login:ci
```

سيظهر لك رابط في المتصفح، اتبع الخطوات:
1. افتح الرابط
2. سجل الدخول إلى حساب Google
3. امنح الصلاحيات لـ Firebase CLI
4. سيظهر Token في الـ terminal

#### ب. إضافة Token إلى GitHub Secrets
1. اذهب إلى: `https://github.com/shadyyhusseinn-blip/neet/settings/secrets/actions`
2. اضغط **New repository secret**
3. أضف:
   - **Name:** `FIREBASE_TOKEN`
   - **Secret:** الصق الـ token
4. اضغط **Add secret**

#### ج. التحقق من Workflow
الـ workflow موجود في: `.github/workflows/deploy.yml`

يعمل تلقائياً عند:
- Push إلى فرع `main`
- Pull request إلى فرع `main`

---

## 🌐 Firebase Hosting Configuration

### 3. إعدادات Hosting

تم إعداد Firebase Hosting في `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [...],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**الميزات:**
- ✅ SPA Routing (جميع المسارات تعود إلى index.html)
- ✅ Cache headers للملفات الثابتة
- ✅ No-cache لـ index.html

**رابط الموقع:** https://photography-shady-program.web.app

---

## 🔐 Firebase Security Rules

### 4. Firestore Rules

القواعد موجودة في `firestore.rules`:

**الصلاحيات:**
- ✅ القراءة العامة للمعارض والمحتوى
- ✅ الكتابة للمحررين والمسؤولين
- ✅ المصادقة المطلوبة للمستخدمين
- ✅ أدوار: `admin`, `editor`

**نشر القواعد:**
```bash
firebase deploy --only firestore:rules
```

### 5. Storage Rules

القواعد موجودة في `storage.rules`:

**الصلاحيات:**
- ✅ القراءة العامة للصور
- ✅ الكتابة للمحررين والمسؤولين
- ✅ الكتابة الخاصة لملفات البروفايل

**نشر القواعد:**
```bash
firebase deploy --only storage:rules
```

---

## 📦 Environment Variables

### 6. المتغيرات البيئية المطلوبة

ملف `.env.example` يحتوي على جميع المتغيرات المطلوبة.

**المتغيرات الأساسية:**
```env
# Firebase (مطلوب للعمل الكامل)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID

# ImageKit (للصور)
IMAGEKIT_URL_ENDPOINT
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY

# Make.com (للإشعارات)
MAKE_WEBHOOK_URL

# Payment Gateways (اختياري)
VITE_STRIPE_PUBLIC_KEY
VITE_PAYPAL_CLIENT_ID
```

**إنشاء ملف .env:**
```bash
cp .env.example .env
# ثم عدل القيم في .env
```

---

## 🛠️ Development Setup

### 7. إعداد التطوير المحلي

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إنشاء ملف .env
cp .env.example .env

# 3. تحديث المتغيرات في .env

# 4. تشغيل الخادم المحلي
npm run dev
```

**الخادم سيعمل على:** http://localhost:3003

---

## 🚢 Deployment Process

### 8. عملية النشر

#### النشر اليدوي:
```bash
# 1. بناء المشروع
npm run build

# 2. نشر على Firebase
firebase deploy --only hosting
```

#### النشر التلقائي (بعد إعداد Firebase token):
```bash
# 1. إضافة التغييرات
git add .

# 2. Commit
git commit -m "وصف التعديل"

# 3. Push
git push

# ✅ النشر التلقائي سيبدأ
```

---

## 🔍 Troubleshooting

### 9. حل المشاكل الشائعة

#### المشكلة: Missing Firebase environment variables
**الحل:**
1. أنشئ ملف `.env`
2. أضف متغيرات Firebase
3. أعد تشغيل الخادم

#### المشكلة: GitHub Actions لا يعمل
**الحل:**
1. تأكد من إضافة `FIREBASE_TOKEN` إلى GitHub Secrets
2. تحقق من صلاحية الـ token
3. راجع سجلات GitHub Actions

#### المشكلة: Firestore/Storage access denied
**الحل:**
1. تأكد من نشر القواعد الصحيحة
2. تحقق من أدوار المستخدم في Firestore
3. راجع القواعد في Firebase Console

#### المشكلة: SPA Routing لا يعمل
**الحل:**
1. تأكد من وجود rewrite rule في `firebase.json`
2. أعد نشر Firebase Hosting
3. تحقق من أن `dist/index.html` موجود

---

## 📊 الحالة الحالية

### ✅ تم إعداد:
- ✅ Firebase Hosting
- ✅ GitHub Actions Workflow
- ✅ Firestore Rules
- ✅ Storage Rules
- ✅ SPA Routing
- ✅ Cache Headers
- ✅ .env.example

### ⚠️ يحتاج إعداد يدوي:
- ⚠️ Firebase token في GitHub Secrets
- ⚠️ Firebase config في .env (للعمل الكامل)
- ⚠️ ImageKit credentials (اختياري)
- ⚠️ Make.com webhook (اختياري)

---

## 🎞️ الخطوات التالية الموصى بها

1. **إعداد Firebase token** (مهم للنشر التلقائي)
2. **تحديث Firebase config في .env** (للعمل الكامل مع Firebase)
3. **اختبار النشر التلقائي** (بعد إعداد token)
4. **إعداد ImageKit** (إذا أردت استخدام تخزين الصور)
5. **إعداد Make.com webhook** (للإشعارات)

---

## 📞 الدعم

للمساعدة:
- Firebase Console: https://console.firebase.google.com/project/photography-shady-program/overview
- GitHub Repository: https://github.com/shadyyhusseinn-blip/neet
- الموقع: https://photography-shady-program.web.app
