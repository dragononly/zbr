var http = require("http");

http.createServer(function (req, res) {

    var fileName = "." + req.url;

   // if (fileName === "./stream") {
        res.writeHead(200, {"Content-Type":"text/event-stream", 
                            "Cache-Control":"no-cache", 
                            "Connection":"keep-alive"});
        res.writeHeader(200,{
            'Access-Control-Allow-Origin':'*','Access-Control-Allow-Method':'GET,POST'
        ,'Content-Type':'text/event-stream'});
        res.write("retry: 10000\n");
        res.write("event: connecttime\n");
        res.write("data: " + (new Date()) + "\n\n");
        res.write("data: " + (new Date()) + "\n\n");

        interval = setInterval(function() {
            res.write("data: " + (new Date()) + "\n\n");
        }, 1000);

        req.connection.addListener("close", function () {
            clearInterval(interval);
        }, false);
 // }
}).listen(80, "127.0.0.1");