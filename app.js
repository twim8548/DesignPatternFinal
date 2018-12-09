var fs = require('fs');
var http = require('http');
var express = require('express');

// DB 연결
var client = require('mysql').createConnection({
    user: 'root',
    password: '111111',
    database: 'location'
});

// 웹 서버 생성
var app = express();
var server = http.createServer(app);

app.get('/', function (request, response) {
    fs.readFile('Main.html', function (error, data) {
        response.send(data.toString());
    });
});

app.get('/tracker', function (request, response) {
    fs.readFile('Tracker.html', function (error, data) {
        response.send(data.toString());
    });
});

app.get('/observer', function (request, response) {
    fs.readFile('Observer.html', function (error, data) {
        response.send(data.toString());
    });
});

app.get('/showdata', function (request, response) {
    client.query('SELECT * FROM locations', function (error, data) {
        response.send(data);
    });
});

// 웹 서버 실행
server.listen(3000, function () {
    console.log('서버가 실행 되었습니다. http://localhost:3000');
});

// 소켓 서버 생성, 실행
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    // join 이벤트
    socket.on('join', function (data) {
        socket.join(data);
    });

    // location 이벤트
    socket.on('location', function (data) {
        // 데이터를 삽입
        client.query('INSERT INTO locations(name, latitude, longitude, date) VALUES (?, ?, ?, NOW())', [data.name, data.latitude, data.longitude]);

        // receive 이벤트 발생
        io.sockets.emit('receive', {
            latitude: data.latitude,
            longitude: data.longitude,
            date: Date.now()
        });
    });
});
