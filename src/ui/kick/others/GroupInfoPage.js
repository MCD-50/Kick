import React, { Component, PropTypes } from 'react';
import {
	Animated,
	View,
	StyleSheet,
	Text,
	ScrollView,
	TouchableOpacity,
	BackAndroid,
	ListView
} from 'react-native';

import Fluxify from 'fluxify';
import InternetHelper from '../../../helpers/InternetHelper.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Card from '../../customUI/Card.js';
import {
	UPMARGIN,
	DOWNMARGIN,
	LEFTMARGIN,
	RIGHTMARGIN
} from '../../../constants/AppConstant.js';
import Icon from '../../customUI/Icon.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import CheckBox from '../../customUI/CheckBox.js';

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
	centerContainer: {
		alignItems: 'center',
		justifyContent: 'center',
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
	avatar: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: UPMARGIN,
		marginBottom: DOWNMARGIN
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
class GroupInfoPage extends Component {

	constructor(params) {
		super(params);
		const chat = this.props.route.data;
		this.state = {
			chat: chat,
			dataSource: ds.cloneWithRows(chat.info.users),
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (this.props.route.callback)
					this.props.route.callback(Page.GROUP_INFO_PAGE)
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
					this.props.route.callback(Page.GROUP_INFO_PAGE)
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

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderElement() {
		const chat = this.state.chat;
		const title = (chat.title.length > 1) ?
			chat.title[0] + chat.title[1].toUpperCase() :
			((chat.title.length > 0) ?
				chat.title[0] :
				'UN');
		return (
			<View style={styles.container}>
				<View style={[{ backgroundColor: '#0086ff', height:68, marginBottom:2 }]}>
					<View style={[styles.view, { flexDirection: 'row' }]}>
						<View>
							<Avatar size={55} bgcolor={this.getColor(chat.title)} text={title} />
						</View>
						<View style={{
							flex: 1, marginLeft: 15,
							alignItems: 'flex-start', justifyContent: 'center'
						}}>
							<Text style={styles.textBold}>{chat.title}</Text>
							<Text style={styles.text}>{chat.info.users.length + ' People'}</Text>
						</View>
					</View>
				</View>
				<ScrollView style={{flex:1}} keyboardDismissMode='interactive'>
					<Card fullWidth='0'>
						<View style={styles.view}>
							<Text style={styles.textBodyBold}>Encryption</Text>
							<Text style={styles.textBody}>Messages you send to this group is secured with end-to-end encyption.</Text>
						</View>
					</Card>
					<Card fullWidth='0'>
						<View style={styles.view}>
							<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
								<Icon color='black' name='people' />
								<Text style={{ fontSize: 15, color: 'black' }}>   Members</Text>
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
				</ScrollView>
			</View>
		)
	}


	renderListItem(chat) {
		console.log(chat);
		const title = (chat.title.length > 1) ?
			chat.title[0] + chat.title[1].toUpperCase() :
			((chat.title.length > 0) ?
				chat.title[0] :
				'UN');
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: chat.title,
					},
					secondaryText: chat.email,
				}} />
		);
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						if (this.props.route.callback)
							this.props.route.callback(Page.GROUP_INFO_PAGE)
						this.props.navigator.pop();
					}}
					translucent={true}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

GroupInfoPage.propTypes = propTypes;
export default GroupInfoPage;