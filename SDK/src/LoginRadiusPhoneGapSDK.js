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
var win;
var params = {};
var $LR = {
    FB_native_permissions: {
        USER_BASIC_INFO: "public_profile",

        /* Basic User Data permissions */
        USER_ABOUT: "user_about_me",
        USER_BOOKS: "user_actions.books",
        USER_FITNESS: "user_actions.fitness",
        USER_MUSIC: "user_actions.music",
        USER_NEWS: "user_actions.news",
        USER_VIDEO: "user_actions.video",
        USER_ACTIVITIES: "user_activities",
        USER_BIRTHDAY: "user_birthday",
        USER_EDUCATION: "user_education_history",
        USER_EVENTS: "user_events",
        USER_FRIEND_USING_APP: "user_friends",
        USER_GAMES_ACTIVITY: "user_games_activity",
        USER_GROUPS: "user_groups",
        USER_HOMETOWN: "user_hometown",
        USER_INTERESTS: "user_interests",
        USER_LIKES: "user_likes",
        USER_LOCATION: "user_location",
        USER_PHOTOS: "user_photos",
        USER_RELATIONSHIPS: "user_relationships",
        USER_RELATIONSHIP_PREF: "user_relationship_details",
        USER_RELIGION_POLITICS: "user_religion_politics",
        USER_STATUS: "user_status",
        USER_TAGGED_PLACES: "user_tagged_places",
        USER_VIDEOS: "user_videos",
        USER_WEBSITE: "user_website",
        USER_WORK_HISTORY: "user_work_history",

        /* Extended Permissions */
        USER_EMAIL: "email",
        INSIGHTS: "read_insights",
        MAILBOX: "read_mailbox",
        STREAM: "read_stream",
        PAGE_MAILBOX: "read_page_mailboxes",
        FRIENDS: "read_friendlists",
        ADS_MANAGEMENT: "ads_management",
        ADS_READ: "ads_read",
        MANAGE_NOTIFICATIONS: "manage_notifications",
        PUBLISH_ACTIONS: "publish_actions",
        MANAGE_PAGES: "manage_pages",
        RSVP_EVENTS: "rsvp_events"
    },
    //An array of providers that are valid.
    providers: [],

    //URL pattern
    URL: 'https://{APP_NAME}.hub.loginradius.com/requesthandlor.aspx?apikey={API_KEY}&provider=' +
        '{PROVIDER}&callback=http://{APP_NAME}.hub.loginradius.com/is_access_token=true&scope=lr_basic',
    //Options array for configuration settings
    options: {
        permissions: ["public_profile"]
    },
     GoogleScope:"https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email",
    //Api Domain where all LoginRadius calls go.
    APIDomain: "https://api.loginradius.com",
    //Domain that Hosted User Registration is located on.
    HostedDomain: "https://cdn.loginradius.com/hub/prod/Theme/mobile-v4/index.html",
    //Access tokens for native login are passed to the backend for parsing
    accessTokenPass: {
        'FACEBOOK': '/api/v2/access_token/facebook?key={API_KEY}&fb_access_token={ACCESS_TOKEN}',
        'GOOGLE': '/api/v2/access_token/googlejwt?key={API_KEY}&id_token={ACCESS_TOKEN}'
    },

    //Bindable call for when we receive the token.
    onLogin: function() {},

    //Bindable call after fetching the provider list.
    providerCallback: function() {},

    //Instead of renderInterface, just init. Short, simple, sweet.
    init: function(options) {
        $LR.util.jsonpCall("http://cdn.loginradius.com/interface/json/"+options.apikey+".json", function handler(data) {
            $LR.providers = data['Providers'];
            $LR.providerCallback();
        });

        if (!options.permissions)
            options.permissions = this.options.permissions;
        this.options = options;
    },

    //Public function for logging in via a provider string name.
    login: function(provider) {
       var ref = cordova.InAppBrowser.open('http://', '_blank', 'location=no');   //open new  inappbrowser window for native login background
        if ($LR.options.facebooknative && provider == "facebook") {
            try {
                facebookConnectPlugin.login($LR.options.permissions,
                        this.util.nativeCallbackFacebookSuccess,
                        this.util.nativeCallbackFacebookFail);
            } catch (e) {
                alert(e);
                 sessionStorage.removeItem("providername");
            }
        } else if (this.options.googlenative && provider == "google") {
            var webClientId="";

            if($LR.options.googlewebid!=null ||$LR.options.googlewebid!=""){
                webClientId=$LR.options.googlewebid;
            }
            window.plugins.googleplus.login({
               'webClientId': webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
               'scope': $LR.GoogleScope
            },
            function (user_data) {
                // For the purpose of this example I will store user data on local storage
                $LR.util.nativeCallbackGoogleSuccess(user_data);
            },function (msg) {
                alert('error: ' + msg);
                sessionStorage.removeItem("providername");
            });
        } else {
            var url = $LR.util.getProviderUrl(provider);
                      console.log(url);
                      $LR.util.openWindow(url);

      }},

    logout: function() {

            try {
              sessionStorage.removeItem('LRTokenKey');
              if(facebookConnectPlugin.getLoginStatus){
               facebookConnectPlugin.logout(this.util.nativeLogoutFacebookSuccess,this.util.nativeLogoutFacebookFailure);
              }

                window.plugins.googleplus.logout(
                    function (msg) {
                      alert(msg); // do something useful instead of alerting

                    }
                );

            } catch (e) {
                alert(e)
            }

    },

    util: {

     openWindow: function(_url) {

                if (!_url)
                    return false;

                win = window.open(_url, '_blank', 'width=450,height=500,toolbar=no');
                win.addEventListener('loadstart', function(event) {})
                win.addEventListener('loadstop', function(event) {


                    if ((event.url.indexOf("?token")) > 0) {
                        var k = event.url.indexOf("?token");
                        token = event.url.substring(k + 7, k + 43);
                        sessionStorage.setItem("LRTokenKey", token);

                        win.close();
                        $LR.onLogin();

                    }
                });
            },
       

      openWindowUserRegistration : function(url, callback) {

            if (!url) return false;
            if($LR.options.SafariViewController){
            SafariViewController.isAvailable(function (available) {

                                url+="&customRedirect=true";

            					if($LR.options.googlenative)
            						url+="&googleNative=true";
            					if($LR.options.facebooknative)
            						url+="&facebookNative=true";

                                SafariViewController.show(
                                {
            						url: url,
            						hidden: false, // default false. You can use this to load cookies etc in the background (see issue #1 for details).
            						animated: false, // default true, note that 'hide' will reuse this preference (the 'Done' button will always animate though)
            						transition: 'curl', // (this only works in iOS 9.1/9.2 and lower) unless animated is false you can choose from: curl, flip, fade, slide (default)
            						enterReaderModeIfAvailable: false // default false
                                },
                                // this success handler will be invoked for the lifecycle events 'opened', 'loaded' and 'closed'
                                function(result)
                                {
            						if (result.event === 'opened') {
            						  console.log('opened');
            						} else if (result.event === 'loaded') {
            						  console.log('loaded');
            						} else if (result.event === 'closed') {
            						  console.log('closed');
            						}
                                },
                                function(msg)
                                {
            						console.log("KO: " + msg);
                                })
                             });//end of SafariViewController.isAvailable(func{});
                    }else{

                    var email; // getting email for registration and forgot password
                    var status; // getting status for registration and forgot password
                    var token; // getting token for call api and getting userprofile
                    var lrUid; //getting uid for login
                    win = window.open(url, '_blank', 'location=no');
                    win.addEventListener('loadstart', function(event) {
                    var getParamValue = function(param) {
			        var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
				    results = regex.exec(event.url);
				    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
					};
                     var provider = getParamValue("provider");
                    if (provider == "facebook" && $LR.options.facebooknative) {
                     $LR.login(provider);
                    }else if(provider == "google" && $LR.options.googlenative){
                     $LR.login(provider);
                     }
               });

                    win.addEventListener('loadstop',
                            function(event) {

                                var getParamValue = function(param) {
                                    var regex = new RegExp("[\\?&]" + param
                                            + "=([^&#]*)"), results = regex
                                            .exec(event.url);
                                    return results === null ? ""
                                            : decodeURIComponent(results[1].replace(
                                                    /\+/g, " "));
                                };

                                    var redirect = getParamValue("redirect");
                                    if (redirect != "") {
                                        var action = getParamValue("action");
                                        if (action != "") {
                                            switch (action) {

                                            case "registration":

                                                email = getParamValue("email");
                                                status = getParamValue("status");
                                                params.email = email;
                                                params.status = status;
                                                params.action = action;
                                                break;

                                            case "login":

                                                token = getParamValue("lrtoken");
                                                lrUid = getParamValue("lraccountid");
                                                params.action = action;
                                                params.token = token;
                                                params.lrUid = lrUid;
                                                break;

                                            case "forgotpassword":

                                                status = getParamValue("status");
                                                email = getParamValue("email");
                                                params.status = status;
                                                params.email = email;
                                                params.action = action;
                                                break;

                                            case "social":
                                            case "sociallogin":
                                                token = getParamValue("lrtoken");
                                                params.token = token;
                                                params.action = action;
                                                break;

                                            case "emailnotverfied":
                                                params.action = action;
                                                break;

                                            default:
                                                alert('action: ' + action +' is not defined');
                                                break;
                                            }
                                        }
                                        win.close();
                                    };


                            });
                    win.addEventListener('exit', function(event) {

                        callback(params);
                    });

                }}
        ,
        addJs: function(url, context) {
            context = context || document;
            var head = context.getElementsByTagName('head')[0];
            var js = context.createElement('script');
            js.src = url;
            js.type = "text/javascript";
            head.appendChild(js);

            return js;
        },
        
        handleUrl:function(url){
            SafariViewController.hide();
            var getParamValue = function(param,url) {
                var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
                    results = regex.exec(url);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };
            
            if(url.indexOf('login')!=-1)
            {
                
                var token=getParamValue("lrtoken",url);
                var lrUid=getParamValue("lraccountid",url);
                var response={
                    action:"login",
                    token: token,
                    lrUid: lrUid
                }
                $LR.options.callback(response);
            }
            if(url.indexOf('social')!=-1)
            {
                if (getParamValue("action",url)=="emailnotverfied")
                {
                    var response={
                        action:"emailnotverfied"
                    }
                    $LR.options.callback(response);
                }else
                {
                    var token=getParamValue("lrtoken",url);
                    var lrUid=getParamValue("lraccountid",url);
                    var response={
                        action:"sociallogin",
                        token: token,
                        lrUid: lrUid
                    }
                    $LR.options.callback(response);
                }

            }
            if(url.indexOf('registration')!=-1)
            {
                
                var email=getParamValue("email",url);
                var status=getParamValue("status",url);
                var response={
                    action:"registration",
                    email: email,
                    status: status
                }
                $LR.options.callback(response);
            }
            if(url.indexOf('forgotpassword')!=-1)
            {
                
                var email=getParamValue("email",url);
                var status=getParamValue("status",url);
                var response={
                    action:"forgotpassword",
                    email: email,
                    status: status
                }
                $LR.options.callback(response);
            }
            if(url.indexOf('googleNative')!=-1)
            {
                setTimeout(function(){
                 $LR.login('google');
                },1000);
            }
            if(url.indexOf('facebookNative')!=-1)
            {
                setTimeout(function(){
                 $LR.login('facebook');
                },1000);
            }
            if(url.indexOf('emailnotverfied')!=-1)
            {
                var response={
                    action:"emailnotverfied"
                }
                $LR.options.callback(response);
            }
            if(url.indexOf('denied_access')!=-1)
            {
                win.close()
            }
        },

        jsonpCall: function(url, handle) {
            var func = 'loginRadiusAppJsonLoaded';
            window[func] = function (data) {
            
                handle(data);
                window[func] = undefined;
                try {
                    delete window[func];
                } catch (e) {}
            };

            var endurl = url.indexOf('?') != -1 ? url + '&callback=' + func : url + '?callback=' + func;
            var js = $LR.util.addJs(endurl);
        },

        searchProviders: function(provider) {
            for (var i = 0; i < $LR.providers.length; i++) {
                if ($LR.providers[i]['Name'].toLowerCase() == provider.toLowerCase())
                    return $LR.providers[i];
            }
            return null;
        },

        getProviderUrl: function(provider) {
            provider = this.searchProviders(provider);
            if (provider) {
                var url = provider['Endpoint'];
                url = url + "&ismobile=1&is_access_token=1";
                return url;
            }

        },

        nativeCallbackGoogleSuccess: function(user_data) {

            var url = $LR.APIDomain + $LR.accessTokenPass['GOOGLE'];
            url = url.replace("{API_KEY}", $LR.options.apikey).replace("{ACCESS_TOKEN}", user_data.idToken);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);


        },
        nativeCallbackFacebookSuccess: function(userData) {

            var url = $LR.APIDomain + $LR.accessTokenPass['FACEBOOK'];
            url = url.replace("{API_KEY}", $LR.options.apikey).replace("{ACCESS_TOKEN}", userData['authResponse']['accessToken']);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);
        },

        nativeCallbackFacebookFail: function(res) {
            console.log(res);
        },

        LoginRadiusNativeCallback: function(callback) {
            sessionStorage.setItem("LRTokenKey", callback['access_token']);
            var actionfb = ("sociallogin");
            var lrfbtoken = sessionStorage.getItem("LRTokenKey");
            window.location = $LR.options.nativepath;
            win.close();
        },

        nativeLogoutFacebookSuccess: function(response) {
            sessionStorage.removeItem('LRTokenKey');
        },

        nativeLogoutFacebookFailure: function(response) {
            console.log('error');
        },

        lrRegister: function() {
            var CallbackFun = $LR.options.callback;
            $LR.init($LR.options);
            for (var prov in $LR.providers) {
                var url = $LR.util.getProviderUrl($LR.providers[prov].Name);
                var domain = url.split('/')[2];
                domain = domain.split(':')[0];
                domain = domain.split('.')[0];
            }
            var url = $LR.HostedDomain + "?apikey=" + $LR.options.apikey +
                "&sitename=" + domain +
                "&promptPasswordOnSocialLogin=" +
                $LR.options.promptPasswordOnSocialLogin +
                "&V2RecaptchaSiteKey=" + $LR.options.V2RecaptchaSiteKey +
                "&action=registration";
            $LR.util.openWindowUserRegistration(url, CallbackFun);

        },
        lrSocial: function() {
            var CallbackFun = $LR.options.callback;
            $LR.init($LR.options);
            for (var prov in $LR.providers) {
                var url = $LR.util.getProviderUrl($LR.providers[prov].Name);
                var domain = url.split('/')[2];
                domain = domain.split(':')[0];
                domain = domain.split('.')[0];
            }
            var url = $LR.HostedDomain + "?apikey=" + $LR.options.apikey +
                "&sitename=" + domain +
                "&promptPasswordOnSocialLogin=" +
                $LR.options.promptPasswordOnSocialLogin +
                "&V2RecaptchaSiteKey=" + $LR.options.V2RecaptchaSiteKey +
                "&action=social";
            $LR.util.openWindowUserRegistration(url, CallbackFun);
        },
        lrForgotPassword: function() {
            var CallbackFun = $LR.options.callback;
            $LR.init($LR.options);
            for (var prov in $LR.providers) {
                var url = $LR.util.getProviderUrl($LR.providers[prov].Name);
                var domain = url.split('/')[2];
                domain = domain.split(':')[0];
                domain = domain.split('.')[0];
            }
            var url = $LR.HostedDomain + "?apikey=" + $LR.options.apikey +
                "&sitename=" + domain +
                "&action=forgotpassword";
            $LR.util.openWindowUserRegistration(url, CallbackFun);
        },
        lrLogin: function() {
            var CallbackFun = $LR.options.callback;
            $LR.init($LR.options);
            for (var prov in $LR.providers) {
                var url = $LR.util.getProviderUrl($LR.providers[prov].Name);
                var domain = url.split('/')[2];
                domain = domain.split(':')[0];
                domain = domain.split('.')[0];
            }
            var url = $LR.HostedDomain + "?apikey=" + $LR.options.apikey +
                "&sitename=" + domain +
                "&promptPasswordOnSocialLogin=" +
                $LR.options.promptPasswordOnSocialLogin +
                "&V2RecaptchaSiteKey=" + $LR.options.V2RecaptchaSiteKey +
                "&action=login";
            $LR.util.openWindowUserRegistration(url, CallbackFun);
        }
    }
};
