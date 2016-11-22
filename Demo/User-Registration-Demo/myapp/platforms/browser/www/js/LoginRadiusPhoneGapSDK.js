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

    //Api Domain where all LoginRadius calls go.
    APIDomain: "https://api.loginradius.com",
    //Domain that Hosted User Registration is located on.
    HostedDomain: "https://cdn.loginradius.com/hub/prod/Theme/mobile-v2/index.html",
    //Access tokens for native login are passed to the backend for parsing
    accessTokenPass: {
        'FACEBOOK': '/api/v2/access_token/facebook?key={API_KEY}&fb_access_token={ACCESS_TOKEN}',
        'GOOGLE': '/api/v2/access_token/google?key={API_KEY}&google_access_token={ACCESS_TOKEN}'
    },

    //Bindable call for when we receive the token.
    onLogin: {},

    //Bindable call after fetching the provider list.
    providerCallback: function() {},

    //Instead of renderInterface, just init. Short, simple, sweet.
    init: function(options) {

        $LR.util.jsonpCall("https://api.loginradius.com/api/v2/app/jsinterface?apikey=" + options.apikey, function handler(data) {
            $LR.providers = data['Providers'];
            $LR.providerCallback();
        });

        if (!options.permissions)
            options.permissions = this.options.permissions;
        this.options = options;
    },

    //Public function for logging in via a provider string name.
    login: function(provider) {
        if (this.options.native && provider.toUpperCase() == "FACEBOOK") {
            try {
                facebookConnectPlugin.login($LR.options.permissions, this.util.nativeCallbackFacebookSuccess,
                    this.util.nativeCallbackFacebookFail);
            } catch (e) {
                alert(e);
            }
        } else if (this.options.native && provider.toUpperCase() == "GOOGLE") {
            try {
                GoogleLogin.login(this.util.nativeCallbackGoogleSuccess, this.util.nativeCallbackGoogleFailure, []);
            } catch (e) {
                alert(e);
            }
        } else {

            var url = $LR.util.getProviderUrl(provider);
            console.log(url);
            $LR.util.openWindow(url);


            //  alert(usr);

        }

    },

    logout: function() {
        if (this.options.native) {
            try {
                facebookConnectPlugin.logout(this.util.nativeLogoutFacebookSuccess,
                    this.util.nativeLogoutFacebookFailure);
            } catch (e) {
                alert(e)
            }
        } else {
            sessionStorage.removeItem('LRTokenKey');
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

        openWindowUserRegistration: function(_url, callback) {
            if (!_url) return false;
            win = window.open(_url, '_blank', 'location=yes');
            win.addEventListener('loadstop', function(event) {
                var getParamValue = function(param) {
                    var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
                        results = regex.exec(event.url);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                };

                var redirect = getParamValue("redirect");
                if (redirect != "") {
                    var action = getParamValue("action");
                    if (action != "") {
                        switch (action) {

                            case "registration":

                                var email = getParamValue("email");
                                var status = getParamValue("status");
                                params.email = email;
                                params.status = status;
                                params.action = action;
                                break;

                            case "login":

                                var token = getParamValue("lrtoken");
                                var lrUid = getParamValue("lraccountid");
                                params.action = action;
                                params.token = token;
                                params.lrUid = lrUid;
                                break;

                            case 'forgotpassword':

                                var status = getParamValue("status");
                                var email = getParamValue("email");
                                params.status = status;
                                params.email = email;
                                params.action = action;
                                break;

                            case 'sociallogin':
                                var token = getParamValue("lrtoken");
                                params.token = token;
                                params.action = action;
                                break;

                            default:
                                alert('action not defined');
                                break;
                        }
                    }
                    win.close();
                };
            });
            win.addEventListener('exit', function(event) {

                callback(params);
            });
        },

        addJs: function(url, context) {
            context = context || document;
            var head = context.getElementsByTagName('head')[0];
            var js = context.createElement('script');
            js.src = url;
            js.type = "text/javascript";
            head.appendChild(js);

            return js;
        },

        jsonpCall: function(url, handle) {
            var func = 'Loginradius' + Math.floor((Math.random() * 1000000000000000000) + 1);
            window[func] = function(data) {
                handle(data);

                window[func] = undefined;
                try {
                    delete window[func];
                } catch (e) {}

                document.getElementsByTagName('head')[0].removeChild(js);
            };

            var endurl = url.indexOf('?') != -1 ? url + '&callback=' + func : url + '?callback=' + func;
            var js = this.addJs(endurl);
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

        nativeCallbackGoogleSuccess: function(userData) {

            var url = $LR.APIDomain + $LR.accessTokenPass['GOOGLE'];
            url = url.replace("{API_KEY}", $LR.options.apikey).replace("{ACCESS_TOKEN}", userData);
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
            $LR.onLogin();
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