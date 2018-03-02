angular.module('xenMonitor.controllers', []).run(['$rootScope', '$q', '$xenApi', '$window', '$ionicPopup', '$ionicHistory', '$state', '$ionicLoading', function($rootScope, $q, $xenApi, $window, $ionicPopup, $ionicHistory, $state, $ionicLoading){
		$rootScope.user = {pin:""};
		$rootScope.getHost = function(username, password, ip){
		return $q(function(resolve, reject){
			try {
				var now = (new Date).getTime();
				
				var promise = $xenApi.initHost(username, password, ip);
				promise.then(function(session) {
					var promise2 = $xenApi.getHost(session);
					promise2.then(function(host){
						var tmp = {uuid: host.uuid, session: session};
						$rootScope.sessions.push(tmp);
						if (host.enabled == true) tmpenabled = 'Yes';
						else tmpenabled = 'No';
						
						var then1 = host.other_config.boot_time*1000;
						var delta1 = Math.abs(now - then1)/1000;
						var days1 = Math.floor(delta1 / 86400);
						delta1 -= days1 * 86400;
						var hours1 = Math.floor(delta1 / 3600) % 24;
						delta1 -= hours1 * 3600;
						var minutes1 = Math.floor(delta1 / 60) % 60;
						delta1 -= minutes1 * 60;
						
						var then2 = host.other_config.agent_start_time*1000;
						var delta2 = Math.abs(now - then2)/1000;
						var days2 = Math.floor(delta2 / 86400);
						delta2 -= days2 * 86400;
						var hours2 = Math.floor(delta2 / 3600) % 24;
						delta2 -= hours2 * 3600;
						var minutes2 = Math.floor(delta2 / 60) % 60;
						delta2 -= minutes2 * 60;
						
						var tmp = {
							username: username,
							password: password,
							key: host.key,
							state: host.enabled,
							name: host.name_label,
							description: host.name_description,
							tags: host.tags,
							folder: host.other_config.folder,
							enabled: tmpenabled,
							iscsi_iqn: host.other_config.iscsi_iqn,
							server_uptime: days1 + ' days ' + hours1 + ' hours ' + minutes1 + 'minutes',
							toolstack_uptime: days2 + ' days ' + hours2 + ' hours ' + minutes2 + 'minutes',
							uuid: host.uuid,
							hostname: host.hostname,
							ip: host.address,
							cpus: host.cpu_info.cpu_count,
							cpu_vendor: host.cpu_info.vendor,
							cpu_speed: Math.floor(host.cpu_info.speed) + ' MHz',
							cpu_model: host.cpu_info.modelname,
							software_version: host.software_version.product_brand + " " + host.software_version.product_version + " build " + host.software_version.build_number
							
						}
						resolve(tmp);
					});				
				});
			}catch(err){
				$rootScope.showError('Something went wrong!');
			}
		});
	};
	$rootScope.doLogout = function (){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('pin');
	};
	$rootScope.showError = function(err) {
		$rootScope.hideLoading();
		var alertPopup = $ionicPopup.alert({
			title: '<i class="icon ion-alert-circled my-icon"></i>',
			template: '<p class="my-title">Error</p>'+err,
			cssClass: 'error-popup',
		});
	};
	$rootScope.showAlert = function(mes) {	
		var alertPopup = $ionicPopup.alert({
			title: '<i class="icon ion-alert-circled my-icon"></i>',
			template: '<p class="my-title">Warning</p>'+mes,
			cssClass: 'confirm-popup',
		});
	};
	$rootScope.showSuccess = function(mes) {
		var alertPopup = $ionicPopup.alert({
			title: '<i class="icon ion-ios-checkmark my-icon"></i>',
			template: '<p class="my-title">Success</p>'+mes,
			cssClass: 'success-popup'
		});
	};
	$rootScope.showConfirm = function(mes) {
		var confirmPopup = $ionicPopup.confirm({
			title: '<i class="icon ion-android-warning my-icon"></i>',
			template: '<p class="my-title">'+mes+'</p>'+'Are you sure?',
			cssClass: 'confirm-popup'
		});
		return $q(function(resolve, reject){
			confirmPopup.then(function(res) {
				if(res) {
					resolve(1);
				} else {
					resolve(0);
				}
			});
		});
    };
	
	$rootScope.showLoading = function(){
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner> Loading...'
		});
	};
	$rootScope.hideLoading = function(){
		$ionicLoading.hide();
	};
	
	$rootScope.goToHosts = function(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.hosts');
	};
}])

