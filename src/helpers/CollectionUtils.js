
import { Chat } from '../models/Chat.js';
import { ChatItem } from '../models/ChatItem.js';
import { Message } from '../models/Message.js';
import { ActionName } from '../enums/ActionName.js';
import { Type } from '../enums/Type.js';

import Fluxify from 'fluxify';

import { EMAIL, FULL_NAME, DOMAIN } from '../constants/AppConstant.js';
import { getStoredDataFromKey } from './AppStore.js';
import DatabaseHelper from './DatabaseHelper.js';
import InternetHelper from './InternetHelper.js';


class CollectionUtils {

	getAllBots = () => {
		return [
			{
				title: 'Todo',
				sub_title: 'Some random bot with some random description',
				info: {
					is_added_to_chat_list: true,
					chat_type: Type.BOT,
					room: null,
					new_message_count: null,
					last_message_time: null,
					last_active: null,
					email: null,
					users: []
				}
			},
			{
				title: 'Note',
				sub_title: 'Some random bot with some random description',
				info: {
					is_added_to_chat_list: true,
					chat_type: Type.BOT,
					room: null,
					new_message_count: null,
					last_message_time: null,
					last_active: null,
					email: null,
					users: []
				}
			}];
	}

	addDefaultBots = (callback) => {
		let array = this.getAllBots();

		getStoredDataFromKey(EMAIL)
			.then((mail) => {
				let _array = array.map((bot) => {
					return Object.assign({}, bot, {
						info: {
							...bot.info,
							room: this.getRoom(mail, false, bot.title)
						}
					})
				});

				let items = _array.map((item) => {
					return this.convertToChat(item, false);
				});

				DatabaseHelper.addNewChat(items, (msg) => callback(), true);
			})
	}

	createChat = (title, sub_title, is_added_to_chat_list, chat_type, room, email, new_message_count = 0, last_message_time = null, last_active = null, users = []) => {
		let info = {
			is_added_to_chat_list: is_added_to_chat_list,
			chat_type: chat_type,
			room: room,
			new_message_count: new_message_count,
			last_message_time: last_message_time,
			last_active: last_active,
			email: email,
			users: users
		};
		return new Chat(title, sub_title, info);
	}


	createChatFromResponse = (response, email) => {
		if (response.meta.chat_type == Type.BOT) {
			const info = {
				is_added_to_chat_list: true,
				chat_type: Type.BOT,
				room: response.meta.room,
				new_message_count: 0,
				last_message_time: null,
				last_active: null,
				email: null,
				users: []
			};
			return new Chat(response.chat_items[0].bot_data.bot_name, response.chat_items[0].text, info);
		} else {
			let info = {
				is_added_to_chat_list: true,
				chat_type: response.meta.chat_type,
				room: response.meta.room,
				new_message_count: 0,
				last_message_time: null,
				last_active: null,
				email: null,
				users: response.meta.users
			}

			let title = null, users = null, email = null;
			if (response.meta.chat_type == Type.PERSONAL) {
				const item = response.meta.users.filter((mm) => mm.email != email)[0];
				title = item.title;
				email = item.email;
			} else {
				title = response.chat_items[0].chat_data.chat_title
				email = response.meta.owner;
			}

			info = Object.assign({}, info, {
				...info,
				email: email,
			});
			return new Chat(title, response.chat_items[0].text, info);
		}
	}

	convertToChat = (item, has_id) => {
		let chat = new Chat(item.title, item.sub_title, item.info);
		if (has_id)
			chat.setId(item._id);
		return chat;
	}

	getEmailForChat(users, owner) {
		for (const x of users) {
			if (x.email != owner.userId)
				return x.title;
		}
		return 'Unknown User';
	}

	getUserForRoom = (owner, others) => {
		if (others.length < 1)
			return []
		others.push({
			title: owner.userName,
			email: owner.userId
		});
		return others
	}

