# إعداد Firebase للمشروع

## الخطوة 1: الحصول على مفاتيح Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. سجل الدخول بحسابك
3. اختر مشروعك: `photography-shady-program`
4. اضغط على أيقونة الترس ⚙️ بجانب "Project Overview"
5. اختر **Project settings**
6. في تبويب **General**، قم بالتمرير لأسفل إلى قسم **Your apps**
7. إذا لم يكن هناك تطبيق، اضغط على **Add app** ثم اختر **Web** (</>)
8. املأ اسم التطبيق (مثلاً: "Photography Studio")
9. اضغط على **Register app**
10. انسخ كود التكوين الذي سيظهر

## الخطوة 2: إضافة المفاتيح إلى ملف .env

في مجلد المشروع الرئيسي، قم بإنشاء ملف `.env` (إذا لم يكن موجوداً) وأضف المفاتيح التالية:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_FIREBASE_AUTH_DOMAIN="photography-shady-program.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="photography-shady-program"
VITE_FIREBASE_STORAGE_BUCKET="photography-shady-program.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="XXXXXXXXXXXX"
VITE_FIREBASE_APP_ID="1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXX"
```

**استبدل القيم الموجودة بالقيم الفعلية من Firebase Console**

## الخطوة 3: إعادة تشغيل التطبيق

بعد إضافة المفاتيح، أعد تشغيل خادم التطوير:

```bash
npm run dev
```

## الخطوة 4: التحقق من التكوين

بعد إعادة التشغيل، افتح المتصفح وتحقق من:
- Console في المتصفح يجب أن يظهر: "✅ Firebase initialized successfully"
- تسجيل الدخول يجب أن يعمل بشكل صحيح

## ملاحظات مهمة

- ملف `.env` لا يجب رفعه إلى GitHub (مضاف بالفعل في .gitignore)
- المفاتيح تبدأ بـ `VITE_` لأننا نستخدم Vite
- إذا كنت تستخدم الإنتاج، تأكد من إضافة المفاتيح في بيئة الإنتاج أيضاً

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. تأكد من أن مفتاح API صحيح (يبدأ بـ `AIzaSy`)
2. تأكد من أن Project ID صحيح (`photography-shady-program`)
3. تأكد من أن Auth Domain صحيح (`photography-shady-program.firebaseapp.com`)
4. تحقق من Firebase Console أن Authentication مفعّل
   - اذهب إلى **Authentication** > **Sign-in method**
   - تأكد من تفعيل **Email/Password**
