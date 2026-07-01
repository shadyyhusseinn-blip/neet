# Scripts

## create-admin-user.js

هذا السكريبت يقوم بإنشاء مستخدم Admin في Firebase Authentication و Firestore.

### المتطلبات

1. **الحصول على ملف Service Account Key**:
   - اذهب إلى Firebase Console: https://console.firebase.google.com/project/photography-shady-program/settings/serviceaccounts/adminsdk
   - اضغط على "Generate new private key"
   - احفظ الملف باسم `service-account-key.json` في جذر المشروع (مجاور لـ `package.json`)
   - **مهم**: لا ترفع هذا الملف إلى GitHub (مضاف بالفعل في `.gitignore`)

2. **تثبيت Firebase Admin SDK**:
   ```bash
   npm install firebase-admin
   ```

### التشغيل

```bash
node scripts/create-admin-user.js
```

### ما يفعله السكريبت

- إنشاء مستخدم في Firebase Authentication:
  - البريد: `shadyyhusseinn@gmail.com`
  - كلمة المرور: `admin123`
  - الاسم: `Shady Hussein`

- إنشاء مستند المستخدم في Firestore collection `users`:
  ```javascript
  {
    id: "uid",
    email: "shadyyhusseinn@gmail.com",
    name: "Shady Hussein",
    role: "admin",
    isBlocked: false,
    forceLogout: false,
    createdAt: "2026-07-01T...",
    lastLogin: "2026-07-01T..."
  }
  ```

### الطريقة البديلة (بدون سكريبت)

إذا كنت لا تريد استخدام السكريبت، يمكنك:

1. **إنشاء المستخدم في Firebase Console**:
   - اذهب إلى Authentication > Users
   - اضغط "Add user"
   - البريد: `shadyyhusseinn@gmail.com`
   - كلمة المرور: `admin123`

2. **إضافة المستند في Firestore**:
   - اذهب إلى Firestore Database
   - افتح collection `users`
   - أضف مستند جديد مع id = uid المستخدم
   - الصق البيانات التالية:
   ```json
   {
     "email": "shadyyhusseinn@gmail.com",
     "name": "Shady Hussein",
     "role": "admin",
     "isBlocked": false,
     "forceLogout": false,
     "createdAt": "2026-07-01T00:00:00.000Z",
     "lastLogin": "2026-07-01T00:00:00.000Z"
   }
   ```