	createChatItemFromResponse = (response, chatToBeUpdated) => {
		if (chatToBeUpdated.info.chat_type == Type.BOT) {
			let message = new Message(response.bot_data.bot_name,
				chatToBeUpdated.title, response.text, response.created_on, false,
				this.createChatItemInfo(response.bot_data.info));
			return new ChatItem(message, chatToBeUpdated.info.room, Type.BOT);
		} else {
			let message = new Message(response.chat_data.user_name,
				response.chat_data.user_id, response.text,
				response.created_on, response.chat_data.is_alert,
				this.createChatItemInfo(null));
			return new ChatItem(message, chatToBeUpdated.info.room, chatToBeUpdated.info.chat_type);
		}
	}

	createChatItem = (user_name, user_id, text, created_on, is_alert, chat_room, chat_type, info = null) => {
		let message = new Message(user_name, user_id, text, created_on, is_alert,
			this.createChatItemInfo(info));
		const chat_item = new ChatItem(message, chat_room, chat_type);
		return chat_item;
	}

	convertToChatItemFromAirChatMessageObject = (airChatObject, chat_room, chat_type) => {
		return this.createChatItem(airChatObject.user.name, airChatObject.user._id, airChatObject.text,
			this.getCreatedOn(), airChatObject.isAlert, chat_room, chat_type, airChatObject.info);
	}


	convertToAirChatMessageObjectFromChatItem = (chat_item, is_group_chat) => {
		let message = {
			_id: Math.round(Math.random() * 1000000),
			text: chat_item.message.text,
			createdAt: chat_item.message.created_on,
			user: {
				_id: chat_item.message.user_id,
				name: chat_item.message.user_name,
			},
			isAlert: chat_item.message.is_alert,
			isGroupChat: is_group_chat,
			info: this.createChatItemInfo(chat_item.message.info),
		}
		return message;
	}


	createChatItemInfo = (info) => {
		if (info) {
			return {
				base_action: info.base_action,
				button_text: info.button_text,
				is_interactive_chat: info.is_interactive_chat,
				is_interactive_list: info.is_interactive_list,
				items: info.items
			}
		}

		return {
			base_action: null,
			button_text: null,
			is_interactive_chat: null,
			is_interactive_list: null,
			items: []
		}
	}

	prepareBeforeSending(chat_type, chat_title, room,
		airChatMessageObject, chatItem, item_id, add = 1) {
		if (airChatMessageObject) {
			if (chat_type == Type.BOT) {
				return {
					meta: {
						room: room,
						item_id: item_id,
						chat_type: Type.BOT,
						add: add,
						user_id: airChatMessageObject.user._id,
					},
					created_on: this.parseCreatedAt(airChatMessageObject.createdAt.toString()),
					text: airChatMessageObject.text,
					chat_data: null,
					bot_data: {
						bot_name: chat_title,
						info: this.createChatItemInfo(airChatMessageObject.info)
					}
				};
			} else {
				return {
					meta: {
						room: room,
						chat_type: chat_type,
						add: add,
						user_id: airChatMessageObject.user._id,
					},
					created_on: this.parseCreatedAt(airChatMessageObject.createdAt.toString()),
					text: airChatMessageObject.text,
					chat_data: {
						chat_title: chat_title,
						chat_type: chat_type,
						user_name: airChatMessageObject.user.name,
						user_id: airChatMessageObject.user._id,
						is_alert: airChatMessageObject.isAlert
					},
					bot_data: null
				};
			}
		} else if (chatItem) {
			if (chat_type == Type.BOT) {
				return {
					meta: {
						room: room,
						item_id: item_id,
						chat_type: Type.BOT,
						add: add,
						user_id: chatItem.message.user_id
					},
					created_on: chatItem.message.created_on,
					text: chatItem.message.text,
					chat_data: null,
					bot_data: {
						bot_name: chat_title,
						info: this.createChatItemInfo(chatItem.message.info)
					}
				};
			} else {
				return {
					meta: {
						room: room,
						chat_type: chat_type,
						add: add,
						user_id: chatItem.message.user_id
					},
					created_on: chatItem.message.created_on,
					text: chatItem.message.text,
					chat_data: {
						chat_title: chat_title,
						chat_type: chat_type,
						user_name: chatItem.message.user_name,
						user_id: chatItem.message.user_id,
						is_alert: chatItem.message.is_alert
					},
					bot_data: null
				};
			}
		} else {
			return null;
		}
	}


