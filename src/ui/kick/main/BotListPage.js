import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	Text,
	ListView,
	TouchableOpacity,
	BackAndroid,
} from 'react-native';


import SwipeListView from '../../customUI/SwipeListView.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';

import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';

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
	botList: PropTypes.array,
};


const defaultProps = {
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
class BotListPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			searchText: '',
			isLoading: true,
			dataSource: ds.cloneWithRows([]),
			owner: this.props.route.owner
		};

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.setStateData = this.setStateData.bind(this);
		this.renderListItem = this.renderListItem.bind(this);

		this.onChangeText = this.onChangeText.bind(this);
		this.getColor = this.getColor.bind(this);
		this.renderElement = this.renderElement.bind(this);
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.props.route.callback(Page.BOT_LIST_PAGE);
				this.props.navigator.pop();
				return true;
			}
			return false;
		});
	}

	removeBackEvent() {
		BackAndroid.removeEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				this.props.route.callback(Page.BOT_LIST_PAGE);
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
		this.setStateData();
	}

	setStateData() {
		DatabaseHelper.getAllChatsByQuery({ chat_type: Type.BOT }, (results) => {
			console.log(results);
			this.setState({
				dataSource: ds.cloneWithRows(results),
				isLoading: false
			});
		})
	}

	onChangeText(e) {
		this.setState({ searchText: e });
	}


	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderListItem(bot) {
		// const searchText = this.state.searchText.toLowerCase();
		// if (searchText.length > 0 && bot.title.toLowerCase().indexOf(searchText) < 0) {
		// 	return null;
		// }
		const title = (bot.title.length > 1) ?
			bot.title[0] + bot.title[1].toUpperCase() :
			((bot.title.length > 0) ?
				bot.title[0] :
				'UN');
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(bot.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: bot.title,
						icon: 'headset'
					},
					secondaryText: bot.sub_title,
				}}
				onPress={() => {
					let page = Page.CHAT_PAGE;
					this.props.navigator.replace({
						id: page.id,
						name: page.name,
						chat: bot,
						owner: this.state.owner,
						callback: this.props.route.callback,
					})
				}} />
		);
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
						<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]}
							onPress={_ => {
								const page = Page.BOT_INFO_PAGE;
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

	// <View style={styles.rowBack}>
	// 					<TouchableOpacity style={[styles.backLeftBtn, styles.backLeftBtnLeft]}
	// 						onPress={_ => console.log('x')}>
	// 						<Text style={{
	// 							color: 'white',
	// 							fontSize: 16,
	// 						}}>Details</Text>
	// 					</TouchableOpacity>
	// 					<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]}
	// 						onPress={_ => console.log('x')}>
	// 						<Text style={{
	// 							color: 'white',
	// 							fontSize: 16,
	// 						}}>Details</Text>
	// 					</TouchableOpacity>
	// 				</View>

	// searchable={{
	// 						autoFocus: true,
	// 						placeholder: 'Search bot...',
	// 						onChangeText: e => this.onChangeText(e),
	// 						onSearchClosed: () => this.setState({ searchText: '' }),
	// 					}}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.props.route.callback(Page.BOT_LIST_PAGE);
						this.props.navigator.pop();
					}}
					centerElement={this.props.route.name}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

BotListPage.propTypes = propTypes;

export default BotListPage;