'use strict';

/**
 * @ngdoc function
 * @name oncokb.controller:CurateCtrl
 * @description
 * # CurateCtrl
 * Controller of the oncokb
 */
angular.module('oncokb')
    .controller('CurateCtrl', ['$scope', '$location', '$routeParams', 'storage',
        function ($scope, $location, $routeParams, storage) {
            $scope.createDoc = function() {
                if($scope.newDocName) {
                    storage.requireAuth().then(function () {
                        storage.createDocument($scope.newDocName.toString()).then(function (file) {
                            $location.url('/curate/' + file.id + '/');
                        });
                    }, function () {
                        $location.url('/curate');
                    });
                }
            };

            $scope.getDocs = function() {
                storage.requireAuth(true).then(function(){
                    storage.retrieveAllFiles().then(function(result){
                        console.log('Documents', result);
                        $scope.documents = result;
                        // $scope._documents = result;
                        // getDocumentFromList(0, []);
                    });
                });
            };

            $scope.curateDoc = function() {
                console.log($scope);
                console.log($scope.selectedDoc);
                console.log('selected file id', $scope.selectedDoc.id);
                $location.url('/curate/' + $scope.selectedDoc.id + '/');
            };

            $scope.documents = [];
            $scope.getDocs();

            function getDocumentFromList(index, documents) {
                if($scope._documents && $scope._documents.length > index) {
                    storage.getDocument($scope._documents[index].id).then(function(file){
                        console.log(file);
                        if(file.editable) {
                            documents.push(file);
                        }
                        getDocumentFromList(++index, documents);
                    });
                }else {
                    $scope.documents = documents;
                }
            }
        }]
    )
    .controller('CurateEditCtrl', ['$scope', '$location', '$routeParams', 'storage', 'realtimeDocument', 'user',
        function ($scope, $location, $routeParams, storage, realtimeDocument, User) {
            $scope.fileId = $routeParams.fileId;
            $scope.realtimeDocument = realtimeDocument;
            $scope.gene = '';
            $scope.newGene = {};
            $scope.newMutation = {};
            $scope.newTumor = {};
            $scope.collaborators = {};
            $scope.checkboxes = {
                'oncogenic': ['YES', 'NO', 'N/A']
            };

            print(realtimeDocument);

            if($routeParams.fileId) {
                var model = realtimeDocument.getModel();
                if(!model.getRoot().get('gene')) {
                  storage.getDocument($routeParams.fileId).then(function(file){
                    var gene = model.create('Gene');
                    model.getRoot().set('gene', gene);
                    $scope.gene = gene;
                    $scope.gene.name.setText(file.title);
                    $scope.model =  model;
                    afterCreateGeneModel();
                  });
                }else {
                  $scope.gene = model.getRoot().get('gene');
                  $scope.model =  model;
                  afterCreateGeneModel();
                }
            }else {
              $scope.model = '';
            }

            $scope.authorize = function(){
                print($routeParams);
                    storage.requireAuth(false).then(function () {
                    var target = $location.search().target;
                    if (target) {
                        $location.url(target);
                    } else {
                        storage.getDocument('1rFgBCL0ftynBxRl5E6mgNWn0WoBPfLGm8dgvNBaHw38').then(function(file){
                            storage.downloadFile(file).then(function(text) {
                                $scope.curateFile = text;
                            });
                        });
                    }
                });
            };

            $scope.addGene = function() {
                if (this.newGene && this.newGene.name) {
                    realtimeDocument.getModel().beginCompoundOperation();
                    var gene = realtimeDocument.getModel().create(Oncokb.Gene, this.newGene);
                    this.newGene = {};
                    this.gene = gene;
                    realtimeDocument.getModel().endCompoundOperation();
                }
            };

            $scope.addMutation = function() {
                if (this.gene && this.newMutation && this.newMutation.name) {
                    var _mutation = '';
                    realtimeDocument.getModel().beginCompoundOperation();
                    _mutation = realtimeDocument.getModel().create(OncoKB.Mutation);
                    _mutation.name.setText(this.newMutation.name);
                    this.gene.mutations.push(_mutation);
                    realtimeDocument.getModel().endCompoundOperation();
                    this.newMutation = {};
                }
            };

            $scope.checkScope = function() {
                print($scope.gene);
                print($scope.gene.mutations.asArray());
                print($scope.collaborators);
            };

            $scope.remove = function(index, $event) {
                if ($event.stopPropagation) $event.stopPropagation();
                if ($event.preventDefault) $event.preventDefault();
                $scope.gene.mutations.remove(index);
            };

            $scope.redo = function() {
              $scope.model.redo();
            };

            $scope.undo = function() {
              $scope.model.undo();
            };

            $scope.curatorsName = function() {
              return this.gene.curators.asArray().map(function(d){return d.name}).join(', ');
            };

            $scope.curatorsEmail = function() {
              return this.gene.curators.asArray().map(function(d){return d.email}).join(', ');
            };

            $scope.removeCurator = function(index) {
              $scope.gene.curators.remove(index);
            };

            function bindDocEvents() {
              $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, displayCollaboratorEvent);
              $scope.realtimeDocument.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, displayCollaboratorEvent);
              $scope.model.addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, onUndoStateChanged);
              $scope.gene.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, valueChanged);
            }

            function afterCreateGeneModel() {
              displayAllCollaborators($scope.realtimeDocument, bindDocEvents);
            }

            function valueChanged(evt) {
              if($scope.gene) {
                var hasCurator = false;
                if($scope.gene.curators && angular.isArray($scope.gene.curators.asArray()) && $scope.gene.curators.asArray().length > 0) {
                  var _array = $scope.gene.curators.asArray();
                  for(var i=0; i<_array.length; i++) {
                    if(_array[i].email.text === User.email) {
                      hasCurator = true;
                      break;
                    }
                  }

                  if(!hasCurator) {
                    $scope.realtimeDocument.getModel().beginCompoundOperation();
                    var _curator = realtimeDocument.getModel().create(OncoKB.Curator, User.name, User.email);
                    $scope.gene.curators.push(_curator);
                    $scope.realtimeDocument.getModel().endCompoundOperation();
                  }
                }else {
                  $scope.realtimeDocument.getModel().beginCompoundOperation();
                  var _curator = realtimeDocument.getModel().create(OncoKB.Curator, User.name, User.email);
                  $scope.gene.curators.push(_curator);
                  $scope.realtimeDocument.getModel().endCompoundOperation();
                }
              }
            }

            function displayCollaboratorEvent(evt) {
              print(evt);
              switch (evt.type) {
                case 'collaborator_left':
                  removeCollaborator(evt.collaborator);
                  break;
                case 'collaborator_joined':
                  addCollaborator(evt.collaborator);
                  break;
                default:
                  console.info('Unknown event:', evt);
                  break;
              }
              $scope.$apply($scope.collaborators);
            }

            function addCollaborator(user) {
              if(!$scope.collaborators.hasOwnProperty(user.userId)) {
                $scope.collaborators[user.sessionId] = {};
              }
              $scope.collaborators[user.sessionId] = user;
              print(user);
            }

            function removeCollaborator(user) {
              if(!$scope.collaborators.hasOwnProperty(user.sessionId)) {
                console.log('Unknown collaborator:', user);
              }else {
                delete $scope.collaborators[user.sessionId];
              }
            }

            function displayAllCollaborators(document, callback) {
              var collaborators = document.getCollaborators();
              var collaboratorCount = collaborators.length;
              var _user = {};
              for (var i = 0; i < collaboratorCount; i++) {
                var user = collaborators[i];
                if(!$scope.collaborators.hasOwnProperty(user.userId)) {
                  $scope.collaborators[user.sessionId] = {};
                }
                $scope.collaborators[user.sessionId] = user;
                if(user.isMe) {
                  _user = user;
                }
              }

              if(User.email === 'N/A') {
                storage.getUserInfo(_user.userId).then(function(userInfo){
                  User.name = userInfo.displayName;
                  User.email = angular.isArray(userInfo.emails)?(userInfo.emails.length>0?userInfo.emails[0].value:'N/A'):userInfo.emails;
                  callback();
                });
              }else {
                callback();
              }
            }

            function onUndoStateChanged(evt) {
              console.info(evt);

              if (evt.canUndo) {
                $scope.canUndo = true;
              }else {
                $scope.canUndo = false;
              }
              if (evt.canRedo) {
                $scope.canRedo = true;
              }else {
                $scope.canRedo = false;
              }
            }

            function print(item) {
              console.log('\n---------------------------------');
              console.log(item);
              console.log('---------------------------------\n');
            }
        }]
    )
    .directive("bindCompiledHtml", function($compile, $timeout) {
        return {
            template: '<div></div>',
            scope: {
              rawHtml: '=bindCompiledHtml'
            },
            link: function(scope, elem, attrs) {
              scope.$watch('rawHtml', function(value) {
                if (!value) return;
                // we want to use the scope OUTSIDE of this directive
                // (which itself is an isolate scope).
                var newElem = $compile(value)(scope.$parent);
                elem.contents().remove();
                elem.append(newElem);
              });
            }
        };
    });