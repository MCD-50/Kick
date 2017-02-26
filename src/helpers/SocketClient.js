
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
        this.socket.on('message_from_server', (msg) => this.onMessageInternal(msg));
        this.socket.on('notification_from_server', (noti) => this.onNotificationInternal(noti));
        this.socket.on('joined_room', (msg) => console.log(msg));
        this.socket.on('left_room', (msg) => console.log(msg));
    }

    onConnectInternal() {
        let callbacks = this.stateChangeCallbacks.connect;
        this.stateChangeCallbacks.connect = [];
        callbacks.forEach(callback => callback());
    }

    onOpenInternal() {
        let callbacks = this.stateChangeCallbacks.open;
        this.stateChangeCallbacks.open = [];
        callbacks.forEach(callback => callback());
    }

    onErrorInternal(e) {
        let callbacks = this.stateChangeCallbacks.error;
        this.stateChangeCallbacks.error = [];
        callbacks.forEach(callback => callback(e));
    }

    onCloseInternal(e) {
        let callbacks = this.stateChangeCallbacks.close;
        this.stateChangeCallbacks.close = [];
        callbacks.forEach(callback => callback(e));
    }

    onMessageInternal(msg) {
        let callbacks = this.stateChangeCallbacks.message;
        this.stateChangeCallbacks.message = [];
        callbacks.forEach(callback => callback(msg));
    }

    onNotificationInternal(noti) {
        let callbacks = this.stateChangeCallbacks.notification;
        this.stateChangeCallbacks.notification = [];
        callbacks.forEach(callback => callback(noti));
    }

    //query is object which contains the various params needed by server.

    sendMessage(query) {
        //emit message to server directly.
        this.socket.emit('message_from_client', query);
    }

    join_room(room_name) {
        this.socket.emit('join_room', room_name);
    }

    leave_room(room_name) {
        this.socket.emit('leave_room', room_name);
    }

}


export default SocketClient;





