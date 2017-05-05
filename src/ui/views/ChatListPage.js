//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, BackAndroid } from 'react-native';

//import from app

import { Toolbar, Avatar, Progress, ListItem, Badge, Toast, SwipeListView } from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import { APP_INFO, GET_MESSAGES, REMOVE_USER_FROM_GROUP } from '../../constants/AppConstant.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getTitle, getTextColor, getSortedArrayByLastMessageTime, getUniqueArrayByRoom, getTodayDate, pushNewDataAndSortArray, createChatItemFromResponse, convertToAirChatMessageObject, createChatFromResponse, checkIfResponseItemInChatListByRoom } from '../../helpers/CollectionHelper.js';
import { getData, setData } from '../../helpers/AsyncStore.js';
import { Type } from '../../enums/Type.js';
import DatabaseHelper from '../../helpers/DatabaseHelper.js';
import SocketHelper from '../../helpers/SocketHelper.js';
import AlertHelper from '../../helpers/AlertHelper.js';


//socket-io fix
window.navigator.userAgent = "react-native"


const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired
};

const menuItems = [
	'Users', 'New group', 'Profile', 'Settings'
]


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ChatListPage extends Component {

	constructor(params) {
		super(params);
		this.socket = {};
		this.state = {
			searchText: '',
			isLoading: true,
			dataSource: ds.cloneWithRows([]),
			title: 'Updating...',
			appInfo: null,
		};

		this.onSocketConnectCallback = this.onSocketConnectCallback.bind(this);
		this.onRoomJoinedCallback = this.onRoomJoinedCallback.bind(this);
		this.getMessageOnStart = this.getMessageOnStart.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.onMessageReceive = this.onMessageReceive.bind(this);
		this.getBadgeAndIcon = this.getBadgeAndIcon.bind(this);
		this.onRightElementPress = this.onRightElementPress.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.renderLastMessageTime = this.renderLastMessageTime.bind(this);
		this.callback = this.callback.bind(this);
		this.deleteRow = this.deleteRow.bind(this);
	}

	componentWillMount() {
		getData(APP_INFO)
			.then((res) => {
				this.setState({ appInfo: res });
			});
	}

	componentDidMount() {
		this.socket = SocketHelper(this.onMessageReceive, this.onSocketConnectCallback, this.onRoomJoinedCallback);
	}

	onSocketConnectCallback() {
		getData(APP_INFO)
			.then((res) => {
				this.socket.joinRoom(res.email.toLowerCase().trim())
			})
	}

	onRoomJoinedCallback() {
		DatabaseHelper.getAllChats((results) => {
			const chats = getSortedArrayByLastMessageTime(Object.keys(results.rows).map((key) => results.rows[key]));
			Fluxify.doAction('updateChatList', chats);
			this.getMessageOnStart(chats);
		});
	}

	setStateData(chats) {
		chats = chats.filter((x) => x.info.is_added_to_chat_list == true);
		this.setState({ chatList: chats, dataSource: ds.cloneWithRows(chats), isLoading: false });
	}

	getMessageOnStart(chats) {
		chats = getUniqueArrayByRoom(chats);
		const rooms = chats.map((n) => n.info.room);
		const last_message_times = chats.map((n) => n.info.last_message_time);

		let url = GET_MESSAGES.format(this.state.appInfo.domain);
		let data = { email: this.state.appInfo.email, rooms: rooms, last_message_times: last_message_times }

		resolveRequest(url, data)
			.then((res) => {
				console.log(res);
			}).catch((rej) => this.setState({ title: 'Kick' }))
	}

	onMessageReceive(messages) {
		if (this.state.title == 'Updating...') this.setState({ title: 'Kick' });
		console.log(messages);
		// if (messages.length < 1) return;
		// let chats = [], chat_items = [];
		// for (const message of messages) {
		// 	let chat_to_updated = checkIfResponseItemInChatListByRoom(this.props.chatList, message) == null
		// 	if (chat_to_updated == null) {
		// 		chat_to_updated = createChatFromResponse(message, this.state.appInfo.email);
		// 	}

		// 	let items = message.chat_items.map((item) => createChatItemFromResponse(message.meta, item, chat_to_updated));

		// 	if (items.length > 0) {
		// 		items = getSortedArrayByLastMessageTime(items);
		// 		const last_item = items[0];
		// 		const new_message_count = chat_to_updated.info.new_message_count == null ? items.length : chat_to_updated.info.new_message_count + items.length;
		// 		chat_to_updated = Object.assign({}, chat_to_updated, {
		// 			sub_title: last_item.message.text,
		// 			info: {
		// 				...chat_to_updated.info, is_added_to_chat_list: true,
		// 				last_message_time: last_item.message.created_on, new_message_count: new_message_count,
		// 			}
		// 		});

		// 		const current_chat_messages = items
		// 			.map((item) => convertToAirChatMessageObject(item, chat_to_updated.info.chat_type == Type.GROUP))
		// 			.concat(this.props.currentChatMessages);

		// 		chats.push(chat_to_updated);
		// 		chat_items.push(current_chat_messages)

		// 		if (this.props.currentChat && this.props.currentChat.info && this.props.currentChat.info.room == chat_to_updated.info.room) {
		// 			Fluxify.doAction('updateCurrentChat', chat_to_updated);
		// 			Fluxify.doAction('updateCurrentChatMessages', current_chat_messages);
		// 		}
		// 	}
		// }

		// if (chats && chats.length > 0) {
		// 	chats = pushNewDataAndSortArray(this.props.chatList, chats).slice();
		// 	chat_items = chat_items.slice();
		// 	DatabaseHelper.addNewChat(chats, (msg) => DatabaseHelper.addNewChatItem(chat_items, (msg) => { }), true);
		// 	Fluxify.doAction('updateChatList', chats);
		// }
	}

	getBadgeAndIcon(count = null, type = null) {
		if (count && count > 0) {
			return <Badge text={count.toString()} />
		} else if (type && type == Type.GROUP) {
			return 'people';
		} else if (type && type == Type.GROUP) {
			return 'person';
		} else {
			return null
		}
	}

	getLastMessageTime(last_message_time) {
		if (last_message_time) {
			last_message_time = last_message_time.split(' ');
			if (last_message_time.length > 1) {
				if (getTodayDate() == last_message_time[0]) {
					last_message_time = last_message_time[1].split(':');
					return last_message_time[0] + ':' + last_message_time[1];
				} else {
					return last_message_time[0];
				}
			}
		}
		return null;
	}

	callback(from_page, chat = null) {
		console.log('yeah');
	}

	renderListItem(chat) {
		const title = getTitle(chat.title);
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={getTextColor(chat.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: chat.title,
						icon: this.getBadgeAndIcon(null, chat.info.chat_type)
					},
					secondaryText: chat.sub_title,
				}}

				rightElement={{
					upperElement: this.getLastMessageTime(chat.info.last_message_time),
					lowerElement: this.getBadgeAndIcon(count = chat.info.new_message_count),
				}}

				onPress={() => {
					const page = Page.CHAT_PAGE;
					this.props.navigator.push({
						id: page.id, name: page.name,
						data: {
							chat: chat,
							callback: this.callback,
							appInfo: this.state.appInfo
						}
					})
				}} />
		);
	}

	onRightElementPress(action) {
		let page = Page.CONTACT_LIST_PAGE;
		const index = action.index;
		if (index == 1) {
			page = Page.NEW_GROUP_PAGE;
		} else if (index == 2) {
			page = Page.PROFILE_PAGE;
		} else if (index == 3) {
			page = Page.SETTINGS_PAGE;
		}
		if (page) {
			this.props.navigator.push({
				id: page.id, name: page.name,
				data: {
					appInfo: this.state.appInfo,
					callback: this.callback,
				},
			});
		}
	}

	deleteRow(secId, rowId, _rowMap) {
		const newData = this.props.chatList;
		let chat = newData[rowId];
		const rowMap = Object.assign({}, _rowMap);

		if (chat.info.chat_type == Type.GROUP) {
			AlertHelper.showAlert(null, 'Are you sure you want to delete and exit this group?',
				(data) => {
					if (data.ok) {
						const url = REMOVE_USER_FROM_GROUP.format(this.state.appInfo.domain);
						const data = { room: chat.info.room, email: this.state.appInfo.email };
						resolveRequest(url, data)
							.then((res) => {
								DatabaseHelper.removeChatByQuery([{ room: chat.info.room }], (results) => {
									rowMap[`${secId}${rowId}`].closeRow();
									newData.splice(rowId, 1);
									Fluxify.doAction('updateChatList', newData);
									this.setState({ isLoading: false });
									Toast.show('Chat deleted');
								});
							}).catch((rej) => {
								Toast.show("Can't delete chat");
								this.setState({ isLoading: false });
							});
					} else {
						this.setState({ isLoading: false });
					}
				});
		} else {
			AlertHelper.showAlert(null, 'Are you sure you want to delete this chat?',
				(data) => {
					if (data.ok) {
						chat = Object.assign({}, chat, {
							info: {
								...chat.info,
								is_added_to_chat_list: false
							}
						});
						DatabaseHelper.updateChatByQuery({ room: chat.info.room }, chat,
							(res) => {
								DatabaseHelper.removeChatItemsByQuery({ chat_room: chat.info.room },
									(sss) => {
										rowMap[`${secId}${rowId}`].closeRow();
										newData.splice(rowId, 1);
										Fluxify.doAction('updateChatList', newData);
										Toast.show('Chat deleted');
									});
							});
					}
				});
		}
	}

	renderElement() {
		if (this.state.isLoading) {
			return (
				<View style={style.progress_ring_centered_view}>
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
					<View style={style.row_back_swipe_list_view}>
						<TouchableOpacity style={[style.back_right_holder_swipe_list_view, style.back_right_button_swipe_list_view]} onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
							<Text style={[style.text_with_margin_bottom_and_font_size_14, { margin: 0, fontSize: 16 }]}>Delete</Text>
						</TouchableOpacity>
					</View>
				)}
				leftOpenValue={0}
				rightOpenValue={-120} />
		);
	}

	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					centerElement={this.state.title}
					rightElement={{ menu: { labels: menuItems } }}
					onRightElementPress={(action) => this.onRightElementPress(action)} />
				{this.renderElement()}
			</View>
		)
	}
}

ChatListPage.propTypes = propTypes;
export default ChatListPage;