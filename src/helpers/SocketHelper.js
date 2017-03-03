import { getStoredDataFromKey } from './AppStore.js';
import { SERVER_URL } from '../constants/AppConstant.js';
import SocketClient from './SocketClient.js';


function initializeSocket(callback) {
    getStoredDataFromKey(SERVER_URL)
        .then((socket_url) => {
            callback(socket_url);
        });
}

const socket = new SocketClient();
export default (socket_message_callback, socket_connect_callback, socket_room_joined_callback) => {

    initializeSocket((socket_url) => {
        socket.onConnect(() => {
            console.log('Connected.');
            socket_connect_callback();
        });
        socket.onOpen(() => console.log('Connection opened.'))
        socket.onError((event) => console.log('Error occured.', event))
        socket.onClose((event) => console.log('Connection closed', event))
        socket.onMessage((msg) => socket_message_callback(msg));
        socket.onNotification((noti) => socket_message_callback(noti));
        socket.onJoin(() => socket_room_joined_callback())
        socket.initSocket(socket_url);
    })

    const closeSocket = () => socket.disconnect()
    const joinRoom = (room_name) => socket.joinRoom(room_name);
    const leaveRoom = (room_name) => socket.leaveRoom(room_name);
    const sendMessage = (query) => {
        socket.sendMessage(query);
    }

    return { closeSocket, sendMessage, joinRoom, leaveRoom }
}

