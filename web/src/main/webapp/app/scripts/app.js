'use strict';

/**
 * @ngdoc overview
 * @name oncokb
 * @description
 * # oncokb
 *
 * Main module of the application.
 */
var OncoKB = {};
//Global variables
OncoKB.global = {};
//OncoKB.global.genes
//OncoKB.global.alterations
//OncoKB.global.tumorTypes
//OncoKB.global.treeEvidence
//OncoKB.global.processedData

//Variables for tree tab
OncoKB.tree = {};
//processedData

OncoKB.config = {
    clientId: '19500634524-r0jf2v73enc62qo83cs5rnrm7eb0qndt.apps.googleusercontent.com',
    scopes: [
        // 'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/drive.file'
    ],
    folderId: '0BzBfo69g8fP6R1ZKakhOMVE3UEE',
    userRoles: {
        'public': 1, // 0001
        'user':   2, // 0010
        'curator':4, // 0100
        'admin':  8  // 1000
    },
    users: '0BzBfo69g8fP6fmdkVnlOQWdpLWtHdFM4Ml9vNGxJMWpNLTNUM0lhcEc2MHhKNkVfSlZjMkk',
    accessLevels: {}
}

OncoKB.config.accessLevels.public = OncoKB.config.userRoles.public | OncoKB.config.userRoles.user  | OncoKB.config.userRoles.curator | OncoKB.config.userRoles.admin;
OncoKB.config.accessLevels.user = OncoKB.config.accessLevels.public;
OncoKB.config.accessLevels.curator = OncoKB.config.userRoles.curator | OncoKB.config.userRoles.admin;
OncoKB.config.accessLevels.admin = OncoKB.config.userRoles.admin;


OncoKB.curateInfo = {
    'Gene': {
        'name': {
            type: 'string'
        },
        'summary': {
            type: 'string',
            display: 'Summary',
            comment: true
        },
        'background': {
            type: 'string',
            display: 'Background',
            comment: true
        },
        'mutations': {
            type: 'list'
        },
        'curators': {
            type: 'list'
        }
    },
    'Mutation': {
        'name': {
            type: 'string'
        },
        'oncogenic': {
            type: 'string',
            display: 'Oncogenic',
            comment: true
        },
        'effect': {
            type: 'ME'
        },
        'description': {
            type: 'string',
            display: 'Description of mutation effect',
            comment: true
        },
        'tumors': {
            type: 'list'
        }
    },
    'Curator': {
        'name': {
            type: 'string'
        },
        'email': {
            type: 'string'
        }
    },
    'NCCN': {
        'therapy': {
            type: 'string',
            display: 'Therapy',
            comment: true
        },
        'disease': {
            type: 'string',
            display: 'Disease',
            comment: true
        },
        'version': {
            type: 'string',
            display: 'Version',
            comment: true
        },
        'pages': {
            type: 'string',
            display: 'Pages',
            comment: true
        },
        'category': {
            type: 'string',
            display: 'NCCN category of evidence and consensus',
            comment: true
        },
        'description': {
            type: 'string',
            display: 'Description of evidence',
            comment: true
        }
    },
    'InteractAlts': {
        'alterations': {
            type: 'string',
            display: 'Alterations',
            comment: true
        },
        'description': {
            type: 'string',
            display: 'Description of evidence',
            comment: true
        }
    },
    'Tumor': {
        'name': {
            type: 'string'
        },
        'prevalence': {
            type: 'string',
            display: 'Prevalence',
            comment: true
        },
        'progImp': {
            type: 'string',
            display: 'Prognostic implications',
            comment: true
        },
        'trials': {
            type: 'list'
        },
        'TI': {
            type: 'list'
        },
        'nccn': {
            type: 'NCCN'
        },
        'interactAlts': {
            type: 'InteractAlts',
            comment: true
        }
    },
    'TI': {
        'name': {
            type: 'string'
        },
        'types': {
        },
        'treatments': {
            type: 'list'
        },
        'description': {
            type: 'string',
            display: 'Description of evidence',
            comment: true
        }
    },
    'Treatment': {
        'name': {
            type: 'string'
        },
        'type': {
            type: 'string'
        },
        'level': {
            type: 'string',
            display: 'Highest level of evidence',
            comment: true
        },
        'indication': {
            type: 'string',
            display: 'Approved indications',
            comment: true
        },
        'description': {
            type: 'string',
            display: 'Description of evidence',
            comment: true
        },
        'trials': {
            type: 'string',
            comment: true
        }
    },
    'ME': {
        'value': {
            type: 'string',
            comment: true
        },
        'addOn': {
            type: 'string',
            comment: true
        }
    },
    'Comment': {
        'date': {
            type: 'string'
        },
        'userName': {
            type: 'string'
        },
        'email': {
            type: 'string'
        },
        'content': {
            type: 'string'
        },
        'resolved': {
            type: 'string'
        }
    }
};

