import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	ListView,
	Text,
	TouchableOpacity,
	BackAndroid,
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import Container from '../../Container.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import Progress from '../../customUI/Progress.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';
import InternetHelper from '../../../helpers/InternetHelper.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';


const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];


const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		marginBottom: DOWNMARGIN,
		marginTop: UPMARGIN,
	},
	progress: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	view: {
		flex: 1,
		marginLeft: 10,
		marginRight: 10,
		marginTop: UPMARGIN,
		marginBottom: DOWNMARGIN,
	},

	text: {
		flex: 1,
		color: 'white',
		fontSize: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
};

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ViewInfo extends Component {
	constructor(params) {
		super(params);
		this.pageCount = 1;
		this.state = {
			botName: this.props.route.botName,
			message: this.props.route.message,
			owner: this.props.route.owner,
			searchText: '',
			items: [],
			hasMore: true,
			dataSource: ds.cloneWithRows([]),
			isLoading: true
		}
		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
		this.renderFooter = this.renderFooter.bind(this);
		this.loadMore = this.loadMore.bind(this);
		this.callback = this.callback.bind(this);
		this.popAndSetData = this.popAndSetData.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	componentDidMount() {
		this.loadMore();
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.popAndSetData();
				return true;
			}
			return false;
		});
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.popAndSetData();
				return true;
			}
			return false;
		});
	}

	popAndSetData(data = null) {
		this.props.navigator.pop();
		Fluxify.doAction('updateCurrentPageId', Page.CHAT_PAGE.id);
		this.props.route.callback(data);
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderFooter() {
		if (this.state.hasMore) {
			return (
				<TouchableOpacity style={[styles.view, {
					borderRadius: 3,
					backgroundColor: '#5E64FF',
				}]}
					onPress={() => {
						this.pageCount += 1;
						this.loadMore()
					}}
					accessibilityTraits="button">
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
						<Text style={[styles.text, {
							padding: 10,
							paddingLeft: 10,
							paddingRight: 10
						}]}>Load More</Text>
					</View>
				</TouchableOpacity>
			)
		}
		return null;
	}

	loadMore() {
		this.setState({ isLoading: true });
		InternetHelper.checkIfNetworkAvailable((isConnected) => {
			if (isConnected) {
				InternetHelper.loadMore(this.state.owner.domain, this.state.botName, this.pageCount, this.state.owner.userId, (responseData) => {
					if (responseData && responseData.message && responseData.message.length > 0) {
						const hasMore = responseData.message.length > 19 ? true : false
						this.setState({
							isLoading: false,
							hasMore: hasMore,
							dataSource: ds.cloneWithRows(this.state.items.concat(responseData.message)),
							items: this.state.items.concat(responseData.message),
						});
					} else {
						this.setState({ hasMore: false });
					}
					console.log(this.state.items);
				});
			}
		});
	}

	callback() {
		Fluxify.doAction('updateCurrentPageId', Page.VIEW_MORE_PAGE.id);
	}

	renderListItem(item) {
		const searchText = this.state.searchText.toLowerCase();
		if (searchText.length > 0 && item.text.toLowerCase().indexOf(searchText) < 0) {
			return null;
		}
		let title = (item.text.length > 1) ? item.text[0].toUpperCase() + item.text[1].toUpperCase() : item.text[0].toUpperCase();
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(item.text)} text={title} />}
				centerElement={{
					primaryText: item.text,
					secondaryText: item.creation,
				}}
				onPress={() => {
					const message = this.state.message;
					if (message.action.base_action != 'delete_' && message.action.base_action != 'update_') {
						const page = Page.VIEW_INFO_PAGE;
						this.props.navigator.push({ id: page.id, name: page.name, data: item, callback: this.callback })
					} else if (message.action.base_action == 'delete_') {
						const x = Object.assign({}, message, {
							_id: Math.round(Math.random() * 1000000),
							text: item.text,
							createdAt: new Date(),
							user: {
								_id: this.state.owner.userId,
								name: this.state.owner.userName,
							}
						});
						this.popAndSetData({
							item_id: item.id,
							message: x
						});
					} else if (message.action.base_action == 'update_') {
						let page = Page.EDIT_INFO_PAGE;
						this.props.navigator.replace({
							id: page.id, name: page.name, botName: this.state.botName,
							owner: this.state.owner, message: message, item: item, callback: this.props.route.callback
						});
					}
				}} />
		);
	}


	render() {
		return (
			<Container>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.popAndSetData();
					}}
					centerElement={this.state.botName} />
				<ListView
					dataSource={this.state.dataSource}
					keyboardShouldPersistTaps='always'
					keyboardDismissMode='interactive'
					enableEmptySections={true}
					ref={'LISTVIEW'}
					renderFooter={this.renderFooter}
					renderRow={(item) => this.renderListItem(item)}
				/>
			</Container>)
	}

}

ViewInfo.propTypes = propTypes;
export default ViewInfo;

