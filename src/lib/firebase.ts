import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: rawConfig.projectId || "wise-lamp-h3bk6",
  appId: rawConfig.appId || "1:992383993623:web:63f38775cb7c18ffce1952",
  apiKey: rawConfig.apiKey || "AIzaSyAg8_UIm4c6fY0MVSLPuY9mE9GrgOXMzH8",
  authDomain: rawConfig.authDomain || "wise-lamp-h3bk6.firebaseapp.com",
  storageBucket: rawConfig.storageBucket || "wise-lamp-h3bk6.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "992383993623",
  oAuthClientId: rawConfig.oAuthClientId || "992383993623-h07il8qmnea7k80e4emuceiomeqjmc8d.apps.googleusercontent.com"
};

let appInstance;
try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase initialization warning:', e);
  appInstance = getApps()[0] || initializeApp(firebaseConfig);
}

export const app = appInstance;
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

