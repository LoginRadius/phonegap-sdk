var LoginRadiusUserRegistration = {
};
LoginRadiusUserRegistration.util = {
};
var win;
var params={};
(function (util) {

    util.openWindow = function (url,callback) {
        if (!url)return false;
        win =window.open(url, '_blank', 'location=yes');
		win.addEventListener('loadstop',function(event){
			var getParamValue= function(param){
			var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
			results = regex.exec(event.url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
			};
			var redirect=getParamValue("redirect");
			if(redirect!="")
			{
				var action= getParamValue("action");
				if(action!="")
				{ 	params.action= action;
					switch(action) {
							case "registration":
								params.email=getParamValue("email");
								params.status=getParamValue("status");
								break;
								
							case "login":
								
								params.token=getParamValue("lrtoken");
								params.lrUid=getParamValue("lraccountid");
								break;
								
							case 'forgotpassword':
								
								params.status=getParamValue("status");
								params.email=getParamValue("email");
								break;								
							case 'social':
								params.token=getParamValue("lrtoken");
								break;
							case 'sociallogin':
								params.token=getParamValue("lrtoken");
								break;
							
							default:
								alert('action not defined');
								break;
							}
							win.close();
				}	            
				
			};
		});		
		win.addEventListener('exit',function(event){
			callback(params);
		});		
    }
    var userAgent = navigator.userAgent.toLowerCase();
    // Figure out what browser is being used
    var browser = {
        version : (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1], 
		safari : /webkit/.test(userAgent), opera : /opera/.test(userAgent), 
		msie : (/msie/.test(userAgent)) && (!/opera/.test(userAgent)), 
		mozilla : (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
    };
    util.browser = browser;
    var readyBound = false;
    var isReady = false;
    var readyList = [];
    // Handle when the DOM is ready
    function domReady() {
        // Make sure that the DOM is not already loaded
        if (!isReady) {
            // Remember that the DOM is ready
            isReady = true;
            if (readyList) {
                for (var fn = 0; fn < readyList.length; fn++) {
                    readyList[fn].call(window, []);
                }
                readyList = [];
            }
        }
    };
    // From Simon Willison. A safe way to fire onload w/o screwing up everyone else.
    function addLoadEvent(func) {
        var oldonload = window.onload;
        if (typeof window.onload != 'function') {
            window.onload = func;
        }
        else {
            window.onload = function () {
                if (oldonload) {
                    oldonload();
                }
                func();
            };
        }
    };
    // does the heavy work of working through the browsers idiosyncracies (let's call them that) to hook onload.
    function bindReady() {
        if (readyBound) {
            return;
        }
        readyBound = true;
        // Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
        if (document.addEventListener && !browser.opera) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", domReady, false);
        }
        // If IE is used and is not in a frame
        // Continually check to see if the document is ready
        if (browser.msie && window == top)(function () {
            if (isReady)return;
            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            }
            catch (error) {
                setTimeout(arguments.callee, 0);
                return;
            }
            // and execute any waiting functions
            domReady();
        }
        )();
        if (browser.opera) {
            document.addEventListener("DOMContentLoaded", function () {
                if (isReady)return;
                for (var i = 0; i < document.styleSheets.length; i++)if (document.styleSheets[i].disabled) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                domReady();
            }
            , false);
        }
        if (browser.safari) {
            var numStyles;
            (function () {
                if (isReady)return;
                if (document.readyState != "loaded" && document.readyState != "complete") {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                if (numStyles === undefined) {
                    var links = document.getElementsByTagName("link");
                    for (var i = 0; i < links.length; i++) {
                        if (links[i].getAttribute('rel') == 'stylesheet') {
                            numStyles++;
                        }
                    }
                    var styles = document.getElementsByTagName("style");
                    numStyles += styles.length;
                }
                if (document.styleSheets.length != numStyles) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                domReady();
            }
            )();
        }
        // A fallback to window.onload, that will always work
        addLoadEvent(domReady);
    };
    // This is the public function that people can use to hook up ready.
    util.ready = function (fn, args) {
        // Attach the listeners
        bindReady();
        // If the DOM is already ready
        if (isReady) {
            // Execute the function immediately
            fn.call(window, []);
        }
        else {
            // Add the function to the wait list
            readyList.push(function () {
                return fn.call(window, []);
            }
            );
        }
    };
    bindReady();
}
(LoginRadiusUserRegistration.util));
LoginRadiusUserRegistration = (function () {
    var module = {
    };
    var util = LoginRadiusUserRegistration.util;
    module.options = {
		apiKey : "",
		siteName : ""
    };
    var variables = {
        Domain : "https://cdn.loginradius.com/hub/prod/Theme/mobile-staging/index.html"
    };
    getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex =  new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results == null  ? "" : decodeURIComponent(results[1].replace(/\+/g, " ").replace("/", ""));
    };
    
    module.lrRegister = function () {
			var options = module.options;        
			options.apiKey = options.apiKey.trim();
            url = variables.Domain + "?apikey="+ options.apiKey + "&sitename=" + options.siteName + "&action=registration";
            util.openWindow(url, options.callback);
        
    };
	module.lrSocial = function () {
			
			var options = module.options;        
			options.apiKey = options.apiKey.trim();
            url = variables.Domain + "?apikey="+ options.apiKey + "&sitename=" + options.siteName + "&action=social";
            util.openWindow(url, options.callback);
    };
	module.lrForgotPassword = function () {
			
			var options = module.options;        
			options.apiKey = options.apiKey.trim();
            url = variables.Domain + "?apikey="+ options.apiKey + "&sitename=" + options.siteName + "&action=forgotpassword";
            util.openWindow(url, options.callback);
    };
	module.lrLogin = function () {
			
			var options = module.options;        
			options.apiKey = options.apiKey.trim();
            url = variables.Domain + "?apikey="+ options.apiKey + "&sitename=" + options.siteName + "&action=login";
            util.openWindow(url, options.callback);
    };
    module.init = function (options) {
        var fn = function(){return;};
		module.options.apiKey = options.apiKey!=undefined?options.apiKey:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
        module.options.siteName = options.siteName;
		module.options.callback = options.callback || fn;
    };
  
    return module;
}
)(LoginRadiusUserRegistration);
