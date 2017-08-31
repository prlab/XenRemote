angular.module('xenMonitor', ['ionic', 'xenMonitor.controllers', 'xenMonitor.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.visibility = null;
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.text('')
  
  $stateProvider
	
	.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/sidebar.html',
		controller: 'AppCtrl'
	})
	
	.state('pin', {
		url: '/pin',
		templateUrl: 'templates/pin.html',
		controller: 'PinCtrl'
	})
  
  	.state('signup', {
		url: '/signup',
		templateUrl: 'templates/signup.html',
		controller: 'SignupCtrl'
	})
  
	.state('app.hosts', {
		url: '/hosts',
		views: {
			'mainContent': {
				templateUrl: 'templates/hosts.html',
				controller: 'HostsCtrl'
			}
		}
	})

	.state('app.host-details', {
		url: '/hosts/:hostId',
		views: {
			'mainContent': {
				templateUrl: 'templates/host-details.html',
				controller: 'HostDetailsCtrl'
			}
		}
	})
	
	.state('app.storage-details', {
		url: '/hosts/:hostId/storage/:SRKey/storage-details',
		views: {
			'mainContent': {
				templateUrl: 'templates/storage-details.html',
				controller: 'SRDetailsCtrl'
			}
		}
	})
	
	.state('app.host-vms', {
		url: '/hosts/:hostId/host-vms',
		views: {
			'mainContent': {
				templateUrl: 'templates/host-vms.html',
				controller: 'HostVMsCtrl'
			}
		}
	})
	
	.state('app.vm-details', {
		url: '/hosts/:hostId/host-vms/:VMKey/vm-details',
		views: {
			'mainContent': {
				templateUrl: 'templates/vm-details.html',
				controller: 'VMDetailsCtrl'
			}
		}
	})

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/pin');

})

.controller('XenMonitorCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicHistory, $location) { 
  $scope.goBack = function() {
      $ionicHistory.goBack();
  };
  
});
