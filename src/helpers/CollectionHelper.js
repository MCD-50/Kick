//import from system
import Fluxify from 'fluxify';


//import from app
import { Chat } from '../models/Chat.js';
import { ChatItem } from '../models/ChatItem.js';
import { Message } from '../models/Message.js';
import { Type } from '../enums/Type.js';
import { CARROT, PETER_RIVER, WISTERIA, ALIZARIN, TURQUOISE, MIDNIGHT_BLUE } from '../constants/AppColor.js';

//prepare data before sending to server
export const prepareBeforeSending = (chat_type, chat_title, room, obj, item, add = 1) => {
	if (obj)
		return {
			meta: {
				room: room, chat_type: chat_type,
				email: obj.user._id, add: add
			},
			created_on: this.parseCreatedAt(obj.createdAt.toString()),
			text: obj.text,
			chat_data: {
				chat_title: chat_title, chat_type: chat_type,
				user_name: obj.user.name, user_id: obj.user._id,
				is_alert: obj.isAlert
			},
			communication: obj.communication
		};
	return {
		meta: {
			room: room, chat_type: chat_type,
			email: item.message.user_id, add: add
		},
		created_on: item.message.created_on,
		text: item.message.text,
		chat_data: {
			chat_title: chat_title, chat_type: chat_type,
			user_name: item.message.user.name, user_id: item.message.user_id,
			is_alert: item.message.is_alert
		},
		communication: item.message.communication
	}
}


function prepareInfo() {
	if (arguments.length > 0) {
		return {
			is_added_to_chat_list: arguments.length > 0 && typeof arguments[0] != 'object' ? arguments[0] : true,
			chat_type: arguments.length > 1 && typeof arguments[0] != 'object' ? arguments[1] : arguments[0].meta.chat_type,
			room: arguments.length > 2 && typeof arguments[0] != 'object' ? arguments[2] : arguments[0].meta.room,
			new_message_count: arguments.length > 3 && typeof arguments[0] != 'object' ? arguments[3] : 0,
			last_message_time: arguments.length > 4 && typeof arguments[0] != 'object' ? arguments[4] : null,
			last_active: arguments.length > 5 && typeof arguments[0] != 'object' ? arguments[5] : null,
			email: arguments.length > 6 && typeof arguments[0] != 'object' ? arguments[6]
				: (arguments[0].meta.raised_by == null || arguments[0].meta.meta.raised_by == undefined ? null : arguments[0].meta.meta.raised_by),
			users: arguments.length > 7 && typeof arguments[0] != 'object' ? arguments[7] : arguments[0].meta.users,
		}
	}
	return null
}


//creating chat in different situations
export const createChat = (title, sub_title, is_added_to_chat_list, chat_type, room, email, new_message_count = 0, last_message_time = null, last_active = null, users = []) => {
	return new Chat(title, sub_title, prepareInfo(is_added_to_chat_list, chat_type,
		room, email, new_message_count, last_message_time, last_active, email, users));
}

