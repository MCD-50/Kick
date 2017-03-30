import { Type } from '../enums/Type.js';

const bot_list = [
	{
		title: 'Todo',
		sub_title: 'No new message',
		info: {
			is_added_to_chat_list: true,
			chat_type: Type.BOT,
			room: null,
			new_message_count: 0,
			last_message_time: null,
			last_active: null,
			email: null,
			users: []
		}
	},
	{
		title: 'Note',
		sub_title: 'No new message',
		info: {
			is_added_to_chat_list: true,
			chat_type: Type.BOT,
			room: null,
			new_message_count: 0,
			last_message_time: null,
			last_active: null,
			email: null,
			users: []
		}
	},
	{
		title: 'User',
		sub_title: 'No new message',
		info: {
			is_added_to_chat_list: true,
			chat_type: Type.BOT,
			room: null,
			new_message_count: 0,
			last_message_time: null,
			last_active: null,
			email: null,
			users: []
		}
	}];

export const getBotList = () => {
	return bot_list;
}