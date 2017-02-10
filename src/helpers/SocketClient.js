
import React from 'react';
window.navigator.userAgent = "react-native"
import io from 'socket.io-client/dist/socket.io';
import InternetHelper from './InternetHelper.js';
import ParseHelper from './ParseHelper.js';


class SocketClient {
    constructor() {
        this.socket = {};
        this.stateChangeCallbacks = {
            connect: [],
            open: [],
            close: [],
            error: [],
            message: [],
            notification: []
        }
    }

    onConnect(callback) { this.stateChangeCallbacks.connect.push(callback) }
    onOpen(callback) { this.stateChangeCallbacks.open.push(callback) }
    onClose(callback) { this.stateChangeCallbacks.close.push(callback) }
    onError(callback) { this.stateChangeCallbacks.error.push(callback) }
    onMessage(callback) { this.stateChangeCallbacks.message.push(callback) }
    onNotification(callback) { this.stateChangeCallbacks.notification.push(callback) }

    initSocket(socket_url) {
        this.socket = io(socket_url, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => this.onConnectInternal());
        this.socket.on('open', () => this.onOpenInternal());
        this.socket.on('error', (e) => this.onErrorInternal(e));
        this.socket.on('close', (e) => this.onCloseInternal(e));
        this.socket.on('bot_message_from_server', (msg) => this.onMessageInternal(msg));
        this.socket.on('notification_from_server', (noti) => this.onNotificationInternal(noti));
    }

    onConnectInternal() {
        this.stateChangeCallbacks.connect.forEach(callback => callback());
    }

    onOpenInternal() {
        this.stateChangeCallbacks.open.forEach(callback => callback());
    }

    onErrorInternal(e) {
        this.stateChangeCallbacks.error.forEach(callback => callback(e));
    }

    onCloseInternal(e) {
        this.stateChangeCallbacks.close.forEach(callback => callback(e));
    }

    onMessageInternal(msg) {
        this.stateChangeCallbacks.message.forEach(callback => callback(msg));
    }

    onNotificationInternal(noti) {
        this.stateChangeCallbacks.notification.forEach(callback => callback(noti));
    }

    //query is object which contains the various params needed by server.

    sendMessage(query) {
        //emit message to server directly.
        this.socket.emit('message_from_client', query);
    }

}


export default SocketClient;





