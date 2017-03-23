import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Text,
	BackAndroid,
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';

const styles = StyleSheet.create({
	base: {
		flex: 1
	},
	container: {
		flex: 1,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		marginBottom: DOWNMARGIN,
		marginTop: UPMARGIN,
	},
	view: {
		marginBottom: 10,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},

	headerText: {
		fontSize: 17,
	},

	text: {
		fontSize: 14,
	}

});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
};


class ViewInfo extends Component {

	constructor(params) {
		super(params);
		this.state = {
			data: this.props.route.data,
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderView = this.renderView.bind(this);
		this.popAndSetData = this.popAndSetData.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
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

	popAndSetData() {
		this.props.navigator.pop();
		Fluxify.doAction('updateCurrentPageId', Page.CHAT_PAGE.id);
		this.props.route.callback();
	}

	renderView() {
		const components = Object.keys(this.state.data).map((key) => {
			return (
				<View key={key} style={styles.view}>
					<Text style={styles.headerText}>{key.trim()}</Text>
					<Text style={styles.text}>{this.state.data[key].trim()}</Text>
				</View>
			)
		});
		return (
			<ScrollView style={styles.container}>
				{components}
			</ScrollView>
		)
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.popAndSetData();
					}}
					centerElement={this.props.route.name} />
				{this.renderView()}
			</View>)
	}

}

ViewInfo.propTypes = propTypes;
export default ViewInfo;
