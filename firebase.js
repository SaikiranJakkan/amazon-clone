import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCqpBGCnK2E7Svlt7_ehM_DGhIEpa7giD4",
  authDomain: "fir-f5bfa.firebaseapp.com",
  projectId: "fir-f5bfa",
  storageBucket: "fir-f5bfa.appspot.com",
  messagingSenderId: "1096672723548",
  appId: "1:1096672723548:web:691458783fe6f2a744dc99",
};
const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();

export default db;