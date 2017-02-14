import React from 'react';
import DB from './DatabaseUtils.js';
import { Type } from '../enums/Type.js';


class DatabaseHelper {
    constructor() {
        this.chats = [];
        this.isLocked = false;
    }

    setLock(val) {
        this.isLocked = val;
    }

    getLock() {
        return this.isLocked;
    }

    checkIfChatExists(data, callback) {

        if (data.type == Type.BOT) {
            this.getChatByQuery({ title: data.title }, (results) => {
                if (results.length > 0)
                    callback(true);
                else
                    callback(false);
            })
        }

        else if (data.type == Type.GROUP) {
            this.getChatByQuery({ title: data.title }, (results) => {
                if (results.length > 0)
                    callback(true);
                else
                    callback(false);
            })
        }

        else if (data.type == Type.PERSONAL) {
            this.getChatByQuery({ email: data.email }, (results) => {
                if (results.length > 0)
                    callback(true);
                else
                    callback(false);
            })
        } else {
            callback(false);
        }
    }


    // Read operation on chats and chatItems;

    getAllChats(callback) {
        this.setLock(true);
        return DB.CHATS.get_all((results) => {
            this.setLock(false);
            callback(results);
        });
    }

    //don't set lock over this.
    getChatByQuery(query, callback) {
        return DB.CHATS.get(query, (results) => {
            callback(results);
        })
    }

    getChatById(chatIds, callback) {
        this.items = [];
        this.setLock(true);
        this.getChatByIdInternal(chatIds, callback);
    }

    getChatByIdInternal(chatIds, callback) {

        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback(this.items);
            return;
        }

        DB.CHATS.get_id(chatIds[length - 1], (results) => {
            results.map((item) => this.items.push(item));
            chatIds.pop();
            this.getChatByIdInternal(chatIds, callback);
        })
    }

    getAllChatItemForChatByChatId(chatIds, callback) {
        this.items = [];
        this.setLock(true);
        this.getAllChatItemForChatByChatIdInternal(chatIds, callback);
    }

    getAllChatItemForChatByChatIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback(this.items);
            return;
        }

        DB.CHATITEMS.get({ chatId: chatIds[length - 1] }, (results) => {
            results.map((item) => this.items.push(item));
            chatIds.pop();
            this.getAllChatItemForChatByChatIdInternal(chatIds, callback);
        })
    }

    getChatItemById(chatIds, callback) {
        this.items = [];
        thid.setLock(true);
        this.getChatItemByIdInternal(chatIds, callback);
    }

    getChatItemByIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback(this.items);
            return;
        }

        DB.CHATITEMS.get_id(chatIds[length - 1], (results) => {
            results.map((item) => this.items.push(item));
            chatIds.pop();
            this.getChatItemByIdInternal(chatIds, callback);
        });
    }

    //create operation on chats and chatItems;
    addNewChat(datas, callback) {
        this.setLock(true);
        this.addNewChatInternal(datas, callback);
    }

    addNewChatInternal(datas, callback) {
        let length = datas.length;
        if (length == 0) {
            this.setLock(false);
            callback('Added chats');
            return;
        }

        this.checkIfChatExists(datas[length - 1], (val) => {
            if (val) {
                datas.pop();
                this.addNewChatInternal(datas, callback);
            } else {
                DB.CHATS.add(datas[length - 1], (results) => {
                    datas.pop();
                    this.addNewChatInternal(datas, callback);
                })
            }
        })
    }

    addNewChatItem(datas, callback) {
        this.setLock(true);
        console.log(datas);
        this.addNewChatItemInternal(datas, callback);
    }

    addNewChatItemInternal(datas, callback) {
        let length = datas.length;
        if (length == 0) {
            this.setLock(false);
            callback('Added chats');
            return;
        }
        DB.CHATITEMS.add(datas[length - 1], (results) => {
            console.log(results);
            datas.pop();
            this.addNewChatItemInternal(datas, callback);
        })
    }


    //update operation on chats and chatItems;

    updateChat(chatIds, datas, callback) {
        this.setLock(true);
        this.updateChatInternal(chatIds, datas, callback);
    }


    updateChatInternal(chatIds, datas, callback) {
        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback('Updated chats');
            return;
        }

        DB.CHATS.update_id(chatIds[length - 1], datas[length - 1], (results) => {
            chatIds.pop();
            datas.pop();
            this.updateChatInternal(chatIds, datas, callback);
        })
    }

    updateChatByQuery(query, data, callback) {
        this.setLock(true);
        this.updateChatByQueryInternal(query, data, callback);
    }


    updateChatByQueryInternal(query, data, callback) {
        DB.CHATS.update(query, data, (results) => {
            this.setLock(false);
            callback(results);
        })
    }


    //delete operation on chats and chatItems; 

    removeChatById(chatIds, callback) {
        this.setLock(true);
        this.removeChatByIdInternal(chatIds, callback);
    }


    removeChatByIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback('Removed chats');
            return;
        }
        DB.CHATS.remove_id(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.removeChatByIdInternal(chatIds, callback);
        })
    }



    removeChatItemById(chatIds, callback) {
        this.setLock(true);
        this.removeChatByIdInternal(chatIds, callback);
    }

    removeChatItemByIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            this.setLock(false);
            callback('Removed chats');
            return;
        }
        DB.CHATITEMS.remove_id(chatItemId, (results) => {
            chatIds.pop();
            this.removeChatItemByIdInternal(chatIds, callback);
        })
    }


}

const database = new DatabaseHelper();
export default database;  