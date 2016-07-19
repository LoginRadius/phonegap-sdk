# LoginRadius PhoneGap SDK
![Home Image](https://d2lvlj7xfpldmj.cloudfront.net/support/github/banner-1544x500.png)

## Introduction ##
LoginRadius is an Identity Management Platform that simplifies user registration while securing data. LoginRadius Platform simplifies and secures your user registration process, increases conversion with Social Login that combines 30 major social platforms, and offers a full solution with Traditional Customer Registration. You can gather a wealth of user profile data from Social Login or Traditional Customer Registration.

LoginRadius centralizes it all in one place, making it easy to manage and access. Easily integrate LoginRadius with all of your third-party applications, like MailChimp, Google Analytics, Livefyre and many more, making it easy to utilize the data you are capturing.

LoginRadius helps businesses boost user engagement on their web/mobile platform, manage online identities, utilize social media for marketing, capture accurate consumer data, and get unique social insight into their customer base.

Please visit [here](http://www.loginradius.com/) for more information.

######Before using demo project,you must install PhoneGap environment in your system Please visit [here](http://docs.phonegap.com/getting-started/1-install-phonegap/desktop/) for complete PhoneGap installation.

#### There are two projects in the library:
a. User-Registration-Demo - This is the demo application.    
b. PhoneGapSDK -This is the LoginRadius SDK

##### User-Registration-Demo
1.Put the value according to your requirement in index.html

####Index.html

```ruby
   options.apikey = '<LoginRadius API Key>';
   options.siteName = '<LoginRadius Site Name>';
   options.promptPasswordOnSocialLogin='true';
   options.V2RecaptchaSiteKey="";
```

2.Finally, setup elements to trigger the functions that will direct your users to the relevant hosted interface.
```ruby
    <div class="lr-sociallogincontent">
        <a onclick="$LR.util.lrRegister();"> Register</a>
    </div>
    <!--Open the Login(social and email/password) interface on click of this element -->
    <div class="lr-sociallogincontent">
        <a onclick="$LR.util.lrLogin();">Login</a></br>
    </div>
    <!--Open the Social Login interface on click of this element -->
    <div class="lr-sociallogincontent">
        <a onclick="$LR.util.lrSocial();">Social Login</a></br>
    </div>
    <div class="lr-sociallogincontent">
    <!--Open the Forgot password interface on click of this element -->
        <a onclick="$LR.util.lrForgotPassword();">Forgot Password</a></br>
	</div>
    
    ```