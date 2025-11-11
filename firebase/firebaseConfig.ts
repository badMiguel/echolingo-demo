import { initializeApp } from "firebase/app";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
import { getFirestore } from "firebase/firestore";
// import {...} from "firebase/functions";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAs4oDhTnltcuDVNdKjjM4ZfMZHBujt4uw",
    authDomain: "echolingo-demo.firebaseapp.com",
    projectId: "echolingo-demo",
    storageBucket: "echolingo-demo.firebasestorage.app",
    messagingSenderId: "289889835149",
    appId: "1:289889835149:android:38e379b5cda38c71272ac4",
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export const db = getFirestore(app);
export const storage = getStorage(app);
