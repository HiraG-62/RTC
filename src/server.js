const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const Clients = require('./clients')

const clients = new Map();

wss.on('connection', function (ws) {
    console.log('connected')
    ws.on('message', function (message) {
        let data = JSON.parse(message);
        switch(data.type) {
            case "join":
                const client = new Clients(data.id, data.name, ws);
                clients.set(data.id, client);
                console.log("joined: " + clients.get(data.id).getId());
                break;
            case "request":
                data = {"name": "HiraG", "content": { "volume": 0.5}};
                ws.send(JSON.stringify(data))
                console.log(ws)
                break;
            default:
                console.log(clients.get(data.id).getName());
                break;
        }
    })

    ws.on('close', function () {
        try {
            clients.delete(id);
            console.log("success delete");
        } catch(err) {
            console.log("failed delete");
        }
    })
})

server.listen(3000, () => {
    console.log('WebSocket Server is running on port 3000');
});