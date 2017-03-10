import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	Text,
	ListView,
	BackAndroid,
} from 'react-native';


import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';

import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import InternetHelper from '../../../helpers/InternetHelper.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { FULL_URL } from '../../../constants/AppConstant.js';

import {
	UPMARGIN,
	DOWNMARGIN,
	LEFTMARGIN,
	RIGHTMARGIN,
} from '../../../constants/AppConstant.js';

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	progress: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	text: {
		marginTop: UPMARGIN,
		marginBottom: DOWNMARGIN,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		fontSize: 16,
		color: 'black',
	}
});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
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
class ContactListPage extends Component {

	constructor(params) {
		super(params);

		this.listOfContacts = [];
		this.listOfData = [];
		this.state = {
			searchText: '',
			title: 'Syncing...',
			owner: this.props.route.owner,
			isLoading: true,
			contacts: [],
			dataSource: ds.cloneWithRows([]),
			selectedContacts: [],
		};


		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.getColor = this.getColor.bind(this);
		this.getTitle = this.getTitle.bind(this);
		this.renderToolbarRightElement = this.renderToolbarRightElement.bind(this);
		this.onItemSelected = this.onItemSelected.bind(this);

		this.renderElement = this.renderElement.bind(this);
		this.callback = this.callback.bind(this);
		this.loadChats = this.loadChats.bind(this);
		this.addAndUpdateContactList = this.addAndUpdateContactList.bind(this);
		this.syncUsers = this.syncUsers.bind(this);
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.props.route.callback(Page.CONTACT_LIST_PAGE);
				this.props.navigator.pop();
				return true;
			}
			return false;
		});
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.props.route.callback(Page.CONTACT_LIST_PAGE);
				this.props.navigator.pop();
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

	componentDidMount() {
		this.loadChats();
	}

	loadChats() {
		DatabaseHelper.getAllChatsByQuery({ chat_type: Type.PERSONAL }, (results) => {
			//console.log(results);
			this.syncUsers(results.filter((n) => n.person.email != this.state.owner.userId));
		})
	}


	syncUsers(userList) {
		InternetHelper.checkIfNetworkAvailable((isAvailable) => {
			const x = this.props.route.isForGroupChat ? 'Select contact' : this.props.route.name
			if (isAvailable) {
				InternetHelper.getAllUsers(this.state.owner.domain, this.state.owner.userId, (array, msg) => {
					if (array && array.length > 0) {
						//console.log(array);
						this.addAndUpdateContactList(userList, array, x);
					} else {
						this.setStateData(userList, x)
					}
				});
			} else {
				this.setStateData(userList, x);
			}
		})
	}


	addAndUpdateContactList(userList, userFetched, title) {
		let newListOfUsers = [];
		for (user of userFetched) {
			const last_active = CollectionUtils.getLastActive(user.last_active);
			const x = userList.filter((n) => n.person.email == user.email);
			const title = user.last_name != null ? user.first_name + ' ' + user.last_name : user.first_name;
			const number = user.number ? user.number : null;
			const email = user.email;
			if (x && x.length > 0) {
				newListOfUsers.push(Object.assign({}, x[0], {
					title: title,
					info: {
						...x[0].info,
						last_active: last_active
					},
					person: {
						...x[0].person,
						title: title,
						number: number
					}
				}));
			} else {
				const personal = CollectionUtils.createChatPersonObject({
					title: title,
					email: user.email,
					number: number,
				});

				const chat = CollectionUtils.createChat(title, 'No new message', false,
					Type.PERSONAL, CollectionUtils.getRoom(this.state.owner.userId, true, null, user.email),
					null, null, last_active, personal);

				newListOfUsers.push(chat);
			}
		}

		newListOfUsers = CollectionUtils.getUniqueItemsByChatRoom(newListOfUsers);
		newListOfUsers = newListOfUsers.filter((y) => y.person.email != this.state.owner.userId);
		DatabaseHelper.addNewChat(newListOfUsers, (msg) => {
			//console.log(msg)
		}, true);
		this.setStateData(newListOfUsers, title);
	}

	setStateData(listOfData, title) {
		listOfData = listOfData.map((person) => {
			return {
				...person,
				is_selected: false,
			}
		})
		this.setState({
			title: title,
			isLoading: false,
			dataSource: ds.cloneWithRows(listOfData),
			contacts: listOfData
		});
	}


	onChangeText(e) {
		this.setState({ searchText: e });
	}

	callback() {
		this.setStateData();
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderListItem(contact) {
		const searchText = this.state.searchText.toLowerCase();
		if (searchText.length > 0 && contact.title.toLowerCase().indexOf(searchText) < 0) {
			return null;
		}
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(contact.title)} text={this.getTitle(contact)} />}
				onLeftElementPress={() => {
					if (this.props.route.isForGroupChat) {
						this.onItemSelected(contact);
					}
				}}
				centerElement={{
					primaryText: contact.title,
					secondaryText: contact.info.last_active,
					tertiaryText: 'person'
				}}

				onPress={() => {
					if (this.props.route.isForGroupChat) {
						this.onItemSelected(contact);
					} else {
						let page = Page.CHAT_PAGE;
						let state = this.state;
						const chat = contact;
						delete chat.is_selected;
						this.props.navigator.replace({
							id: page.id,
							name: page.name,
							chat: contact,
							callback: this.props.route.callback,
							owner: state.owner,
						})
					}

				}} />
		);
	}

	onItemSelected(contact) {
		const selectedContacts = this.state.selectedContacts;
		let index = selectedContacts.indexOf(contact);
		if (index > -1) {
			contact.is_selected = false;
			selectedContacts.splice(index, 1);
		} else {
			contact.is_selected = true;
			selectedContacts.push(contact);
		}
		const contacts = this.state.contacts;
		contacts[contacts.indexOf(contact)] = contact;

		this.setState({
			contacts: contacts,
			dataSource: ds.cloneWithRows(contacts),
			selectedContacts: selectedContacts,
		});
	}

	rightElementPress(action) {
		if (this.props.route.isForGroupChat && this.state.selectedContacts.length > 0) {
			let page = Page.NEW_GROUP_PAGE;
			this.props.navigator.replace({ id: page.id, name: page.name, callback: this.props.route.callback, contacts: this.state.selectedContacts, owner: this.props.route.owner });
		}
		else if (action && action.index == 0) {
			let page = Page.NEW_CONTACT_PAGE;
			this.props.navigator.push({ id: page.id, name: page.name, callback: this.callback })
		}
	}

	getTitle(contact) {
		if (contact.is_selected == true)
			return '###icon';
		return (contact.title.length > 1) ? contact.title[0] + contact.title[1].toUpperCase() : ((contact.title.length > 0) ? contact.title[0] : 'UN');
	}

	renderElement() {
		if (this.state.isLoading) {
			return (
				<View style={styles.progress}>
					<Progress color={['#3f51b5']} size={50} duration={300} />
				</View>)
		} else if (this.state.dataSource._cachedRowCount < 1) {
			return (
				<Text style={styles.text}>It's empty in here.</Text>
			);
		}

		return (
			<ListView
				dataSource={this.state.dataSource}
				keyboardShouldPersistTaps='always'
				keyboardDismissMode='interactive'
				enableEmptySections={true}
				ref={'LISTVIEW'}
				renderRow={(item) => this.renderListItem(item)}
			/>
		);
	}

	renderToolbarRightElement() {
		if (this.props.route.isForGroupChat) {
			if (this.state.selectedContacts.length > 0)
				return 'done';
			else
				return null;
		}

		return ({
			menu: {
				labels: ['Add contact']
			}
		});
	}

	render() {
		return (
			<Container>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.props.route.callback(Page.CONTACT_LIST_PAGE);
						this.props.navigator.pop();
					}}
					centerElement={this.state.title}
					rightElement={this.renderToolbarRightElement()}
					onRightElementPress={(action) => this.rightElementPress(action)}
				/>
				{this.renderElement()}

			</Container>
		)
	}
}

ContactListPage.propTypes = propTypes;

export default ContactListPage;