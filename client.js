// client js
var io = require('socket.io-client');
var readline = require('readline');
var os = require('os');

// var socket = io('http://100.114.138.136:3001');
var socket = io('http://localhost:3001');

var user = {
    username: 'guest user',
    session: null
}

socket.on('hello', (message) => {
    writeLine(message);

});

socket.emit('greeting', 'Natalia');
socket.emit('message', 'Anyone wanna chat?! =)');

socket.on('prompt', message => {
    writeLine(`from broadcast: ${message}`);
});
socket.on('exists', username => {
    console.log(`user: ${username} already exists`);
});
socket.on('created', username => {
    console.log(`New user created: ${username}`);
});
socket.on('login success', (username, session) => {
    console.log(`Logged in successfully. Welome ${username}! Session ${session}`);
    user = {
        username,
        session
    }
    console.log(user);
});
socket.on('login failure', username => {
    console.log(`Failed to log user ${username}. Check credentials and try again.`);
});

socket.on('logged', () => {
    console.log(`logged user: ${username}`);
});

function writeLine(line) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(line + os.EOL);

    cli.prompt(true);
}


var cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

cli.setPrompt('>>> ');

cli.prompt();

cli.on('line', line => {
    writeLine(line);
    socket.emit('prompt', {line, session: user.session});
});
