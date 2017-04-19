import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	BackAndroid,
	Alert,
	ListView,
	Text
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
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import StateClient from '../../../helpers/StateClient.js';
window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';
import Toast from '../../customUI/Toast.js';
import Communications from '../../customUI/airchat/Communication.js';
import { ListRenderer } from '../../../helpers/ListRenderer.js';
import ListItem from '../../customUI/ListItem.js';

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

let botMenuItem = ['New', 'Filter'];
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });

class BotPage extends Component {
	constructor(params) {
		super(params);
		this.state = {
			botName: this.props.route.botName,
			owner: this.props.route.owner,
			isLoading: true,
			hasMore: false,
			filter: {},
			searchText: '',
			dataSource: ds.cloneWithRows([]),
			items: [],
			pageCount: 1,
			meta: null
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);

		this.loadItems = this.loadItems.bind(this);
		this.addNewItem = this.addNewItem.bind(this);
		this.searchItems = this.searchItems.bind(this);

		this.renderElement = this.renderElement.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderFooter = this.renderFooter.bind(this);

	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	componentDidMount() {
		InternetHelper.getMeta(this.state.owner.domain, this.state.botName,
			(res) => {
				console.log(res);
				if (res.is_error) {
					Alert.alert('Unable to get meta of given bot.', 'Please check internet connection, bot Name and try again in little bit');
					this.setState({ isLoading: false });
				} else {
					this.setState({ meta: res.data });
					this.loadItems(this.state.pageCount);
				}
			})
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (this.props.route.callback)
					this.props.route.callback(Page.BOT_PAGE);
				this.props.navigator.pop();
				return true;
			}
			return false;
		});
	}


	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (this.props.route.callback)
					this.props.route.callback(Page.BOT_PAGE);
				this.props.navigator.pop();
				return true;
			}
			return false;
		});
	}

	loadItems(pageCount) {
		InternetHelper.loadMore(this.state.owner.domain, this.state.botName, pageCount,
			this.state.owner.userId, (responseData) => {
				console.log(responseData);
				if (responseData && responseData.message && responseData.message.length > 0) {
					const hasMore = responseData.message.length > 19 ? true : false
					this.setState({
						pageCount: pageCount + 1,
						isLoading: false,
						hasMore: hasMore,
						dataSource: ds.cloneWithRows(this.state.items.concat(responseData.message)),
						items: this.state.items.concat(responseData.message),
					});
				} else {
					this.setState({
						pageCount: pageCount + 1,
						isLoading: false,
						hasMore: false,
					});
				}
			}, true);
	}

	addNewItem() {
		InternetHelper.getMeta(this.state.owner, this.state.botName, (responseData) => {
			const page = Page.VIEW_INFO_PAGE;
			this.props.navigator.push({
				id: page.id, name: page.name, botName: this.state.botName,
				meta: responseData.message[0], owner: this.state.owner
			})
		});
	}

	renderFooter() {
		if (this.state.hasMore) {
			return (
				<TouchableOpacity style={[styles.view, {
					borderRadius: 3,
					backgroundColor: 'white'
				}]}
					onPress={() => {
						this.loadItems(this.state.pageCount + 1)
					}}
					accessibilityTraits="button">
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
						<Text style={[styles.text, {
							padding: 10,
							color: 'black',
							paddingLeft: 10,
							paddingRight: 10
						}]}>Load More</Text>
					</View>
				</TouchableOpacity>
			)
		}
		return null;
	}

	renderListItem(item) {
		let renderer = new ListRenderer(this.state.meta);
		const title = renderer.render_item_title(item);
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={CollectionUtils.getColor(title)} text={'UN'} />}
				centerElement={{
					primaryElement: {
						primaryText: renderer.render_item_title(item),
					},
					secondaryText: renderer.render_item_subtitle(item),
				}}
				onPress={() => {
					let page = Page.VIEW_INFO_PAGE;
					this.props.navigator.push({
						id: page.id,
						name: page.name,
						item: item,
						botName: this.state.botName,
						owner: this.state.owner,
						prev_name: Page.BOT_PAGE.name
					})
				}} />)
	}

	searchItems(text) {
		console.log(text);
	}

	renderElement() {
		if (this.state.isLoading)
			return (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Progress />
				</View>)
		else if (this.state.items.length < 1)
			return <Text style={{
				marginTop: 10, marginBottom: 10,
				marginLeft: 16, marginRight: 16, fontSize: 15, color: 'black'
			}}>It's empty in here</Text>
		return (
			<ListView
				dataSource={this.state.dataSource}
				keyboardShouldPersistTaps='always'
				keyboardDismissMode='interactive'
				enableEmptySections={true}
				ref={'LISTVIEW'}
				renderFooter={this.renderFooter}
				renderRow={(item) => this.renderListItem(item)} />);
	}

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						if (this.props.route.callback)
							this.props.route.callback(Page.BOT_PAGE);
						this.props.navigator.pop();
					}}
					centerElement={this.state.botName}
					rightElement={{
						menu: { labels: botMenuItem },
					}}
					onRightElementPress={(action) => {
						if (action.index == 0) {
							this.addNewItem();
						} else {
							console.log('filter')
						}
					}}
					searchable={{
						autoFocus: true,
						placeholder: 'Search...',
						onChangeText: (e) => {
							this.setState({ searchText: e });
						},
						onSearchClosed: () => this.setState({ searchText: '' }),
					}} />
				{this.renderElement()}
			</View>
		)
	}
}

BotPage.propTypes = propTypes;
export default BotPage;