.controller('HostsCtrl', function($scope, $rootScope, $state, $localStorage, $ionicModal, $xenApi, $window, $q) {
	
})


.controller('PinCtrl', function($scope, $rootScope, $state, $localStorage, $ionicModal, $xenApi, $window, $q) {

	$scope.loginData = {};

	$scope.doLogin = function(form){
		
		var users =  $localStorage.getObject('users','[]');
		var user = users.filter(function(tmp){
			return tmp.pin == $scope.loginData.pin;
		})[0];
		
		
		if(angular.isUndefined(user)){
			$rootScope.showError('User not found');
		}
		else{
			$rootScope.user = user;
			form.pristine = true;
			$scope.loginData.pin = "";
			$rootScope.goToHosts();
		}
	};
	
	$scope.openSignup = function(form){
		form.pristine = true;
		$scope.loginData.pin = "";
		$state.go('signup');
	};

})

.controller('SignupCtrl', function($scope, $rootScope, $state, $localStorage, $ionicModal, $xenApi, $window, $q, $ionicHistory) {
	$scope.newAccountData = {pin:"", confirm:""};

	$scope.doSignup = function(){
		var users =  $localStorage.getObject('users','[]');
		if(($scope.newAccountData.pin == $scope.newAccountData.confirm) && !angular.isUndefined($scope.newAccountData.pin)){
			var user = users.filter(function(tmp){
				return tmp.pin == $scope.newAccountData.pin;
			})[0];
			
			if(!angular.isUndefined(user)){
				$rootScope.showError('User already exists');
			}
			else{
				var u = {pin:$scope.newAccountData.pin};
				users.push(u);
				$localStorage.storeObject('users', users);
				$rootScope.showSuccess('User successfully created.');
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('pin');
			}	
		}
		else{
			$rootScope.showAlert('PINs do not match');
		}
	};
})


