import React from 'react';
import DB from './DatabaseUtils.js';
import { Type } from '../enums/Type.js';
let chats = [];
class DatabaseHelper {

    // getAllBots(callback) {
    //     return DB.BOTS.get_all((results) => {
    //         callback(results);
    //     })
    // }

    // removeBotByName(names, callback) {
    //     let length = names.length;
    //     if (length == 0) {
    //         callback('Removed bot');
    //         return;
    //     }

    //     DB.BOTS.remove({ name: names[length - 1] }, function (results) {
    //         names.pop();
    //         this.removeBotByName(names, callback);
    //     })
    // }

    // addNewBot(datas, callback) {
    //     let length = datas.length;
    //     if (length == 0) {
    //         callback('Added bots');
    //         return;
    //     }

    //     DB.BOTS.add(datas[length - 1], function (results) {
    //         datas.pop();
    //         this.addNewBot(datas, callback);
    //     })
    // }

    getAllChats(callback) {
        return DB.CHATS.get_all((results) => {
            callback(results);
        });
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
            getChatByQuery({ email: data.email }, (results) => {
                if (results.length > 0)
                    callback(true);
                else
                    callback(false);
            })
        } else {
            callback(false);
        }
    }

    getChatByQuery(query, callback) {
        return DB.CHATS.get(query, (results) => {
            callback(results);
        })
    }

    addNewChat(datas, callback) {
        let length = datas.length;
        
        if (length == 0) {
            callback('Added chats');
            return;
        }

        this.checkIfChatExists(datas[length - 1], (val) => {
            if (val) {
                datas.pop();
                this.addNewChat(datas, callback);
            } else {
                DB.CHATS.add(datas[length - 1], (results) => {
                    datas.pop();
                    this.addNewChat(datas, callback);
                })
            }
        })

    }

    getChatById(chatIds, callback) {
        items = [];
        getChatByIdInternal(chatIds, callback);
    }

    getChatByIdInternal(chatIds, callback) {

        let length = chatIds.length;
        if (length == 0) {
            callback(items);
            return;
        }

        DB.CHATS.get_id(chatIds[length - 1], (results) => {
            items.push(results);
            chatIds.pop();
            this.getChatByIdInternal(chatIds, callback);
        })
    }


    // updateChat(chatIds, datas, callback) {
    //     let length = chatIds.length;
    //     if (length == 0) {
    //         callback('Updated chats');
    //         return;
    //     }

    //     DB.CHATS.update_id(chatIds[length - 1], datas[length - 1], function (results) {
    //         chatIds.pop();
    //         datas.pop();
    //         this.updateChat(chatIds, datas, callback);
    //     })
    // }


    removeChatById(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Removed chats');
            return;
        }
        DB.CHATS.remove_id(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.removeChatById(chatIds, callback);
        })
    }



    addNewChatItem(datas, callback) {
        let length = datas.length;
        if (length == 0) {
            callback('Added chats');
            return;
        }
        DB.CHATITEMS.add(datas[length - 1], (results) => {
            datas.pop();
            this.addNewChatItem(datas, callback);
        })
    }

    getAllChatItemForChatByChatId(chatIds, callback) {
        items = [];
        getAllChatItemForChatByChatIdInternal(chatIds, callback);
    }

    getAllChatItemForChatByChatIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback(items);
            return;
        }
        DB.CHATITEMS.get_id(chatIds[length - 1], (results) => {
            items.push(results);
            chatIds.pop();
            this.getAllChatItemForChatByChatIdInternal(chatIds, callback);
        })
    }

    getChatItemById(chatIds, callback) {
        items = [];
        getChatItemByIdInternal(chatIds, callback);
    }


    getChatItemByIdInternal(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback(items);
            return;
        }

        DB.CHATITEMS.get_id(chatIds[length - 1], (results) => {
            chatIds.pop();
            this.getChatItemByIdInternal(chatIds, callback);
        });
    }

    removeChatItemById(chatIds, callback) {
        let length = chatIds.length;
        if (length == 0) {
            callback('Removed chats');
            return;
        }
        DB.CHATITEMS.remove_id(chatItemId, (results) => {
            chatIds.pop();
            this.removeChatItemById(chatIds, callback);
        })
    }


}

const database = new DatabaseHelper();
export default database;  