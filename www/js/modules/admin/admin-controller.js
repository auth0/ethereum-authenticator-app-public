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
(function (angular) {
	'use strict';

	angular
		.module('App.Admin')
		.controller('AdminCtrl', AdminCtrl);

	function AdminCtrl($scope, $localStorage, $ionicPopup, $cordovaToast, $state, $ionicPopover, $cordovaClipboard, SignatureFactory, $ionicModal, DeviceService) {
		var self = this;

		function activate() {
			$scope.infoModal = DeviceService;

			self.notificationItem = SignatureFactory.getSignature();
			console.log(self.notificationItem)
			if (typeof self.notificationItem !== typeof undefined) {
				self.notificationItem.requestInfo = JSON.parse(self.notificationItem.requestInfo);
				if (self.notificationItem.requestInfo.type == 5) {
					$scope.infoModal.modalText = "Ethereum account registration was succesful";
					$scope.infoModal.modalTextSubInfo = "You can now use your email to link your Ethereum account with Auth0";
					$scope.infoModal.showModal();
				}
			}

			self.logins = $localStorage.logins;
			self.localKey = JSON.parse($localStorage.myKey);
		}


		self.inputPopup = function () {
			$ionicPopup.show({
				cssClass: 'inputPopup',
				title: "Secondary address",
				content: '<div class="popupDiv"><label class="inputPopupLabel">' + self.localKey.address + '</div></label>',
				buttons: [{
						text: 'CANCEL',
						type: 'col col-25 col-offset-50 no-radius button button-clear button-positive'
					}, {
						text: 'COPY',
						type: 'col col-25 no-radius button button-clear button-positive',
						onTap: function (e) {
							$cordovaClipboard.copy(self.localKey);
						}
					}

				]
			});
		}

		// popover
		var template = '<ion-popover-view> <ion-content class="popoverContent"> <div class="list"> <a class="item" target="_blank" ng-click="removeKeys()"> Remove local storage key </a> <a class="item" target="_blank" ng-click="removeLogins()"> Clear Logs </a> <a class="item" target="_blank" ng-click="aboutSection()"> About </a> </div></ion-content> </ion-popover-view>';

		self.popover = $ionicPopover.fromTemplate(template, {
			scope: $scope
		});

		self.openPopover = function ($event) {
			self.popover.show($event);
		};

		// remove local key
		$scope.removeKeys = function () {
			var removeKeysPopup = $ionicPopup.confirm({
				cssClass: 'inputPopup',
				title: 'Remove Key',
				template: '<div class="popupDiv"><label>Are you sure you want remove the key?</label></div>',
				okType: 'col col-25 no-radius button button-clear button-positive',
				cancelType: 'col col-25 col-offset-50 no-radius button button-clear button-positive',
				cancelText: 'CANCEL'
			});
			self.popover.hide();
			removeKeysPopup.then(function (res) {
				if (res) {
					$localStorage.myKey = null;
					$cordovaToast.showShortCenter('Your key are removed')
					$state.transitionTo('register');
				}
			});

		}

		// remove log history
		$scope.removeLogins = function () {
			var removeLoginsPopup = $ionicPopup.confirm({
				cssClass: 'inputPopup',
				title: 'Remove Logs',
				template: '<div class="popupDiv"><label>Are you sure you want remove the logs?</label></div>',
				okType: 'col col-25 no-radius button button-clear button-positive',
				cancelType: 'col col-25 col-offset-50 no-radius button button-clear button-positive',
				cancelText: 'CANCEL'
			});
			self.popover.hide();
			removeLoginsPopup.then(function (res) {
				if (res) {
					$localStorage.logins = null;
					$cordovaToast.showShortCenter('Your logs are removed')
					self.logins = null;
				}
			});

		}

		// about section
		$scope.aboutSection = function () {
			var aboutSectionPopup = $ionicPopup.show({
				cssClass: 'inputPopup',
				title: 'Powered by',
				templateUrl: 'templates/about/about.html',
				buttons: [{
						text: 'CLOSE',
						type: 'col col-25 col-offset-75 no-radius button button-clear button-positive',
						onTap: function (e) {

						}
					}

				]
			});
			self.popover.hide();
		}

		$scope.$on('$ionicView.enter', function (ev, d) {
			activate();
		});
	}
})(window.angular);