# AdSense and AdMob Checklist

## Before applying for AdSense

1. Replace all placeholder contact/domain values.
2. Add 20-30 real Kapoorpur gallery posts with original photos and descriptions.
3. Make sure Privacy Policy, Terms, Contact, Disclaimer, About, and Advertise pages are reachable.
4. Do not ask anyone to click ads.
5. Do not place ads near upload buttons, navigation buttons, or confusing tap areas.
6. Add the exact ads.txt line Google provides after AdSense review asks for it.
7. Use only original or permitted photos/videos.

## Environment values

Add these values in GitHub repository secrets if the public build should use them:

- `VITE_ADMIN_EMAIL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADSENSE_CLIENT_ID`
- `VITE_ADSENSE_SLOT_ID`
- `VITE_GA_MEASUREMENT_ID`

## AdMob later for Android

Use AdMob if this PWA is later converted into a native Android app. Do not reuse website AdSense units inside a native Android app.
