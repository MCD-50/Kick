import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	BackAndroid,
} from 'react-native';

import Fluxify from 'fluxify';
import { AirChatUI } from '../../customUI/airchat/AirChatUI.js';
import { Message } from '../../../models/Message.js';
import SendUI from '../../customUI/SendUI.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FIRST_NAME } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { ActionName } from '../../../enums/ActionName.js';
import Progress from '../../customUI/Progress.js';
import StateHelper from '../../../helpers/StateHelper.js';
import StateClient from '../../../helpers/StateClient.js';

window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';


const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	progress: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
};

const menuItems = [
	'View info', 'Clear chat', 'Mail chat'
]

let count = 0;
class ChatPage extends Component {
	constructor(params) {
		super(params);
		const chat = this.props.route.chat;
		//this.socket = {};
		this.state = {
			chat: chat,
			isLoading: true,
			messages: [],
			owner: this.props.route.owner,
			isGroupChat: chat.info.chat_type == Type.GROUP ? true : false,
			recentAction: {
				base_action: null,
				action_on_button_click: null,
				action_on_list_item_click: null
			},
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.updateFluxState = this.updateFluxState.bind(this);
		this.updateFluxStateMessages = this.updateFluxStateMessages.bind(this);
		this.onChatListItemChanged = this.onChatListItemChanged.bind(this);
		this.OnRecentActionChanged = this.OnRecentActionChanged.bind(this);
		this.storeChatItemInDatabase = this.storeChatItemInDatabase.bind(this);
		this.saveMessageOnSend = this.saveMessageOnSend.bind(this);

		this.setStateData = this.setStateData.bind(this);
		this.setUsers = this.setUsers.bind(this);
		this.renderSend = this.renderSend.bind(this);
		this.onSend = this.onSend.bind(this);


		this.onViewInfo = this.onViewInfo.bind(this);
		this.onViewMore = this.onViewMore.bind(this);
		this.onItemClicked = this.onItemClicked.bind(this);
		this.callback = this.callback.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		StateHelper.removeChatItemListChanged();
		StateHelper.removeRecentActionChanged();
		this.removeBackEvent();
	}


	componentDidMount() {
		this.setUsers();
		StateHelper.setOnChatItemListChanged(this.onChatListItemChanged);
		StateHelper.setOnRecentActionChanged(this.OnRecentActionChanged)
		DatabaseHelper.getAllChatItemForChatByChatRoom([this.state.chat.info.room], (results) => {
			let messages = results.map((result) => {
				return CollectionUtils.convertToAirChatMessageObjectFromChatItem(result, this.state.isGroupChat)
			});
			let chat = Object.assign({}, this.state.chat, {
				info: {
					...this.state.chat.info,
					new_message_count: null
				}
			});
			this.updateFluxState(messages.reverse(), chat);
		})
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.popAndSaveChat();
				return true;
			}
			return false;
		});
	}

	popAndSaveChat() {
		let chat = StateClient.currentChat ? StateClient.currentChat : this.state.chat
		chat = Object.assign({}, chat, {
			info: {
				...chat.info,
				new_message_count: null
			}
		});
		DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat, (msg) => {
			//console.log(msg);
		});
		this.props.navigator.pop();
		this.props.route.callback(Page.CHAT_PAGE, chat);
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.popAndSaveChat();
				return true;
			}
			return false;
		});
	}

	updateFluxState(messages, chat) {
		this.updateFluxStateMessages(messages);
		Fluxify.doAction('updateCurrentChat', chat);
		if (this.state.chat.info.chat_type == Type.BOT) {
			Fluxify.doAction('updateRecentAction', this.state.recentAction);
		}
	}

	updateFluxStateMessages(messages) {
		Fluxify.doAction('updateCurrentChatMessages', messages);
	}

	onChatListItemChanged(chatItemList) {
		if (Page.CHAT_PAGE.id == StateClient.currentPageId)
			this.setStateData(chatItemList);
	}

	OnRecentActionChanged(recentAction) {
		if (Page.CHAT_PAGE.id == StateClient.currentPageId)
			this.setState({ recentAction: recentAction });
	}

	setStateData(messages) {
		this.setState({
			isLoading: false,
			messages: messages,
			recentAction: this.state.recentAction,
		})
	}

	setUsers() {
		let chat = this.state.chat;
		if (chat.info.chat_type != Type.BOT) {
			let users = [];
			if (chat.info.chat_type == Type.GROUP) {
				users = chat.group.people;
				if (users && users.length > 0)
					InternetHelper.setAllUsersInRoom(this.state.owner.domain, users, this.state.chat.info.room);
				else {
					InternetHelper.checkIfNetworkAvailable((isConnected) => {
						if (isConnected) {
							InternetHelper.getAllUsersInRoom(this.state.owner.domain, chat.info.room, (users) => {
								if (users) {
									users = users.map((n) => CollectionUtils.createChatPersonObject(n));
									const group = CollectionUtils.createChatGroupObject({
										people: users,
									});
									chat = Object.assign({}, chat, {
										group: group
									});
									this.setState({ chat: chat });
									Fluxify.doAction('updateCurrentChat', chat);
								}
							});
						}
					})
				}
			} else if (chat.info.chat_type == Type.PERSONAL) {
				let owner = this.state.owner;
				let currentUser = {
					title: owner.userName,
					email: owner.userId,
					number: owner.number
				};
				users = [currentUser, chat.person];
				if (users && users.length > 0)
					InternetHelper.setAllUsersInRoom(this.state.owner.domain, users, this.state.chat.info.room);
			}
		}
	}

	storeChatItemInDatabase(airChatObject) {
		const chatItem = CollectionUtils.convertToChatItemFromAirChatMessageObject(airChatObject,
			this.state.chat.info.room, this.state.chat.info.chat_type);
		this.saveMessageOnSend(chatItem, this.state.chat);
	}

	saveMessageOnSend(item, chat) {
		chat = Object.assign({}, chat, {
			sub_title: item.message.text,
			info: {
				...chat.info,
				is_added_to_chat_list: true,
				last_message_time: item.message.created_on,
				new_message_count: null,
				last_active: CollectionUtils.getLastActive(item.message.created_on)
			}
		});
		console.log(chat);
		console.log(item);
		Fluxify.doAction('updateCurrentChat', chat);
		DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat, (msg) => {
			console.log('chat page', msg);
			DatabaseHelper.addNewChatItem([item], (msg) => {
				console.log('chat page', msg);
			})
		});
	}

	onSend(messages = [], item_id = null) {
		InternetHelper.checkIfNetworkAvailable((isConnected) => {
			if (isConnected) {
				this.storeChatItemInDatabase(messages[0], null);
				this.updateFluxStateMessages(messages.concat(this.state.messages));
				let chat_title = this.state.chat.info.chat_type == Type.PERSONAL ? this.state.owner.userName
					: this.state.chat.title;
				let obj = CollectionUtils.prepareBeforeSending(this.state.chat.info.chat_type,
					chat_title, this.state.chat.info.room, messages[0], null, item_id);
				InternetHelper.sendData(this.state.owner.domain, obj, this.state.owner.userId);
			}
		})
	}

	onViewInfo(message, item = null) {
		let page = Page.VIEW_INFO_PAGE;
		if (item == null)
			this.props.navigator.push({ id: page.id, name: page.name, data: message.listItems.items[0], callback: this.callback });
		else
			this.props.navigator.push({ id: page.id, name: page.name, data: item, callback: this.callback });
	}

	onViewMore(message) {
		let page = Page.VIEW_MORE_PAGE;
		this.props.navigator.push({
			id: page.id, name: page.name, botName: this.state.chat.title,
			owner: this.state.owner, message: message, callback: this.callback
		});
	}

	onItemClicked(message, index) {
		const item = message.listItems.items[index];
		if (message.action.base_action != 'delete_' && message.action.base_action != 'update_') {
			this.onViewInfo(null, item);
		} else if (message.action.base_action == 'delete_') {
			const owner = this.state.owner;
			message = Object.assign({}, message, {
				_id: Math.round(Math.random() * 1000000),
				text: item.text,
				createdAt: new Date(),
				user: {
					_id: owner.userId,
					name: owner.userName,
				}
			});
			//console.log(message, item);
			this.onSend([message], item.id);
		} else if (message.action.base_action == 'update_') {
			let page = Page.EDIT_INFO_PAGE;
			this.props.navigator.push({
				id: page.id, name: page.name, botName: this.state.chat.title,
				owner: this.state.owner, message: message, item: item, callback: this.callback
			});
		}
	}

	callback(data) {
		if (data) {
			Fluxify.doAction('updateCurrentChatMessages', StateClient.currentChatMessages);
			this.onSend([data.message], data.item_id);
		}
		// let message = CollectionUtils.createChatItem(this.state.owner.userName, this.state.owner.userId,
		// 	text, new Date(), null, null, null, null, null, null, null, null, null, this.state.chatId, Type.BOT);

		// switch (childActionName) {
		// 	case ActionName.DELETE_ITEM:
		// 		this.onBotMessageSend([message], name, ActionName.DELETE, childActionName, 0);
		// 		break;
		// 	case ActionName.UPDATE_ITEM:
		// 		this.onBotMessageSend([message], name, ActionName.UPDATE, childActionName, 0);
		// 		break;
		// }
	}

	renderSend(props) {
		return (
			<SendUI {...props } />
		)
	}

	render() {
		return (
			<View style={styles.container}>

				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.popAndSaveChat();
					}}
					centerElement={this.state.chat.title}
					rightElement={{
						menu: { labels: menuItems },
					}}

					onRightElementPress={(action) => { }} />

				<AirChatUI
					messages={this.state.messages}
					onSend={this.onSend}
					user={{
						_id: this.state.owner.userId,
						name: this.state.owner.userName,
					}}
					info={{
						button_text: null,
						is_interactive_chat: null,
						is_interactive_list: null
					}}
					action={this.state.recentAction}
					listItems={{
						action_on_internal_item_click: null,
						items: []
					}}
					onViewInfo={this.onViewInfo}
					onViewMore={this.onViewMore}
					onItemClicked={this.onItemClicked}
					isAlert={false}
					isGroupChat={this.state.isGroupChat}

					keyboardDismissMode='interactive'
					enableEmptySections={true}
					renderSend={this.renderSend}
				/>
			</View>
		)
	}
}

ChatPage.propTypes = propTypes;

export default ChatPage;

