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
		color: '#0086ff',
		fontSize: 13,
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

class SettingPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			owner: this.props.route.owner,
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderElement = this.renderElement.bind(this);

	}

	addBackEvent() {
		BackAndroid.addEventListener('hardwareBackPress', () => {
			if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
				if (this.props.route.callback)
					this.props.route.callback(Page.SETTINGS_PAGE)
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
					this.props.route.callback(Page.SETTINGS_PAGE)
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

	renderElement() {
		return (
			<ScrollView style={styles.container} keyboardDismissMode='interactive'>
				<Card fullWidth='0'>
					<View style={styles.view}>
						<Text style={styles.textBodyBold}>Kickbot beta</Text>
						<Text style={styles.text}>0.0.1</Text>
						<Text style={styles.textBody}>Simple bot app by frappe inc. Making the erpnext product more simple to use.</Text>
					</View>
				</Card>
			</ScrollView>
		)
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					centerElement={this.props.route.name}
					onLeftElementPress={() => {
						if (this.props.route.callback)
							this.props.route.callback(Page.SETTINGS_PAGE)
						this.props.navigator.pop();
					}}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

SettingPage.propTypes = propTypes;
export default SettingPage;