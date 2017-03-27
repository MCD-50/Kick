
import React, { Component, PropTypes } from 'react';
import {
	StyleSheet,
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	Linking,
	Alert,
	ScrollView,
	StatusBar
} from 'react-native';

import Fluxify from 'fluxify';
import InternetHelper from '../../../helpers/InternetHelper.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import { hasServerUrl, setData, getStoredDataFromKey } from '../../../helpers/AppStore.js';
import Progress from '../../customUI/Progress.js';
import {
	FULL_URL, SERVER_URL, DOMAIN, EMAIL,
	UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN,
	COLOR, USERNAME, STATUS, FULL_NAME, FIRST_RUN
} from '../../../constants/AppConstant.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Toast from '../../customUI/Toast.js';
var frappeIcon = require('../../../res/appIcon.png');
var backgroundImage = require('../../../res/backgroundImage.png');

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
	text: {
		flex: 1,
		color: 'white',
		fontSize: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInput: {
		color: 'black',
		fontSize: 17,
		borderWidth: 1.2,
		borderColor: 'transparent',
		backgroundColor: 'white',
		borderRadius: 3,
		padding: 5,
		paddingLeft: 10,
		paddingRight: 10
	},
	image: {
		width: 80,
		height: 80,
	},
	backgroundImage: {
		flex: 1,
		width: null,
		height: null,
		resizeMode: 'cover'
	}
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
	placeholder: 'Text...',
	placeholderTextColor: '#b2b2b2',
	multiline: false,
	autoFocus: false,
};


const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];




class LoginPage extends Component {

	constructor(params) {
		super(params);
		this.state = {
			domain: '',
			email: '',
			password: '',
			showProgress: false,
			showFirstRunPage: this.props.route.showFirstRunPage,
		};

		this.login = this.login.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.signUp = this.signUp.bind(this);
		this.isAllowed = this.isAllowed.bind(this);
		this.showAlert = this.showAlert.bind(this);
		this.cleanDomain = this.cleanDomain.bind(this);
		this.setServerUrl = this.setServerUrl.bind(this);
		this.resolveServerUrl = this.resolveServerUrl.bind(this);
		this.onType = this.onType.bind(this);
		this.renderSignIn = this.renderSignIn.bind(this);
		this.addAllUsers = this.addAllUsers.bind(this);
		this.saveData = this.saveData.bind(this);
		this.checkIfSameCredential = this.checkIfSameCredential.bind(this);
	}


	signUp() {
		Linking.openURL('https://erpnext.com/login#signup');
	}

	forgotPassword() {
		Linking.openURL('https://erpnext.com/login#forgot');
	}

	login() {
		this.setState({ showProgress: true, });
		if (this.isAllowed()) {
			this.checkIfSameCredential((old_email) => {
				if (old_email && old_email.toLowerCase() != this.state.email.toLowerCase()) {
					this.showAlert("Email doesn't match", "Your previous email does not matches with entered email. All data will be erased. You want to continue?",
						() => {
							DatabaseHelper.eraseEverything((msg) => {
								this.saveData();
							})
						})
				} else {
					this.saveData();
				}
			});
		} else {
			this.showAlert('Info...', 'Please fill in all the details');
		}
	}

	saveData() {
		let domain = this.state.domain.trim().toLowerCase();
		let email = this.state.email.trim().toLowerCase();
		let password = this.state.password;
		let full_url = 'http://' + domain + '/api/method/login?' + 'usr=' + email + '&pwd=' + password;
		InternetHelper.login(full_url, (title, body) => {
			this.showAlert(title, body);
		}, (msg) => {
			setData(DOMAIN, domain);
			setData(EMAIL, email);
			setData(FULL_URL, full_url);
			setData(FULL_NAME, msg.full_name)
			this.resolveServerUrl();
		})
	}

	checkIfSameCredential(callback) {
		getStoredDataFromKey(EMAIL)
			.then((email) => {
				callback(email);
			})
	}


	cleanDomain(domain) {
		let array = domain.split("/");
		length = array.length;
		return array[length - 1];
	}

	isAllowed() {
		let state = this.state;
		let domain = state.domain;
		let email = state.email;
		let password = state.password;
		if (domain && email && password && domain.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0)
			return true;
		return false;
	}

	resolveServerUrl() {
		let domain = this.state.domain;
		fetch('http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_dev_port')
			.then((res) => res.json())
			.then((data) => {
				if (data.message[0] == 1) {
					domain = domain.split(':');
					let url = 'http://' + domain[0] + ':' + data.message[1];
					this.setServerUrl(url);
				} else {
					domain = domain.split(':');
					let url = 'http://' + domain[0];
					this.setServerUrl(url);
				}
			}, (reject) => {
				this.showAlert('Error...', 'Something went wrong.');
			});
	}

