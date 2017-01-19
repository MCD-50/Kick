import React, { Component } from 'react';

import DB from '../utils/DatabaseUtils.js';

class DatabaseHelper extends Component {

    //chat related functions.
    getAllChats(callback) {
        DB.CHATS.get_all(function (results) {
            callback(results);
        });
    }

    updateChat(chatId, data, callback) {
        DB.CHATS.update_id(chatId, data, function (results) {
            callback(results);
        })
    }

    addNewChat(data, callback) {
        DB.CHATS.add(data, function (results) {
            callback(results);
        })
    }

    getChatById(chatId, callback) {
        DB.CHATS.get_id(chatId, function (results) {
            callback(results);
        })
    }

    removeChatById(chatId, callback) {
        DB.CHATS.remove_id(chatId, function (results) {
            callback(results);
        })
    }

    //chatitem related function
    getAllChatItemForChatByChatId(chatId, callback) {
        DB.CHATITEM.get_id(chatId, function (results) {
            callback(results);
        })
    }

    addNewChatItem(data, callback) {
        DB.CHATITEM.add(data, function (results) {
            callback(results);
        })
    }

    getChatItemById(chatItemId, callback) {
        DB.CHATITEM.get_id(chatItemId, function (results) {
            callback(results);
        })
    }

    removeChatItemById(chatItemId, callback) {
        DB.CHATITEM.remove_id(chatItemId, function (results) {
            callback(results);
        })
    }


    //remove database
    removeAllDatabaseItems(callback) {
        DB.CHATS.erase_db(function (results) {
            console.log(results);
            DB.CHATITEM.erase_db(function (results) {
                console.log(results);
            })
        })


    }

}

const databaseHelper = new DatabaseHelper();

export default databaseHelper;  