export const API_BASE = "https://api.prod.boo.dating";

export const FIREBASE_KEY_EMAIL = "AIzaSyBd4tZV38BT2DD2-K00W60vbB7ebtE1xYg";
export const FIREBASE_KEY_CAPTURE = "AIzaSyDdcyTrWVUO7JuUg2T1k9HKtOFtM-1JXME";

export const FIREBASE_IDENTITY_BASE =
  "https://www.googleapis.com/identitytoolkit/v3/relyingparty";
export const FIREBASE_SECURE_TOKEN_BASE =
  "https://securetoken.googleapis.com/v1/token";

export const DEFAULT_APP_VERSION = "1.13.140";
export const DEFAULT_CONTINUE_URL = "https://boo.dating";
export const DEFAULT_DEVICE_ID = "da35c542c8ceab17";
export const DEFAULT_APPSFLYER_ID = "1791541594977-7499932426504586083";

export const ANDROID_PACKAGE = "enterprises.dating.boo";
export const ANDROID_CERT = "B1E48B78E468DBEEF275C6807802356C0DD03B67";
export const FIREBASE_GMPID = "1:269920577613:android:f7838efb0a9dfda724d404";

export const TOKEN_REFRESH_BUFFER_MS = 60_000;

export const BOO_JSON_HEADERS: Record<string, string> = {
  "user-agent": "Dart/3.10 (dart:io)",
  "content-type": "application/json",
  from: "android",
  "accept-encoding": "gzip",
};

export const FIREBASE_HEADERS: Record<string, string> = {
  "content-type": "application/json",
  "x-android-package": ANDROID_PACKAGE,
  "x-android-cert": ANDROID_CERT,
  "accept-language": "en-GB, en-US",
  "x-client-version": "Android/Fallback/X24001000/FirebaseCore-Android",
  "x-firebase-gmpid": FIREBASE_GMPID,
  "x-firebase-client":
    "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
  "user-agent":
    "Dalvik/2.1.0 (Linux; U; Android 13; Subsystem for Android(TM) Build/TQ3A.230901.001)",
  "accept-encoding": "gzip",
};
