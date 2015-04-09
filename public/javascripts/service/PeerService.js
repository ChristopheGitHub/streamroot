'use strict';

app.factory('peer', function ($rootScope) {
  var peer = new Peer({host: 'sd-44839.dedibox.fr', port: 8001, path: '/peerjs'});
  return {
    on: function (eventName, callback) {
      peer.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(peer, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      peer.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(peer, args);
          }
        });
      });
    },
    connect: function (peerId) {
      return peer.connect(peerId);
    }
  };
});