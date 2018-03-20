//angular.module('starter.controllers', [])
angular.module('thyssenApp.controllers', ['thyssenApp.services'])
        .controller('LoginCtrl', function ($scope, $ionicLoading, $ionicPopup, $http, $ionicHistory, $state, $window, $location, SiglaSyncDataFactory, appConfig, listaPaises) {
            $scope.userModel = {};
            $scope.appConfig = appConfig;
            $scope.paises = listaPaises.data;
            $scope.doLogin = function () {
                $scope.submitted = true;
                $scope.error = {};
                $scope.userModel.idpais = $scope.userModel.pais.id
                $http.post(appConfig.loginUrl, $scope.userModel)
                        .success(
                                function (data) {
                                    $window.sessionStorage.access_token = data.access_token;
                                    $window.sessionStorage.idTecnico = data.idTecnico;
                                    $window.sessionStorage.idpais = $scope.userModel.pais.id;
                                    $window.sessionStorage.nombrepais = $scope.userModel.pais.nombre;
                                    $state.go('app.inicio');
                                })
                        .error(
                                function (error, status, code) {
                                    $ionicLoading.hide();
                                    if (error.code === 9100) {
                                        $ionicPopup.alert({
                                            title: 'Error de Acceso',
                                            template: error.message
                                        });
                                    } else {
                                        if (status === 422) {
                                            $ionicPopup.alert({
                                                title: 'Error de Acceso',
                                                template: 'Verifique usuario y contraseña'
                                            });
                                        } else {
                                            angular.forEach(error, function (err) {
                                                $scope.error[err.field] = err.message;
                                                //$location.path('/inicio').replace();
                                            });
                                            $ionicPopup.alert({
                                                title: 'Error de Acceso',
                                                template: 'Contacte al administrador'
                                            });
                                        }
                                    }
                                }
                        );
            };

            $scope.logout = function () {
                $window.sessionStorage.access_token = null;
                $ionicHistory.clearCache().then(function () {
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });
                    $state.go('login');
                });
            }
        })
        .controller('MenuCtrl', function ($scope, $ionicHistory, $state, $window) {
            $scope.logout = function () {
                $window.sessionStorage.access_token = null;
                $ionicHistory.clearCache().then(function () {
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });
                    $state.go('login');
                });
            }
        })
        .controller('CatListCtrl', function ($scope, $ionicLoading, $filter, appConfig, $ionicPopup, $http, $timeout, $ionicScrollDelegate, $window, ProdDataFactory, $state, $ionicModal) {
            $scope.filtrosProd = [];
            $scope.filtrosProd.familia = [];
            $scope.filtrosProd.familia.id = 0;
            $scope.filtrosProd.subfamilia = [];
            $scope.filtrosProd.subfamilia.id = 0;
            $scope.filtrosProd.cod_sigla = '';
            $scope.filtrosProd.desc_princ = '';
            $scope.filtrosProd.desc_sec = '';
            $scope.filtrosProd.pais_nombre = $window.sessionStorage.nombrepais;
            $scope.filtrosProd.idPais = $window.sessionStorage.idPais;
            $scope.cat_resultados = [];
            
            $scope.serverUrl = appConfig.serverRoot;

            $scope.familiasSeleccionables = JSON.parse(sessionStorage.listafamilias);


            $scope.cargarSubfam = function () {
                
                $scope.filtrosProd.subfamilia = null;
                
                var listasubfamilias = JSON.parse(sessionStorage.listasubfamilias);

              //  listasubfamilias = $filter('filter')(listasubfamilias, {familia_id: $scope.filtrosProd.familia.id})[0];

                $scope.subfamiliasSeleccionables = [];

                angular.forEach(listasubfamilias, function (subfam) {
                    if (subfam.familia_id === $scope.filtrosProd.familia.id)
                    $scope.subfamiliasSeleccionables.push(subfam);
                });
                
               
                
                 
            

            }

            $scope.buscarProductos = function () {
                
                if ( $scope.filtrosProd.familia.id !== 0 && $scope.filtrosProd.subfamilia !== null||  $scope.filtrosProd.cod_sigla !=='' ||
                    $scope.filtrosProd.desc_princ !== '' || $scope.filtrosProd.desc_sec !== '' ) {
                $scope.abrir_cat_resultados_modal();
                $scope.cat_resultados = []; //Vacío para que vacíe la lista de la página.
                $scope.currentProdListPage = 1;

                ProdDataFactory.getProdList($scope.currentProdListPage, $window.sessionStorage.idpais,
                        $scope.filtrosProd.familia.id, $scope.filtrosProd.subfamilia.id, $scope.filtrosProd.cod_sigla,
                        $scope.filtrosProd.desc_princ, $scope.filtrosProd.desc_sec)
                        .then(function (data) {
                            $scope.cat_resultados = data;
                            $scope.moreProdCanBeLoaded = ($scope.cat_resultados.length > 0);
                        }).catch(function (response) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Error obteniendo la lista de Productos'
                    });
                }).finally(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            } else {
                alert('Debe seleccionar al menos un filtro. Tenga en cuenta que si la búsqueda se realiza por familia, debe especificar tambien una subfamilia.');
            }
        };
            $scope.getMore = function () {
                if ($scope.moreProdCanBeLoaded) {
                    $scope.currentProdListPage += 1;
                    ProdDataFactory.getProdList($scope.currentProdListPage, $window.sessionStorage.idpais,
                            $scope.filtrosProd.familia.id, $scope.filtrosProd.subfamilia.id, $scope.filtrosProd.cod_sigla,
                            $scope.filtrosProd.desc_princ, $scope.filtrosProd.desc_sec).then(function (data) {
                        if (data.length > 0) {
                            $scope.cat_resultados = $scope.cat_resultados.concat(data);
                            $scope.moreProdCanBeLoaded = true;
                        } else {
                            $scope.currentProdListPage -= 1;
                            $scope.moreProdCanBeLoaded = false;
                        }
                        ;
                    }).catch(function (response) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Error obteniendo m�s Productos'
                        });
                    }).finally(function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                } else {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                ;
            };
            $ionicModal.fromTemplateUrl('templates/imgProductoModal.html', function (modal) {
                $scope.imgProductoModal = modal;
            }, {
                scope: $scope,
                animation: 'slide-in-up'
            });
            $scope.abrirImgProductoModal = function (index) {
                $scope.prodindex = index;
                $scope.imgProductoModal.show();
            };
            
           
            
            $scope.cerrarImgProductoModal = function () {
                $scope.imgProductoModal.hide();
            };
            $ionicModal.fromTemplateUrl('templates/cat_resultados_modal.html', function (modal) {
                $scope.cat_resultados_modal = modal;
            }, {
                scope: $scope,
                animation: 'slide-in-up'
            });
            $scope.abrir_cat_resultados_modal = function () {
                $scope.cat_resultados_modal.show();
            };
            $scope.cerrar_cat_resultados_modal = function () {
                $scope.cat_resultados_modal.hide();
            };

        })
            .controller('MainController', function ($scope, $location, $window, appConfig) {
            $scope.loggedIn = function () {
                return Boolean($window.sessionStorage.access_token);
            };
            $scope.logout = function () {
                delete $window.sessionStorage.access_token;
                $location.path(appConfig.loginUrl).replace();
            };
        });
