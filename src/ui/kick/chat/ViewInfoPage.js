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
import AlertHelper from '../../../helpers/AlertHelper.js';
import Card from '../../customUI/Card.js';


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


class ViewInfo extends Component {

	constructor(params) {
		super(params);
		this.state = {
			item: this.props.route.item,
			owner: this.props.route.owner,
			botName: this.props.route.botName,
			message: this.props.route.message,
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.renderView = this.renderView.bind(this);
		this.popAndSetData = this.popAndSetData.bind(this);
		this.deleteDoc = this.deleteDoc.bind(this);
		this.updateDoc = this.updateDoc.bind(this);
	}

	componentWillMount() {
		this.addBackEvent();
	}

	componentWillUnmount() {
		this.removeBackEvent();
	}

	updateDoc() {
		let page = Page.EDIT_INFO_PAGE;
		this.props.navigator.replace({
			id: page.id,
			name: page.name,
			item: this.state.item,
			botName: this.state.botName,
			owner: this.state.owner,
			message: this.state.message,
			callback: this.props.route.callback
		});
	}

	deleteDoc() {
		AlertHelper.showAlert('Delete ?', 'This will delete the item from database. You sure you want to delete this?'
			, (data) => {
				console.log(this.state.item);
				if (data.Ok) {
					let page = Page.CHAT_PAGE;
					const x = Object.assign({}, this.state.message, {
						_id: Math.round(Math.random() * 1000000),
						text: `Delete ${this.state.botName} where id is ${this.state.item["name"].fieldvalue}.`,
						createdAt: new Date(),
						user: {
							_id: this.state.owner.userId,
							name: this.state.owner.userName,
						},
						info: {
							...this.state.message.info,
							base_action: 'delete_',
							items: [].concat(this.state.item)
						}
					});
					this.popAndSetData({
						item_id: this.state.item["name"].fieldvalue,
						message: x
					});
				}
			});
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

	renderView() {
		const components = Object.keys(this.state.item).map((key) => {
			if (key == 'name')
				return null;
			console.log(this.state.item, key);
			return (
				<View key={key} style={styles.view}>
					<Text style={styles.textBodyBold}>{CollectionUtils.capitalize(key)}</Text>
					<Text style={[styles.text, { color: '#a0a0a0' }]}>{CollectionUtils.getText(this.state.item[key].fieldvalue)}</Text>
				</View>
			)
		});
		return (
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
						{components}
					</Card>
				</ScrollView>
			</View>
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
					centerElement=''
					rightElement={['delete', 'edit']}
					onRightElementPress={(action) => {
						if (action.index == 0)
							this.deleteDoc()
						else if (action.index == 1)
							this.updateDoc()
					}}
					translucent={true} />
				{this.renderView()}
			</View>)
	}

}

ViewInfo.propTypes = propTypes;
export default ViewInfo;
