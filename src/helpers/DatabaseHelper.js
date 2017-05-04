//import from app
import DB from './DatabaseClient.js';
import { Type } from '../enums/Type.js';


class DatabaseHelper {

	checkIfChatExists(data, callback) {
		this.getChatByQuery({ room: room }, (results) => {
			if (results && results.length > 0)
				callback(true, { room: room });
			else
				callback(false, null);
		});
	}

	getAllChats(callback) {
		return DB.CHATS.get_all((results) => {
			callback(results);
		});
	}

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
		this.getAllChatItemForChatByChatRoomInternal(chatIds, callback);
	}

	getAllChatItemForChatByChatRoomInternal(chatIds, callback) {
		let length = chatIds.length;
		if (length == 0) {

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

	addNewChat(datas, callback = null, forceUpdate = false) {
		this.addNewChatInternal(datas, callback, forceUpdate);
	}

	addNewChatInternal(_datas, callback, forceUpdate) {
		const datas = _datas.slice();
		let length = datas.length;
		if (length == 0) {
			if (callback)
				callback('Added Chats');
			return;
		}
		this.checkIfChatExists(datas[length - 1].info.room, (val, query) => {
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
		this.addNewChatItemInternal(datas, callback);
	}

	addNewChatItemInternal(_datas, callback) {
		const datas = _datas.slice();
		let length = datas.length;
		if (length == 0) {
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
		this.updateChatByQueryInternal(query, data, callback);
	}

	updateChatByQueryInternal(query, data, callback) {
		DB.CHATS.update(query, data, (results) => {
			callback(results);
		})
	}


	//delete operation on chats and chatItems; 
	removeChatByQuery(rooms, callback) {
		this.removeChatByQueryInternal(rooms, callback);
	}

	removeChatByQueryInternal(_rooms, callback) {
		const rooms = _rooms.slice();
		let length = rooms.length;
		if (length == 0) {
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

	eraseEverything(callback) {
		DB.CHATS.erase_db((x) => {
			DB.CHATITEMS.erase_db((y) => {
				callback('done');
			})
		})
	}
}

const database = new DatabaseHelper();
export default database;  