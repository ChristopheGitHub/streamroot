app.factory('peer', function ($rootScope) {
  var peer = new Peer({host: 'localhost', port: 8000, path: '/peerjs'});
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
//      var dataConnection = peer.connect(peerId);
//      return {
//        on: function (eventName, callback) {
//          console.log('on');
//          dataConnection.on(eventName, function () {  
//            var args = arguments;
//            $rootScope.$apply(function () {
//              callback.apply(dataConnection, args);
//            });
//          });
//        },
//        send: function (data, callback) {
//          console.log('send');
//          console.log(data);
//          dataConnection.send(data, function () {
//            var args = arguments;
//            $rootScope.$apply(function () {
//              if (callback) {
//                callback.apply(dataConnection, args);
//              }
//            });
//          });
//        }
//      };
    }
  };
});