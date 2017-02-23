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

    checkIfExists(data, callback) {

        if (data.info.chatType == Type.BOT) {
            this.getChatByQuery({ title: data.title }, (results) => {
                if (results.length > 0)
                    callback(true, { title: data.title });
                else
                    callback(false, { title: data.title });
            })
        }

        else if (data.info.chatType == Type.GROUP) {
            this.getChatByQuery({ title: data.title }, (results) => {
                if (results.length > 0)
                    callback(true, { title: data.title });
                else
                    callback(false, { title: data.title });
            })
        }

        else if (data.info.chatType == Type.PERSONAL) {
            this.getChatByQuery({ email: data.personal.email }, (results) => {
                if (results.length > 0)
                    callback(true, { email: data.personal.email });
                else
                    callback(false, { email: data.personal.email });
            })
        } else {
            callback(false, null);
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


    getAllChatsByQuery(query, callback) {
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
    addNewChat(datas, callback, forceUpdate = false) {
        this.setLock(true);
        this.addNewChatInternal(datas, callback, forceUpdate);
    }

    addNewChatInternal(datas, callback, forceUpdate) {
        let length = datas.length;
        if (length == 0) {
            this.setLock(false);
            callback('Added chats');
            return;
        }

        this.checkIfExists(datas[length - 1], (val, query) => {
            if (val) {
                if (forceUpdate && query) {
                    let item = datas[length - 1];
                    DB.CHATS.update(query, { lastActive: item.info.lastActive }, (results) => {
                        datas.pop();
                        this.addNewChatInternal(datas, callback, forceUpdate);
                    })
                } else {
                    datas.pop();
                    this.addNewChatInternal(datas, callback, forceUpdate);
                }
            } else {
                DB.CHATS.add(datas[length - 1], (results) => {
                    datas.pop();
                    this.addNewChatInternal(datas, callback, forceUpdate);
                })
            }
        })
    }

    addNewChatItem(datas, callback) {
        this.setLock(true);
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
            this.removeChatItemsByQuery({ chatId: chatIds[length - 1] })
            this.removeChatByIdInternal(chatIds, callback);
        })
    }

    removeChatItemsByQuery(query, callback) {
        DB.CHATITEMS.remove(query, (results) => {
            callback();
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