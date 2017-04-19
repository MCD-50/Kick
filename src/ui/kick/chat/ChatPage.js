import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	BackAndroid,
	Alert
} from 'react-native';

import Fluxify from 'fluxify';
import { AirChatUI } from '../../customUI/airchat/AirChatUI.js';
import { Message } from '../../../models/Message.js';
import SendUI from '../../customUI/SendUI.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FULL_NAME } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { ActionName } from '../../../enums/ActionName.js';
import Progress from '../../customUI/Progress.js';
import StateHelper from '../../../helpers/StateHelper.js';
import StateClient from '../../../helpers/StateClient.js';
window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';
import Toast from '../../customUI/Toast.js';
import Communications from '../../customUI/airchat/Communication.js';

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

let menuItems = ['View info', 'Clear chat', 'Mail chat']

class ChatPage extends Component {
	constructor(params) {
		super(params);
		const chat = this.props.route.chat;
		this.state = {
			chat: chat,
			isLoading: true,
			messages: [],
			owner: this.props.route.owner,
			isGroupChat: chat.info.chat_type == Type.GROUP,
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.updateFluxState = this.updateFluxState.bind(this);
		this.updateFluxStateMessages = this.updateFluxStateMessages.bind(this);
		this.onChatListItemChanged = this.onChatListItemChanged.bind(this);
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

		this.showAlert = this.showAlert.bind(this);
		this.clearChat = this.clearChat.bind(this);
		this.mailChat = this.mailChat.bind(this);
		this.viewChatInfo = this.viewChatInfo.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		StateHelper.removeChatItemListChanged();
		this.removeBackEvent();
	}


	componentDidMount() {
		this.setUsers();
		StateHelper.setOnChatItemListChanged(this.onChatListItemChanged);
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
		const currentChatMessages = StateClient.currentChatMessages;
		let title = null;
		if (currentChatMessages.length > 0) {
			sub_title = currentChatMessages[0].text;
		} else {
			sub_title = 'No new message';
		}
		chat = Object.assign({}, chat, {
			sub_title: sub_title,
			info: {
				...chat.info,
				new_message_count: null
			}
		});
		DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat, (msg) => {
			console.log(msg);
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
	}

	updateFluxStateMessages(messages) {
		Fluxify.doAction('updateCurrentChatMessages', messages);
	}

	onChatListItemChanged(chatItemList) {
		if (Page.CHAT_PAGE.id == StateClient.currentPageId)
			this.setStateData(chatItemList);
	}

	setStateData(messages) {
		this.setState({
			isLoading: false,
			messages: messages,
		})
		if (this.state.chat.info.chat_type == Type.BOT && messages.length > 0) {
			this.setState({ info: messages[0].info });
		}
	}

	setUsers() {
		let chat = this.state.chat;
		if (this.state.isGroupChat) {
			InternetHelper.getAllUsersInRoom(this.state.owner.domain, chat.info.room, (users) => {
				if (users) {
					users = users.map((n) => {
						return {
							title: n.title,
							email: n.email,
						}
					});
					chat = Object.assign({}, chat, {
						info: {
							...chat.info,
							users: users
						}
					});
					this.setState({ chat: chat });
					Fluxify.doAction('updateCurrentChat', chat);
				}
			});
		} else if (chat.info.chat_type == Type.PERSONAL) {
			InternetHelper.setAllUsersInRoom(this.state.owner.domain, chat.info.users,
				chat.info.room, chat.info.chat_type)
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
		Fluxify.doAction('updateCurrentChat', chat);
		DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat, (msg) => {
			console.log('chat page', msg);
			DatabaseHelper.addNewChatItem([item], (msg) => {
				console.log('chat page', msg);
			})
		});
	}

	onSend(messages = [], item_id = null) {
		console.log(messages)
		InternetHelper.checkIfNetworkAvailable((isConnected) => {
			if (isConnected) {
				this.storeChatItemInDatabase(messages[0], null);
				this.updateFluxStateMessages(messages.concat(this.state.messages));
				let chat_title = this.state.chat.info.chat_type == Type.PERSONAL ? this.state.owner.userName
					: this.state.chat.title;
				let obj = CollectionUtils.prepareBeforeSending(this.state.chat.info.chat_type,
					chat_title, this.state.chat.info.room, messages[0], null, item_id,
					this.state.chat.info.chat_type == Type.BOT ? 0 : 1);
				InternetHelper.sendData(this.state.owner.domain, obj, this.state.owner.userId);
			}
		})
	}

	onViewInfo(message, item = null) {
		let page = Page.VIEW_INFO_PAGE;
		if (message.info.base_action == 'create_')
			page = Page.EDIT_INFO_PAGE;
		const data = item == null ? message.info.items[0] : item;
		console.log(data);
		this.props.navigator.push({
			id: page.id,
			name: page.name,
			item: data,
			botName: this.state.chat.title,
			owner: this.state.owner,
			message: message,
			callback: this.callback
		});
	}

	onViewMore(message) {
		let page = Page.VIEW_MORE_PAGE;
		this.props.navigator.push({
			id: page.id,
			name: page.name,
			botName: this.state.chat.title,
			owner: this.state.owner,
			message: message,
			callback: this.callback
		});
	}

	onItemClicked(message, index) {
		this.onViewInfo(message, message.info.items[index]);
	}

	callback(data = null) {
		if (data && data.message) {
			this.onSend([data.message], data.item_id);
		}
		Fluxify.doAction('updateCurrentChatMessages', StateClient.currentChatMessages);
	}

	renderSend(props) {
		return (<SendUI {...props } />);
	}

	showAlert(title, body) {
		Alert.alert(
			title,
			body,
			[{
				text: 'OK', onPress: () => {
					this.setState({ isLoading: true });
					DatabaseHelper.removeChatItemsByQuery({
						chat_room: this.state.chat.info.room
					}, (results) => {
						this.setState({ isLoading: false });
						Fluxify.doAction('updateCurrentChatMessages', []);
						Toast.show('All Message deleted');

					});
				}
			},
			{
				text: 'CANCEL', onPress: () => {
					console.log('CANCEL Pressed');
				}
			}]
		);
	}

	clearChat() {
		this.showAlert(null, 'Are you sure you want to delete all messages in this chat?');
	}

	mailChat() {
		let chats = '';
		StateClient.currentChatMessages.map((msg) => {
			chats += msg.user.name + '\n' + msg.text + '\n\n';
		});
		Communications.email([this.state.owner.userId], null, null, this.state.chat.title + ' chats', chats.toString());
	}

	viewChatInfo() {
		let page = null;
		switch (this.state.chat.info.chat_type) {
			case Type.BOT:
				page = Page.BOT_INFO_PAGE;
				break;
			case Type.GROUP:
				page = Page.GROUP_INFO_PAGE;
				break;
			case Type.PERSONAL:
				page = Page.CONTACT_INFO_PAGE;
				break;
			default:
				break;
		}
		if (page) {
			this.props.navigator.push({
				id: page.id,
				name: page.name,
				data: this.state.chat,
				owner: this.state.owner,
				callback: this.callback
			});
		}
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
					onRightElementPress={(action) => {
						switch (action.index) {
							case 0:
								this.viewChatInfo();
								break;
							case 1:
								this.clearChat();
								break;
							case 2:
								this.mailChat();
								break;
							default:
								break;
						}
					}} />

				<AirChatUI
					messages={this.state.messages}
					onSend={this.onSend}
					user={{
						_id: this.state.owner.userId,
						name: this.state.owner.userName,
					}}
					info={{
						base_action: null,
						button_text: null,
						is_interactive_chat: null,
						is_interactive_list: null,
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

