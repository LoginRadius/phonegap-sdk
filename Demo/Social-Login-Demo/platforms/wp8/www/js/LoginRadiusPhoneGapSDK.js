/*
The MIT License (MIT)

Copyright (c) 2014 LoginRadius Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

//The General LR Object.
var $LR = {

    //An array of providers that are valid.
    providers: [],

    //Options array for configuration settings
    options: {
        permissions: ["public_profile"]
    },

    //Api Domain where all LoginRadius calls go.
    APIDomain: "https://api.loginradius.com",

    //Access tokens for native login are passed to the backend for parsing
    accessTokenPass: {
        'FACEBOOK': '/api/v2/access_token/facebook?key={API_KEY}&fb_access_token={ACCESS_TOKEN}'
    },

    //Bindable call for when we receive the token.
    onLogin: function(){},


    //Instead of renderInterface, just init. Short, simple, sweet.
    init: function(options) {
        $LR.util.jsonpCall("https://hub.loginradius.com/getinterfaceinfo/" + options.apikey, function (data) {
            $LR.providers = data['Providers'];
        });
        if (!options.permissions)
            options.permissions = this.options.permissions;
        this.options = options;
    },

    //Public function for logging in via a provider string name.
    login: function(provider){
        if (this.options.native && provider.toUpperCase() == "FACEBOOK"){
		
           var url = $LR.util.getProviderUrl(provider);
            $LR.util.openWindow(url);
        }
        else{
            var url = $LR.util.getProviderUrl(provider);
            $LR.util.openWindow(url);
        }

    },

    logout: function(){
        sessionStorage.removeItem('LRTokenKey');
    },

    util: {
         openWindow: function (_url) {
            if (!_url)
                return false;
            var win = window.open(_url, '_blank', 'menubar=1,resizable=1,width=450,height=500');
			win.addEventListener('loadstart', function(event){})
            win.addEventListener('loadstop', function(event){
			
			
			 if ((event.url.indexOf("?token")) > 0) {
			 
                var k = event.url.indexOf("?token");
                token = event.url.substring(k + 7, k + 43);
				sessionStorage.setItem("LRTokenKey", token);
				
				win.close();
                $LR.onLogin();
                
            }
			
               
            });
         },

        addJs: function (url, context) {
            context = context || document;
            var head = context.getElementsByTagName('head')[0];
            var js = context.createElement('script');
            js.src = url;
            js.type = "text/javascript";
            head.appendChild(js);

            return js;
        },

        jsonpCall: function (url, handle) {
            var func = 'Loginradius' + Math.floor((Math.random() * 1000000000000000000) + 1);
            window[func] = function (data) {
                handle(data);

                window[func] = undefined;
                try {
                    delete window[func];
                }
                catch (e) { }

                document.getElementsByTagName('head')[0].removeChild(js);
            };

            var endurl = url.indexOf('?') != -1 ? url + '&callback=' + func : url + '?callback=' + func;
            var js = this.addJs(endurl);
        },

        searchProviders: function(provider){
            for(var i=0; i < $LR.providers.length; i++) {
                if ($LR.providers[i]['Name'].toLowerCase() ==  provider.toLowerCase())
                    return $LR.providers[i];
            }
            return null;
        },

        getProviderUrl: function(provider){
            provider = this.searchProviders(provider);
            if (provider){
			var url=provider['Endpoint']+"&ismobile=1";
			return url;
			}
                
        },

        nativeCallbackFacebookSuccess: function(response){
            var url = $LR.APIDomain + $LR.accessTokenPass['FACEBOOK'];
            url = url.replace("{API_KEY}", $LR.options.apikey).replace("{ACCESS_TOKEN}", response['authResponse']['accessToken']);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);
        },

        nativeCallbackFacebookFail: function(){

        },

        LoginRadiusNativeCallback: function (callback){
           sessionStorage.setItem("LRTokenKey", callback['access_token']);
           $LR.onLogin();
        }
    }
};
