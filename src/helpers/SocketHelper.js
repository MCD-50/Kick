import { getStoredDataFromKey } from './AppStore.js';
import { SERVER_URL } from '../constants/AppConstant.js';
import SocketClient from './SocketClient.js';

const socket = new SocketClient();

function initializeSocket(callback) {
    getStoredDataFromKey(SERVER_URL)
        .then((socket_url) => {
            callback(socket_url);
        });
}

export default (callback) => {
    socket.onConnect(() => console.log('Connected.'))
    socket.onOpen(() => console.log('Connection opened.'))
    socket.onError((event) => console.log('Error occured.', event))
    socket.onClose((event) => console.log('Connection closed', event))
    socket.onMessage((msg) => callback(msg));
    socket.onNotification((noti) => callback(noti));

    initializeSocket((socket_url) => {
        socket.initSocket(socket_url);
    })

    const closeSocket = () => socket.disconnect()
    const joinRoom = (room_name) => socket.join_room(room_name);
    const leaveRoom = (room_name) => socket.leave_room(room_name);
    const sendMessage = (query) => {
        socket.sendMessage(query);
    }

    return { closeSocket, sendMessage, joinRoom, leaveRoom }
}

