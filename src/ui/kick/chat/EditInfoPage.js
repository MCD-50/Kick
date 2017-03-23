import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	BackAndroid,
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';


const styles = StyleSheet.create({
	base:{
		flex:1
	},
	container: {
		flex: 1,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		marginBottom: DOWNMARGIN,
		marginTop: UPMARGIN,
	},

	headerText: {
		fontSize: 17,
	},

	text: {
		fontSize: 14,
	},

	textInput: {
		fontSize: 18,
		fontWeight: '300',
	},
});

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	text: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	placeholderTextColor: React.PropTypes.string,
	multiline: React.PropTypes.bool,
	autoFocus: React.PropTypes.bool,
};

const defaultProps = {
	text: '',
	placeholder: 'Edit...',
	placeholderTextColor: '#b2b2b2',
	multiline: false,
	autoFocus: false,
};

class EditInfoPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			item: this.props.route.item,
			botName: this.props.route.botName,
			message: this.props.route.message,
			owner: this.props.route.owner,
			description: this.props.route.item.text,
		};
		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.onType = this.onType.bind(this);
		this.showAlert = this.showAlert.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.popAndSetData = this.popAndSetData.bind(this);
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

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	onType(e) {
		this.setState({ description: e.nativeEvent.text });
	}

	showAlert(title, body) {
		Alert.alert(
			title,
			body,
			[{ text: 'OK', onPress: () => console.log('OK Pressed') }]
		);
	}

	sendMessage() {
		if (this.state.description.length > 0) {
			const x = Object.assign({}, this.state.message, {
				_id: Math.round(Math.random() * 1000000),
				text: this.state.description,
				createdAt: new Date(),
				user: {
					_id: this.state.owner.userId,
					name: this.state.owner.userName,
				}
			});
			this.popAndSetData({
				item_id: this.state.item.id,
				message: x
			});
		} else {
			this.showAlert('Empty', 'No text entered.');
		}
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.popAndSetData()
					}}
					centerElement={this.props.route.name} />

				<ScrollView style={styles.container} keyboardDismissMode='interactive'>
					<TextInput
						placeholder="Text..."
						autoCorrect={false}
						onChange={(event) => this.onType(event)}
						multiline={true}
						value={this.state.description}
					/>

					<View style={{
						marginTop: 30,
						alignItems: 'flex-end',

					}}><TouchableOpacity style={{
						borderRadius: 3,
						backgroundColor: '#5E64FF',
						width: 100
					}}
						onPress={() => { this.sendMessage() }}
						accessibilityTraits="button">
							<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
								<Text style={{
									padding: 10,
									paddingLeft: 10,
									paddingRight: 10,
									fontSize: 17,
									color: 'white'
								}}>UPDATE</Text>
							</View>

						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
		);
	}
}

EditInfoPage.propTypes = propTypes;
export default EditInfoPage;