.controller('AppCtrl', function($scope, $rootScope, $state, $stateParams, $localStorage, $ionicModal, $xenApi, $window, $q, $ionicHistory) {
	//$localStorage.clearAll();
	$scope.$on('$stateChangeSuccess', function onStateSuccess(event, toState, toParams, fromState) {
		if (angular.isUndefined($rootScope.user.pin) || $rootScope.user.pin=="" || $rootScope.user.pin==null){
			$rootScope.doLogout();
			return;
		}
		if(!(toState.url=='/hosts' && fromState.url=='/pin')) return;
		$scope.hosts = $localStorage.getObject($rootScope.user.pin+'hosts','[]');
		$rootScope.sessions = [];
		var count = $scope.hosts.length - 1;
		try{
			if($scope.hosts.length>0) $rootScope.showLoading();
			angular.forEach($scope.hosts, function(item, index){
				var promise = $xenApi.initHost(item.username, item.password, item.ip);
				promise.then(function(session){
					var tmp = {uuid: item.uuid, session: session};
					$rootScope.sessions.push(tmp);
					if(count === index) $rootScope.hideLoading();
				});
			});
		}catch(err){
			$rootScope.hideLoading();
			$rootScope.showError('Something went wrong!');
		}
	});
	
	$scope.connectData = $localStorage.getObject($rootScope.user.pin+'userinfo','{}');
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.connectForm = modal;
	});
	$scope.closeAddHost = function() {
		$scope.connectForm.hide();
	};	
	$scope.addHost = function() {
		$scope.connectForm.show();
	};
	
	$scope.addNewHost = function(){
		try{
			$rootScope.showLoading();
			var promise = $rootScope.getHost($scope.connectData.name, $scope.connectData.password, $scope.connectData.ip);
			promise.then(function(host){
				$scope.hosts.push(host);
				$localStorage.storeObject($rootScope.user.pin+'hosts',$scope.hosts);
				$rootScope.hideLoading();
				$rootScope.showSuccess('Host has been successfully added.');
			});
			$localStorage.storeObject($rootScope.user.pin+'userinfo',$scope.connectData);
			$scope.connectForm.hide();
		}catch (err){
			$rootScope.hideLoading();
			$rootScope.showError('Something went wrong!');
		}
    }
	
	$scope.refreshHosts = function(){
		var newHosts = [];
		$rootScope.sessions = [];
		var count = $scope.hosts.length - 1;
		$rootScope.showLoading();
		angular.forEach($scope.hosts, function(item, index){
			var promise = $rootScope.getHost(item.username, item.password, item.ip);
			promise.then(function(host){
				try{
					newHosts.push(host);
					$localStorage.storeObject($rootScope.user.pin+'hosts',newHosts);
					$scope.hosts = newHosts;
					if(index === count) {
						$rootScope.hideLoading();
						$rootScope.showSuccess('Refresh successfully completed.');
					}
				}catch(err){
					$rootScope.hideLoading();
					$rootScope.showError('Something went wrong!');
					return;
				}
			});
		});
		if ($scope.hosts.length == 0){
			$rootScope.hideLoading();
			$rootScope.showAlert('No Hosts found.');
		}
	}
	
	$scope.deleteHost = function(id){
		var promise = $rootScope.showConfirm('Remove host from the list');
		try{
			promise.then(function(answer){
				if (answer == 0) return; 		
				angular.forEach($scope.hosts, function(item){
					if(id==item.uuid) {
						var index = $scope.hosts.indexOf(item);
						$scope.hosts.splice(index,1);
						$localStorage.storeObject($rootScope.user.pin+'hosts',$scope.hosts);
					}
				});
				var VMs =  $localStorage.getObject($rootScope.user.pin+'VMs','[]');
				angular.forEach(VMs, function(item){
					if(id==item.uuid) {
						var index = VMs.indexOf(item);
						VMs.splice(index,1);
						$localStorage.storeObject($rootScope.user.pin+'VMs',VMs);
					}
				});
				var VMMetrics =  $localStorage.getObject($rootScope.user.pin+'VMMetrics','[]');
				angular.forEach(VMMetrics, function(item){
					if(id==item.uuid) {
						var index = VMMetrics.indexOf(item);
						VMMetrics.splice(index,1);
						$localStorage.storeObject($rootScope.user.pin+'VMMetrics',VMMetrics);
					}
				});
				var VMGuestMetrics =  $localStorage.getObject($rootScope.user.pin+'VMGuestMetrics','[]');
				angular.forEach(VMGuestMetrics, function(item){
					if(id==item.uuid) {
						var index = VMGuestMetrics.indexOf(item);
						VMGuestMetrics.splice(index,1);
						$localStorage.storeObject($rootScope.user.pin+'VMGuestMetrics',VMGuestMetrics);
					}
				});
				angular.forEach($rootScope.sessions, function(item){
					if(id==item.uuid) {
						var index = $rootScope.sessions.indexOf(item);
						$rootScope.sessions.splice(index,1);
					}
				});
				$rootScope.goToHosts();
				$rootScope.showSuccess('Host successfully deleted.');
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
		}
    }
	
    $scope.viewHostDetails = function(uuid){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$window.location.href = "#/app/hosts/"+uuid;
    }
	
	$scope.viewVMs = function(uuid){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$window.location.href = "#/app/hosts/"+uuid+"/host-vms";
	}
})

