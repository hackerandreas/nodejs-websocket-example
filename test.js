var http = require('http');

var server = http.createServer(function(req, res){
	res.writeHead(200, {'content-type':'text/plain'});
	res.write("hello\n");
	setTimeout(function(){
		res.write("world\n");
	}, 1000);
	setTimeout(function(){
		res.end("!\n");
	}, 3000);
});

server.listen(8000);