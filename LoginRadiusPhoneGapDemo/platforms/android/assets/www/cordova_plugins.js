cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",
        "id": "org.apache.cordova.inappbrowser.inappbrowser",
        "clobbers": [
            "window.open"
        ]
    },
    {
        "file": "plugins/com.aquto.cordova.GoogleLogin/www/GoogleLogin.js",
        "id": "com.aquto.cordova.GoogleLogin.GoogleLogin",
        "clobbers": [
            "window.plugins.GoogleLogin"
        ]
    },
    {
        "file": "plugins/com.phonegap.plugins.facebookconnect/facebookConnectPlugin.js",
        "id": "com.phonegap.plugins.facebookconnect.FacebookConnectPlugin",
        "clobbers": [
            "facebookConnectPlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.inappbrowser": "0.5.4-dev",
    "com.aquto.cordova.GoogleLogin": "0.0.1",
    "com.phonegap.plugins.facebookconnect": "0.11.0",
    "com.google.playservices": "21.0.0"
}
// BOTTOM OF METADATA
});