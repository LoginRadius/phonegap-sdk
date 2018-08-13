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
var apiDomain = "api.loginradius.com";
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


    //Options array for configuration settings
    options: {
        permissions: ["public_profile"]
    },

    //Api Domain where all LoginRadius calls go.
    // APIDomain: "https://api.loginradius.com",
    //Domain that Hosted User Registration is located on.
    GoogleScope: "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email",
	vkontakteScope: ['direct','email','status','wall'],
    accessTokenPass: {
        'FACEBOOK': '/api/v2/access_token/facebook?key={API_KEY}&fb_access_token={ACCESS_TOKEN}',
        'GOOGLE': '/api/v2/access_token/googlejwt?key={API_KEY}&id_token={ACCESS_TOKEN}',
		'VKONTAKTE': '/api/v2/access_token/vkontakte?key={API_KEY}&vk_access_token={ACCESS_TOKEN}'
    },

    //Bindable call for when we receive the token.
    onLogin: {},

    //Bindable call after fetching the provider list.
    providerCallback: function() {},

    //Instead of renderInterface, just init. Short, simple, sweet.
    init: function(options) {
        if (!options.permissions)
            options.permissions = this.options.permissions;
        this.options = options;

    },




    //Public function for logging in via a provider string name.
    login: function(url) {

        if (this.options.facebookNative && url.indexOf("facebook") !== -1) {
            win = window.open("http://", '_blank', 'location=no');
            try {
                facebookConnectPlugin.login($LR.options.permissions, this.util.nativeCallbackFacebookSuccess,
                    this.util.nativeCallbackFacebookFail);
            } catch (e) {
                alert(e);
            }
        } else if (this.options.googleNative && url.indexOf("google") !== -1) {
            win = window.open("http://", '_blank', 'location=no');
            var webClientId = "";
            if ($LR.options.googlewebid != null || $LR.options.googlewebid != "") {
                webClientId = $LR.options.googlewebid;
            }
            window.plugins.googleplus.login({
                    'webClientId': webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'scope': $LR.GoogleScope
                },
                function(user_data) {
                    // For the purpose of this example I will store user data on local storage
                    $LR.util.nativeCallbackGoogleSuccess(user_data);

                },
                function(msg) {
                    alert('error: ' + msg);
                    sessionStorage.removeItem("providername");
                });
        } else if(this.options.vkontakteNative && url.indexOf("vkontakte") !== -1){
			win = window.open("http://", '_blank', 'location=no');
			var vkontakteAppId = "";
			if($LR.options.vkontakteAppId !=null || $LR.options.vkontakteAppId != ""){
				vkontakteAppId = $LR.options.vkontakteAppId;
				SocialVk.init(vkontakteAppId);
				SocialVk.login($LR.vkontakteScope,this.util.nativeCallbackVkontakteSuccess,this.util.nativeCallbackVkontakteError);
			}
		} else if(this.options.customScopeEnabled) {
            return LRObject.util.openWindow(url+"&is_custom_scope=true");
        } else {
            return LRObject.util.openWindow(url);
        }

    },

    logout: function(options) {
        try {
            sessionStorage.removeItem('LRTokenKey');
            if (options.facebookNative) {
                facebookConnectPlugin.logout(this.util.nativeLogoutFacebookSuccess, this.util.nativeLogoutFacebookFailure);
            }
            if (options.googleNative) {

                window.plugins.googleplus.logout(
                    function(msg) {
                        alert(msg); // do something useful instead of alerting

                    }
                );
            }
			if(options.vkontakteNative){
				SocialVk.logout(this.util.nativeLogoutVkontakteSuccess,this.util.nativeLogoutVkontakteFailure);
			}
        } catch (e) {
            alert(e)
        }
    },

    util: {


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



        nativeCallbackGoogleSuccess: function(userData) {

            var url = "https://" + apiDomain + $LR.accessTokenPass['GOOGLE'];
            url = url.replace("{API_KEY}", LRObject.options.apiKey).replace("{ACCESS_TOKEN}", userData.idToken);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);


        },
        nativeCallbackFacebookSuccess: function(userData) {
            var url = "https://" + apiDomain + $LR.accessTokenPass['FACEBOOK'];
            url = url.replace("{API_KEY}", LRObject.options.apiKey).replace("{ACCESS_TOKEN}", userData['authResponse']['accessToken']);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);
        },

        nativeCallbackFacebookFail: function(res) {
            console.log(res);
        },
		
		nativeCallbackVkontakteSuccess: function(data) {
		    var os = $LR.util.checkMobileOS();
		    var token = "";
		    if(os == "Android"){
		        var jsonData = JSON.parse(data);
                token = jsonData.token;
		    }else if(os == "iOS"){
                token = data.token;
		    }
			var url = "https://" + apiDomain + $LR.accessTokenPass['VKONTAKTE'];
            url = url.replace("{API_KEY}", LRObject.options.apiKey).replace("{ACCESS_TOKEN}", token);
            $LR.util.jsonpCall(url, $LR.util.LoginRadiusNativeCallback);
		},
		
		nativeCallbackVkontakteError: function(error) {
			console.log(error);
		},
		
        LoginRadiusNativeCallback: function(callback) {
            win.close();
            sessionStorage.setItem("LRTokenKey", callback['access_token']);
            LRObject.loginRadiusHtml5PassToken(callback['access_token']);

        },

        nativeLogoutFacebookSuccess: function(response) {
            sessionStorage.removeItem('LRTokenKey');
        },

        nativeLogoutFacebookFailure: function(response) {
            console.log('error');
        },
		
		nativeLogoutVkontakteSuccess: function(response) {
            sessionStorage.removeItem('LRTokenKey');
        },

        nativeLogoutVkontakteFailure: function(response) {
            console.log('error');
        },
		
		checkMobileOS: function(){
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			if (/android/i.test(userAgent)) {
				return "Android";
			}

			if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
				return "iOS";
			}

			return "unknown";
		},

        lrRegister: function() {
            $LR.init($LR.options);
            var registration_options = {}
            registration_options.onSuccess = function(response) {
                //On Success
                console.log(response);
                if (response != null) {
                    params.success = response;
                    params.action = "registration";
                    $LR.options.callback(params);
                }

            };
            registration_options.onError = function(errors) {
                //On Errors
                console.log(errors);
                if (errors != null) {
                    params.errors = errors;
                    params.action = "registration";
                    $LR.options.callback(params);
                }



            };
            registration_options.container = "registration-container";
            LRObject.util.ready(function() {
                LRObject.init("registration", registration_options);
            })


        },
        lrSocial: function() {
            $LR.init($LR.options);
            var sl_options_main = {};
            sl_options_main.onSuccess = function(response) {

                if (response != null) {
                    params.success = response;
                    params.action = "sociallogin";
                    $LR.options.callback(params);
                }

                console.log(response);
            };


            sl_options_main.onError = function(errors) {



                //On Errors
                if (errors != null) {
                    params.errors = errors;
                    params.action = "sociallogin";
                    $LR.options.callback(params);
                }
            };

            sl_options_main.container = "sociallogin-main-container"
            sl_options_main.templateName = "loginradiuscustom_tmpl"
            LRObject.customInterface(".interfacecontainerdiv", sl_options_main);
            LRObject.util.ready(function() {

                LRObject.init('socialLogin', sl_options_main);
            });
        },
        lrForgotPassword: function() {
            $LR.init($LR.options);
            var forgotpassword_options = {};
            forgotpassword_options.container = "forgotpassword-container";
            forgotpassword_options.onSuccess = function(response) {
                // On Success
                if (response != null) {
                    params.success = response;
                    params.action = "forgotpassword";
                    $LR.options.callback(params);
                }
                console.log(response);

            };
            forgotpassword_options.onError = function(errors) {
                // On Errors
                console.log(errors);
                if (errors != null) {
                    params.errors = errors;
                    params.action = "forgotpassword";
                    $LR.options.callback(params);
                }
            }

            LRObject.util.ready(function() {
                LRObject.init("forgotPassword", forgotpassword_options);
            });

        },
        lrLogin: function() {
            $LR.init($LR.options);
            var options = {};
            var sl_options = {};
            sl_options.onSuccess = function(response) {


                if (response != null) {
                    params.success = response;
                    params.action = "login";
                    $LR.options.callback(params);
                }

                console.log(response);
            };
            options.onSuccess = function(response) {

                if (response != null) {
					params.errors =null;
                    params.success = response;
                    params.action = "login";
                    $LR.options.callback(params);
                }

                console.log(response);
            };
            options.onError = function(errors) {


                if (errors != null) {
					params.success = null;
                    params.errors = errors;
                    params.action = "login";
                    $LR.options.callback(params);
                }

                console.log(errors);

            };
            sl_options.onError = function(errors) {
                if (errors != null) {
					params.success = null;
                    params.errors = errors;
                    params.action = "login";
                    $LR.options.callback(params);
                }

                //On Errors
                console.log(errors);

            };
            options.container = "login-container";
            sl_options.container = "sociallogin-container"
            sl_options.templateName = "loginradiuscustom_tmpl";

            LRObject.customInterface(".interfacecontainerdiv", sl_options);
            LRObject.util.ready(function() {
                LRObject.$hooks.register('socialLoginFormRender', function() {
                    document.getElementById('login-container').style.display = 'none';
                    document.getElementById('line').style.display = 'none';
                    document.getElementById('attid').style.display = 'block';
                });

                LRObject.init("login", options);
                LRObject.init('socialLogin', sl_options);
            });

        },

        lrProfileUpdate: function() {
            $LR.init($LR.options);
            var profileeditor_options = {};
            profileeditor_options.container = "profileeditor-container";
            profileeditor_options.onSuccess = function(response) {

                // On Success
                params.success = response;
                params.action = "updateprofile";
                $LR.options.callback(params);
                console.log(response);

            };
            profileeditor_options.onError = function(errors) {

                // On Error
                params.errors = errors;
                params.action = "updateprofile";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {

                LRObject.init("profileEditor", profileeditor_options);
            });
        },

        lrChangePassword: function() {
            $LR.init($LR.options);
            var changepassword_options = {};
            changepassword_options.container = "changepassword-container";
            changepassword_options.onSuccess = function(response) {
                // On Success
                params.success = response;
                params.action = "changepassword";
                $LR.options.callback(params);
                console.log(response);
            };
            changepassword_options.onError = function(errors) {
                // On Error
                params.errors = errors;
                params.action = "changepassword";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {

                LRObject.init("changePassword", changepassword_options);
            });

        },
        lrUpdatePhone: function() {
            $LR.init($LR.options);
            var updatephone_options = {};
            updatephone_options.container = "updatephone-container";
            updatephone_options.onSuccess = function(response) {
                // On Success
                params.success = response;
                params.action = "updatephone";
                $LR.options.callback(params);
                console.log(response);
            };
            updatephone_options.onError = function(errors) {
                // On Error
                params.errors = errors;
                params.action = "updatephone";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {

                LRObject.init("updatePhone", updatephone_options);


            });
        },


        lrAddEmail: function() {
            $LR.init($LR.options);
            var addemail_options = {};
            addemail_options.container = "addemail-container";
            addemail_options.onSuccess = function(response) {
                // On Success
                params.success = response;
                params.action = "addemail";
                $LR.options.callback(params);
                console.log(response);
            };
            addemail_options.onError = function(errors) {
                // On Error
                params.errors = errors;
                params.action = "addemail";
                $LR.options.callback(params);
                console.log(errors);
            };


            LRObject.util.ready(function() {

                LRObject.init("addEmail", addemail_options);

            });
        },


        lrRemoveEmail: function() {

            $LR.init($LR.options);
            var removeemail_options = {};
            removeemail_options.container = "removeemail-container";
            removeemail_options.onSuccess = function(response) {
                // On Success
                params.success = response;
                params.action = "removeemail";
                $LR.options.callback(params);
                console.log(response);
            };
            removeemail_options.onError = function(errors) {
                // On Error
                params.errors = errors;
                params.action = "removeemail";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {

                LRObject.init("removeEmail", removeemail_options);

            });
        },

        lrChangeUsername: function() {
            $LR.init($LR.options);
            var changeusername_options = {};

            changeusername_options.container = "changeusername-container";
            changeusername_options.onSuccess = function(response) {
                // On Success
                params.success = response;
                params.action = "changeusername";
                $LR.options.callback(params);
                console.log(response);
            };
            changeusername_options.onError = function(errors) {
                // On Error
                params.errors = errors;
                params.action = "changeusername";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {
                LRObject.init("changeUsername", changeusername_options);
            });

        },



        lrAccountLink: function() {
            $LR.init($LR.options);
            var la_options = {};
            la_options.container = "interfacecontainerdiv_link";
            la_options.templateName = "loginradiuscustom_tmpl_link"
            la_options.onSuccess = function(response) {
                // On Success

                params.success = response;
                params.action = "accountlinking";
                $LR.options.callback(params);
                console.log(response);
            };
            la_options.onError = function(errors) {
                // On Errors
                params.errors = errors;
                params.action = "accountlinking";
                $LR.options.callback(params);
                console.log(errors);
            };

            LRObject.util.ready(function() {
                LRObject.init("linkAccount", la_options);
                LRObject.init("unLinkAccount", la_options);
            });

        },
		
		lrAutoLogin: function() { 
			$LR.init($LR.options);
			var al_options = {};
			al_options.container = "autologin-container";
			al_options.onSuccess = function(response) { 
				//On Success
				params.errors = null;
				params.success = response;
				params.action = "autologin";
				$LR.options.callback(params);
				console.log(response);
			};
			al_options.onError = function(errors) { 
				//On Errors
				params.success =null;
				params.errors = errors;
				params.action = "autologin";
				$LR.options.callback(params);
				console.log(errors);
			};
			
			LRObject.util.ready(function() {
				LRObject.init("autoLogin",al_options);
			});
		},
		
		lrSimplifiedRegistration: function() {
			$LR.init($LR.options);
			var sr_options = {};
			sr_options.container = "passwordLessLogin-container";
			sr_options.onSuccess = function(response) {
				//On Success
				params.errors = null;
				params.success = response;
				params.action = "simplifiedregistration";
				$LR.options.callback(params);
				console.log(response);
			};
			sr_options.onError = function(errors) {
				//On Errors
				params.success =null;
				params.errors = errors;
				params.action = "simplifiedregistration";
				$LR.options.callback(params);
				console.log(errors);
			};
			
			LRObject.util.ready(function() {
				LRObject.init("noRegistrationPasswordLessLogin", sr_options);
			});
		},
		
		lrResetPasswordBySecurityQuestions: function() {
			$LR.init(options);
			var rps_options = {};
			rps_options.container = "resetPasswordBySecQ-container";
			rps_options.onSuccess = function(response) {
				//On Success
				params.errors = null;
				params.success = response;
				params.action = "resetpasswordbysecurityquestions";
				$LR.options.callback(params);
				console.log(response);
			};
			rps_options.onError = function(errors) {
				//On Errors
				params.success =null;
				params.errors = errors;
				params.action = "resetpasswordbysecurityquestions";
				$LR.options.callback(params);
				console.log(errors);
			};

			LRObject.util.ready(function() {
				LRObject.init("resetPasswordBySecurityQuestion", rps_options);
			});		
		}
    }
};


