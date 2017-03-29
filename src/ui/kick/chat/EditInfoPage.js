import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Text,
	TouchableOpacity,
	BackAndroid,
} from 'react-native';

import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import AlertHelper from '../../../helpers/AlertHelper.js';
import Card from '../../customUI/Card.js';
import AutoGrowTextInput from '../../customUI/AutoGrowTextInput.js';


const styles = StyleSheet.create({
	base: {
		flex: 1
	},
	container: {
		flex: 1
	},
	view: {
		flex: 1,
		marginLeft: LEFTMARGIN,
		marginRight: RIGHTMARGIN,
		marginBottom: DOWNMARGIN,
		marginTop: UPMARGIN,
	},

	headerText: {
		fontSize: 17,
	},

	textBold: {
		color: 'white',
		fontSize: 19,
		marginBottom: 5,
	},

	text: {
		color: 'white',
		fontSize: 14,
		marginBottom: 10,
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

	textInput: {
		marginTop: 3,
		color: 'black',
		fontSize: 15,
		paddingLeft: 8,
		paddingRight: 8,
		backgroundColor: '#f0f0f0',
		borderRadius: 4
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
			is_create: false,
			item: this.props.route.item,
			botName: this.props.route.botName,
			message: this.props.route.message,
			owner: this.props.route.owner,
			obj: {},
		};
		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.onType = this.onType.bind(this);
		this.popAndSetData = this.popAndSetData.bind(this);
		this.updateDoc = this.updateDoc.bind(this);
		this.updateItems = this.updateItems.bind(this);
		this.renderFields = this.renderFields.bind(this);
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

	componentDidMount() {
		let obj = {};
		let x = Object.keys(this.state.item).filter((nn) => this.state.item[nn].is_editable == 1);
		x.map((nn) => obj[nn] = this.state.item[nn].fieldvalue);
		this.setState({ obj: obj });
	}

	onType(e, mm) {
		let obj = this.state.obj;
		obj[mm] = e.nativeEvent.text;
		this.setState({ obj: obj });
	}

	updateItems() {
		let item = Object.assign({}, this.state.item);
		Object.keys(this.state.obj).forEach((nn) => item[nn].fieldvalue = this.state.obj[nn])
		return item;
	}

	isRequiredFieldsNotEmpty() {
		let x = Object.keys(this.state.item).filter((nn) => this.state.item[nn].is_req == 1);
		x = x.filter((nn) => this.state.obj[nn].length > 0);
		if (x && x.length > 0) {
			return true;
		}
		return false;
	}

	updateDoc() {
		if (this.isRequiredFieldsNotEmpty()) {
			const item_id = this.state.item["name"].fieldvalue
			
			let text = `Update ${this.state.botName} where id is ${item_id}.`, base_action = 'update_';
			if(item_id == null || item_id.length < 1){
				text = `Create new ${this.state.botName}`;
				base_action = 'create_';
			}

			const x = Object.assign({}, this.state.message, {
				_id: Math.round(Math.random() * 1000000),
				text: text,
				createdAt: new Date(),
				user: {
					_id: this.state.owner.userId,
					name: this.state.owner.userName,
				},
				info: {
					...this.state.message.info,
					base_action: base_action,
					items: [].concat(this.updateItems())
				}
			});
			
			this.popAndSetData({
				item_id: item_id,
				message: x
			});
		} else {
			AlertHelper.showAlert('Its empty!', 'Please enter text and then update.');
		}
	}

	renderFields() {
		let x = Object.keys(this.state.item).filter((nn) => this.state.item[nn].is_editable == 1);
		x = x.map((nn) => {
			return (
				<View style={[styles.view, { marginBottom: 10 }]} key={nn}>
					<Text style={[styles.textBodyBold]}> {'* ' + CollectionUtils.capitalize(nn)} </Text>
					<AutoGrowTextInput
						style={styles.textInput}
						ref={nn}
						placeholder='Start here...'
						autoCorrect={false}
						onChange={(event) => this.onType(event, nn)}
						placeholderTextColor={this.props.placeholderTextColor}
						multiline={true}
						value={this.state.obj[nn]}
						autoCapitalize='sentences'
						enablesReturnKeyAutomatically={true}
						underlineColorAndroid="transparent" />
				</View>);
		});
		return x;
	}

	render() {
		console.log(this.state.item);
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => {
						this.popAndSetData()
					}}
					centerElement=''
					rightElement={['done']}
					onRightElementPress={(action) => {
						if (action.index == 0)
							this.updateDoc()
					}}
					translucent={true} />

					<View style={styles.container}>
						<View style={[{ backgroundColor: '#0086ff', height: 68, marginBottom: 2 }]}>
							<View style={[styles.view, { flexDirection: 'row' }]}>
								<View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
									<Text style={[styles.textBold, { color: 'white' }]}>{this.state.botName}</Text>
									<Text style={[styles.text, { color: 'white' }]}>{this.state.item["name"].fieldvalue}</Text>
								</View>
							</View>
						</View>
						<ScrollView style={{ flex: 1 }} keyboardDismissMode='interactive'>
							<Card fullWidth='0'>
								<View style={{ flex: 1 }}>
									{this.renderFields()}
								</View>
							</Card>
						</ScrollView>
					</View>
			</View>
		);
	}
}

EditInfoPage.propTypes = propTypes;
export default EditInfoPage;
