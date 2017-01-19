import React, { Component } from 'react';

import DatabaseHelper from '../helper/DatabaseHelper.js';


class DatabaseWrapper extends Component {

    getAllChats(callback) {
        return DatabaseHelper.getAllChats((results) => {
            callback(results);
        });
    }


    addNewChatRecursively(datas, callback) {
        let length = datas.length;
        if (length == 0) {
            callback('Added chats');
            return;
        }

        DatabaseHelper.addNewChat(datas[length - 1], (results) => {
            datas.pop();
            this.addNewChatRecursively(datas, callback);
        })
    }

    getChatByIdRecursively(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Got chats');
            return;
        }
        DatabaseHelper.getChatById(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.getChatByIdRecursively(chatIds, callback);
        })
    }

    updateChatRecursively(chatIds, datas, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Updated chats');
            return;
        }
        DatabaseHelper.updateChat(chatIds[length - 1], datas[length - 1], (results) => {
            chatIds.pop();
            datas.pop();
            this.updateChatRecursively(chatIds, datas, callback);
        })
    }

    removeChatByIdRecursively(chatIds, callback) {
        let length = chatIds.length;        
        if (length == 0) {
            callback('Removed chats');
            return;
        }

        DatabaseHelper.removeChatById(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.removeChatByIdRecursively(chatIds, callback);
        })
    }

    getAllChatItemForChatByChatIdRecursively(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Got chat items');
            return;
        }

        DatabaseHelper.getAllChatItemForChatByChatId(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.getAllChatItemForChatByChatIdRecursively(chatIds, callback);
        })
    }

    addNewChatItemRecursively(datas, callback) {
        let length = datas.length;
        if (length == 0) {
            callback('Added chats');
            return;
        }

        DatabaseHelper.addNewChatItem(datas[length - 1], (results) => {
            datas.pop();
            this.addNewChatItemRecursively(datas, callback);
        })
    }

    getChatItemByIdRecursively(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Got chats');
            return;
        }
        DatabaseHelper.getChatItemById(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.getChatItemByIdRecursively(chatIds, callback);
        })
    }

    removeChatItemByIdRecursively(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Removed chats');
            return;
        }

        DatabaseHelper.removeChatItemById(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.removeChatItemByIdRecursively(chatIds, callback);
        })
    }
}

const databaseWrapper = new DatabaseWrapper();

export default databaseWrapper; 