OncoKB.setUp = function(object) {
    if(OncoKB.curateInfo.hasOwnProperty(object.attr)){
        for(var key1 in OncoKB.curateInfo[object.attr]){
            if(OncoKB.curateInfo[object.attr][key1].hasOwnProperty('display')) {
                object[key1].display = OncoKB.curateInfo[object.attr][key1].display;
            }
            if(object[key1].type === 'EditableString') {
                Object.defineProperty(object[key1], 'text', {
                    set: object[key1].setText,
                    get: object[key1].getText
                });
            }
        }
    }
};

OncoKB.initialize = function() {
    var nonSetUp = ['TI'];
    var keys = _.keys(OncoKB.curateInfo);
    var keysL = keys.length;

    for (var i = 0; i < keysL; i++) {
        var _key = keys[i];
        var _keys = _.keys(OncoKB.curateInfo[_key]);
        var _keysL = _keys.length;

        //Google Realtime data module for annotation curation
        //Gene is the main entry
        OncoKB[_key] = function() {};

        OncoKB[_key].prototype.attr = _key;

        OncoKB[_key].prototype.setUp = function() {
            OncoKB.setUp(this);
        };

        OncoKB[_key].prototype.initialize = function () {
            var model = gapi.drive.realtime.custom.getModel(this);
            var id = this.attr;
            var atrrs = _.keys(OncoKB.curateInfo[id]);
            var atrrsL = atrrs.length;

            for(var j = 0; j < atrrsL; j++) {
                var __key = atrrs[j];
                if(__key === 'types' && id === 'TI') {
                    this.types = model.createMap({'status': '0', 'type': '0'});
                }else {
                    if(OncoKB.curateInfo[id][__key].hasOwnProperty('type')) {
                        if(id !== 'Comment') {
                            this[__key + '_comments'] = model.createList();
                        }
                        switch (OncoKB.curateInfo[id][__key].type) {
                            case 'string':
                                this[__key] = model.createString('');
                                break;
                            case 'list':
                                this[__key] = model.createList();
                                break;
                            default:
                                this[__key] = model.create(OncoKB.curateInfo[id][__key].type);
                                break;
                        }
                    }
                }
            }
            this.setUp();
        }

        //Register every field of OncoKB into document
        for(var j=0; j<_keysL; j++) {
            OncoKB[_key].prototype[_keys[j]] = gapi.drive.realtime.custom.collaborativeField(_key + '_' + _keys[j]);
            if(_key !== 'Comment') {
            OncoKB[_key].prototype[_keys[j] + '_comments'] = gapi.drive.realtime.custom.collaborativeField(_key + '_' + _keys[j] + '_comments');
            }
        }

        //Register custom type
        gapi.drive.realtime.custom.registerType(OncoKB[_key], _key);

        //Set realtime API initialize function for each type, this function only runs one time when create new data model
        gapi.drive.realtime.custom.setInitializer(OncoKB[_key], OncoKB[_key].prototype.initialize);

        //Set on loaded function, this function will be loaded everyone the document been pulled from google drive
        if(nonSetUp.indexOf(_key) !== -1) {
            gapi.drive.realtime.custom.setOnLoaded(OncoKB[_key]);
        }else {
            gapi.drive.realtime.custom.setOnLoaded(OncoKB[_key], OncoKB[_key].prototype.setUp);
        }
    }

    //Create comments category individually
    // OncoKB.Comments = function() {};

    // OncoKB.Comments.prototype.attr = _key;

    // OncoKB.Comments.prototype.setUp = function() {};

    // OncoKB.Comments.prototype.initialize = function () {
    //     var model = gapi.drive.realtime.custom.getModel(this);
    //     var id = this.attr;
    //     var attr = _.keys(OncoKB.curateInfo);
    //     var attrL = -1;
    //     attr = _.remove(attr, function(n) { return n==='Comment'; });
    //     attrL = attr.length;

    //     for(var i = 0; i < attrL; i++) {
    //         var _key = attr[i];
    //         var _attr = _.keys(OncoKB.curateInfo[_key]);
    //         var _attrL = _attr.length;

    //         for(var j = 0; j < _attrL; j++) {
    //             var __key = _attr[j];
    //             if(OncoKB.curateInfo[_key][__key].hasOwnProperty('comment') && OncoKB.curateInfo[_key][__key].comment) {
    //                 if(!this.hasOwnProperty(_key)){
    //                     this[_key] == {};
    //                 }
    //                 this[_key][__key] = model.createList();
    //             }
    //         }
    //     }
    //     this.setUp();
    // };

    // var attr = _.keys(OncoKB.curateInfo);
    // var attrL = -1;
    // attr = _.remove(attr, function(n) { return n !=='Comment'; });
    // attrL = attr.length;

    // for(var i = 0; i < attrL; i++) {
    //     var _key = attr[i];
    //     var _attr = _.keys(OncoKB.curateInfo[_key]);
    //     var _attrL = _attr.length;

    //     OncoKB.Comments.prototype[_key] = gapi.drive.realtime.custom.collaborativeField('comments_' + _key);

    //     for(var j = 0; j < _attrL; j++) {
    //         var __key = _attr[j];
    //         if(OncoKB.curateInfo[_key][__key].hasOwnProperty('comment') && OncoKB.curateInfo[_key][__key].comment) {
    //             OncoKB.Comments.prototype[_key][__key] = gapi.drive.realtime.custom.collaborativeField('comments_' + _key + '_' + __key);
    //         }
    //     }
    // }

    // //Register custom type
    // gapi.drive.realtime.custom.registerType(OncoKB.Comments, 'Comments');

    // //Set realtime API initialize function for each type, this function only runs one time when create new data model
    // gapi.drive.realtime.custom.setInitializer(OncoKB.Comments, OncoKB.Comments.prototype.initialize);

    // gapi.drive.realtime.custom.setOnLoaded(OncoKB.Comments, OncoKB.Comments.prototype.setUp);
};

