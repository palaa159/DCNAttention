var net = require('net'),
    server = net.createServer(),
    PARSE = require('./parse.js');

server.listen(3015);
console.log('Server listening on ' + server.address().address + ':' + server.address().port);

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    var data = '';
    sock.on('data', function(chunk) {
        // var string = chunk.toString();
        // string = string.replace(/\r?\n|\r/g, " ");
        // data += string;
    });
    sock.on('end', function() {
        // console.log('!!!!-----!!!!');
        // var recv = JSON.parse(data);
        // var devArr = proc_devArr(recv.devArr);

        // PARSE.saveObject(recv.id, {
        //     id: recv.id,
        //     timestamp: recv.timestamp,
        //     devArr: devArr,
        //     devCount: devArr.length
        // });
    });
});
