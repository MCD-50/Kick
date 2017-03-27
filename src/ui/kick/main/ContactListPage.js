import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	Text,
	ListView,
	BackAndroid,
	TouchableOpacity
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';
import SwipeListView from '../../customUI/SwipeListView.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import InternetHelper from '../../../helpers/InternetHelper.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { FULL_URL } from '../../../constants/AppConstant.js';
import StateClient from '../../../helpers/StateClient.js';

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
		backgroundColor: '#ebb510',
		marginTop: 0,
		marginBottom: 1,
		right: 0
	},
	backLeftBtn: {
		alignItems: 'flex-end',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		paddingRight: 15,
		width: 120
	},
	backLeftBtnLeft: {
		backgroundColor: '#0eb244',
		marginTop: 0,
		marginBottom: 1,
		left: 0
	},
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
		this.state = {
			searchText: '',
			title: 'Syncing...',
			owner: this.props.route.owner,
			isLoading: true,
			contacts: [],
			dataSource: ds.cloneWithRows([]),
		};


		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.getColor = this.getColor.bind(this);
		this.renderElement = this.renderElement.bind(this);

		this.loadcontacts = this.loadcontacts.bind(this);
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
		this.loadcontacts();
	}

	loadcontacts() {
		DatabaseHelper.getAllChatsByQuery({ chat_type: Type.PERSONAL }, (results) => {
			this.syncUsers(results.filter((n) => n.info.email != this.state.owner.userId));
		})
	}

	syncUsers(user_list) {
		
		InternetHelper.getAllUsers(this.state.owner.domain,
			this.state.owner.userId, (array, msg) => {
				if (array && array.length > 0) {
					user_list = CollectionUtils.addAndUpdateContactList(user_list,
						array.filter((nn) => nn.email != this.state.owner.userId), this.state.owner);
					
					DatabaseHelper.addNewChat(user_list, (msg) => {
						//console.log(msg);
					}, true);
				}

				this.setStateData(user_list, 'Contacts');
				const x = user_list.slice();
				const all_users = CollectionUtils.getSortedArrayByDate(
					x.concat(StateClient.chatList.filter((nn) => nn.info.chat_type != Type.PERSONAL))
				);
				Fluxify.doAction('updateChatList', all_users);
			});
	}

	setStateData(users, title) {
		this.setState({
			contacts: users,
			dataSource: ds.cloneWithRows(users),
			title: title,
			isLoading: false,
		});
	}

	callback(fromWhichPage) {
		this.setStateData(StateClient.chatList, this.state.title);
	}

	onChangeText(e) {
		this.setState({ searchText: e });
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderListItem(contact) {
		let title = (contact.title.length > 1) ?
			contact.title[0] + contact.title[1].toUpperCase()
			: ((contact.title.length > 0) ? contact.title[0] : 'UN');

		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(contact.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: contact.title,
					},
					secondaryText: contact.info.last_active
				}}
				onPress={() => {
					let page = Page.CHAT_PAGE;
					this.props.navigator.replace({
						id: page.id,
						name: page.name,
						chat: contact,
						callback: this.props.route.callback,
						owner: this.state.owner,
					})
				}} />
		);
	}

	renderElement() {
		console.log(this.state);
		if (this.state.isLoading) {
			return (
				<View style={styles.progress}>
					<Progress />
				</View>)
		} else if (this.state.contacts < 1) {
			return (
				<Text style={styles.text}>It's empty in here.</Text>
			);
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
						<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]}
							onPress={_ => {
								const page = Page.CONTACT_INFO_PAGE;
								this.props.navigator.push({
									id: page.id,
									name: page.name,
									data: data,
									owner: this.state.owner
								})
							}}>
							<Text style={{
								color: 'white',
								fontSize: 16,
							}}>Details</Text>
						</TouchableOpacity>
					</View>
				)}
				leftOpenValue={0}
				rightOpenValue={-120}
			/>
		);
	}


	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.props.route.callback(Page.CONTACT_LIST_PAGE);
						this.props.navigator.pop();
					}}
					centerElement={this.state.title}
					
					onRightElementPress={(action) => {
						if (action.index == 0) {
							let page = Page.NEW_CONTACT_PAGE;
							this.props.navigator.push({
								id: page.id,
								name: page.name,
								owner: this.state.owner,
								callback: this.callback
							})
						}
					}}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

ContactListPage.propTypes = propTypes;
export default ContactListPage;