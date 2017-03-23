import React from 'react';
import DB from './DatabaseClient.js';
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
		if (data.info.chat_type == Type.BOT) {
			this.getChatByQuery({ room: data.info.room }, (results) => {
				if (results && results.length > 0)
					callback(true, { room: data.info.room });
				else
					callback(false, null);
			});
		} else {
			this.getChatByQuery({ room: data.info.room }, (results) => {
				if (results && results.length > 0)
					callback(true, { room: data.info.room });
				else
					callback(false, null);
			});
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

	getAllChatItemForChatByChatRoom(chatIds, callback) {
		this.items = [];
		this.setLock(true);
		this.getAllChatItemForChatByChatRoomInternal(chatIds, callback);
	}

	getAllChatItemForChatByChatRoomInternal(chatIds, callback) {
		let length = chatIds.length;
		if (length == 0) {
			this.setLock(false);
			callback(this.items);
			return;
		}

		DB.CHATITEMS.get({ chat_room: chatIds[length - 1] }, (results) => {
			results.map((item) => this.items.push(item));
			chatIds.pop();
			this.getAllChatItemForChatByChatRoomInternal(chatIds, callback);
		})
	}

	//create operation on chats and chatItems;

	addNewChat(datas, callback, forceUpdate = false) {
		this.setLock(true);
		this.addNewChatInternal(datas, callback, forceUpdate);
	}

	addNewChatInternal(_datas, callback, forceUpdate) {
		const datas = _datas.slice();
		let length = datas.length;
		if (length == 0) {
			this.setLock(false);
			callback('Added Chats');
			return;
		}
		this.checkIfChatExists(datas[length - 1], (val, query) => {
			//console.log(val, query);
			//console.log(datas);
			if (val) {
				if (forceUpdate && query) {
					DB.CHATS.update(query, datas[length - 1], (results) => {
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

	addNewChatItemInternal(_datas, callback) {
		const datas = _datas.slice();
		let length = datas.length;
		if (length == 0) {
			this.setLock(false);
			callback('Added Chat items')
			return;
		}

		DB.CHATITEMS.add(datas[length - 1], (results) => {
			datas.pop();
			this.addNewChatItemInternal(datas, callback);
		})

	}


	//update operation on chats and chatItems;

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
	removeChatByQuery(rooms, callback) {
		this.setLock(true);
		this.removeChatByQueryInternal(rooms, callback);
	}

	removeChatByQueryInternal(_rooms, callback) {
		const rooms = _rooms.slice();
		let length = rooms.length;
		if (length == 0) {
			this.setLock(false);
			callback('Removed chats');
			return;
		}

		DB.CHATS.remove(rooms[length - 1], (results) => {
			const chat_room = rooms[length - 1].room
			this.removeChatItemsByQuery({ chat_room: chat_room }, (results) => {
				rooms.pop();
				this.removeChatByQueryInternal(rooms, callback);
			});
		})
	}

	removeChatItemsByQuery(query, callback) {
		DB.CHATITEMS.remove(query, (results) => {
			callback(results);
		})
	}
}

const database = new DatabaseHelper();
export default database;  