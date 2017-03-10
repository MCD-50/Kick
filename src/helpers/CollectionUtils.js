
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
				sub_title: 'Make a todo',
				info: {
					is_added_to_chat_list: true,
					chat_type: Type.BOT,
					room: null,
					new_message_count: null,
					last_message_time: null,
					last_active: null,
				},
				person: null,
				group: null,
				bot: {
					description: 'Some random bot with some random description',
					commands: [
						{
							syntax: '/bot add todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot get todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot update todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot delete todo',
							command_description: 'Some random command with some random description'
						}]
				}
			},
			{
				title: 'Note',
				sub_title: 'Make a note',
				info: {
					is_added_to_chat_list: true,
					chat_type: Type.BOT,
					room: null,
					new_message_count: null,
					last_message_time: null,
					last_active: null,
				},
				person: null,
				group: null,
				bot: {
					description: 'Some random bot with some random description',
					commands: [
						{
							syntax: '/bot add todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot get todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot update todo',
							command_description: 'Some random command with some random description'
						}, {
							syntax: '/bot delete todo',
							command_description: 'Some random command with some random description'
						}]
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

	createChat = (title, sub_title, is_added_to_chat_list, chat_type, room, new_message_count, last_message_time, last_active, person = null, group = null, bot = null) => {
		let info = {
			is_added_to_chat_list: is_added_to_chat_list,
			chat_type: chat_type,
			room: room,
			new_message_count: new_message_count,
			last_message_time: last_message_time,
			last_active: last_active
		}
		return new Chat(title, sub_title,
			this.createChatInfoObject(info),
			this.createChatPersonObject(person),
			this.createChatGroupObject(group),
			this.createChatBotObject(bot));
	}

	createChatFromResponse = (response) => {
		if (response.is_bot == 'true') {
			const info = {
				is_added_to_chat_list: true,
				chat_type: Type.BOT,
				room: response.room,
				new_message_count: 1,
				last_message_time: response.created_on,
				last_active: this.getLastActive(response.created_on)
			}
			return new Chat(response.bot_name, response.text,
				info,
				this.createChatPersonObject(null),
				this.createChatGroupObject(null),
				this.createChatBotObject(null));
		} else {
			const info = {
				is_added_to_chat_list: true,
				chat_type: response.chat_type,
				room: response.room,
				new_message_count: 1,
				last_message_time: response.created_on,
				last_active: this.getLastActive(response.created_on)
			}
			const title = response.chat_type == Type.PERSONAL ? response.user_name : response.chat_title
			const person = response.chat_type == Type.PERSONAL ? {
				title: response.user_name,
				email: response.user_id,
				number: null
			} : {
					title: null,
					email: null,
					number: null
				};
			return new Chat(title, response.text,
				info,
				person,
				this.createChatGroupObject(null),
				this.createChatBotObject(null));
		}
	}

	convertToChat = (item, has_id) => {
		let chat = new Chat(item.title, item.sub_title,
			this.createChatInfoObject(item.info),
			this.createChatPersonObject(item.person),
			this.createChatGroupObject(item.group),
			this.createChatBotObject(item.bot));
		if (has_id)
			chat.setId(item._id);

		return chat;
	}

	createChatItemFromResponse = (response, chat_room, bot_id) => {
		if (response.is_bot == 'true') {
			let message = new Message(response.bot_name, bot_id, response.text,
				response.created_on, false,
				this.createChatItemInfo(JSON.parse(response.info)),
				this.createChatItemAction(JSON.parse(response.action)),
				this.createChatItemListItems(JSON.parse(response.list_items)));
			return new ChatItem(message, chat_room, Type.BOT);
		} else {
			let alert = response.is_alert == 'true' ? true : false;
			let message = new Message(response.user_name, response.user_id, response.text,
				response.created_on, alert,
				this.createChatItemInfo(null),
				this.createChatItemAction(null),
				this.createChatItemListItems(null));
			return new ChatItem(message, chat_room, response.chat_type);
		}
	}



	createChatItem = (user_name, user_id, text, created_on, is_alert, chat_room, chat_type, info = null, action = null, list_items = null) => {
		let message = new Message(user_name, user_id, text, created_on, is_alert,
			this.createChatItemInfo(info),
			this.createChatItemAction(action),
			this.createChatItemListItems(list_items));
		const chat_item = new ChatItem(message, chat_room, chat_type);
		return chat_item;
	}


	convertToChatItemFromAirChatMessageObject = (airChatObject, chat_room, chat_type) => {
		return this.createChatItem(airChatObject.user.name, airChatObject.user._id, airChatObject.text,
			this.getCreatedOn(), airChatObject.isAlert, chat_room, chat_type, airChatObject.info, airChatObject.action, airChatObject.listItems);
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
			action: this.createChatItemAction(chat_item.message.action),
			listItems: this.createChatItemListItems(chat_item.message.list_items)
		}

		return message;
	}


	createChatItemInfo = (info) => {

		if (info) {
			return {
				button_text: info.button_text,
				is_interactive_chat: info.is_interactive_chat,
				is_interactive_list: info.is_interactive_list
			}
		}

		return {
			button_text: null,
			is_interactive_chat: null,
			is_interactive_list: null
		}
	}

	createChatItemListItems = (list_items) => {
		if (list_items) {
			return {
				action_on_internal_item_click: list_items.action_on_internal_item_click,
				items: list_items.items
			}
		}
		return {
			action_on_internal_item_click: null,
			items: []
		}
	}

	createChatItemAction = (action) => {
		if (action) {
			return {
				base_action: action.base_action,
				action_on_button_click: action.action_on_button_click,
				action_on_list_item_click: action.action_on_list_item_click
			}
		}
		return {
			base_action: null,
			action_on_button_click: null,
			action_on_list_item_click: null
		}
	}

	createChatInfoObject = (info) => {
		return {
			is_added_to_chat_list: info.is_added_to_chat_list,
			chat_type: info.chat_type,
			room: info.room,
			new_message_count: info.new_message_count,
			last_message_time: info.last_message_time,
			last_active: info.last_active,
		}
	}

	createChatPersonObject = (personal) => {
		if (personal) {
			return {
				title: personal.title,
				email: personal.email,
				number: personal.number,
			}
		}
		return {
			title: null,
			email: null,
			number: null,
		}
	}

	createChatBotObject = (bot) => {
		if (bot) {
			return {
				description: bot.description,
				commands: bot.commands,
			}
		}
		return {
			description: null,
			commands: null,
		}
	}

	createChatGroupObject = (group) => {
		if (group) {
			return {
				people: group.people,
				peopleCount: (group.people != null) ? group.people.length : null,
			}
		}
		return {
			people: null,
			peopleCount: null,
		}
	}

	createChatBotCommandObject = (command) => {
		if (command) {
			return {
				syntax: command.syntax,
				command_description: command.command_description,
			}
		}
		return {
			syntax: null,
			command_description: null,
		}
	}

	prepareBeforeSending(chat_type, chat_title, room, airChatMessageObject, chatItem, item_id) {
		if (airChatMessageObject) {
			if (chat_type == Type.BOT) {
				return {
					"room": room,
					"user_id": airChatMessageObject.user._id,
					"is_bot": 'true',
					"bot_name": chat_title,
					"created_on": this.parseCreatedAt(airChatMessageObject.createdAt.toString()),
					"text": airChatMessageObject.text,
					"action": this.createChatItemAction(airChatMessageObject.action),
					"info": this.createChatItemInfo(airChatMessageObject.info),
					"list_items": this.createChatItemListItems(airChatMessageObject.listItems),
					"item_id": item_id
				}
			} else {
				return {
					"room": room,
					"is_bot": 'false',
					"created_on": this.parseCreatedAt(airChatMessageObject.createdAt.toString()),
					"user_name": airChatMessageObject.user.name,
					"user_id": airChatMessageObject.user._id,
					"text": airChatMessageObject.text,
					"is_alert": airChatMessageObject.isAlert ? "true" : "false",
					"chat_title": chat_title,
					"chat_type": chat_type
				}
			}
		} else if (chatItem) {
			if (chat_type == Type.BOT) {
				return {
					"room": room,
					"user_id": chatItem.message.user_id,
					"is_bot": 'true',
					"bot_name": chat_title,
					"created_on": chatItem.message.created_on,
					"text": chatItem.message.text,
					"page_count": page_count,
					"action": this.createChatItemAction(chatItem.message.action),
					"info": this.createChatItemInfo(chatItem.message.info),
					"list_items": this.createChatItemListItems(chatItem.message.listItems),
					"item_id": item_id
				}
			} else {
				return {
					"room": room,
					"is_bot": 'false',
					"created_on": chatItem.message.created_on,
					"user_name": chatItem.message.user_name,
					"user_id": chatItem.message.user_id,
					"text": chatItem.message.text,
					"is_alert": chatItem.message.is_alert ? "true" : "false",
					"chat_title": chat_title,
					"chat_type": chat_type
				}
			}
		} else {
			return null;
		}
	}

	prepareCallbackData = (text, item_id) => {
		return {
			item_id: item_id,
			text: text
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

	getUniqueItems = (listItems) => {
		var room = [];
		var arr = [];
		for (var i = 0; i < listItems.length; i++) {
			if (room.indexOf(listItems[i].room) < 0) {
				room.push(listItems[i].room);
				arr.push(listItems[i]);
			}
		}
		return arr;
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

	getSortedArrayByRoom = (listItems) => {
		listItems = listItems.map((n) => {
			if (typeof n.room == "object" && n.room != null) {
				return {
					...n,
					room: n.room.room_name
				}
			} else {
				return {
					...n,
					room: n.room
				}
			}
		})
		return listItems.sort((a, b) => {
			return a.room > b.room ? -1 : (b.room > a.room ? 1 : 0);
		})

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
}

const collection = new CollectionUtils();
export default collection;

