import firebase from "firebase/app"
import "firebase/database"

if (!firebase.apps.length) {
  firebase.initializeApp( {
    apiKey: "AIzaSyBhaptFVGUzDvRwiOxBVv8jrBQPp1Ub9Rw",
    authDomain: "desire-8ab9d.firebaseapp.com",
    databaseURL: "https://desire-8ab9d.firebaseio.com",
    projectId: "desire-8ab9d",
    storageBucket: "desire-8ab9d.appspot.com",
    messagingSenderId: "969491076588",
    appId: "1:969491076588:web:0519ce1fa7145ef29fdcc9",
    measurementId: "G-9X0FDD86ZB"
  })
}

export default firebase