.controller('HostDetailsCtrl', function($scope, $state, $stateParams, $localStorage, $xenApi, $rootScope, $window) {
	try{
		$scope.memory = {};
		$scope.memory.total = '-';
		$scope.occupied = '-';
		var Hosts = $localStorage.getObject($rootScope.user.pin+'hosts','[]');
		$scope.host = Hosts.filter(function(tmp){
			return tmp.uuid == $stateParams.hostId;
		})[0];
		
		var session = $rootScope.sessions.filter(function(tmp){
			return tmp.uuid == $stateParams.hostId;
		})[0];
		getPBDs();
		getPGPU();
		getVGPU();
		getHostMetrics();
	}catch(err){
		$rootScope.showError(err);
		$rootScope.goToHosts();		
	}

	 function getHostMetrics(){
		try{
			var promise2 = $xenApi.getHostMetrics(session.session);
			promise2.then(function(hostMetrics){
				$scope.memory.total = Math.round(hostMetrics.memory_total/(1024*1024));
				$scope.memory.free = Math.round(hostMetrics.memory_free/(1024*1024));
				$scope.occupied = $scope.memory.total - $scope.memory.free;
				$scope.percent = (($scope.memory.total - $scope.memory.free)/$scope.memory.total)*100;
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
		}
	}
	
	function getPGPU(){
		try{
			var promise2 = $xenApi.getPGPU(session.session);
			promise2.then(function(PGPU){
				$scope.pgpu = PGPU.name_label;
				//console.log(PGPU);
			});
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
	}
	
	function getVGPU(){
		try{
			var promise2 = $xenApi.getVGPU(session.session);
			promise2.then(function(VGPU){
				$scope.vgpu = VGPU.model_name;
				//console.log(VGPU);
			});
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
	}
	
	$scope.refreshHostMetrics = function(){
		getHostMetrics();
		try{
			$rootScope.showLoading();
			var promise = $rootScope.getHost($scope.host.username, $scope.host.password, $scope.host.ip);
			promise.then(function(host){
				$scope.host = host;
				$rootScope.hideLoading();
				$rootScope.showSuccess('Refresh successfully completed.');
			});
		}catch(err){
			$rootScope.hideLoading();
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
		}
	}
	
	function doHostDisable(id){
		/*var promise = $xenApi.hostDisable(session.session, id);
		promise.then(function(result){
			//$rootScope.showSuccess('VM successfully started');
		});*/
	}
	function doHostEnable(id){
		/*var promise = $xenApi.hostEnable(session.session, id);
		promise.then(function(result){
			$rootScope.showSuccess('Host successfully enabled');
		});*/
	}
	function doHostShutdown(id){
		/*var promise = $xenApi.hostShutdown(session.session, id);
		promise.then(function(result){
			$rootScope.showSuccess('Host successfully shut down');
		});*/
	}
	function doHostReboot(id){
		/*var promise = $xenApi.hostReboot(session.session, id);
		promise.then(function(result){
			$rootScope.showSuccess('Host successfully reboot');
		});*/
	}
	function shutDownAllVMs(){
		var tmp = [];
		try{
			var promise = $xenApi.getHostVMs(session.session);
			promise.then(function(hostVMs){
				angular.forEach(hostVMs, function(item){
					if(item.data.is_a_snapshot==0 && item.data.is_a_template==0 && item.data.is_control_domain==0 && item.data.is_snapshot_from_vmpp==0){
						tmp.push(item);
					}
				});
				angular.forEach(tmp, function(item){
					if (item.data.power_state==='Running'){
						var promise = $xenApi.shutDown(session.session, item.key);
						promise.then(function(result){
						});
					}
					if (item.data.power_state==='Suspended'){
						var promise = $xenApi.resume(session.session, item.key);
						promise.then(function(result){
							var promise2 = $xenApi.shutDown(session.session, item.key);
							promise2.then(function(result){
							});
						});
					}
				});
			});
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
	}
	
	$scope.doShutDown = function(id){
		shutDownAllVMs();
		doHostDisable(id);
		doHostShutdown(id);
	}
	$scope.doReboot = function(id){
		shutDownAllVMs();
		doHostDisable(id);
		doHostReboot(id);
	}
	$scope.doEnable = function(id){
		doHostEnable(id);
	}
	function getSRs(){
		var promise = $xenApi.getSRs(session.session);
		promise.then(function(result){
			$scope.SRs = [];
			angular.forEach(result, function(tmp){
				angular.forEach($scope.PBDs, function(item){
					if((tmp.key == item.data.SR) && tmp.data.physical_utilisation >= 0){
						$scope.SRs.push(tmp);
					}
				});
			});
			//console.log($scope.SRs);
		});
	}
	function getPBDs(){
		var promise = $xenApi.getPBDs(session.session);
		promise.then(function(result){
			$scope.PBDs = result.filter(function(tmp){
				return (tmp.data.host == $scope.host.key && tmp.data.currently_attached);
			});
			//console.log($scope.PBDs);
			getSRs();
		});
	}
	
	$scope.viewSRDetails = function(hostId, SRKey){
        $window.location.href = "#/app/hosts/"+hostId+"/storage/"+SRKey+"/storage-details";
    }

	$scope.tab = 1;
	$scope.filtText = "info";
	
	$scope.select = function(setTab) {
        $scope.tab = setTab;
		
		if (setTab === 2) {
			$scope.filtText = "stats";
        }
		else if (setTab === 3) {
			$scope.filtText = "storage";
		}
        else if (setTab === 4) {
            $scope.filtText = "flash";
        }
        else {
            $scope.filtText = "info";
        }
    };
	
    $scope.isSelected = function (checkTab) {		
        return ($scope.tab === checkTab);
    };
	
})

.controller('SRDetailsCtrl', function($scope, $state, $stateParams, $localStorage, $ionicModal, $xenApi, $rootScope, $window) {
	var session;
	$scope.$on('$stateChangeSuccess', function onStateSuccess(event, toState, toParams, fromState) {
		try{
			if(!(toState.url.endsWith("/storage-details"))) return;
			session = $rootScope.sessions.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];
			getSRs();
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
			return;
		}
	});
	
	function getSRs(){
		var shared, usage, size, virtual, used;
		var promise = $xenApi.getSRs(session.session);
		promise.then(function(result){
			var hostSRs = result;
			var tmpSR = hostSRs.filter(function(tmp){
				return tmp.key == $stateParams.SRKey;
			})[0];
			if(tmpSR.data.shared == true) shared = "Yes";
			else shared = "No";
			
			if (tmpSR.data.physical_utilisation == 0) { 
				usage = 0;
			}
			else if (tmpSR.data.physical_size == 0) {
				usage = 0;
				used = 0;
			}
			else {
				usage = ((tmpSR.data.physical_utilisation/tmpSR.data.physical_size)*100).toFixed(1);
				var tmp_used = (tmpSR.data.physical_utilisation/(1024*1024)).toFixed(1);
			}
			if (tmp_used == 0 || tmp_used == 'NaN') {used = tmp_used;}
			else if ((tmp_used/1024)>0) used = "(" + (tmp_used/1024).toFixed(1) + " GB used)";
			else used = "(" + tmp_used + " MB used)";
			
			
			var tmp_size = (tmpSR.data.physical_size/(1024*1024)).toFixed(1);
			if (tmp_size == 0) size = tmp_size + " B";
			if ((tmp_size/1024)>0) size = (tmp_size/1024).toFixed(1) + " GB";
			else size = tmp_size + " MB";
			
			var tmp_virtual = (tmpSR.data.virtual_allocation/(1024*1024)).toFixed(1);
			if (tmp_virtual == 0) virtual = tmp_virtual + " B";
			if ((tmp_virtual/1024)>0) virtual = (tmp_virtual/1024).toFixed(1) + " GB";
			else virtual = tmp_virtual + " MB";
			
			$scope.SR = {key: tmpSR.key,
						name: tmpSR.data.name_label,
						description: tmpSR.data.name_description,
						type: tmpSR.data.type,
						shared: shared,	usage: usage + "%" + used, 
						size: size, virtual: virtual, used: used};
			//console.log($scope.SR);
		});
	}
})

.controller('HostVMsCtrl', function($scope, $state, $stateParams, $localStorage, $ionicModal, $xenApi, $rootScope, $window) {
	var session, Hosts, tmpVMs;
	$scope.$on('$stateChangeSuccess', function onStateSuccess(event, toState, toParams, fromState) {
		try{
			if(!(toState.url.endsWith("/host-vms"))) return;
			
			$scope.VMs =  $localStorage.getObject($rootScope.user.pin+'VMs','[]');
			Hosts = $localStorage.getObject($rootScope.user.pin+'hosts','[]');
			$scope.host = Hosts.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];
			session = $rootScope.sessions.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];

			
			tmpVMs = $scope.VMs.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			});
			if (tmpVMs.length == 0){
				getVMs(0);
			}
			else{
				$scope.hostVMs = tmpVMs[0];
				getTemplates();
			}
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
		
		$ionicModal.fromTemplateUrl('templates/newVM.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.addForm = modal;
		});
		$scope.closeAddVM = function() {
			$scope.addForm.hide();
		};	
		$scope.addVM = function() {
			$scope.addForm.show();
		};
	});
	
	
	function getTemplates() {
		$scope.myTemplates = [];
		angular.forEach($scope.hostVMs.VMs, function(item){
			if(item.data.is_a_snapshot==0 && item.data.is_a_template==1 && item.data.is_control_domain==0 && item.data.is_snapshot_from_vmpp==0 && item.data.is_default_template==0 && item.data.is_vmss_snapshot==0){
				$scope.myTemplates.push(item);
			}
		});
		$scope.selectedTemplate = {};
		//console.log($scope.myTemplates);
	}
	
	function getVMs(showSuccess) {
		try{
			var promise = $xenApi.getHostVMs(session.session);
			promise.then(function(hostVMs){
				var tmp = {uuid: $scope.host.uuid, VMs: hostVMs};
				$scope.hostVMs = tmp;
				$scope.VMs.push(tmp);
				//console.log($scope.VMs);
				$localStorage.storeObject($rootScope.user.pin+'VMs',$scope.VMs);
				getTemplates();
				if(showSuccess) $rootScope.showSuccess('Refresh successfully completed.');
			});
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
	}
	
	$scope.refreshVMs = function(hideSuccess){
		try{
			angular.forEach($scope.VMs, function(item){
				if($scope.host.uuid==item.uuid) {
					var index = $scope.VMs.indexOf(item);
					$scope.VMs.splice(index,1);
					$localStorage.storeObject($rootScope.user.pin+'VMs',$scope.VMs);
				}
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
			return;
		}
		if(hideSuccess) getVMs(0);
		else getVMs(1);
	}
	
	function doCreateNewVM(id, name){
		var promise = $xenApi.createNewVM(session.session, id, name);
		promise.then(function(result){
			doProvision(result);
		});
	}
	
	function doProvision(id){
		var promise = $xenApi.provision(session.session, id);
		promise.then(function(result){
			$rootScope.showSuccess('New VM successfully created');
			$scope.refreshVMs(1);
		});
	}
	
	$scope.createNewVM = function(){
		newVM = doCreateNewVM($scope.selectedTemplate.data.key, $scope.selectedTemplate.name);
		$scope.closeAddVM();
		//doProvision(newVM);
	}
	
	$scope.something = function(){
		var promise = $xenApi.something(session.session);
		promise.then(function(result){
			console.log(result);
		});
	}

	$scope.viewVMDetails = function(hostId, VMKey){
        $window.location.href = "#/app/hosts/"+hostId+"/host-vms/"+VMKey+"/vm-details";
    }
})

.controller('VMDetailsCtrl', function($scope, $state, $stateParams, $localStorage, $rootScope, $xenApi) {
	var Hosts, VMs, VMMetrics, VMGuestMetrics, host, hostVMs, session, hostVMMetrics, hostVMGuestMetrics;
	$scope.$on('$stateChangeSuccess', function onStateSuccess(event, toState, toParams, fromState) {
		try{
			Hosts =  $localStorage.getObject($rootScope.user.pin+'hosts','[]');
			VMs =  $localStorage.getObject($rootScope.user.pin+'VMs','[]');
			VMMetrics =  $localStorage.getObject($rootScope.user.pin+'VMMetrics','[]');
			VMGuestMetrics =  $localStorage.getObject($rootScope.user.pin+'VMGuestMetrics','[]');
			//console.log(VMs);
			host = Hosts.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];
			$scope.hostName = host.name;
			session = $rootScope.sessions.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];
			hostVMs = VMs.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			})[0];
			
			$scope.VM = hostVMs.VMs.filter(function(tmp){
				return tmp.key == $stateParams.VMKey;
			})[0];
			//console.log($scope.VM.data.guest_metrics);
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}
		
		try{
			$scope.snapshots = [];
			angular.forEach($scope.VM.data.snapshots, function(item){
				var snapshot = hostVMs.VMs.filter(function(tmp){
					return tmp.key == item;
				});
				var tmpDate = snapshot[0].data.snapshot_time.split('T')[0];
				var date = tmpDate.slice(6,8)+'/'+tmpDate.slice(4,6)+'/'+tmpDate.slice(0,4);
				var time = snapshot[0].data.snapshot_time.split('T')[1].split('Z')[0];
				var name = snapshot[0].data.name_label;
				var desc = snapshot[0].data.name_description;
				$scope.snapshots.push({date:date, time:time, name:name, desc:desc});
			});
			
			hostVMMetrics = VMMetrics.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			});
			
			hostVMGuestMetrics = VMGuestMetrics.filter(function(tmp){
				return tmp.uuid == $stateParams.hostId;
			});
			
			$scope.VMMetrics = [];
			
			if (hostVMMetrics.length == 0){
				getVMMetrics();
			}
			else{
				var tmpVMMetrics = hostVMMetrics[0].data.filter(function(tmp){
					return tmp.key == $scope.VM.data.metrics;
				});
				if($scope.VMMetrics.length == 0) {
					getVMMetrics();
				}
				$scope.VMMetrics = tmpVMMetrics[0];
			}
			
			//console.log(hostVMGuestMetrics[0]);
			if (hostVMGuestMetrics.length == 0){
				getVMGuestMetrics(0);
			}
			else{
				$scope.VMGuestMetrics = hostVMGuestMetrics[0].data.filter(function(tmp){
					return tmp.key == $scope.VM.data.guest_metrics;
				});
				if($scope.VMGuestMetrics.length == 0) {
					getVMGuestMetrics(0);
					return;
				}
				console.log($scope.VMGuestMetrics);
				$scope.ip = $scope.VMGuestMetrics[0].data.networks[Object.keys($scope.VMGuestMetrics[0].data.networks)[0]];
				if($scope.ip==undefined){
					$scope.ip="";
				}
				if ($scope.VMGuestMetrics[0].data.PV_drivers_up_to_date == "1")
					$scope.tools = "Installed";
				else
					$scope.tools = "Not Installed";
				if (!$scope.VMGuestMetrics[0].data.os_version.name) $scope.os = "Unknown";
				else $scope.os = $scope.VMGuestMetrics[0].data.os_version.name;
			}
		}catch(err){
			$rootScope.showError(err);
			$rootScope.goToHosts();
		}	
	});
	
	function getVMMetrics() {
		var now = (new Date).getTime();
		try{
			var promise = $xenApi.getVMMetrics(session.session);
			promise.then(function(VM_metrics){
				$scope.VMMetrics = VM_metrics.filter(function(tmp){
					return tmp.key == $scope.VM.data.metrics;
				});
				//console.log("VMMetrics");
				//console.log(JSON.stringify($scope.VMMetrics));				
				var tmp = {
					uuid: $stateParams.hostId,
					data: VM_metrics
				};
				angular.forEach(hostVMMetrics, function(item){
					if($stateParams.hostId==item.uuid) {
						var index = hostVMMetrics.indexOf(item);
						hostVMMetrics.splice(index,1);
					}
				});
				hostVMMetrics.push(tmp);
				$localStorage.storeObject($rootScope.user.pin+'VMMetrics',hostVMMetrics);
				
				if ('Running' != $scope.VM.data.power_state) {
					$scope.time_since_startup = "-";
					return;
				}
				var arr = $scope.VMMetrics[0].data.start_time.split(/[T : Z]/);
				
				var then = Date.UTC(arr[0].slice(0,4), arr[0].slice(4,6)-1, arr[0].slice(6,8), arr[1], arr[2], arr[3]);
				
				var delta = Math.abs(now - then)/1000;
				var days = Math.floor(delta / 86400);
				delta -= days * 86400;
				var hours = Math.floor(delta / 3600) % 24;
				delta -= hours * 3600;
				var minutes = Math.floor(delta / 60) % 60;
				delta -= minutes * 60;
				
				$scope.time_since_startup = days + " days " + hours + " hours " + minutes + " minutes ";
			
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
		}
	}
	
	
	function getVMGuestMetrics(showSuccess) {
		try{
			var promise = $xenApi.getVMGuestMetrics(session.session);
			promise.then(function(VMGuest_metrics){
				
				$scope.VMGuestMetrics = VMGuest_metrics.filter(function(tmp){
					return tmp.key == $scope.VM.data.guest_metrics;
				});
				//console.log("VMGuestMetrics");
				//console.log(JSON.stringify($scope.VMGuestMetrics));
				
				var tmp = {
					uuid: $stateParams.hostId,
					data: VMGuest_metrics
				};
				angular.forEach(hostVMGuestMetrics, function(item){
					if($stateParams.hostId==item.uuid) {
						var index = hostVMGuestMetrics.indexOf(item);
						hostVMGuestMetrics.splice(index,1);
					}
				});
				hostVMGuestMetrics.push(tmp);
				$localStorage.storeObject($rootScope.user.pin+'VMGuestMetrics',hostVMGuestMetrics);

				$scope.ip = $scope.VMGuestMetrics[0].data.networks[Object.keys($scope.VMGuestMetrics[0].data.networks)[0]];
				if($scope.ip==undefined){
					$scope.ip="";
				}
				if ($scope.VMGuestMetrics[0].data.PV_drivers_up_to_date == "1")
					$scope.tools = "Installed";
				else
					$scope.tools = "Not Installed";
				if (!$scope.VMGuestMetrics[0].data.os_version.name) $scope.os = "Unknown";
				else $scope.os = $scope.VMGuestMetrics[0].data.os_version.name;
				if(showSuccess) $rootScope.showSuccess('Refresh successfully completed.');
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
		}
	}
	
	$scope.refreshVMMetrics = function(){
		try{
			angular.forEach(VMMetrics, function(item){
				if($stateParams.hostId==item.uuid) {
					var index = VMMetrics.indexOf(item);
					VMMetrics.splice(index,1);
					$localStorage.storeObject($rootScope.user.pin+'VMMetrics',VMMetrics);
				}
			});
			angular.forEach(VMGuestMetrics, function(item){
				if($stateParams.hostId==item.uuid) {
					var index = VMGuestMetrics.indexOf(item);
					VMGuestMetrics.splice(index,1);
					$localStorage.storeObject($rootScope.user.pin+'VMGuestMetrics',VMGuestMetrics);
				}
			});
		}catch(err){
			$rootScope.showError('Something went wrong!');
			$rootScope.goToHosts();
			return;
		}
		getVMMetrics();
		getVMGuestMetrics(1);
	}
	
	$scope.doShutDown = function(id){
		var promise = $xenApi.shutDown(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully shut down');
		});
	}
	
	$scope.doReboot = function(id){
		var promise = $xenApi.reboot(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully reboot');
		});
	}
	
	$scope.doSuspend = function(id){
		var promise = $xenApi.suspend(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully suspended');
		});
	}
	
	$scope.doForceShutDown = function(id){
		var promise = $xenApi.forceShutDown(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully shut down');
		});
	}
	
	$scope.doForceReboot = function(id){
		var promise = $xenApi.forceReboot(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully reboot');
		});
	}
	
	$scope.doStart = function(id){
		var promise = $xenApi.start(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully started');
		});
	}
	
	$scope.doResume = function(id){
		var promise = $xenApi.resume(session.session, id);
		//$scope.refreshVMMetrics();
		promise.then(function(result){
			$rootScope.showSuccess('VM successfully resumed');
		});
	}
	
	$scope.tab = 1;
	$scope.filtText = "info";
	
	$scope.select = function(setTab) {
        $scope.tab = setTab;
		
		if (setTab === 2) {
			$scope.filtText = "stats";
        }
        else if (setTab === 3) {
            $scope.filtText = "flash";
        }
        else if (setTab === 4){
            $scope.filtText = "camera";
        }
        else {
            $scope.filtText = "info";
        }
    };
	
    $scope.isSelected = function (checkTab) {		
        return ($scope.tab === checkTab);
    };
})
