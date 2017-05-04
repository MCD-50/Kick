//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ScrollView, TextInput, ListView, BackAndroid } from 'react-native';

//import from app
import { Toolbar, Avatar, Progress, ListItem, Card, Icon, RippleFeedback} from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { Type } from '../../enums/Type.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getRoom, pushAndGetUsersInRoom, getCreatedOn, createChatItem, createChat, prepareBeforeSending, getLastActive } from '../../helpers/CollectionHelper.js';
import { SET_USERS_IN_ROOM, SEND_MESSAGE } from '../../constants/AppConstant.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import AlertHelper from '../../helpers/AlertHelper.js';
import DatabaseHelper from '../../helpers/DatabaseHelper.js';

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,
	text: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	placeholderTextColor: React.PropTypes.string,
	multiline: React.PropTypes.bool,
	autoFocus: React.PropTypes.bool,
};

const defaultProps = {
	text: '',
	placeholder: 'Text...',
	placeholderTextColor: '#b2b2b2',
	multiline: false,
	autoFocus: false,
};


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });

class NewGroupPage extends Component {
	constructor(params) {
		super(params);

		const contacts = this.props.chats.
			filter((nn) => nn.info.chat_type == Type.PERSONAL)
			.map((nn) => {
				return {
					...nn,
					is_selected: false
				}
			});

		this.state = {
			appInfo: this.props.route.data.appInfo,
			selectedCount: 0,
			groupName: '',
			contacts: contacts,
			isLoading: false,
			dataSource: ds.cloneWithRows(contacts),
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.popPage = this.popPage.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.toggleTitle = this.toggleTitle.bind(this);
		this.isEditable = this.isEditable.bind(this);
		this.getBackground = this.getBackground.bind(this);
		this.renderFooter = this.renderFooter.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.createGroup = this.createGroup.bind(this);
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
			if (this.props.route.data.callback)
				this.props.route.data.callback(Page.NEW_GROUP_PAGE)
			this.props.navigator.pop();
			return true;
		}
		return false;
	}

	setStateData(contact) {
		const contacts = this.state.contacts;
		contacts[contacts.indexOf(contact)] = contact;
		this.setState({ contacts: contacts, selectedCount: contacts.filter((nn) => nn.is_selected == true).length, dataSource: ds.cloneWithRows(contacts) })
	}

	toggleTitle(contact) {
		if (contact.is_selected == true)
			return '###icon';
		return getTitle(contact.title);
	}

	createGroup() {
		if (!this.state.isLoading && this.state.groupName.length > 0) {
			this.setState({ isLoading: true });
			const appInfo = this.state.appInfo;
			const room = getRoom(appInfo.email, Type.GROUP, null, this.state.groupName);
			const message = owner.userName + ' created this group.';
			const createdOn = getCreatedOn();
			let contacts = this.state.contacts
				.filter((nn) => nn.is_selected == true)
				.map((nn) => {
					return { title: nn.title, email: nn.info.email }
				});
			contacts = pushAndGetUsersInRoom(appInfo, contacts);
			const chatItem = createChatItem(appInfo.user_name, app_info.email, message, createdOn, true, room, Type.GROUP, null);
			const chat = createChat(this.state.groupName, message, true, Type.GROUP, room, app_info.email, 0, createdOn, getLastActive(createdOn));

			let url = SET_USERS_IN_ROOM.format(this.state.appInfo.domain);
			const data = { room: room, users: contacts, chat_type: Type.GROUP };
			
			
			resolveRequest(url, data)
			.then((res) => {
				if (res){
					DatabaseHelper.addNewChat([chat], 
					(y)=>{
						DatabaseHelper.addNewChatItem([chatItem],
						(yy)=>{
							const msg_to_be_send = prepareBeforeSending(Type.GROUP, this.state.groupName, room, null, chatItem, 1);
							url = SEND_MESSAGE.format(this.state.appInfo.domain);
							resolveRequest(url, msg_to_be_send)
							.then(()=>{
								this.popPage();
							}).catch((ex)=>{
								this.setState({ isLoading: false });
								this.popPage();
							})
						})
					});
				}
			}).catch((rej) => {
				this.setState({ isLoading: false });
				AlertHelper.showAlert('Something went wrong.', 'Get back from this page.',
				(m)=>{
					if(m.Ok){
						this.popPage();
					}
				})
			});
		}
	}

	isEditable() {
		if (this.state.selectedCount > 0 && !this.state.isLoading)
			return true
		return false
	}

	getBackground(color = '#f0f0f0') {
		if (this.state.selectedCount > 0)
			return color;
		return '#dddddd';
	}

	renderElement() {
		if (this.state.contacts.length < 1) {
			return (
				<Text style={style.text_with_margin_bottom_and_font_size_14}>It's empty in here.</Text>
			);
		}
		return (
			<View style={style.container_with_flex_1}>
				<View style={[{ backgroundColor: STATUS_BAR_COLOR, height: 55, marginBottom: 2 }]}>
					<View style={style.view_with_flex_1_and_margin_all_sides}>
						<View style={[style.new_group_page_text_input, { backgroundColor: this.getBackground() }]}>
							<View style={style.container_with_flex_1}>
								<TextInput style={style.text_input_standard_style}
									placeholder='Group name'
									editable={this.isEditable()}
									onChange={(e) => this.setState({ groupName: e.nativeEvent.text })}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false} autoCapitalize='sentences' value={this.state.groupName}
									enablesReturnKeyAutomatically={true} underlineColorAndroid="transparent" />
							</View>
							<RippleFeedback onPress={() => this.createGroup()}>
								<View style={{ padding: 3 }}>
									<Icon color={this.getBackground(STATUS_BAR_COLOR)} name='arrow-forward' />
								</View>
							</RippleFeedback>
						</View>
					</View>
				</View>
				<ScrollView style={style.container_with_flex_1} keyboardDismissMode='interactive'>
					{this.renderFooter()}
				</ScrollView>
			</View>
		);
	}

	renderFooter() {
		if (this.state.isLoading) {
			return (
				<View style={[style.view_with_flex_1_and_margin_all_sides, style.align_center_justify_center]}>
					<Progress />
				</View>
			)
		} else {
			return (
				<Card fullWidth='0'>
					<View style={style.view_with_flex_1_and_margin_all_sides}>
						<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<Icon color='black' name='people' />
							<Text style={style.text_with_black_color_and_font_size_17}> Contacts</Text>
						</View>
					</View>
					<View>
						<ListView
							dataSource={this.state.dataSource}
							keyboardShouldPersistTaps='always'
							keyboardDismissMode='interactive'
							enableEmptySections={true}
							ref={'LISTVIEW'}
							renderRow={(item) => this.renderListItem(item)}
						/>
					</View>
				</Card>
			);
		}
	}

	renderListItem(contact) {
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={getTextColor(contact.title)} text={this.toggleTitle(contact)} />}
				onLeftElementPress={() => {
					contact.is_selected = !contact.is_selected;
					this.setStateData(contact);
				}}
				centerElement={{
					primaryElement: {
						primaryText: contact.title,
					},
					secondaryText: contact.info.last_active
				}}
				onPress={() => {
					contact.is_selected = !contact.is_selected;
					this.setStateData(contact);
				}} />
		);
	}


	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						if (!this.state.isLoading) {
							this.popPage();
						}
					}}
					translucent={true} />
				{this.renderElement()}
			</View>
		)
	}
}

NewGroupPage.propTypes = propTypes;
NewGroupPage.defaultProps = defaultProps;
export default NewGroupPage;