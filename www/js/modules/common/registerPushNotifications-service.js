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
(function () {
	'use strict';

	angular
		.module('App.registerPush')
		.factory('NotificationsService', function (DeviceService, NotificationsFactory) {
			var FCMtoken;

			function getPushNotificationToken() {
				if (!DeviceService.isBrowser()) {
					FCMPlugin.getToken(
						function (token) {
							console.log(token);
							FCMtoken = token;
							if(token == null){
								getPushNotificationToken();
							}
							navigator.splashscreen.hide();
						},
						function (err) {
							console.log('error retrieving token: ' + err);
						}
					)
					FCMPlugin.onNotification(
						function (data) {
							if (data.wasTapped) {
				//Notification was received on device tray and tapped by the user.
								//alert(JSON.stringify(data));
								NotificationsFactory.notification(data);
							} else {
				//Notification was received in foreground. Maybe the user needs to be notified.
								//alert(JSON.stringify(data));
								NotificationsFactory.notification(data);
							}
						},
						function (msg) {
							console.log('onNotification callback successfully registered: ' + msg);
						},
						function (err) {
							console.log('Error registering onNotification callback: ' + err);
						}
					);
				}
			}



			function getToken() {
				return FCMtoken;
			}

			return {
				getPushNotificationToken: getPushNotificationToken,
				getToken: getToken
			};
		});


})();