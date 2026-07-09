# دليل النشر التلقائي (Auto Deployment Guide)

## 📋 نظرة عامة

تم إعداد **GitHub Actions** للنشر التلقائي على Firebase Hosting. أي تعديل تقوم به على الفرع `main` سيتم نشره تلقائياً على الموقع.

---

## 🚀 كيف يعمل النشر التلقائي

1. **عند Push إلى GitHub:**
   - يتم تشغيل GitHub Actions تلقائياً
   - يتم بناء المشروع (`npm run build`)
   - يتم نشر الموقع على Firebase Hosting

2. **النتيجة:**
   - الموقع يتم تحديثه تلقائياً
   - لا حاجة لأوامر يدوية

---

## 🔑 إعداد Firebase Token (مطلوب مرة واحدة)

للنشر التلقائي، تحتاج إلى إضافة Firebase token إلى GitHub Secrets:

### الخطوة 1: الحصول على Firebase Token

```bash
firebase login:ci
```

سيظهر لك رابط في المتصفح، اتبع الخطوات:
1. افتح الرابط
2. سجل الدخول إلى حساب Google
3. امنح الصلاحيات لـ Firebase CLI
4. سيظهر Token في الـ terminal

### الخطوة 2: إضافة Token إلى GitHub Secrets

1. اذهب إلى مستودع GitHub الخاص بك
2. اضغط على **Settings** → **Secrets and variables** → **Actions**
3. اضغط على **New repository secret**
4. أضف:
   - **Name:** `FIREBASE_TOKEN`
   - **Secret:** الصق الـ token الذي حصلت عليه
5. اضغط **Add secret**

---

## 📝 عملية النشر اليدوي (اختياري)

إذا أردت النشر يدوياً:

```bash
# 1. بناء المشروع
npm run build

# 2. نشر على Firebase
firebase deploy --only hosting
```

---

## 🔍 التحقق من حالة النشر

يمكنك التحقق من حالة النشر في GitHub:
1. اذهب إلى **Actions** tab في المستودع
2. سترى قائمة بجميع عمليات النشر
3. يمكنك رؤية التفاصيل والسجلات لكل عملية

---

## ⚠️ استكشاف الأخطاء

### المشكلة: النشر التلقائي لا يعمل

**الحل:**
1. تأكد من إضافة `FIREBASE_TOKEN` إلى GitHub Secrets
2. تأكد من أن الـ token صالح
3. تحقق من سجلات GitHub Actions

### المشكلة: خطأ في البناء

**الحل:**
1. تحقق من أن جميع dependencies مثبتة
2. تأكد من عدم وجود أخطاء في الكود
3. جرب البناء محلياً: `npm run build`

---

## 🎯 البنية التحتية الحالية

### ✅ تم إعداد:

1. **Git Repository**
   - متصل بـ GitHub: `https://github.com/shadyyhusseinn-blip/neet.git`
   - الفرع الرئيسي: `main`

2. **Firebase Hosting**
   - Project ID: `photography-shady-program`
   - URL: `https://photography-shady-program.web.app`

3. **GitHub Actions**
   - Workflow: `.github/workflows/deploy.yml`
   - Trigger: Push إلى فرع `main`
   - Action: Build + Deploy

---

## 📊 سير العمل المستقبلي

### عند إجراء أي تعديل:

```bash
# 1. إضافة التغييرات
git add .

# 2. Commit
git commit -m "وصف التعديل"

# 3. Push إلى GitHub
git push

# ✅ النشر التلقائي سيبدأ تلقائياً!
```

### النتيجة:
- ✅ التعديلات ترفع إلى GitHub
- ✅ GitHub Actions يبدأ تلقائياً
- ✅ المشروع يتم بناؤه
- ✅ الموقع يتم نشره على Firebase
- ✅ التعديلات تظهر على الموقع

---

## 🎉 الخلاصة

الآن كل تعديل تقوم به سيتم نشره تلقائياً على الموقع! 🚀

**رابط الموقع:** https://photography-shady-program.web.app