	getRoom = (ownerEmail, is_personal, title = null, targetEmail = null) => {
		ownerEmail = ownerEmail.toLowerCase().trim();
		if (is_personal) {
			targetEmail = targetEmail.toLowerCase().trim();
			return ownerEmail.length > targetEmail.length ? ownerEmail + targetEmail
				: (ownerEmail.length < targetEmail.length ? targetEmail + ownerEmail
					: this.resolveRoom(ownerEmail, targetEmail));
		} else {
			title = title.trim();
			return ownerEmail + 'bot@' + title;
		}
	}

	resolveRoom = (ownerEmail, targetEmail) => {
		return ownerEmail > targetEmail ? ownerEmail + targetEmail : targetEmail + ownerEmail;
	}


	getCreatedOn = () => {
		let today = new Date();
		var dd = today.getDate();
		if (dd.toString().length < 2)
			dd = '0' + dd.toString()
		var mm = parseInt(today.getMonth()) + 1;
		if (mm.toString().length < 2)
			mm = '0' + mm.toString();
		var yyyy = today.getFullYear();
		return yyyy + '-' + mm + '-' + dd + ' ' + this.parseTime(today.getHours(), today.getMinutes(), today.getSeconds())
	}


	parseTime = (hh, mm, ss) => {
		if (hh.toString().length < 2)
			hh = '0' + hh;
		if (mm.toString().length < 2)
			mm = '0' + mm;
		if (ss.toString().length < 2)
			ss = '0' + ss;
		return hh + ':' + mm + ':' + ss;
	}

	parseCreatedAt = (createdAt) => {
		let date = createdAt.split(' ');
		let mm = this.getMonth(-1, date[1]);
		if (mm.toString().length < 2)
			mm = '0' + mm.toString();
		let dd = date[2];
		if (dd.toString().length < 2)
			dd = '0' + dd.toString();
		let yyyy = date[3];
		let time = date[4].split(':');
		return yyyy + '-' + mm + '-' + dd + ' ' + this.parseTime(time[0], time[1], time[2]);
	}

	getTodayDate = () => {
		let today = new Date();
		var dd = today.getDate();
		if (dd.toString().length < 2)
			dd = '0' + dd.toString();
		var mm = today.getMonth();
		if (mm.toString().length < 2)
			mm = '0' + (parseInt(mm) + 1).toString();
		else
			mm = (parseInt(mm) + 1).toString();
		var yyyy = today.getFullYear();
		return yyyy + '-' + mm + '-' + dd
	}

	getMonth = (index, month = null) => {
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		if (index > -1) {
			return months[index];
		} else {
			for (let i = 0; i < months.length; i++) {
				if (months[i] == month)
					return i + 1;
			}
		}
	}

	getLastActive = (createdOn, getDateOnly = false) => {
		if (createdOn) {
			let dateArray = createdOn.split(' ');
			if (getDateOnly) {
				let array = dateArray[0].split('-');
				let month = months[parseInt(array[1]) - 1];
				return array[2] + ' ' + month + ', ' + array[0];
			}

			let today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth(); //January is 0!
			var yyyy = today.getFullYear();

			let day = parseInt(dateArray[0].split('-')[2]);
			if (dd == day) {
				return 'Last seen at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
			} else if (dd == day - 1) {
				return 'Last seen yesterday at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
			} else {
				let array = dateArray[0].split('-');
				let month = this.getMonth(parseInt(array[1]) - 1);
				return 'Last seen ' + array[2] + ' ' + month + ', ' + array[0];
			}
		} else {
			return 'Last seen recently';
		}
	}