/*
Social APIs 
*/

var LoginRadiusSDK = (function() {
    //for cross browser communication
    (function(a, b) {
        "use strict";
        var c = function() {
            var b = function() {
                var b = a.location.hash ? a.location.hash.substr(1).split("&") : [],
                    c = {};
                for (var d = 0; d < b.length; d++) {
                    var e = b[d].split("=");
                    c[e[0]] = decodeURIComponent(e[1])
                }
                return c
            };
            var c = function(b) {
                var c = [];
                for (var d in b) {
                    c.push(d + "=" + encodeURIComponent(b[d]))
                }
                a.location.hash = c.join("&")
            };
            return {
                get: function(a) {
                    var c = b();
                    if (a) {
                        return c[a]
                    } else {
                        return c
                    }
                },
                add: function(a) {
                    var d = b();
                    for (var e in a) {
                        d[e] = a[e]
                    }
                    c(d)
                },
                remove: function(a) {
                    a = typeof a == "string" ? [a] : a;
                    var d = b();
                    for (var e = 0; e < a.length; e++) {
                        delete d[a[e]]
                    }
                    c(d)
                },
                clear: function() {
                    c({})
                }
            }
        }();
        a.hash = c
    })(window)

    var lrToken = hash.get('lr-token');
    if (lrToken) {
        window.opener.loginradiushtml5passToken(lrToken);
        document.write('<style type="text/css">body { display: none !important; } </style>');
        window.close();
    }




    var token = 'LRTokenKey';

    var util = {};

    // store all about loginradius module
    var module = {};
    var onlogin = function() {};


    module.isauthenticated = false;


    /**function is used to set Callback Handler to login
     * @function
     * @public
     * @param fn {function}
     */
    module.setLoginCallback = function(fn) {
        module.onlogin = fn;
    };


    /**The User Profile API is used to get social profile data from the user’s social account after authentication. The social profile will be retrieved via oAuth and OpenID protocols. The data is normalized into LoginRadius' standard data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getUserprofile = function(handle) {


        util.jsonpCall("https://" + apiDomain + "/api/v2/userprofile?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };

    /**The photo API is used to get photo data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param A valid albumId, it return album photos
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getPhotos = function(albumId, handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/photo?access_token=" + module.getToken() + "&albumid=" + albumId, function(data) {
            handle(data);
        });
    };

    /**The Check In API is used to get check-ins data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getCheckins = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/checkin?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };

    /**The Albums API is used to get the Albums data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getAlbums = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/album?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Audio API is used to get audio files data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getAudios = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/audio?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Mention API is used to get mention data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getMentions = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/mention?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Following API is used to get the followers’ information from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getFollowings = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/following?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Event API is used to get the event data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getEvents = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/event?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Post API is used to get posted messages from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getPosts = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/post?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Company API is used to get the followed company’s data in the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getCompanies = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/company?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Group API is used to get group data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getGroups = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/group?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };

    /**The Status API is used to get the status messages from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getStatuses = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/status?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };

    /**The Contact API is used to get contacts/friends/connections data from the user’s social account. The data will normalized into LoginRadius' data format.
     * @function
     * @public
     * @param Curser value for getting next records set
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getContacts = function(cursor, handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/contact?access_token=" + module.getToken() + "&nextcursor=" + cursor, function(data) {
            handle(data);
        });
    };


    /**The Video API is used to get videos data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getVideos = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/video?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };


    /**The Likes API is used to get likes data from the user’s social account. The data will be normalized into LoginRadius' data format.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.getLikes = function(handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/like?access_token=" + module.getToken(), function(data) {
            handle(data);
        });
    };

    /**
    The Page API is used to get the page data from the user’s social account. The data will be normalized into LoginRadius’ standard data format. This API requires setting permissions in your LoginRadius Dashboard.
     * @function
     * @public
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius

    */



    module.getPage = function(pagename, handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/page?access_token=" + module.getToken() + "&pagename=" + pagename, function(data) {
            handle(data);
        });
    };


    /**This API is used to update the status on the user’s wall.
     * @function
     * @public
     * @param title for status message.
     * @param A web link of the status message
     * @param An image URL of the status message
     * @param The status message text
     * @param A caption of the status message
     * @param A description of the status message
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.postStatus = function(title, url, status, imageurl, caption, description, handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/status/js?access_token=" + module.getToken() + "&title=" + title + "&url=" + url + "&imageurl=" + imageurl + "&status=" + status + "&caption=" + caption + "&description=" + description, function(data) {
            handle(data);
        });
    };


    /**The Message API is used to post messages to the user’s contacts. After using the Contact API, you can send messages to the retrieved contacts.
     * @function
     * @public
     * @param A valid friend id to send the message, it would be fetched from the contacts list
     * @param The subject of the message to be send
     * @param The details of the message to be send
     * @param handle {CallbackHandler} callback handler, invoke after getting Userprofile from LoginRadius
     */
    module.postMessage = function(to, subject, message, handle) {
        util.jsonpCall("https://" + apiDomain + "/api/v2/message/js?access_token=" + module.getToken() + "&to=" + to + "&subject=" + subject + "&message=" + message, function(data) {
            handle(data);
        });
    };
	
    /**The Access Token API is used to get the LoginRadius access token after authentication. It will be valid for the specific duration of time specified in the response.
     * @function
     * @public
     */
    module.getToken = function() {

        return sessionStorage.getItem('LRTokenKey');
    };

    module.removeToken = function() {

        return sessionStorage.removeItem('LRTokenKey');
    };




    util.jsonpCall = function(url, handle) {
        var func = 'Loginradius' + Math.floor((Math.random() * 1000000000000000000) + 1);
        window[func] = function(data) {
            handle(data);

            try {
                delete window[func];
            } catch (e) {
                window[func] = undefined;
            }
            document.body.removeChild(js);
        };
        var js = document.createElement('script');
        js.src = url.indexOf('?') != -1 ? url + '&callback=' + func : url + '?callback=' + func;
        js.type = "text/javascript";
        document.body.appendChild(js);
    };


    util.addEvent = function(type, element, handle) {
        var elements = [];
        if (element instanceof Array) {
            elements = element;
        } else {
            elements.push(element);
        }
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].attachEvent) {
                elements[i].attachEvent("on" + type, function(e) {
                    handle(e);
                });
            } else if (elements[i].addEventListener) {
                elements[i].addEventListener(type, handle, false);
            }
        }
    };


    function receiveToken(event) {
        if (event.origin.indexOf("hub.loginradius.com") == -1) {
            return;
        }
        loginradiushtml5passToken(event.data);
    }

    util.addEvent("message", window, receiveToken);

    window.loginradiushtml5passToken = function(tok) {
        //sessionStorage.setItem(token, tok);
        module.isauthenticated = true;
        module.onlogin();
    };
    return module;
})();