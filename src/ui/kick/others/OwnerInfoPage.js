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
	RIGHTMARGIN,
	FIRST_RUN
} from '../../../constants/AppConstant.js';
import { setData } from '../../../helpers/AppStore.js';
import Icon from '../../customUI/Icon.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import CheckBox from '../../customUI/CheckBox.js';
import RippleFeedback from '../../customUI/utils/ripplefeedback.js';


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


class OwnerInfoPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			data: [],
			isLoading: true,
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
					this.props.route.callback(Page.OWNER_INFO_PAGE)
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
					this.props.route.callback(Page.OWNER_INFO_PAGE)
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
		InternetHelper.get_user(this.state.owner.domain, this.state.owner.userId,
			(res) => {
				this.setState({
					isLoading: false,
					data: res && res.message ? res.message : []
				});
			});
	}

	getColor(name) {
		const length = name.length;
		return colors[length % colors.length];
	}

	renderElement() {
		if (this.state.data.length > 0) {
			const chat = this.state.data[0];
			const title = (chat.full_name.length > 1) ?
				chat.full_name[0] + chat.full_name[1].toUpperCase() :
				((chat.full_name.length > 0) ?
					chat.full_name[0] :
					'UN');
			return (
				<View style={styles.container}>
					<View style={[{ backgroundColor: '#0086ff', height: 68, marginBottom: 2 }]}>
						<View style={[styles.view, { flexDirection: 'row' }]}>
							<View>
								<Avatar size={55} bgcolor={this.getColor(chat.full_name)} text={title} />
							</View>
							<View style={{
								flex: 1, marginLeft: 15,
								alignItems: 'flex-start', justifyContent: 'center'
							}}>
								<Text style={styles.textBold}>{chat.full_name}</Text>
								<Text style={styles.text}>{CollectionUtils.getLastActive(chat.last_active.split('.')[0])}</Text>
							</View>
						</View>
					</View>
					<ScrollView style={{ flex: 1 }} keyboardDismissMode='interactive'>
						<Card fullWidth='0'>
							<View style={styles.view}>
								<Text style={styles.textBodyBold}>Email</Text>
								<Text style={styles.textBody}>{chat.email}</Text>
							</View>
							<View style={styles.view}>
								<Text style={styles.textBodyBold}>Current site</Text>
								<Text style={styles.textBody}>{this.state.owner.domain}</Text>
							</View>
						</Card>
						<Card fullWidth='0'>
							<View style={[styles.view, { flexDirection: 'row', alignItems: 'center', marginRight: 6 }]}>
								<View style={{ flex: 1 }}>
									<Text style={styles.textBodyBold}>Bio</Text>
									<Text style={styles.textBody}>Its empty in here</Text>
								</View>

								<RippleFeedback onPress={() => console.log('text')}>
									<View style={{ padding: 10 }}>
										<Icon color='black' name='edit' size={20} />
									</View>
								</RippleFeedback>
							</View>
						</Card>
					</ScrollView>
				</View>
			)
		} else {
			return (
				<View style={[styles.view, { alignItems: 'center', justifyContent: 'center' }]}>
					<Progress />
				</View>
			);
		}
	}

	render() {
		return (
			<View style={styles.base}>
				<Toolbar
					leftElement="arrow-back"
					rightElement={{
						menu: {
							labels: ['Logout']
						}
					}}
					centerElement=''
					onLeftElementPress={() => {
						if (this.props.route.callback)
							this.props.route.callback(Page.OWNER_INFO_PAGE)
						this.props.navigator.pop();
					}}
					onRightElementPress={(action) => {
						if (action.index == 0) {
							setData(FIRST_RUN, 'true');
							setTimeout(() => {
								const page = Page.LOGIN_PAGE;
								this.props.navigator.resetTo({ id: page.id, name: page.name, showFirstRunPage: true })
							}, 100);
						}
					}}
					translucent={true}
				/>
				{this.renderElement()}
			</View>
		)
	}
}

OwnerInfoPage.propTypes = propTypes;
export default OwnerInfoPage;