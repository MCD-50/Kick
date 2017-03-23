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


class BotInfoPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			bot: this.props.route.data,
			owner: this.props.route.owner,
			isLoading: true,
			items: []
		};


		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.renderCommands = this.renderCommands.bind(this);
		this.loadData = this.loadData.bind(this);
		this.getVal = this.getVal.bind(this);
		this.getAllCommands = this.getAllCommands.bind(this);
	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (this.props.route.callback)
					this.props.route.callback(Page.BOT_INFO_PAGE)
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
					this.props.route.callback(Page.BOT_INFO_PAGE)
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
		this.loadData();
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderElement() {
		const bot = this.state.bot;
		const title = (bot.title.length > 1) ?
			bot.title[0] + bot.title[1].toUpperCase() :
			((bot.title.length > 0) ?
				bot.title[0] :
				'UN');
		return (
			<View style={styles.container}>
				<View style={[{ backgroundColor: '#0086ff', height: 68, marginBottom: 2 }]}>
					<View style={[styles.view, { flexDirection: 'row' }]}>
						<View>
							<Avatar size={55} bgcolor={this.getColor(bot.title)} text={title} />
						</View>
						<View style={{
							flex: 1, marginLeft: 15,
							alignItems: 'flex-start', justifyContent: 'center'
						}}>
							<Text style={styles.textBold}>{bot.title}</Text>
							<Text style={styles.text}>Active</Text>
						</View>
					</View>
				</View>
				<ScrollView style={{ flex: 1 }} keyboardDismissMode='interactive'>
					{this.renderCommands()}
				</ScrollView>
			</View>
		)
	}

	loadData() {
		fetch('http://' + this.state.owner.domain + '/api/method/frappe.utils.kickapp.bridge.get_all_bots')
			.then((res) => res.json(), (reject) => this.setState({ isLoading: false }))
			.then((responseData) => {
				this.setState({
					isLoading: false,
					items: responseData.message
				});
			}, (reject) => this.setState({ isLoading: false }));

	}

	renderCommands() {
		if (this.state.isLoading) {
			return (
				<View style={[styles.view, { alignItems: 'center', justifyContent: 'center' }]}>
					<Progress />
				</View>
			);
		} else if (this.state.items.length > 0) {
			const currentBot = this.state.items.filter((nn) => nn.bot_name == this.state.bot.title)[0];
			return (
				<View>
					<Card fullWidth='0'>
						<View style={styles.view}>
							<Text style={styles.textBodyBold}>Description</Text>
							<Text style={styles.textBody}>{currentBot.description}</Text>
						</View>
					</Card>
					<Card fullWidth='0'>
						<CheckBox value={1} label='Default bot' checked={this.getVal(currentBot.is_default)} />
						<CheckBox value={2} label='Available in group' checked={this.getVal(currentBot.is_available_in_group)} />
					</Card>
				</View>);
		} else
			return null;
	}

	getVal(val) {
		if (val == 1) return true
		return false
	}

	getAllCommands(commands) {
		return commands.map((x) => {
			return (
				<View style={{
					flex: 1,
					borderColor: '#b0b0b0',
					flexDirection: 'row',
					marginTop: 2,
				}}>
					<View style={{ backgroundColor: 'black', width: 2 }} />
					<View style={{ marginLeft: 10 }}>
						<Text style={[styles.textHeadingBody, { marginBottom: 5 }]}>Example: {x.example}</Text>
						<Text style={[styles.textHeadingBody, , { marginBottom: 5 }]}>Description: {x.description}</Text>
					</View>
				</View>
			);
		})
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						if (this.props.route.callback)
							this.props.route.callback(Page.BOT_INFO_PAGE)
						this.props.navigator.pop();
					}}
					translucent={true}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

BotInfoPage.propTypes = propTypes;

export default BotInfoPage;