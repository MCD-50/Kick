import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Alert,
	ListView,
	TouchableOpacity
} from 'react-native';
import SwipeListView from '../../customUI/SwipeListView.js';
import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { Page } from '../../../enums/Page.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FULL_NAME, DOMAIN, LAST_ACTIVE, IS_CHAT_MODE } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey, setData } from '../../../helpers/AppStore.js';
import Progress from '../../customUI/Progress.js';
import StateHelper from '../../../helpers/StateHelper.js';
import StateClient from '../../../helpers/StateClient.js';
import Toast from '../../customUI/Toast.js';
window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';


const styles = StyleSheet.create({
	base: {
		flex: 1
	},
	container: {
		flex: 1,
	},
	progress: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	rowBack: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	backRightBtn: {
		alignItems: 'flex-start',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		paddingLeft: 15,
		width: 120
	},
	backRightBtnRight: {
		backgroundColor: '#e63237',
		marginTop: 0,
		marginBottom: 1,
		right: 0
	},
});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	hasDefaultBots: PropTypes.bool,
	botList: PropTypes.array,
};

const menuItems = [
	'Contacts', 'New group', 'Profile', 'Settings'
]

const defaultProps = {
	hasDefaultBots: false,
	botList: [],
}

const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ChatListPage extends Component {

	constructor(params) {
		super(params);
		this.socket = {};
		this.state = {
			searchText: '',
			isLoading: true,
			chatList: [],
			dataSource: ds.cloneWithRows([]),
			title: 'Updating...',
			userId: '',
			userName: '',
			domain: '',
		};

		this.onSocketConnectCallback = this.onSocketConnectCallback.bind(this);
		this.onRoomJoinedCallback = this.onRoomJoinedCallback.bind(this);
		this.getMessageOnStart = this.getMessageOnStart.bind(this);
		this.updateFluxState = this.updateFluxState.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.onChatListChanged = this.onChatListChanged.bind(this);
		this.onMessageReceive = this.onMessageReceive.bind(this);
		this.hasChatInChatList = this.hasChatInChatList.bind(this);
		this.updateChat = this.updateChat.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.getColor = this.getColor.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderBadge = this.renderBadge.bind(this);
		this.rightElementPress = this.rightElementPress.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.renderLastMessageTime = this.renderLastMessageTime.bind(this);
		this.callback = this.callback.bind(this);

		this.showAlert = this.showAlert.bind(this);
		this.deleteRow = this.deleteRow.bind(this);
	}

	componentWillMount() {
		getStoredDataFromKey(EMAIL).then((mail) => {
			getStoredDataFromKey(FULL_NAME).then((name) => {
				getStoredDataFromKey(DOMAIN).then((dom) => {
					this.setState({ domain: dom });
					this.setState({ userName: name });
					this.setState({ userId: mail });
					Fluxify.doAction('setAppData', {
						user_id: mail,
						user_name: name,
						domain: dom
					});
				});
			});
		});
	}

	componentDidMount() {
		StateHelper.setOnChatListChanged(this.onChatListChanged);
		this.socket = SocketHelper(this.onMessageReceive, this.onSocketConnectCallback, this.onRoomJoinedCallback);
	}

	onSocketConnectCallback() {
		getStoredDataFromKey(EMAIL).then((mail) => {
			this.socket.joinRoom(mail.toLowerCase().trim());
		});
	}

	onRoomJoinedCallback() {
		DatabaseHelper.getAllChats((results) => {
			let chats = Object.keys(results.rows).map((key) => results.rows[key]);
			chats = CollectionUtils.getSortedArrayByDate(chats);
			this.updateFluxState(chats);
			this.getMessageOnStart(chats);
		});
	}

	updateFluxState(chats) {
		Fluxify.doAction('updateChatList', chats);
	}

	onChatListChanged(chatList) {
		if (Page.CHAT_LIST_PAGE.id == StateClient.currentPageId)
			this.setStateData(chatList);
	}

	setStateData(chats) {
		chats = chats.filter((x) => x.info.is_added_to_chat_list == true);
		this.setState({
			chatList: chats,
			dataSource: ds.cloneWithRows(chats),
			isLoading: false,
		});
	}

	getMessageOnStart(x) {
		let chats = x.filter((m) => m.info.chat_type != Type.BOT);
		chats = CollectionUtils.getUniqueItemsByChatRoom(chats);
		const rooms = chats.map((n) => n.info.room);
		const last_message_times = chats.map((n) => n.info.last_message_time);

		InternetHelper.checkIfNetworkAvailable((isConnected) => {
			if (isConnected) {
				InternetHelper.getAllIssues(this.state.domain, {
					email: this.state.userId,
				}, (res) => {
					console.log(res);
					InternetHelper.getAllMessages(this.state.domain, {
						email: this.state.userId,
						rooms: rooms,
						last_message_times: last_message_times
					});
				})
			} else {
				this.setState({ title: 'Kick' });
			}
		});
	}

	onMessageReceive(messages) {
		if (this.state.title == 'Updating...') {
			this.setState({ title: 'Kick' });
		}
		if (messages.length < 1)
			return;
		let finalChatList = [];
		let finalChatItemsList = [];
		const chatList = StateClient.chatList;

		for (const chat of messages) {
			let chatToBeUpdated = this.hasChatInChatList(chatList, chat);
			chatToBeUpdated = (chatToBeUpdated == null)
				? CollectionUtils.createChatFromResponse(chat, this.state.userId)
				: chatToBeUpdated;
			const response = this.updateChat(chat.chat_items, chatToBeUpdated);
			finalChatList.push(response.chat);
			finalChatItemsList = finalChatItemsList.concat(response.chatItems);
		}

		if (finalChatList && finalChatList.length > 0) {
			finalChatList = CollectionUtils.pushNewDataAndSortArray(chatList, finalChatList).slice();
			finalChatItemsList = finalChatItemsList.slice();
			DatabaseHelper.addNewChat(finalChatList, (msg) => {
				console.log('chat list page', msg);
				DatabaseHelper.addNewChatItem(finalChatItemsList, (msg) => {
					console.log('chat list page', msg);
				});
			}, true);
			this.updateFluxState(finalChatList);
		}
	}

	hasChatInChatList(chatList, chat) {
		const x = chatList.filter((n) => n.info.room == chat.meta.room);
		return x.length > 0 ? x[0] : null;
	}

	updateChat(newChatItemsToBeAdded, chatToBeUpdated) {
		console.log(chatToBeUpdated, newChatItemsToBeAdded);
		let chatList = StateClient.chatList;
		let currentChat = StateClient.currentChat;
		let currentMessages = StateClient.currentChatMessages;

		let chatItems = newChatItemsToBeAdded.map((x) => {
			return CollectionUtils.createChatItemFromResponse(x, chatToBeUpdated)
		});

		if (chatItems.length > 0) {
			chatItems = CollectionUtils.getSortedChatItems(chatItems);
			const lastChatItem = chatItems[0];
			const new_message_count = chatToBeUpdated.info.new_message_count == null
				? chatItems.length : chatToBeUpdated.info.new_message_count + chatItems.length;
			chatToBeUpdated = Object.assign({}, chatToBeUpdated, {
				sub_title: lastChatItem.message.text,
				info: {
					...chatToBeUpdated.info,
					is_added_to_chat_list: true,
					last_message_time: lastChatItem.message.created_on,
					new_message_count: new_message_count,
				}
			});
			if (currentChat && currentChat.info && currentChat.info.room == chatToBeUpdated.info.room) {
				let isGroupChat = chatToBeUpdated.info.chat_type == Type.GROUP ? true : false;
				let botAirchatObject = chatItems.map((item) => {
					return CollectionUtils.convertToAirChatMessageObjectFromChatItem(item, isGroupChat)
				});
				currentMessages = botAirchatObject.concat(currentMessages);
				Fluxify.doAction('updateCurrentChat', chatToBeUpdated);
				Fluxify.doAction('updateCurrentChatMessages', currentMessages);
			}
		}
		return {
			chat: chatToBeUpdated,
			chatItems: chatItems
		};
	}

	callback(fromWhichPage, chat = null) {
		switch (fromWhichPage.id) {
			case Page.BOT_LIST_PAGE.id:
				break;
			case Page.CHAT_PAGE.id:
				break;
			case Page.CONTACT_LIST_PAGE.id:
				break;
			case Page.NEW_GROUP_PAGE.id:
				break;
			default:
				break;
		}

		Fluxify.doAction('updateCurrentPageId', Page.CHAT_LIST_PAGE.id);
		Fluxify.doAction('removeData');
		if (chat) {
			Fluxify.doAction('updateChatList', CollectionUtils.pushNewDataAndSortArray(StateClient.chatList, [chat]));
		} else {
			Fluxify.doAction('updateChatList', StateClient.chatList);
		}
	}

	onChangeText(e) {
		this.setState({
			searchText: e,
		});
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderBadge(count) {
		if (count && count > 0)
			return <Badge text={count.toString()} />
		return null
	}

	getIcon(type) {
		if (type == Type.BOT) {
			return 'headset';
		} else if (type == Type.GROUP) {
			return 'people';
		} else {
			return 'person';
		}
	}

	renderLastMessageTime(last_message_time) {
		if (last_message_time) {
			last_message_time = last_message_time.split(' ');
			if (last_message_time.length > 1) {
				let today = CollectionUtils.getTodayDate();
				if (today == last_message_time[0]) {
					last_message_time = last_message_time[1].split(':');
					return last_message_time[0] + ':' + last_message_time[1];
				} else {
					return last_message_time[0];
				}
			}
		}
		return null;
	}

	renderListItem(chat) {
		let title = (chat.title.length > 1) ? chat.title[0] + chat.title[1].toUpperCase() : ((chat.title.length > 0) ? chat.title[0] : 'UN');
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: chat.title,
						icon: this.getIcon(chat.info.chat_type)
					},
					secondaryText: chat.sub_title,
				}}

				rightElement={{
					upperElement: this.renderLastMessageTime(chat.info.last_message_time),
					lowerElement: this.renderBadge(chat.info.new_message_count),
				}}

				onPress={() => {
					let page = Page.CHAT_PAGE;
					getStoredDataFromKey(IS_CHAT_MODE)
						.then((val) => {
							if (chat.info.chat_type == Type.BOT && val == '0')
								page = Page.BOT_PAGE;
							this.props.navigator.push({
								id: page.id,
								name: page.name,
								chat: chat,
								botName: chat.title,
								callback: this.callback,
								owner: {
									userName: this.state.userName,
									userId: this.state.userId,
									domain: this.state.domain
								}
							})
						})
				}} />

		);
	}

	rightElementPress(action) {
		let page = null;
		let isForGroupChat = false;
		switch (action.index) {
			// case 0:
			// 	page = Page.BOT_LIST_PAGE;
			// 	break;
			case 0:
				page = Page.CONTACT_LIST_PAGE;
				break;
			case 1:
				page = Page.NEW_GROUP_PAGE
				break;
			case 2: page = Page.OWNER_INFO_PAGE
				break;
			case 3: page = Page.SETTINGS_PAGE
				break;
		}

		if (page) {
			let state = this.state;
			this.props.navigator.push({
				id: page.id,
				name: page.name,
				callback: this.callback,
				owner: {
					userName: state.userName,
					userId: state.userId,
					domain: state.domain
				},
			});
		}
	}

	showAlert(title, body, callback = null) {
		Alert.alert(
			title,
			body,
			[{
				text: 'OK', onPress: () => {
					if (callback)
						callback()
				}
			},
			{
				text: 'CANCEL', onPress: () => {
					console.log('CANCEL Pressed');
				}
			}]
		);
	}



	deleteRow(secId, rowId, _rowMap) {
		const newData = this.state.chatList;
		let chat = newData[rowId];
		const rowMap = Object.assign({}, _rowMap);
		if (chat.info.chat_type == Type.GROUP) {
			this.showAlert(null, 'Are you sure you want to delete and exit this group?',
				() => {
					this.setState({ isLoading: true });
					InternetHelper.removeFromGroup(
						this.state.domain,
						chat.info.room,
						this.state.userId,
						(res) => {
							DatabaseHelper.removeChatByQuery([{ room: chat.info.room }], (results) => {
								rowMap[`${secId}${rowId}`].closeRow();
								newData.splice(rowId, 1);
								Fluxify.doAction('updateChatList', newData);
								this.setState({ isLoading: false });
								Toast.show('Chat deleted');
							});
						})
				});
		} else {
			this.showAlert(null, 'Are you sure you want to delete this chat?',
				() => {
					chat = Object.assign({}, chat, {
						info: {
							...chat.info,
							is_added_to_chat_list: false
						}
					});

					DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat,
						(results) => {
							DatabaseHelper.removeChatItemsByQuery({ chat_room: chat.info.room },
								(results) => {
									rowMap[`${secId}${rowId}`].closeRow();
									newData.splice(rowId, 1);
									Fluxify.doAction('updateChatList', newData);
									Toast.show('Chat deleted');
								});
						});
				});
		}
	}

	renderElement() {
		if (this.state.isLoading) {
			return (
				<View style={styles.progress}>
					<Progress />
				</View>)
		}
		return (
			<SwipeListView
				dataSource={this.state.dataSource}
				keyboardShouldPersistTaps='always'
				keyboardDismissMode='interactive'
				enableEmptySections={true}
				renderRow={(item) => this.renderListItem(item)}
				renderHiddenRow={(data, secId, rowId, rowMap) => (
					<View style={styles.rowBack}>
						<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
							<Text style={{
								color: 'white',
								fontSize: 16,
							}}>Delete</Text>
						</TouchableOpacity>
					</View>
				)}
				leftOpenValue={0}
				rightOpenValue={-120}
			/>
		);
	}
	// searchable={{
	// 						autoFocus: true,
	// 						placeholder: 'Search chat...',
	// 						onChangeText: e => this.onChangeText(e),
	// 						onSearchClosed: () => this.setState({ searchText: '' }),
	// 					}}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					centerElement={this.state.title}
					rightElement={{
						menu: { labels: menuItems },
					}}
					onRightElementPress={(action) => this.rightElementPress(action)}

				/>
				{this.renderElement()}

			</View>
		)
	}
}

ChatListPage.propTypes = propTypes;

export default ChatListPage;