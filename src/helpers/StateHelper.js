import StateClient from './StateClient.js';

class StateHelper {
	constructor() {
		this.stateChangeCallbacks = {
			chat: [],
			chat_items: [],
			item: []
		}
		StateClient.on('change:chatList', (chatList) => {
			this.onChatListChanged(chatList);
		});
		StateClient.on('change:currentChatMessages', (chatItemList) => {
			this.onChatListItemChanged(chatItemList);
		});
		StateClient.on('change:currentChat', (currentChat) => {
			this.onCurrentChatChanged(currentChat);
		});

	}

	onChatListChanged = (chatList) => {
		let callbacks = this.stateChangeCallbacks.chat;
		callbacks.forEach(callback => callback(chatList));
	}

	onChatListItemChanged = (chatItemList) => {
		let callbacks = this.stateChangeCallbacks.chat_items;
		callbacks.forEach(callback => callback(chatItemList));
	}

	onCurrentChatChanged = (currentChat) => {
		let callbacks = this.stateChangeCallbacks.item;
		callbacks.forEach(callback => callback(currentChat));
	}


	setOnChatListChanged = (callback) => {
		this.stateChangeCallbacks.chat.push(callback)
	}

	setOnChatItemListChanged = (callback) => {
		this.stateChangeCallbacks.chat_items.push(callback)
	}

	setOnCurrentChatChanged = (callback) => {
		this.stateChangeCallbacks.item.push(callback)
	}


	removeChatItemListChanged = () => {
		this.stateChangeCallbacks.chat_items.pop();
	}

	removeChatListChanged = () => {
		this.stateChangeCallbacks.chat.pop();
	}

	removeCurrentChatChanged = () => {
		this.stateChangeCallbacks.item.pop();
	}

}

const stateHelper = new StateHelper();
export default stateHelper;
