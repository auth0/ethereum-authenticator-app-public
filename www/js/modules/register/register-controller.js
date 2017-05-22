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
(function(angular) {
	'use strict';

	angular
		.module('App.Register')
		.controller('RegisterCtrl', RegisterCtrl);

	function RegisterCtrl($localStorage, RegisterFactory, $state, $scope, NotificationsService, $cordovaToast, $ionicModal,DeviceService) {
		var self = this;

		self.name = "register";
		var ethCrypto = new EthCrypto();
		self.sucessPatternLock = true;
		var completePattern;
		var successPopupItem;
		
		$scope.infoModal = DeviceService;
		
		var lock = new PatternLock("#patternContainerRegister", {
			onDraw: function(pattern) {
				$scope.$apply(function() {
					self.sucessPatternLock = false;
				});
				completePattern = pattern;
				lock.disable();
			},
			radius: 20,
			margin: 27
		});

		self.resertPattern = function() {
			self.sucessPatternLock = true;
			lock.reset();
			lock.enable();
		}

		self.successModal = function() {
			$scope.infoModal.modalText = "Your account was created";
			$scope.infoModal.modalTextSubInfo = "";
			$scope.infoModal.showModal();
		};

		//loader modal
		$ionicModal.fromTemplateUrl('templates/loader/loader.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalLoader = modal;
		});

		self.registerAccount = function(email) {

			if (self.createAccountForm.$invalid || self.sucessPatternLock) {
				$cordovaToast.showShortCenter('Please fill it all the fields')
			} else {
				lock.reset();
				//cordova.plugins.Keyboard.close();
				$scope.loaderText = "Creating your account";
				$scope.modalLoader.show();
				var options = {
					dimBackground: false
				};
				SpinnerPlugin.activityStart("", options, function(res, error) {
					if (res) {
						ethCrypto.createAccount(completePattern).then(function(data) {
							completePattern = undefined;
							self.sucessPatternLock = true;
							lock.enable();
							var parsedData = JSON.parse(data);
							var FCMtoken = NotificationsService.getToken();
							RegisterFactory.setKey(data);
							//request to the server with address and email
							var item = {
								email: email,
								secondaryAddress: '0x' + parsedData.address,
								registrationToken: FCMtoken
							}
							delete data.$promise;
							delete data.$resolved;
							RegisterFactory.postRegistration(item).then(function(data) {
								SpinnerPlugin.activityStop();
								$scope.modalLoader.hide();
								self.successModal();
								delete data.$promise;
								delete data.$resolved;
							}, function(error) {
								SpinnerPlugin.activityStop();
								$scope.modalLoader.hide();
								console.log('[postRegistration] Error', JSON.stringify(error));
								$cordovaToast.showShortCenter('Registration error')
							});
						}).catch(function handleError(error) {
							console.log('[createAccount] Error' + error.stack);
							SpinnerPlugin.activityStop();
							$scope.modalLoader.hide();
							$cordovaToast.showShortCenter('Create account error')
						});
					}
				});
			}
		}

	}
})(window.angular);
