const admin = require('firebase-admin');
const configs = require('./config') 

// Accounts Panel Database:
module.exports =  admin.initializeApp({ 
    credential: admin.credential.cert(configs),
    databaseURL: "https://terratest-96af8-default-rtdb.firebaseio.com"
}, 'db') ;

