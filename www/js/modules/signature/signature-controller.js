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
		.module('App.Signature')
		.controller('SignatureCtrl', SignatureCtrl);

	function SignatureCtrl($scope, SignatureFactory, $localStorage, $timeout, $ionicPopup, $state, $cordovaToast, RegisterFactory, $ionicModal,$cordovaClipboard,DeviceService) {
		var self = this;
		self.name = "Authenthicate signature";

		var ethCrypto = new EthCrypto();
		self.notificationItem;
		self.notificationItemToSignString;
		var successPopupItem;
		var lock2;
		var completePattern;
		$scope.infoModal = DeviceService;

		self.patternPopup = function() {
			$timeout(function() {
				lock2 = new PatternLock("#patternContainerSignature", {
					onDraw: function(pattern) {
						completePattern = pattern;
						lock2.disable();
					},
					radius: 20,
					margin: 20
				});
			}, 0);
			var confirmPopup = $ionicPopup.show({
				cssClass: 'signPopup',
				template: '<div class="center" id="patternContainerSignature"></div>',
				buttons: [{
						text: 'Deny',
						type: 'col col-50 no-radius button button-stable signatureButton deny'
					}, {
						text: 'Sign',
						type: 'col col-50 no-radius button button-stable signatureButton sign',
						onTap: function(e) {
							if (completePattern == undefined) {
								$cordovaToast.showShortCenter('Please enter your pattern password')
								e.preventDefault();
							} else {
								self.cryptoSignature();
							}
						}
					}, {
						type: 'ion-refresh refresh refreshPopup',
						onTap: function(e) {
							if (completePattern == undefined) {
								$cordovaToast.showShortCenter('Please enter your pattern password before refresh it')
							} else {
								self.resertPattern();
							}
							e.preventDefault();
						}
					}

				]
			});
		}

		self.inputPopup = function(title, content) {
			$ionicPopup.show({
				cssClass: 'inputPopup',
				title: title,
				content: '<div class="popupDiv item-button-right"><label class="inputPopupLabel">'+content+'</div></label>',
				buttons: [{
						text: 'CANCEL',
						type: 'col col-25 col-offset-50 no-radius button button-clear button-positive'
					}, {
						text: 'COPY',
						type: 'col col-25 no-radius button button-clear button-positive',
						onTap: function(e) {
							$cordovaClipboard.copy(content);
						}
					}

				]
			});
		}

		self.resertPattern = function() {
			lock2.reset();
			lock2.enable();
			completePattern = undefined;
		}


		//loader modal
		$ionicModal.fromTemplateUrl('templates/loader/loader.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalLoader = modal;
		});

		self.successModal = function() {
			switch (self.notificationItem.requestInfo.type) {
				case 1:
					$localStorage.myKey = RegisterFactory.getKey();
					$scope.infoModal.modalText = "Your mobile challenge was signed";
					$scope.infoModal.modalTextSubInfo = "";
					$scope.infoModal.showModal();
					break;
				case 2:
					$scope.infoModal.modalText = "Your web challenge was signed";
					$scope.infoModal.modalTextSubInfo = "";
					$scope.infoModal.showModal();
					break;
				case 3:
					//store succeful login
					var date = new Date();
					var obj = $localStorage.logins;
					if (typeof obj === "undefined") {
						obj = [];
					}
					var item = {
						"id": obj.length + 1,
						"date": date
					}
					obj.push(item);
					$localStorage.logins = obj;

					$scope.infoModal.modalText = "You are loged in, Confirm login onto " + self.notificationItem.requestInfo.website;
					$scope.infoModal.modalTextSubInfo = "";
					$scope.infoModal.showModal();

					break;
				case 4:
					$scope.infoModal.modalText = "Your login trustless was signed";
					$scope.infoModal.modalTextSubInfo = "";
					$scope.infoModal.showModal();
					break;
				default:
					console.log('fail')
					break;

			}
		};

		function activate() {
			self.notificationItem = SignatureFactory.getSignature();
			self.notificationItemToSignString = self.notificationItem.requestInfo;
			self.notificationItem.requestInfo = JSON.parse(self.notificationItem.requestInfo);
			self.notificationItem.requestInfo.timestamp = moment(self.notificationItem.requestInfo.timestamp).format('MM/DD/YYYY, h:mm:ss');
			
			if(self.notificationItem.requestInfo.type == 1){
				self.storedKey = JSON.parse(RegisterFactory.getKey());
			}else{
				self.storedKey = JSON.parse($localStorage.myKey);
			}		
			
			completePattern = undefined;
		}


		self.cryptoSignature = function() {
			$scope.loaderText = "Signing your challenge. Please wait...";
			$scope.modalLoader.show();
			var options = {
				dimBackground: false
			};
			SpinnerPlugin.activityStart("", options, function(res, error) {
				if (res) {
					ethCrypto.signMessage(self.notificationItemToSignString, JSON.stringify(self.storedKey), completePattern).then(function(signature) {
						
						
						if(self.notificationItem.requestInfo.type == 4){
							
							ethCrypto.signMessage(self.notificationItem.requestInfo.challenge, JSON.stringify(self.storedKey), completePattern).then(function(challengeSignature) {
								
								var signatureItemTrust = {
									"signature": signature,
									"requestId": self.notificationItem.requestInfo.requestId,
									"challengeSignature" : challengeSignature
								};
								delete signature.$promise;
								delete signature.$resolved;
								SignatureFactory.postSignature(signatureItemTrust).then(function(data) {
									console.log('finished process!')
									completePattern = undefined;
									SpinnerPlugin.activityStop();
									$scope.modalLoader.hide();
									SignatureFactory.setSignature(undefined);
									$state.go('admin');
									self.successModal();
									delete data.$promise;
									delete data.$resolved;
								}, function(error) {
									SpinnerPlugin.activityStop();
									$scope.modalLoader.hide();
									console.log('[postSignature] Error', JSON.stringify(error));
									$cordovaToast.showShortCenter('Register signature error or timeout');
									SignatureFactory.setSignature(undefined);
									$state.go('admin');
								});							
							
							}).catch(function handleError(error) {
								//your error handling goes here
								console.log('[signMessage] Error' + JSON.stringify(error));
								$cordovaToast.showShortCenter('Signature error');
								SpinnerPlugin.activityStop();
								$scope.modalLoader.hide();
							});
						}
						else{
							var signatureItem = {
								"signature": signature,
								"requestId": self.notificationItem.requestInfo.requestId
							};
							delete signature.$promise;
							delete signature.$resolved;
							SignatureFactory.postSignature(signatureItem).then(function(data) {
								console.log('finished process!')
								completePattern = undefined;
								SpinnerPlugin.activityStop();
								$scope.modalLoader.hide();
								self.successModal();
								SignatureFactory.setSignature(undefined);
								$state.go('admin');
								delete data.$promise;
								delete data.$resolved;
							}, function(error) {
								SpinnerPlugin.activityStop();
								$scope.modalLoader.hide();
								console.log('[postSignature] Error', JSON.stringify(error));
								$cordovaToast.showShortCenter('Register signature error');
								if (self.notificationItem.requestInfo.type != 1) {
									$state.go('admin');
									SignatureFactory.setSignature(undefined);
								}
							});
						}
					}).catch(function handleError(error) {
						//your error handling goes here
						console.log('[signMessage] Error' + JSON.stringify(error));
						$cordovaToast.showShortCenter('Signature error');
						SpinnerPlugin.activityStop();
						$scope.modalLoader.hide();
					});
				}
			});
		}

		self.reject = function() {
			var rejectItem = {
				"requestId": self.notificationItem.requestInfo.requestId
			};
			$scope.loaderText = "Rejecting your challenge. Please wait...";
			$scope.modalLoader.show();
			var options = {
				dimBackground: false
			};
			SpinnerPlugin.activityStart("", options, function(res, error) {
				if (res) {
					SignatureFactory.rejectSignature(rejectItem).then(function(data) {
						console.log('Rejected!')
						SpinnerPlugin.activityStop();
						$scope.modalLoader.hide();
						$cordovaToast.showShortCenter('You are rejected');
						completePattern = undefined;
						if (self.notificationItem.requestInfo.type == 1) {
							$localStorage.myKey = null;
							$state.go('register');
						} else {
							SignatureFactory.setSignature(undefined);
							$state.go('admin');
							
						}
						delete data.$promise;
						delete data.$resolved;
					}, function(error) {
						console.log('[postRejectSignature] Error', JSON.stringify(error));
						SpinnerPlugin.activityStop();
						$scope.modalLoader.hide();
						$cordovaToast.showShortCenter('Reject');
						if (self.notificationItem.requestInfo.type != 1) {
							SignatureFactory.setSignature(undefined);
							$state.go('admin');
						}
					});
				}
			});
		}

		$scope.$on('$ionicView.enter', function(ev, d) {
			activate();
		});
	}
})(window.angular);