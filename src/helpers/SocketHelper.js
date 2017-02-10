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

//call is function which needs to be invoked;
//query object contains infomation about mesaage, user, room, callback
export default (query, callback) => {
    socket.onConnect(() => console.log('Connected.'))
    socket.onOpen(() => console.log('Connection opened.'))
    socket.onError((event) => console.log('Error occured.'))
    socket.onClose((event) => console.log('Connection closed'))
    socket.onMessage((msg) => console.log(msg));
    socket.onNotification((noti) => console.log(noti));

    initializeSocket((socket_url) => {
        socket.initSocket(socket_url);
    })

    const closeSocket = () => socket.disconnect()
    const sendMessage = (query) => {
        socket.sendMessage(query);
    }

    return { closeSocket, sendMessage }
}

