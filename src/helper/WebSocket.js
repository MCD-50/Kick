
//'/socket.io/?transport=websocket'
///socket.io/?EIO=3&transport=polling&t=1485262678297-0
export function getWebSocket(url) {
    const ws = new WebSocket(url + '/socket.io/?transport=websocket');
    return ws;
}
