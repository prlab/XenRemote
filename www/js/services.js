angular.module('xenMonitor.services', [])

.factory('$localStorage', ['$window', function($window) {
  return {
    store: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    storeObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key,defaultValue) {
      return JSON.parse($window.localStorage[key] || defaultValue);
    },
	clearAll: function() {
		return $window.localStorage.clear();
	}
  }
}])

.factory('$xenApi', ['$q', '$rootScope', function($q, $rootScope) {
	return{
		initHost: function(name, password, ip) {
			return $q(function(resolve, reject){
				var session = new XenAPI(name, password, ip);
				session.init(function(err,res) {
					if(err) {
						//$rootScope.hideLoading();
						$rootScope.showError(err.split(':')[1] + ", Host: " + ip);
						reject(err);
					}else {
						resolve(session);
					}
				});
			});
		},
		getHost: function(session) {
			return $q(function(resolve, reject){
				session.host.get_all_records(function(err,res) {
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						$.each(res, function (key,value) {
							value.key = key;
							//console.log(JSON.stringify(value));
							resolve(value);
						});
					}
				});	
			});
		},
		getHostMetrics: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.host_metrics.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						$.each(res, function (key,value) {
							//console.log(JSON.stringify(value));
							resolve(value);
						});	
					}
				});	
			});
		},		
		getPGPU: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.GPU_group.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						$.each(res, function (key,value) {
							//console.log("PGPU");
							//console.log(JSON.stringify(value));
							resolve(value);
						});	
					}
				});	
			});
		},		
		getVGPU: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VGPU_type.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						$.each(res, function (key,value) {
							//console.log("PGPU");
							//console.log(JSON.stringify(value));
							resolve(value);
						});	
					}
				});	
			});
		},
		getSRs: function(session) {
			//$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.SR.get_all_records( function(err,res){
					//$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						var SRs = [];
						var tmp = {};
						$.each(res, function (key,value) {
							tmp = {key: key, data:value};
							SRs.push(tmp);
						});
						//console.log(JSON.stringify(res));
						resolve(SRs);
					}
				})
			})
		},
		
		something: function(session) {
			//$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VTPM.get_all_records( function(err,res){
					//$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						//$.each(res, function (key,value) {
							resolve(JSON.stringify(res));
						//});
						//console.log(JSON.stringify(res));
					}
				})
			})
		},
		
		getPBDs: function(session) {
			//$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.PBD.get_all_records( function(err,res){
					//$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						var PBDs = [];
						var tmp = {};
						$.each(res, function (key,value) {
							tmp = {key: key, data:value};
							PBDs.push(tmp);
						});
						//console.log(JSON.stringify(res));
						resolve(PBDs);
					}
				})
			})
		},
		
		hostDisable: function(session, host) {
			//$rootScope.showLoading();
			/*return $q(function(resolve, reject){
				session.host.disable([host], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})*/
		},
		hostEnable: function(session, host) {
			//$rootScope.showLoading();
			/*return $q(function(resolve, reject){
				session.host.enable([host], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})*/
		},
		hostShutdown: function(session, host) {
			//$rootScope.showLoading();
			/*return $q(function(resolve, reject){
				session.host.shutdown([host], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})*/
		},
		hostReboot: function(session, host) {
			//$rootScope.showLoading();
			/*return $q(function(resolve, reject){
				session.host.reboot([host], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})*/
		},
		getHostVMs: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						var VMs = [];
						var tmp = {};
						$.each(res, function (key,value) {
							tmp = {key: key, data:value};
							VMs.push(tmp);
						});
						//console.log("VMs");
						//console.log(JSON.stringify(VMs));

						resolve(VMs);
					}
				});		
			});
		},
		getVMMetrics: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM_metrics.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						var VM_metrics = [];
						var tmp = {};
						$.each(res, function (key,value) {
							tmp = {key: key, data:value};
							VM_metrics.push(tmp);
						});
						//console.log("VM_metrics");
						//console.log(JSON.stringify(VM_metrics));
						resolve(VM_metrics);
					}
				});		
			});
		},
		getVMGuestMetrics: function(session) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM_guest_metrics.get_all_records(function(err,res) {
					$rootScope.hideLoading();
					if(err) {
						$rootScope.showError(err);
						reject(err);
					}else {
						var VM_guest_metrics = [];
						var tmp = {};
						$.each(res, function (key,value) {
							tmp = {key: key, data:value};
							VM_guest_metrics.push(tmp);
						});
						//console.log("VM_guest_metrics");					
						//console.log(VM_guest_metrics);

						resolve(VM_guest_metrics);
					}
				});		
			});
		},
		shutDown: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.clean_shutdown([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		reboot: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.clean_reboot([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		suspend: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.suspend([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		forceShutDown: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.hard_shutdown([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		forceReboot: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.hard_reboot([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		start: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.start([vm,false,false], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		resume: function(session, vm) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.resume([vm,false,false], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		createNewVM: function(session, vm, name) {
			$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.clone([vm, name], function(err,res){
					//$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
		provision: function(session, vm) {
			//$rootScope.showLoading();
			return $q(function(resolve, reject){
				session.VM.provision([vm], function(err,res){
					$rootScope.hideLoading();
					if(err){
						$rootScope.showError(err);
						reject(err);
					}else {
						resolve(res);
					}
				})
			})
		},
	}
}])
