import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	Text,
	ListView,
	BackAndroid,
	ScrollView,
	Animated,
	TextInput
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';
import Card from '../../customUI/Card.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import InternetHelper from '../../../helpers/InternetHelper.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { FULL_URL } from '../../../constants/AppConstant.js';
import StateClient from '../../../helpers/StateClient.js';
import RippleFeedback from '../../customUI/utils/ripplefeedback.js';
import Toast from '../../customUI/Toast.js';
import {
	UPMARGIN,
	DOWNMARGIN,
	LEFTMARGIN,
	RIGHTMARGIN,
} from '../../../constants/AppConstant.js';



const styles = StyleSheet.create({
	base: {
		flex: 1
	},
	container: {
		flex: 1,
	},
	view: {
		flex: 1,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		marginTop: UPMARGIN,
		marginBottom: DOWNMARGIN,
	},
	progress: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	textBold: {
		color: 'white',
		fontSize: 19,
		marginBottom: 5,
	},
	text: {
		color: 'white',
		fontSize: 13,
		marginBottom: 10,
	},
	textBodyBold: {
		fontSize: 16,
		color: 'black',
		marginBottom: 5,
	},
	textBody: {
		fontSize: 13,
		color: '#b0b0b0',
	},
	textHeading: {
		fontSize: 15,
		color: '#3498db',
	},
	textHeadingBody: {
		fontSize: 13,
		color: 'black',
	},
	textInput: {
		color: 'black',
		fontSize: 15,
		height: 40
	},
});


const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
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



const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class NewGroupPage extends Component {

	constructor(params) {
		super(params);
		let contacts = StateClient.chatList.filter((nn) => nn.info.chat_type == Type.PERSONAL);
		contacts = contacts.map((nn) => {
			return {
				...nn,
				is_selected: false
			}
		});
		this.state = {
			owner: this.props.route.owner,
			selectedCount: 0,
			groupName: '',
			contacts: contacts,
			isLoading: false,
			dataSource: ds.cloneWithRows(contacts),
		};
		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderFooter = this.renderFooter.bind(this);
		this.getColor = this.getColor.bind(this);
		this.changeTitle = this.changeTitle.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.createGroup = this.createGroup.bind(this);
		this.isEditable = this.isEditable.bind(this);
		this.getBackground = this.getBackground.bind(this);
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (!this.state.isLoading) {
					if (this.props.route.callback)
						this.props.route.callback(Page.NEW_GROUP_PAGE);
					this.props.navigator.pop();
				}

				return true;
			}
			return false;
		});
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (!this.state.isLoading) {
					if (this.props.route.callback)
						this.props.route.callback(Page.NEW_GROUP_PAGE);
					this.props.navigator.pop();
				}

				return true;
			}
			return false;
		});
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	setStateData(contact) {
		let contacts = this.state.contacts;
		contacts[contacts.indexOf(contact)] = contact;

		this.setState({
			contacts: contacts,
			selectedCount: contacts.filter((nn) => nn.is_selected == true).length,
			dataSource: ds.cloneWithRows(contacts),
		})
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderListItem(contact) {
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(contact.title)} text={this.changeTitle(contact)} />}
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

	changeTitle(contact) {
		if (contact.is_selected == true)
			return '###icon';
		return (contact.title.length > 1) ? contact.title[0] + contact.title[1].toUpperCase() : ((contact.title.length > 0) ? contact.title[0] : 'UN');
	}

	createGroup() {

		if (!this.state.isLoading && this.state.groupName.length > 0) {
			this.setState({ isLoading: true });
			const owner = this.state.owner;
			const room = owner.userId + 'group@' + this.state.groupName.replace(/\s/g, '').toLowerCase();
			let contacts = this.state.contacts.filter((nn) => nn.is_selected == true);
			contacts = contacts.map((nn) => {
				return {
					title: nn.title,
					email: nn.info.email,
				}
			});

			contacts = CollectionUtils.getUserForRoom(owner, contacts);
			const text = owner.userName + ' created this group.';
			const createdOn = CollectionUtils.getCreatedOn();
			const chatItem = CollectionUtils.createChatItem(owner.userName, owner.userId,
				text, createdOn, true,
				room, Type.GROUP, CollectionUtils.createChatItemInfo(null));

			const chat = CollectionUtils.createChat(this.state.groupName, text, true, Type.GROUP,
				room, owner.userId, 0, createdOn, CollectionUtils.getLastActive(createdOn));
			InternetHelper.setAllUsersInRoom(owner.domain, contacts, room, Type.GROUP, (x) => {
				DatabaseHelper.addNewChat([chat], (y) => {
					DatabaseHelper.addNewChatItem([chatItem], (z) => {
						const obj = CollectionUtils.prepareBeforeSending(Type.GROUP,
							this.state.groupName, room, null, chatItem, null, 1);
						InternetHelper.sendData(owner.domain, obj, owner.userId);
						this.setState({ isLoading: false });
						this.props.route.callback(Page.NEW_GROUP_PAGE, chat);
						this.props.navigator.pop();
					});
				});
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

	renderFooter() {
		if (this.state.isLoading) {
			return (
				<View style={[styles.view, { alignItems: 'center', justifyContent: 'center' }]}>
					<Progress />
				</View>
			)
		} else {
			return (
				<Card fullWidth='0'>
					<View style={styles.view}>
						<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<Icon color='black' name='people' />
							<Text style={{ fontSize: 15, color: 'black' }}>   Contacts</Text>
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

	renderElement() {
		if (this.state.contacts.length < 1) {
			return (
				<Text style={styles.text}>It's empty in here.</Text>
			);
		}
		return (
			<View style={styles.container}>
				<View style={[{ backgroundColor: '#0086ff', height: 55, marginBottom: 2 }]}>
					<View style={styles.view}>
						<View style={{
							flex: 1,
							backgroundColor: this.getBackground(),
							borderRadius: 3,
							paddingLeft: 5,
							paddingRight: 5,
							alignItems: 'center',
							marginBottom: 5,
							flexDirection: 'row'
						}}>
							<View style={{ flex: 1 }}>
								<TextInput style={styles.textInput}
									placeholder='Group Name...'
									editable={this.isEditable()}
									onChange={(e) => {
										this.setState({ groupName: e.nativeEvent.text });
									}}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false}
									value={this.state.groupName}
									autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true}
									underlineColorAndroid="transparent"
								/>
							</View>
							<RippleFeedback onPress={() => this.createGroup()}>
								<View style={{ padding: 3 }}>
									<Icon color={this.getBackground('#0086ff')} name='arrow-forward' />
								</View>
							</RippleFeedback>
						</View>
					</View>
				</View>
				<ScrollView style={{ flex: 1 }} keyboardDismissMode='interactive'>
					{this.renderFooter()}
				</ScrollView>
			</View>
		);
	}


	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						if (!this.state.isLoading) {
							if (this.props.route.callback)
								this.props.route.callback(Page.NEW_GROUP_PAGE);
							this.props.navigator.pop();
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