/** 
* The MIT License (MIT) 
*  
* Copyright (c) 2016 Auth0, Inc. <support@auth0.com> (http://auth0.com) 
*  
* Permission is hereby granted, free of charge, to any person obtaining a copy 
* of this software and associated documentation files (the "Software"), to deal 
* in the Software without restriction, including without limitation the rights 
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
* copies of the Software, and to permit persons to whom the Software is 
* furnished to do so, subject to the following conditions: 
*  
* The above copyright notice and this permission notice shall be included in all 
* copies or substantial portions of the Software. 
*  
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
* SOFTWARE. 
*/
angular.module('App.LoginFactory', []);
angular.module('App.Login', []);
angular.module('App.NotificationsFactory', []);
angular.module('App.registerPush', []);
angular.module('App.Register', []);
angular.module('App.Admin', []);
angular.module('App.RegisterFactory', []);
angular.module('App.Signature', []);
angular.module('App.SignatureFactory', []);
angular.module('App.DeviceService', []);
angular.module('App.Info', []);
angular.module('App', [
		'ionic',
		'App.LoginFactory',
        'App.Login',
        'App.NotificationsFactory',
        'App.registerPush',
        'App.Register',
        'App.Admin',
		'ngStorage',
		'App.RegisterFactory',
		'App.Signature',
		'App.SignatureFactory',
		'App.DeviceService',
		'App.Info',
		'ngCordova',
		'angularMoment', 'firebase'
])

.run(function ($ionicPlatform, NotificationsService, InitConstants, $state, $firebaseObject) {
	$ionicPlatform.ready(function () {
		
		NotificationsService.getPushNotificationToken();

		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.backgroundColorByHexString("#394573");
		}
	});
	
	$ionicPlatform.registerBackButtonAction(function (event) {
		if ($state.current.name == "admin") {
			navigator.app.exitApp();
		} else if ($state.current.name == "signature") {
			$state.transitionTo("admin")
		}else if ($state.current.name == "register") {
			navigator.app.exitApp();
		} else {
			navigator.app.backHistory();
		}
	}, 100);
	
	var ref = firebase.database().ref();
	var obj = $firebaseObject(ref);
	obj.$loaded().then(function () {
		InitConstants.REST_AUTH_SERVER_BASE_URL = obj.AUTHENTICATION_SERVER_URL;
	});
})

.config(function () {
	var config = {
		databaseURL: "https://block-chain-auth-zero.firebaseio.com/"
	};
	firebase.initializeApp(config);

});