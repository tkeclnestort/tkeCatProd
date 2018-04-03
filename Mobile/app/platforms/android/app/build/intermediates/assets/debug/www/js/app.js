angular.module('thyssenApp', ['ionic', 'thyssenApp.controllers', 'ionic-modal-select'])
        .run(function ($ionicPlatform, $rootScope, $ionicLoading) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
                $rootScope.$on('loading:show', function () {
                    $ionicLoading.show({template: 'Cargando...'});
                });
                $rootScope.$on('loading:hide', function () {
                    $ionicLoading.hide();
                });
            });
        })
        .constant('appConfig', {
            appVersion: '1.0.0',
            appName: 'Catalogo de Productos',apiUrl: 'http://mobile.tkelatam.com/cp/api', loginUrl: 'http://mobile.tkelatam.com/cp/app/login',serverRoot: 'http://mobile.tkelatam.com/cp/', lblTest : '',
            //appName: 'Catalogo de Productos',apiUrl: 'http://mobile.tkelatam.com/cp-test/index.php/api', loginUrl: 'http://mobile.tkelatam.com/cp-test/index.php/app/login', serverRoot: 'http://mobile.tkelatam.com/cp-test/', lblTest : 'TEST', gaEvent: 'TEST Azure', gaTrackProd: true,
            //appName: 'Catalogo de Productos',apiUrl: 'http://tkecp.localhost.net/api',loginUrl: 'http://tkecp.localhost.net/app/login', serverRoot: 'http://tkecp.localhost.net/', lblTest: 'LOCAL',
            nbdebug: 'false'
        })
        .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'MenuCtrl'
                    })
                    .state('app.cat-list', {
                        url: '/cat',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/cat_list.html',
                                controller: 'CatListCtrl',
                            }
                        }
                    })
                    .state('login', {
                        url: '/login',
                        templateUrl: 'templates/login.html',
                        resolve: {
                            listaPaises: function (SiglaSyncDataFactory) {
                                return SiglaSyncDataFactory.obtenerPaises();
                            }
                        },
                        controller: 'LoginCtrl'
                    })

                    .state('app.inicio', {
                        url: '/inicio',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/inicio.html'

                            }
                        },
                        resolve: {
                            listafamilias: function (ProdDataFactory, $window) {
                                ProdDataFactory.getFamiliasCatalogo().then(function (response) {
                                    $window.sessionStorage.setItem('listafamilias', JSON.stringify(response.data));
                                });
                                ProdDataFactory.getSubFamiliasCatalogo().then(function (response) {
                                    $window.sessionStorage.setItem('listasubfamilias', JSON.stringify(response.data));
                                });
                            }
                        }
                    });


            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/login');
            $httpProvider.interceptors.push('authInterceptor');
            $httpProvider.interceptors.push('loadingInterceptor');
            $httpProvider.interceptors.push('devInterceptor');
        })
        .directive('resultadosListWidget', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/resultados_list_widget.html'
            };
        })