var oncokbApp = angular
 .module('oncokb', [
   'ngAnimate',
   'ngCookies',
   'ngResource',
   'ngRoute',
   'ngSanitize',
   'ngTouch',
   'ui.bootstrap',
   'localytics.directives',
   'dialogs.main',
   'dialogs.default-translations',
   'RecursionHelper',
   'angularFileUpload',
   'xml',
   'contenteditable',
   'datatables',
   'datatables.bootstrap'
 ])
 .value('user', {
    name: 'N/A',
    email: 'N/A'
 })
 .value('OncoKB', OncoKB)
 .constant('SecretEmptyKey', '[$empty$]')
 .constant('config', OncoKB.config)
 .constant('gapi', window.gapi)
 .constant('loadingScreen', window.loadingScreen)
 .constant('S', window.S)
 .constant('_', window._)
 .config(function ($locationProvider, $routeProvider, dialogsProvider, $animateProvider, x2jsProvider, config) {
    var access = config.accessLevels;

    // $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
           templateUrl: 'views/welcome.html',
           access: access.public
        })
        // .when('/tree', {
        //     templateUrl: 'views/tree.html',
        //     controller: 'TreeCtrl',
        //     access: access.admin
        // })
        // .when('/variant', {
        //     templateUrl: 'views/variant.html',
        //     controller: 'VariantCtrl',
        //     reloadOnSearch: false,
        //     access: access.admin
        // })
        // .when('/reportGenerator', {
        //     templateUrl: 'views/reportgenerator.html',
        //     controller: 'ReportgeneratorCtrl',
        //     access: access.admin
        // })
        .when('/genes', {
            templateUrl: 'views/genes.html',
            controller: 'GenesCtrl',
            access: access.curator
        })
        .when('/gene/:geneName', {
            templateUrl: 'views/gene.html',
            controller: 'GeneCtrl',
            access: access.curator
            // resolve: {
            //   realtimeDocument: function(loadFile){
            //     return loadFile();
            //   }
            // }
        })
        .otherwise({
            redirectTo: '/'
        });

    dialogsProvider.useBackdrop(true);
    dialogsProvider.useEscClose(true);
    dialogsProvider.useCopy(false);
    dialogsProvider.setSize('md');

    $animateProvider.classNameFilter(/^((?!(fa-spinner)).)*$/);

    x2jsProvider.config = {
        /*
        escapeMode               : true|false - Escaping XML characters. Default is true from v1.1.0+
        attributePrefix          : "<string>" - Prefix for XML attributes in JSon model. Default is "_"
        arrayAccessForm          : "none"|"property" - The array access form (none|property). Use this property if you want X2JS generates an additional property <element>_asArray to access in array form for any XML element. Default is none from v1.1.0+
        emptyNodeForm            : "text"|"object" - Handling empty nodes (text|object) mode. When X2JS found empty node like <test></test> it will be transformed to test : '' for 'text' mode, or to Object for 'object' mode. Default is 'text'
        enableToStringFunc       : true|false - Enable/disable an auxiliary function in generated JSON objects to print text nodes with text/cdata. Default is true
        arrayAccessFormPaths     : [] - Array access paths. Use this option to configure paths to XML elements always in "array form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
        skipEmptyTextNodesForObj : true|false - Skip empty text tags for nodes with children. Default is true.
        stripWhitespaces         : true|false - Strip whitespaces (trimming text nodes). Default is true.
        datetimeAccessFormPaths  : [] - Datetime access paths. Use this option to configure paths to XML elements for "datetime form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
        */
        attributePrefix : '$'
    };
 });

