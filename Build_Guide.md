# React Native Production Build Guide (Using Existing Keystore)

---

## Android Setup

### 1. Use Existing Keystore File

> copy your existing keystore file to: (you can change the name to whatever it is already make sure to use the same name in android/gradle.properties file as well)

    android/app/my-upload-key.keystore

---

### 2. Add in gradle.properties

File location:

    android/gradle.properties

Add the following:
0
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=android
MYAPP_UPLOAD_KEY_PASSWORD=android

---

### 3. Update android/app/build.gradle

Make sure `signingConfigs` is properly configured:

```gradle
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
```

In `buildTypes`:

```gradle
release {
    signingConfig signingConfigs.release
}
```

---

### 4. Generate Release APK

    cd android
    ./gradlew assembleRelease

---

### 5. Generate Release AAB (For Play Store)

    ./gradlew bundleRelease

---

### 6. Output Paths

**APK:**

    android/app/build/outputs/apk/release/

**AAB:**

    android/app/build/outputs/bundle/release/

---

## Clean Build

### Android

    cd android
    ./gradlew clean

## Metro Reset

    npx react-native start --reset-cache

---

## 7 Before every Play Store upload:

Increase versionCode

Update versionName

Generate new AAB

Upload the new AAB

file name : android/app/build.gradle

---

## Important Notes

- Always use the same keystore for production builds.
- Keep a secure backup of your keystore file.
- Losing the keystore will prevent future Play Store updates.
