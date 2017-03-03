
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
            notification: [],
            join: [],
            left: []
        }
    }

    onConnect(callback) { this.stateChangeCallbacks.connect.push(callback) }
    onOpen(callback) { this.stateChangeCallbacks.open.push(callback) }
    onClose(callback) { this.stateChangeCallbacks.close.push(callback) }
    onError(callback) { this.stateChangeCallbacks.error.push(callback) }
    onMessage(callback) { this.stateChangeCallbacks.message.push(callback) }
    onNotification(callback) { this.stateChangeCallbacks.notification.push(callback) }
    onJoin(callback) { this.stateChangeCallbacks.join.push(callback) }
    onLeft(callback) { this.stateChangeCallbacks.left.push(callback) }
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
        this.socket.on('joined_room', (msg) => this.onJoinedRoom(msg));
        this.socket.on('left_room', (msg) => this.onLeftRoom(msg));
    }

    onJoinedRoom(msg) {
        console.log('joined_room')
        let callbacks = this.stateChangeCallbacks.join;
        callbacks.forEach(callback => callback());
    }

    onLeftRoom(msg) {
        console.log('left_room')
        let callbacks = this.stateChangeCallbacks.left;
        callbacks.forEach(callback => callback());
    }

    onConnectInternal() {
        let callbacks = this.stateChangeCallbacks.connect;
        callbacks.forEach(callback => callback());
    }

    onOpenInternal() {
        console.log('Open', e);
        let callbacks = this.stateChangeCallbacks.open;
        callbacks.forEach(callback => callback());
    }

    onErrorInternal(e) {
        console.log('Error', e);
        let callbacks = this.stateChangeCallbacks.error;
        callbacks.forEach(callback => callback(e));
    }

    onCloseInternal(e) {
        console.log('Closed', e)
        let callbacks = this.stateChangeCallbacks.close;
        callbacks.forEach(callback => callback(e));
    }

    onMessageInternal(msg) {
        console.log(msg);
        let callbacks = this.stateChangeCallbacks.message;
        callbacks.forEach(callback => callback(msg));
    }

    onNotificationInternal(noti) {
        let callbacks = this.stateChangeCallbacks.notification;
        callbacks.forEach(callback => callback(noti));
    }

    //query is object which contains the various params needed by server.

    sendMessage(query) {
        //emit message to server directly.
        this.socket.emit('message_from_client', query);
    }

    joinRoom(room_name) {
        //console.log(room_name)
        //console.log(this.stateChangeCallbacks);
        this.socket.emit('join_room', room_name);
    }

    leaveRoom(room_name) {
        //console.log(room_name);
        //console.log(this.stateChangeCallbacks);
        this.removeDummyCallbacks();
        this.socket.emit('leave_room', room_name);
    }

    removeDummyCallbacks() {
        if (this.stateChangeCallbacks.connect.length > 1) {
            let index = this.stateChangeCallbacks.connect.length - 1;
            this.stateChangeCallbacks.connect = this.stateChangeCallbacks.connect.splice(index, 1);
        }
        if (this.stateChangeCallbacks.open.length > 1) {
            let index = this.stateChangeCallbacks.open.length - 1;
            this.stateChangeCallbacks.open = this.stateChangeCallbacks.open.splice(index, 1);
        }
        if (this.stateChangeCallbacks.close.length > 1) {
            let index = this.stateChangeCallbacks.close.length - 1;
            this.stateChangeCallbacks.close = this.stateChangeCallbacks.close.splice(index, 1);
        }
        if (this.stateChangeCallbacks.error.length > 1) {
            let index = this.stateChangeCallbacks.error.length - 1;
            this.stateChangeCallbacks.error = this.stateChangeCallbacks.error.splice(index, 1);
        }
        if (this.stateChangeCallbacks.message.length > 1) {
            let index = this.stateChangeCallbacks.message.length - 1;
            this.stateChangeCallbacks.message = this.stateChangeCallbacks.message.splice(index, 1);
        }
        if (this.stateChangeCallbacks.notification.length > 1) {
            let index = this.stateChangeCallbacks.notification.length - 1;
            this.stateChangeCallbacks.notification = this.stateChangeCallbacks.notification.splice(index, 1);
        }
        if (this.stateChangeCallbacks.join.length > 1) {
            let index = this.stateChangeCallbacks.join.length - 1;
            this.stateChangeCallbacks.join = this.stateChangeCallbacks.join.splice(index, 1);
        }
        if (this.stateChangeCallbacks.left.length > 1) {
            let index = this.stateChangeCallbacks.left.length - 1;
            this.stateChangeCallbacks.left = this.stateChangeCallbacks.left.splice(index, 1);
        }
    }
}


export default SocketClient;