	setServerUrl(server_url, set) {
		setData(SERVER_URL, server_url);
		DatabaseHelper.getAllChatsByQuery({ chat_type: Type.PERSONAL }, (results) => {
			this.addAllUsers(results.filter((n) => n.info.email != this.state.email));
		})
	}

	addAllUsers(users) {
		const domain = this.state.domain.toLowerCase().trim();
		const email = this.state.email.toLowerCase().trim();
		InternetHelper.getAllUsers(domain, email,
			(array, msg) => {
				if (array && array.length > 0) {
					users = CollectionUtils.addAndUpdateContactList(users,
						array.filter((nn) => nn.email != email), {
							userName: array.filter((nn) => nn.email == email)[0].full_name,
							userId: email
						});
				}
				DatabaseHelper.addNewChat(users, (msg) => {
					//console.log(msg)
					setData(FIRST_RUN, 'false');
					CollectionUtils.addDefaultBots(() => {
						let page = Page.CHAT_LIST_PAGE;
						this.props.navigator.replace({ id: page.id, name: page.name });
					});
				}, true);
			});

	}

	showAlert(title, body, callback = null) {
		this.setState({ showProgress: false, });
		Alert.alert(
			title,
			body,
			[{
				text: 'OK', onPress: () => {
					if (callback)
						callback();
				}
			}]
		);
	}

	onType(e, whichState) {
		if (whichState == 1) {
			this.setState({ domain: this.cleanDomain(e.nativeEvent.text) });
		} else if (whichState == 2) {
			this.setState({ email: e.nativeEvent.text });
		} else if (whichState == 3) {
			this.setState({ password: e.nativeEvent.text });
		}
	}


	renderSignIn() {
		if (this.state.showProgress) {
			return (
				<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
					<Progress />
				</View>
			)
		}
		return null;
	}


	render() {
		return (
			<Image style={styles.backgroundImage} source={backgroundImage}>
				<StatusBar backgroundColor='black' barStyle='light-content' />
				<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
					<Image source={frappeIcon} style={styles.image} />
				</View>
				<View style={[styles.base]}>
					<ScrollView style={[styles.container]} keyboardDismissMode='interactive'>
						<View style={{ flex: 1, justifyContent: 'center', marginTop: 50 }}>
							<View style={styles.view}>
								<TextInput style={styles.textInput}
									placeholder='Domain'
									editable={!this.state.showProgress}
									onChange={(e) => this.onType(e, 1)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false}
									autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true}
									underlineColorAndroid="transparent" />
							</View>

							<View style={styles.view}>
								<TextInput style={styles.textInput}
									placeholder='Email'
									editable={!this.state.showProgress}
									onChange={(e) => this.onType(e, 2)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false}
									autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true}
									underlineColorAndroid="transparent"
								/>
							</View>

							<View style={styles.view}>
								<TextInput style={styles.textInput}
									placeholder='Password'
									editable={!this.state.showProgress}
									onChange={(e) => this.onType(e, 3)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false}
									autoCapitalize='sentences'
									secureTextEntry={true}
									enablesReturnKeyAutomatically={true}
									underlineColorAndroid="transparent"
								/>
							</View>

							<TouchableOpacity style={{
								alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: LEFTMARGIN,
								marginRight: RIGHTMARGIN,
								marginTop: RIGHTMARGIN,
								marginBottom: RIGHTMARGIN,
							}}
								disabled={this.state.showProgress}
								onPress={() => { this.forgotPassword() }}
								accessibilityTraits="button">
								<Text style={[styles.text, { color: '#0086ff', fontSize: 14 }]}>Forgot Password?</Text>
							</TouchableOpacity>

							<View style={[styles.view, { minWidth: 100, backgroundColor: '#0086ff' }]}>
								<TouchableOpacity style={{
									alignItems: 'center',
									justifyContent: 'center',
									padding: 15,
									paddingBottom: 8,
									paddingTop: 8
								}}
									onPress={() => this.login()}
									accessibilityTraits="button">
									<Text style={[styles.text, { color: 'white', fontSize: 16 }]}>Login</Text>
								</TouchableOpacity>
							</View>


							<TouchableOpacity style={{
								alignItems: 'center', justifyContent: 'center', marginLeft: LEFTMARGIN,
								marginRight: RIGHTMARGIN,
								marginTop: RIGHTMARGIN,
								marginBottom: RIGHTMARGIN
							}}
								disabled={this.state.showProgress}
								onPress={() => { this.signUp() }}
								accessibilityTraits="button">
								<Text style={[styles.text, { color: '#0086ff', fontSize: 14 }]}>Don't have an account? Sign Up</Text>
							</TouchableOpacity>

							{this.renderSignIn()}
						</View>
					</ScrollView>
				</View>
			</Image>
		);
	}
}

LoginPage.propTypes = propTypes;
LoginPage.defaultProps = defaultProps;
export default LoginPage;
