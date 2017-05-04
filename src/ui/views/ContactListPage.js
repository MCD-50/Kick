//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, TouchableOpacity, BackAndroid } from 'react-native';
import Fluxify from 'fluxify';

//import from app
import { Toolbar, Avatar, Progress, ListItem} from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import { IS_LOGGED, GET_USERS } from '../../constants/AppConstant.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getTitle, getTextColor, addAndUpdateContactList, getSortedArrayByTitle } from '../../helpers/CollectionHelper.js';
import DatabaseHelper from '../../helpers/DatabaseHelper.js';


const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,
};

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });

class ContactListPage extends Component {
	constructor(params) {
		super(params);
		this.pageCount = 1;
		this.state = {
			searchText: '',
			title: 'Syncing...',
			appInfo: this.props.route.appInfo,
			isLoading: true,
			contacts: [],
			hasMore: true,
			dataSource: ds.cloneWithRows([]),
		};


		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.popPage = this.popPage.bind(this);

		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderFooter = this.renderFooter.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.renderElement = this.renderElement.bind(this);

		this.syncUsers = this.syncUsers.bind(this);
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
				this.props.route.data.callback(Page.CONTACT_LIST_PAGE)
			this.props.navigator.pop();
			return true;
		}
		return false;
	}

	componentDidMount() {
		DatabaseHelper.getAllChatsByQuery({ chat_type: Type.PERSONAL }, (results) => {
			this.syncUsers(results.filter((n) => n.info.email != this.state.appInfo.email));
		})
	}



	syncUsers(user_list = null) {
		if (user_list == null)
			user_list = this.state.contacts.filter((x) => x.info.email != this.state.appInfo.email);

		let hasMore = true;
		const url = GET_USERS.format(this.state.appInfo.domain);
		const data = { page_count: this.pageCount };

		resolveRequest(url, data)
			.then((res) => {
				if (res && res.message && res.message.length > 0) {
					hasMore = res.message.length > 19 ? true : false;
					const __list = res.message.filter((nn) => nn.email != this.state.appInfo.email);
					user_list = addAndUpdateContactList(user_list, __list, this.state.appInfo);
					DatabaseHelper.addNewChat(user_list, null, true);
				} else {
					hasMore = false;
				}
				this.setStateData(user_list, 'Contacts', hasMore);
				const x = user_list.concat(this.props.chatList.filter((nn) => nn.info.chat_type != Type.PERSONAL));
				Fluxify.doAction('updateChatList', getSortedArrayByTitle(x));
			})
			.catch((rej) => console.log(rej));
	}

	setStateData(users, title, hasMore) {
		this.setState({
			contacts: users, hasMore: hasMore,
			dataSource: ds.cloneWithRows(users),
			title: title, isLoading: false,
		});
	}

	onChangeText(e) {
		this.setState({ searchText: e });
	}

	renderListItem(contact) {
		const title = getTitle(contact.title);
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={getTextColor(contact.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: contact.title,
					},
					secondaryText: contact.info.last_active
				}}
				onPress={() => {
					const page = Page.CHAT_PAGE;
					this.props.navigator.replace({
						id: page.id, name: page.name,
						data: {
							chat: contact,
							callback: this.props.route.data.callback,
							appInfo: this.state.appInfo,
						}
					})
				}} />
		);
	}


	renderElement() {
		if (this.state.isLoading) {
			return (
				<View style={style.progress_ring_centered_view}>
					<Progress />
				</View>)
		} else if (this.state.contacts.length < 1) {
			return (
				<Text style={style.text_with_black_color_and_font_size_17}>It's empty in here.</Text>
			);
		} else {
			return (
				<ListView
					dataSource={this.state.dataSource}
					keyboardShouldPersistTaps='always'
					keyboardDismissMode='interactive'
					enableEmptySections={true}
					ref={'LISTVIEW'}
					renderRow={(item) => this.renderListItem(item)} />
			)
		}
	}

	renderFooter() {
		if (this.state.hasMore) {
			return (
				<TouchableOpacity style={[style.view_with_flex_1_and_margin_all_sides, { borderRadius: 3, backgroundColor: 'white' }]}
					onPress={() => {
						this.pageCount += 1;
						this.syncUsers();
					}}
					accessibilityTraits="button">
					<View style={[style.container_with_flex_1, style.align_center_justify_center]}>
						<Text style={[style.text_with_black_color_and_font_size_17, { padding: 10 }]}>
							Load More
						</Text>
					</View>
				</TouchableOpacity>
			)
		}
		return null;
	}



	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => this.popPage()}
					centerElement={this.state.title} />
				{this.renderElement()}
				{this.renderFooter()}
			</View>
		)
	}
}

ContactListPage.propTypes = propTypes;
export default ContactListPage;