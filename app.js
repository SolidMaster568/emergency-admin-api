require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require("path");
const config = require("./config");


app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname + "/public")));
app.use(express.static(__dirname + "/public/css"));
app.use(express.static(__dirname + "/public/js"));



//socket 
const http = require("http").Server(app);
const io = require('socket.io')(http);
io.on('connection', function (socket) {
    console.log('A user connected');

    socket.on('disconnect', function () {
      
        console.log('A user disconnected');
    });
});


require('./routes.js')(app);

http.listen(config.port, () => console.log("*Listening on port " + config.port));



module.exports = app;