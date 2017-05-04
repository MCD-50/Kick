//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ScrollView, BackAndroid } from 'react-native';

//import from app
import { Toolbar, Card } from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { style } from '../../constants/AppStyle.js';

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,
};


class SettingPage extends Component {
	constructor(params) {
		super(params);
		this.state = {
			appInfo: this.props.route.data.appInfo,
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.popPage = this.popPage.bind(this);
		this.renderElement = this.renderElement.bind(this);

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
				this.props.route.data.callback(Page.SETTINGS_PAGE)
			this.props.navigator.pop();
			return true;
		}
		return false;
	}

	renderElement() {
		return (
			<ScrollView style={style.container_with_flex_1} keyboardDismissMode='interactive'>
				<Card fullWidth='0'>
					<View style={style.view_with_flex_1_and_margin_all_sides}>
						<Text style={style.text_with_black_color_and_font_size_17}>Kickbot beta</Text>
						<Text style={style.text_with_gray_color_and_font_size_14}>0.0.1</Text>
						<Text style={style.text_with_gray_color_and_font_size_14}>Simple bot app by frappe inc. Making the erpnext product more simple to use.</Text>
					</View>
				</Card>
			</ScrollView>
		)
	}

	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					leftElement="arrow-back"
					centerElement={this.props.route.name}
					onLeftElementPress={() => this.popPage()}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

SettingPage.propTypes = propTypes;
export default SettingPage;