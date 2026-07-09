# تعليمات تفعيل Firebase للرسائل والتنبيهات

## المتطلبات الأساسية
- حساب Firebase مجاني أو مدفوع
- حساب Twilio (اختياري، للإرسال عبر Twilio)

---

## نظام تسجيل الدخول الجديد

النظام الآن يدعم نوعين من تسجيل الدخول:

### 1. دخول الإدارة والمطور (Admin Login)
- **الطريقة**: البريد الإلكتروني أو اسم المستخدم + كلمة المرور
- **الصلاحيات**: صلاحيات Admin كاملة
- **الوصول**: جميع صفحات البرنامج بما فيها إدارة الصلاحيات والموظفين
- **بيانات التطوير**:
  - البريد: `shadyyhusseinn@gmail.com`
  - المستخدم: `shadyyhusseinn`
  - كلمة المرور: `admin123`

### 2. دخول الموظفين (Staff Login)
- **الطريقة**: رقم الهاتف + SMS OTP + كلمة المرور
- **الصلاحيات**: محددة حسب Role (Editor أو Viewer)
- **الوصول**: صفحات محددة حسب الصلاحيات
- **الأرقام التجريبية**:
  - `+201234567890` (Editor) - كود: `123456`
  - `+201111111111` (Viewer) - كود: `111111`

### إعداد Firebase Authentication للإدارة

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Build** > **Authentication**
4. اضغط على **Get Started**
5. اختر تبويب **Sign-in method**
6. فعّل **Email/Password**:
   - اضغط على **Email/Password**
   - اضغط **Enable**
   - اضغط **Save**

### إضافة مستخدم Admin في Firebase

1. من Firebase Console، اذهب إلى **Build** > **Authentication**
2. اضغط على **Users** tab
3. اضغط على **Add user**
4. أدخل البريد الإلكتروني وكلمة المرور
5. اضغط **Add user**

---

## تفعيل وضع الإنتاج لإرسال SMS الحقيقي

### ملاحظة هامة
هذا تطبيق ويب (Web Application) يعمل على المتصفح، وليس تطبيق موبايل. لذلك لا نحتاج إلى SHA keys. بدلاً من ذلك، نحتاج إلى إعداد Firebase Authentication Phone للويب.

### الخطوة 1: إعداد Firebase Authentication Phone للويب

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Build** > **Authentication**
4. اضغط على **Get Started**
5. اختر تبويب **Sign-in method**
6. ابحث عن **Phone** واضغط عليه
7. اضغط على **Enable**
8. في قسم **Phone provider for web**:
   - تأكد من تفعيل **reCAPTCHA**
   - اختر **Invisible reCAPTCHA** لتجربة أفضل
9. اضغط **Save**

### الخطوة 2: إضافة النطاقات المصرح بها (Authorized Domains)

1. من Firebase Console، اذهب إلى **Project Settings** (الإعدادات)
2. في قسم **General**، ابحث عن **Your apps**
3. اختر تطبيق الويب الخاص بك
4. قم بالتمرير لأسفل إلى قسم **Authorized domains**
5. أضف النطاقات التالية:
   - `localhost` (للتطوير)
   - `127.0.0.1` (للتطوير)
   - نطاق موقعك الإنتاجي (مثال: `yourdomain.com`)
   - أي نطاقات فرعية (مثال: `app.yourdomain.com`)
6. اضغط **Save**

### الخطوة 3: إعداد reCAPTCHA

Firebase يستخدم reCAPTCHA تلقائياً للتحقق من أن المستخدم ليس روبوت. للإنتاج:

1. من Firebase Console، اذهب إلى **Project Settings**
2. في قسم **General**، ابحث عن **reCAPTCHA**
3. تأكد من أن reCAPTCHA v3 مفعّل
4. إذا كنت تحتاج إلى مفتاح reCAPTCHA مخصص:
   - اذهب إلى [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
   - أنشئ موقع جديد
   - اختر reCAPTCHA v3
   - أضف نطاقاتك
   - انسخ مفتاح الموقع (Site Key) ومفتاح السر (Secret Key)
   - أضفهم في Firebase Console

### الخطوة 4: اختبار الإرسال الحقيقي

1. تأكد من أن `isDevelopmentMode = false` في الكود
2. افتح التطبيق
3. اذهب إلى صفحة "إعدادات وقسم الرسائل"
4. أدخل رقم هاتفك الحقيقي
5. اضغط "إرسال رسالة تجريبية"
6. يجب أن تصل رسالة SMS حقيقية إلى هاتفك

### استكشاف الأخطاء

#### لم تصل الرسالة
- تأكد من تفعيل Phone Authentication في Firebase Console
- تأكد من إضافة النطاق الخاص بك في Authorized Domains
- تأكد من أن reCAPTCHA يعمل بشكل صحيح
- تحقق من سجلات Firebase Console

#### خطأ reCAPTCHA
- تأكد من أن النطاق مضاف في Authorized Domains
- تأكد من أن reCAPTCHA v3 مفعّل
- جرب استخدام Visible reCAPTCHA بدلاً من Invisible

#### خطأ في Firebase Auth
- تأكد من صحة Firebase SDK config
- تأكد من أن Firebase Project في وضع الإنتاج
- تحقق من قواعد Firestore

---

## الخطوة 1: تفعيل Firebase Authentication Phone

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Build** > **Authentication**
4. اضغط على **Get Started**
5. اختر تبويب **Sign-in method**
6. ابحث عن **Phone** واضغط عليه
7. اضغط على **Enable**
8. أدخل رقم هاتفك للاختبار
9. اضغط على **Send verification code**
10. أدخل الكود المستلم واضغط **Verify**
11. اضغط **Save**

---

## الخطوة 2: تفعيل Cloud Functions (لإرسال SMS تلقائياً)

### خيار A: استخدام Firebase Cloud Functions (يتطلب خطة Blaze)

1. من Firebase Console، اذهب إلى **Build** > **Functions**
2. اضغط على **Get Started**
3. اختر خطة **Blaze** (Pay as you go) - هذه الخطة مطلوبة لإرسال رسائل SMS
4. أكمل عملية الدفع (الحد الأدنى من التكلفة)
5. بعد التفعيل، يمكنك نشر Cloud Functions

### إنشاء Cloud Function لإرسال SMS

أنشئ ملف `functions/index.js` في مشروعك:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// إرسال SMS عبر Twilio
exports.sendBookingReminder = functions.firestore
  .document('bookings/{bookingId}')
  .onWrite(async (change, context) => {
    const booking = change.after.data();
    
    // منطق التحقق من موعد الحجز
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
    
    // إذا كان الحجز خلال 24 ساعة
    if (hoursDiff > 0 && hoursDiff <= 24) {
      // إرسال SMS
      await sendSMS(
        booking.clientPhone,
        `تذكير: لديك حجز غداً الساعة ${booking.eventTime}`
      );
    }
  });

async function sendSMS(to, message) {
  // استخدم Twilio API أو Firebase Cloud Messaging
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
}
```

### نشر Cloud Functions

1. تأكد من تثبيت Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. سجل الدخول:
   ```bash
   firebase login
   ```

3. في مجلد المشروع، نفذ:
   ```bash
   firebase init functions
   ```

4. اختر TypeScript أو JavaScript
5. اضغط Enter للأسئلة التالية

6. نشر الدوال:
   ```bash
   firebase deploy --only functions
   ```

---

## الخطوة 3: إعداد Twilio (اختياري)

### إنشاء حساب Twilio

1. افتح [Twilio Console](https://www.twilio.com/console)
2. سجل حساباً جديداً
3. احصل على رقم هاتف من Twilio
4. انسخ:
   - Account SID
   - Auth Token
   - Phone Number

### إضافة متغيرات البيئة

في Firebase Console:
1. اذهب إلى **Project Settings** > **Functions**
2. في قسم **Runtime config**، أضف:
   - `TWILIO_ACCOUNT_SID`: Account SID الخاص بك
   - `TWILIO_AUTH_TOKEN`: Auth Token الخاص بك
   - `TWILIO_PHONE_NUMBER`: رقم الهاتف من Twilio

---

## الخطوة 4: إعداد Firestore Rules

في Firebase Console:
1. اذهب إلى **Firestore Database** > **Rules**
2. تأكد من أن القواعد تسمح بالقراءة والكتابة للمستخدمين المصرح لهم

مثال قواعد أساسية:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## الخطوة 5: إعداد Firebase SDK في التطبيق

تأكد من أن ملف `firebase.ts` يحتوي على:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

يمكنك الحصول عليها من:
**Project Settings** > **General** > **Your apps** > **SDK setup and configuration**

---

## الميزات الجديدة

### الإرسال اليدوي للرسائل

النظام يدعم الآن إرسال رسائل مخصصة يدوياً:

1. من صفحة "المطور" > "إعدادات وقسم الرسائل"
2. انتقل إلى قسم "إرسال يدوي"
3. أدخل رقم الهاتف المستلم
4. اكتب الرسالة المخصصة في صندوق النص
5. اضغط "إرسال الآن" لإرسال الرسالة فوراً

هذه الميزة مفيدة لإرسال:
- رسائل تذكير مخصصة
- عروض خاصة
- تحديثات هامة
- أي رسائل عاجلة

---

## إعداد أرقام الهواتف التجريبية (للتطوير)

لتجربة النظام بدون إرسال رسائل SMS فعلية، يمكنك إعداد أرقام هواتف تجريبية:

### إضافة رقم هاتف تجريبي في Firebase Console

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Build** > **Authentication**
4. اختر تبويب **Sign-in method**
5. ابحث عن **Phone** واضغط عليه
6. قم بالتمرير لأسفل إلى قسم **Phone numbers for testing**
7. اضغط على **Add phone number**
8. أدخل رقم هاتف تجريبي (مثال: `+201234567890`)
9. أدخل كود التحقق (مثال: `123456`)
10. اضغط **Add**

### استخدام الأرقام التجريبية

- عند استخدام رقم هاتف تجريبي، لن يتم إرسال SMS فعلي
- سيتم عرض كود التحقق في واجهة Firebase Console
- يمكنك استخدام هذا الكود لإكمال عملية التحقق

### الأرقام التجريبية في الكود

النظام يحتوي على وضع تطوير مدمج مع أرقام تجريبية:
- `+201234567890` مع كود `123456`
- `+201111111111` مع كود `111111`

يمكنك تعديل هذه الأرقام في ملف `LoginScreen.tsx` إذا أردت.

---

## الخطوة 6: اختبار النظام

1. افتح التطبيق
2. اذهب إلى صفحة "إعدادات الرسائل والتنبيهات"
3. أدخل رقم هاتفك
4. اضغط "إرسال رسالة تجريبية"
5. تحقق من استلام الرسالة

---

## استكشاف الأخطاء

### المشكلة: لم يتم إرسال الرسالة
- تأكد من تفعيل Phone Authentication
- تأكد من استخدام خطة Blaze لـ Cloud Functions
- تحقق من صحة بيانات Twilio (إذا استخدمتها)

### المشكلة: Cloud Functions لا تعمل
- تأكد من نشر الدوال بنجاح
- تحقق من سجلات Cloud Functions في Firebase Console
- تأكد من أن المتغيرات البيئية مضبوطة بشكل صحيح

### المشكلة: Authentication Phone لا يعمل
- تأكد من إدخال رقم هاتف صحيح مع رمز الدولة
- تحقق من أن Firebase Project في وضع الإنتاج

---

## ملاحظات مهمة

- Firebase Cloud Functions تتطلب خطة Blaze (مدفوعة) للإرسال
- Twilio له حدود مجانية، راجع التسعير قبل الاستخدام
- تأكد من حماية مفاتيح API ولا تشاركها
- راقب الاستخدام لتجنب تكاليف غير متوقعة

---

## الدعم

للمزيد من المعلومات:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
