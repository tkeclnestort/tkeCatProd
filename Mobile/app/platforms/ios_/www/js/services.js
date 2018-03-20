angular.module('thyssenApp.services', [])
        .factory('devInterceptor', function ($q, appConfig) {
            return {
                'request': function (config) {
                    if (appConfig.nbdebug === 'true') {
                        if (config.url.includes("?"))
                            config.url = config.url + '&XDEBUG_SESSION_START=netbeans-xdebug';
                        else
                            config.url = config.url + '?XDEBUG_SESSION_START=netbeans-xdebug';
                    }
                    return config || $q.when(config);
                }
            }
        })
        .factory('loadingInterceptor', function ($rootScope) {
            return {
                request: function (config) {
                    $rootScope.$broadcast('loading:show')
                    return config
                },
                response: function (response) {
                    $rootScope.$broadcast('loading:hide')
                    return response
                }
            }
        })
        .factory('authInterceptor', function ($q, $window, $location) {
            return {
                request: function (config) {
                    if ($window.sessionStorage.access_token) {
                        //HttpBearerAuth
                        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.access_token;
                    }
                    return config;
                },
                responseError: function (rejection) {
                    if (rejection.status === 401) {
                        $location.path('/login').replace();
                    }
                    return $q.reject(rejection);
                }
            };
        })
        .factory('SiglaSyncDataFactory', function ($q, $http, appConfig) {
            return {
                obtenerPaises: function () {
                    return $http.post(appConfig.apiUrl + '/listapaises').success(function (data, status, headers, config) {
                        return data;
                    });
                },
            }
        })
        .factory('ProdDataFactory', function ($q, $http, appConfig) {
            return {
    getProdList: function(currentPage,idPais,familia_id,subfamilia_id,cod_sigla,desc_princ,desc_sec) {
      return $http.get(appConfig.apiUrl + '/searchproductos?page=' + currentPage + '&pais_id=' + idPais + '&cod_sigla=' + cod_sigla
      + '&familia_id=' + familia_id + '&subfamilia_id=' + subfamilia_id
      + '&descpal=' + desc_princ + '&descsec=' + desc_sec).then(function(response){
                        var pageTotalCount = parseInt(response.headers('X-Pagination-Page-Count'));
                        if (currentPage <= pageTotalCount)
                            return response.data;
                        else
                            return [];
                    }
                    );
                },
                getFamiliasCatalogo: function () {

                    return $http.get(appConfig.apiUrl + '/familiascatalogo').success(function (data, status, headers, config) {
                        return data;
                    });
                },
                getSubFamiliasCatalogo: function () {
                    return $http.get(appConfig.apiUrl + '/subfamiliascatalogo').success(function (data, status, headers, config) {
                        return data;
                    })
                },
            }
        });