export const createChatFromResponse = (response, email) => {
	if (response.meta.chat_type == Type.COMMUNICATION) {
		return new Chat(response.meta.raised_by, response.meta.subject, prepareInfo(response));
	} else {
		let info = prepareInfo(response);
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



//creating chat chat_items
export const createChatItem = (user_name, user_id, text, created_on, is_alert, chat_room, chat_item_type, communication = null) => {
	const message = new Message(user_name, user_id, text, created_on, is_alert, createCommunication(communication))
	const chat_item = new ChatItem(message, chat_room, chat_item_type);
	return chat_item;
}


export const createChatItemFromResponse = (meta, response, chat) => {
	if (meta.chat_type == Type.COMMUNICATION) {
		const communication = createCommunication(response, meta);
		const message = new Message(meta.name, meta.email, response.text, response.created_on, false, communication);
		const chat_item = new ChatItem(message, chat.info.room, Type.COMMUNICATION);
		return chat_item;
	} else {
		const communication = createCommunication();
		const message = new Message(meta.name, meta.email, response.text, response.created_on, false, communication);
		const chat_item = new ChatItem(message, chat.info.room, chat.info.chat_type);
		return chat_item;
	}
}

const createCommunication = (communication = null, meta = null) => {
	if (response) {
		return { from_name: response.communication.from_name, from_email: response.communication.from_email, to_emails: response.communication.to_emails, subject: meta.subject, status: response.communication.status, attachments: response.communication.attachments, is_comment: response.communication.is_comment }
	}
	return { from_name: null, from_email: null, to_emails: [], subject: null, status: null, attachments: [], is_comment: false }
}

// createChatItem = (name, user_id, text, created_on, is_alert, chat_room, chat_type, info = null) => {
// 	let message = new Message(user_name, user_id, text, created_on, is_alert,
// 		this.createChatItemInfo(info));
// 	const chat_item = new ChatItem(message, chat_room, chat_type);
// 	return chat_item;
// }

export const convertToAirChatMessageObject = (chat_item, is_group_chat) => {
	return {
		_id: Math.round(Math.random() * 1000000),
		text: chat_item.message.text,
		createdAt: chat_item.message.created_on,
		user: {
			_id: chat_item.message.user_id,
			name: chat_item.message.user_name,
		},
		isAlert: chat_item.message.is_alert,
		isGroupChat: is_group_chat,
		communication: chat_item.message.communication,
	};
}

//add new contact
export const addAndUpdateContactList = (contacts, new_contacts, owner) => {
	let __list = [];
	for (u of new_contacts) {
		const x = contacts.filter((n) => n.info.email == u.email);
		const last_active = getLastActive(u.last_active);
		const title = u.full_name ? u.full_name : "Unknown";
		const email = u.email;
		let chat = null;
		if (x && x.length > 0) {
			chat = Object.assign({}, x[0], {
				title: title,
				info: {
					...x[0].info, last_active: last_active
				}
			});
		} else {
			const room = getRoom(owner.email, true, null, email);
			const array = [].push({ title: title, email: email });
			const users = pushAndGetUsersInRoom(owner, array);
			chat = createChat(title, 'No new message', false, Type.PERSONAL, email, 0, null, last_active, users);
		}
		__list.push(chat);
	}
	return pushNewDataAndSortArray(contacts, __list, true);
}

//time related functions
export const getLastActive = (createdOn, getDateOnly = false) => {
	if (createdOn) {
		let dateArray = createdOn.split(' ');
		if (getDateOnly) {
			let array = dateArray[0].split('-');
			let month = months[parseInt(array[1]) - 1];
			return array[2] + ' ' + month + ', ' + array[0];
		}

		const dd = new Date().getDate().toString();

		let day = parseInt(dateArray[0].split('-')[2]);
		if (dd == day) {
			return 'Last seen at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
		} else if (dd == day - 1) {
			return 'Last seen yesterday at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
		} else {
			let array = dateArray[0].split('-');
			let month = getMonth(parseInt(array[1]) - 1);
			return 'Last seen ' + array[2] + ' ' + month + ', ' + array[0];
		}
	} else {
		return 'Last seen recently';
	}
}

export const getCreatedOn = () => {
	let today = new Date();
	let dd = today.getDate().toString();
	let mm = (parseInt(today.getMonth()) + 1).toString();
	let yyyy = today.getFullYear().toString();
	if (dd.length < 2)
		dd = '0' + dd;
	if (mm.length < 2)
		mm = '0' + mm;
	return yyyy + '-' + mm + '-' + dd + ' ' + parseTime(today.getHours().toString(), today.getMinutes().toString(), today.getSeconds().toString())
}

export const parseCreatedAt = (createdAt) => {
	let date = createdAt.split(' ');
	let mm = this.getMonth(-1, date[1]);
	let dd = date[2].toString();
	let yyyy = date[3].toString();
	if (mm.length < 2)
		mm = '0' + mm;
	if (dd.length < 2)
		dd = '0' + dd;
	let time = date[4].split(':');
	return yyyy + '-' + mm + '-' + dd + ' ' + parseTime(time[0].toString(), time[1].toString(), time[2].toString());
}


export const parseTime = (hh, mm, ss) => {
	if (hh.length < 2)
		hh = '0' + hh;
	if (mm.length < 2)
		mm = '0' + mm;
	if (ss.length < 2)
		ss = '0' + ss;
	return hh + ':' + mm + ':' + ss;
}



export const getTodayDate = () => {
	let today = new Date();
	let dd = today.getDate().toString();
	let mm = today.getMonth().toString();
	let yyyy = today.getFullYear().toString();
	if (dd.length < 2)
		dd = '0' + dd;
	if (mm.length < 2)
		mm = '0' + (parseInt(mm) + 1).toString();
	else
		mm = (parseInt(mm) + 1).toString();
	return yyyy + '-' + mm + '-' + dd
}

export const getMonth = (index, month = null) => {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	if (index > -1) {
		return months[index];
	} else {
		for (var i = 0; i < months.length; i++) {
			if (months[i] == month)
				return i + 1;
		}
	}
}



//misc functions
export const pushAndGetUsersInRoom = (app_info, array) => {
	if (array.length < 1) return []
	return array.push({ title: app_info.name, email: app_info.email });
}

export const pushNewDataAndSortArray = (contacts, __list, sort_by_name = false) => {
	__list.forEach(xx => {
		let index = getIndexOfItemInArrayByRoom(contacts, x.info.room);
		if (index > -1) {
			contacts[index] = x;
		} else {
			contacts.push(x);
		}
	});
	if (sort_by_name)
		return getSortedArrayByTitle(contacts);
	return getSortedArrayByLastMessageTime(contacts);
}

export const getIndexOfItemInArrayByRoom = (array, room) => {
	for (let i = 0; i < array.length; i++) {
		if (chatList[i].info.room == room)
			return i;
	}
	return -1;
}

export const capitalizeText = (str) => {
	var pieces = str.split(/_| /);
	for (var i = 0; i < pieces.length; i++) {
		pieces[i] = pieces[i].charAt(0).toUpperCase() + pieces[i].substr(1);
	}
	return pieces.join(" ");
}

export const getTitle = (str) => {
	return (str.length > 1) ? str[0].toUpperCase() + str[1].toUpperCase() : (str.length > 0 ? str[0].toUpperCase() : 'UN');
}

export const getTextColor = (str) => {
	const array = [CARROT, PETER_RIVER, WISTERIA, ALIZARIN, TURQUOISE, MIDNIGHT_BLUE];
	return array[str.length % array.length];
}

export const getRoom = (owner_email, type, target_email = null, group_name = null) => {
	owner_email = owner_email.toLowerCase().trim();
	if (type == Type.PERSONAL) {
		target_email = target_email.toLowerCase().trim();
		return owner_email > target_email ? owner_email + target_email : target_email + owner_email;
	} else {
		return owner_email + 'group@' + group_name.replace(/\s/g, '').toLowerCase();
	}
}

export const checkIfResponseItemInChatListByRoom = (array, item) => {
	array = array.filter((n) => n.info.room == item.meta.room);
	return array.length > 0 ? array[0] : null;
}


//get unique array
export const getUniqueArrayByRoom = (array) => {
	let r = [], a = []
	for (var i = 0; i < array.length; i++) {
		if (r.indexOf(array[i].info.room) < 0) {
			r.push(array[i].info.room);
			a.push(array[i]);
		}
	}
	return arr;
}

export const getUniqueResponseArrayByRoom = (array) => {
	let r = [], a = []
	for (var i = 0; i < array.length; i++) {
		if (r.indexOf(array[i].meta.room) < 0) {
			r.push(array[i].meta.room);
			a.push(array[i]);
		}
	}
	return arr;
}

//sort related functions
export const getSortedArrayByLastMessageTime = (results) => {
	let _results = results.filter((n) => { return n.info.last_message_time != undefined });
	results = results.filter((n) => { return n.info.last_message_time == undefined });
	_results = _results.sort((a, b) => {
		return a.info.last_message_time > b.info.last_message_time ? -1 : (b.info.last_message_time > a.info.last_message_time ? 1 : 0);
	})
	return _results.concat(results);
}

export const getSortedArrayByCreatedOn = (results) => {
	let _results = results.filter((n) => { return n.message.created_on != undefined });
	results = results.filter((n) => { return n.message.created_on == undefined })
	_results = _results.sort((a, b) => {
		return a.message.created_on > b.message.created_on ? -1 : (b.message.created_on > a.message.created_on ? 1 : 0);
	});
	return _results.concat(results);
}

export const getSortedArrayByTitle = (results) => {
	return results.sort((a, b) => {
		return a.title > b.title ? 1 : (b.title > a.title ? -1 : 0);
	})
}

export const getSortedResponseArrayByRoom = (results) => {
	return results.sort((a, b) => {
		return a.meta.room > b.meta.room ? -1 : (b.meta.room > a.meta.room ? 1 : 0);
	})
}

