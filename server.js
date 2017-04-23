// server.js
var http = require('http');
var io = require('socket.io');
var _ = require('lodash');
var uuidV4 = require('uuid/v4');

var users = [];
var sessions = [];

function createServer() {
    return new Promise((resolve, reject) => {
        var server = http.createServer();

        server.on('listening', () => resolve(server));
        server.on('error', reject);

        server.listen(3001);
    });
}

createServer().then((server) => {
    console.log('started');
    var socket = io(server);

    socket.on('connection', socket => {
        socket.emit('hello', `Hello, I am new user with ID: ${socket.id}`);

        socket.on('message', message => {
            console.log(message);
        });
        socket.on('prompt', ({ line: message, session }) => {
            console.log('prompt message', message);
            if(_.startsWith(message, '/register')) {
                let prompt = _.split(message, ' ');
                let username = prompt[1];
                let pass = prompt[2];
                let userExists = false;

                for (var i = 0; i < users.length; i++) {
                    if(isUser(users[i], username)) {
                        userExists = true;
                    }
                }
                if (userExists) {
                    socket.emit('exists', username);
                } else {
                    createUser(username, pass);
                    socket.emit('created', username);
                }
            } else if (_.startsWith(message, '/login')) {
                let prompt = _.split(message, ' ');
                let username = prompt[1];
                let pass = prompt[2];
                let logged = false;

                for (var i = 0; i < users.length; i++) {
                    if (username === users[i].username && pass ===  users[i].pass) {
                        logged = true;
                    }
                }
                if (logged) {
                    let session = uuidV4();
                    sessions = [...session];
                    socket.emit('login success', username, session);
                } else {
                    socket.emit('login failure', username);
                }
            }
            else {
                // spr czy hash jest w sessions
                // tak -> pisze
                // nie -> warning musisz sie zalogowac
                socket.broadcast.emit('prompt', message);
            }
        });
    });
}).catch((error) => {
    console.log('erorr', error);
});

function isUser(user, username) {
    return username === user.username;
}

function createUser(username, pass) {
    users = [...users, {username, pass}];
}