	getSortedArrayByDate = (results) => {
		_results = results.filter(function (n) { return n.info.last_message_time != undefined });
		results = results.filter(function (n) { return n.info.last_message_time == undefined })
		_results = _results.sort((a, b) => {
			return a.info.last_message_time > b.info.last_message_time ? -1 : (b.info.last_message_time > a.info.last_message_time ? 1 : 0);
		})
		return _results.concat(results);
	}

	getSortedChatItems = (results) => {
		_results = results.filter(function (n) { return n.message.created_on != undefined });
		results = results.filter(function (n) { return n.message.created_on == undefined })
		_results = _results.sort((a, b) => {
			return a.message.created_on > b.message.created_on ? -1 : (b.message.created_on > a.message.created_on ? 1 : 0);
		});
		return _results.concat(results);
	}

	getUniqueItemsByChatRoom = (listItems) => {
		var room = [];
		var arr = [];
		for (var i = 0; i < listItems.length; i++) {
			if (room.indexOf(listItems[i].info.room) < 0) {
				room.push(listItems[i].info.room);
				arr.push(listItems[i]);
			}
		}
		return arr;
	}

	getText = (value) => {
		if (value && value.length > 0) {
			return value;
		} else {
			return "It's empty in here";
		}
	}

	capitalize(str) {
		var pieces = str.split(" ");
		for (var i = 0; i < pieces.length; i++) {
			var j = pieces[i].charAt(0).toUpperCase();
			pieces[i] = j + pieces[i].substr(1);
		}
		return pieces.join(" ");
	}

	getSortedResponseArrayByRoom = (listItems) => {
		return listItems.sort((a, b) => {
			return a.meta.room > b.meta.room ? -1 : (b.meta.room > a.meta.room ? 1 : 0);
		})
	}

	getUniqueResponseItems = (listItems) => {
		var room = [];
		var arr = [];
		for (var i = 0; i < listItems.length; i++) {
			if (room.indexOf(listItems[i].meta.room) < 0) {
				room.push(listItems[i].meta.room);
				arr.push(listItems[i]);
			}
		}
		return arr;
	}

	getIndexOfChatInChatListByRoom = (chatList, room) => {
		for (let i = 0; i < chatList.length; i++) {
			if (chatList[i].info.room == room)
				return i;
		}
		return -1;
	}

	pushNewDataAndSortArray = (listOfChats, chats) => {
		for (const x of chats) {
			let index = this.getIndexOfChatInChatListByRoom(listOfChats, x.info.room);
			if (index > -1) {
				listOfChats[index] = x;
			} else {
				listOfChats.push(x);
			}
		}
		return this.getSortedArrayByDate(listOfChats);
	}


	addAndUpdateContactList(users, userFetched, owner) {
		let newListOfUsers = [];
		for (user of userFetched) {
			const x = users.filter((n) => n.info.email == user.email);
			const last_active = this.getLastActive(user.last_active);
			const title = user.full_name ? user.full_name : "Unknown";
			const email = user.email;
			if (x && x.length > 0) {
				newListOfUsers.push(Object.assign({}, x[0], {
					title: title,
					info: {
						...x[0].info,
						last_active: last_active
					},
				}));
			} else {
				console.log('creating new');
				const users = this.getUserForRoom(owner,
					[{
						title: title,
						email: email
					}]);
				const chat = this.createChat(title, 'No new message', false, Type.PERSONAL,
					this.getRoom(owner.userId, true, null, email),
					email, 0, null, last_active, users);
				newListOfUsers.push(chat);
			}
		}
		return this.getUniqueItemsByChatRoom(newListOfUsers);
	}

}

const collection = new CollectionUtils();
export default collection;

