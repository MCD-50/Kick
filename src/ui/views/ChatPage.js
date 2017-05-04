//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableOpacity, BackAndroid } from 'react-native';

//import from app
import { Toolbar, Toast } from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { AirChatUI } from '../customUI/airchat/AirChatUI.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import { APP_INFO, SET_USERS_IN_ROOM } from '../../constants/AppConstant.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getTitle, getTextColor, getSortedArrayByLastMessageTime, getUniqueArrayByRoom, getTodayDate, pushNewDataAndSortArray, createChatItemFromResponse, convertToAirChatMessageObject, createChatFromResponse, checkIfResponseItemInChatListByRoom } from '../../helpers/CollectionHelper.js';
import { getData, setData } from '../../helpers/AsyncStore.js';
import { Type } from '../../enums/Type.js';
import { Message } from '../../models/Message.js';
import DatabaseHelper from '../../helpers/DatabaseHelper.js';
import SocketHelper from '../../helpers/SocketHelper.js';
import AlertHelper from '../../helpers/AlertHelper.js';
import SendUI from '../components/SendUI.js';
import Communications from '../customUI/airchat/Communication.js';
import Fluxify from 'fluxify';


const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired
};

let menuItems = ['View info', 'Clear chat']

class ChatPage extends Component {
	constructor(params) {
		super(params);
		const chat = this.props.route.data.chat;
		Fluxify.doAction('currentChat', chat);
		this.state = {
			chat: chat,
			isLoading: true,
			messages: this.props.messages || [],
			appInfo: this.props.route.data.appInfo,
			chat_type: chat.info.chat_type,
			is_personal_communication_chat: false,
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.popPage = this.popPage.bind(this);
		
		
		this.storeChatItemInDatabase = this.storeChatItemInDatabase.bind(this);
		this.saveMessageOnSend = this.saveMessageOnSend.bind(this);
		
		this.renderSend = this.renderSend.bind(this);
		this.onSend = this.onSend.bind(this);

		this.onRightElementPress = this.onRightElementPress.bind(this);
		this.onRespond = this.onRespond.bind(this);
		this.callback = this.callback.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			this.popPage();
		});
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			this.popPage();
		});
	}

	popPage() {
		if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
			if (this.props.route.data.callback) {
				let chat = this.props.chat;
				const messages = this.props.messages;
				chat = Object.assign({}, chat, {
					sub_title: messages.length > 0 ? messages[0].text : 'No new message',
					info: { ...chat.info, new_message_count: null }
				});
				DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat, (msg) => console.log(msg));
				this.props.route.data.callback(Page.CHAT_PAGE);
			}
			this.props.navigator.pop();
			return true;
		}
		return false;
	}

	componentDidMount() {
		let chat = this.state.chat;
		const is_group_chat = this.state.chat_type == Type.GROUP;
		if (is_group_chat) {
			const url = SET_USERS_IN_ROOM.format(this.state.appInfo.domain);
			const data = { room: chat.info.room };
			resolveRequest(url, data)
				.then((res) => {
					if (res && res.message && res.message.length > 0) {
						chat = Object.assign({}, chat, {
							info: {
								...chat.info,
								users: res.message.map((n) => {
									return {
										title: n.title,
										email: n.email,
									}
								})
							}
						});
						this.setState({ chat: chat });
					}
				}).catch((rej) => console.log(rej));

		} else if (this.state.chat.info.chat_type == Type.PERSONAL) {
			const url = SET_USERS_IN_ROOM.format(this.state.appInfo.domain);
			const data = { users: chat.info.users, room: chat.info.room, chat_type: chat.info.chat_type };
			resolveRequest(url, data)
				.then((res) => {
					console.log(res);
				}).catch((rej) => console.log(rej));
		}

		DatabaseHelper.getAllChatItemForChatByChatRoom([chat.info.room], (results) => {
			const messages = results.map((result) => convertToAirChatMessageObject(result, this.state.chat_type == Type.GROUP));
			let chat = Object.assign({}, chat, {
				info: { ...chat.info, new_message_count: null }
			});
			Fluxify.doAction('updateCurrentChat', chat);
			Fluxify.doAction('updateCurrentChatMessages', messages);
		})
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

	onRespond(message) {
		console.log(message);
	}

	renderSend(props) {
		return (<SendUI {...props } />);
	}

	onRightElementPress(action) {
		const index = action.index;
		if (index == 0) {
			this.props.navigator.push({
				id: this.state.chat_type == Type.GROUP ? Page.GROUP_INFO_PAGE.id : Page.CONTACT_INFO_PAGE.id,
				name: this.state.chat_type == Type.GROUP ? Page.GROUP_INFO_PAGE.name : Page.CONTACT_INFO_PAGE.name,
				data: {
					chat: this.state.chat,
					appInfo: this.state.appInfo,
					callback: this.callback
				}
			});
		} else if (index == 1) {
			AlertHelper.showAlert(null, 'Are you sure you want to delete all messages in this chat?',
				(data) => {
					if (data.ok) {
						DatabaseHelper.removeChatItemsByQuery({chat_room: this.state.chat.info.room}, 
							(results) => {
							Fluxify.doAction('updateCurrentChatMessages', []);
							Toast.show('All Message deleted');
						});
					}
				});
		}
	}

	render() {
		return (
			<View style={style.view_with_flex_1_and_margin_all_sides}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => this.popPage()}
					centerElement={this.state.chat.title}
					rightElement={{
						menu: { labels: menuItems },
					}}
					onRightElementPress={(action) => this.onRightElementPress()} />

				<AirChatUI
					messages={this.state.messages}
					onSend={this.onSend}
					user={{
						_id: this.state.appInfo.email,
						name: this.state.owner.user_name,
					}}
					communication={{
						from_name: null,
						from_email: null,
						to_emails: [],
						subject: null,
						status: null,
						attachments: [],
						is_comment: false
					}}
					isAlert={false}
					chatType={this.state.chat_type}
					isPersonalCommunicationChat={this.state.is_personal_communication_chat}
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

