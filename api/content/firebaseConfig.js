var firebaseConfig = {
    apiKey: "AIzaSyDIPLDrv3ZpSvTAU98-sAZIFDZ0nWMt3B8",
    authDomain: "api-oig-nasa-gov.firebaseapp.com",
    databaseURL: "https://api-oig-nasa-gov.firebaseio.com",
    projectId: "api-oig-nasa-gov",
    storageBucket: "api-oig-nasa-gov.appspot.com",
    messagingSenderId: "1095279369881",
    appId: "1:1095279369881:web:23a6e1a8f25845c840a208",

    authToken: '',
    displayName: '',
    path: '/site/items'
};


if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);


firebase.auth().onAuthStateChanged(function (user) {
    if (!user && location.pathname.indexOf('login.html') < 0) {
        location.replace('login.html?signInSuccessUrl=' + encodeURIComponent(location.href));
    }
});