/**
 * Set up handlers for various authorization issues that may arise if the access token
 * is revoked or expired.
 */
angular.module('oncokb').run(
    ['$timeout', '$rootScope', '$location', 'loadingScreen', 'storage', 'access', 'config', 'DatabaseConnector', 'users', 
    function ($timeout, $rootScope, $location, loadingScreen, storage, Access, config, DatabaseConnector, Users) {
    $rootScope.user = {
        role: config.userRoles.public
    };

    // $timeout(function(){
        DatabaseConnector.getAllUsers(function(users){
            Users.setUsers(users);
            // console.log('isLoggedIn:', Access.isLoggedIn());
            if(Access.isLoggedIn()) {
                // console.log('Setting me');
                Users.setMe(Users.getMe());
                $rootScope.user = Users.getMe();
            }
            loadingScreen.finish();
        });
    // }, 3000);

    // Error loading the document, likely due revoked access. Redirect back to home/install page
    $rootScope.$on('$routeChangeError', function () {
        $location.url('/');
    });

    // Token expired, refresh
    $rootScope.$on('oncokb.token_refresh_required', function () {
        storage.requireAuth(true).then(function () {
            // no-op
        }, function () {
            $location.url('/');
        });
    });

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (!Access.authorize(next.access)) {
            if(!Access.isLoggedIn()) {
                Access.setURL($location.path());
            }
            $location.path('/');
        }
    });
}]);

/**
 * Bootstrap the app
 */
gapi.load('auth:client:drive-share:drive-realtime', function () {
    gapi.auth.init();
    OncoKB.initialize();

    angular.element(document).ready(function() {
        angular.bootstrap(document, ['oncokb']);
    });
});
