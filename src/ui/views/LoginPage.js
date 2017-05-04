//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Linking, ScrollView, StatusBar } from 'react-native';

//import from app
import { Progress, Toast } from 'react-native-material-component';
import { login } from '../../helpers/InternetHelper.js';
import { setData, getData } from '../../helpers/AsyncStore.js';
import { SERVER_URL, APP_INFO} from '../../constants/AppConstant.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { Page } from '../../enums/Page.js';
import { Type } from '../../enums/Type.js';
import DatabaseHelper from '../../helpers/DatabaseHelper.js';
import AlertHelper from '../../helpers/AlertHelper.js';
var frappeIcon = require('../../res/appIcon.png');
var backgroundImage = require('../../res/backgroundImage.png');


const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,

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


class LoginPage extends Component {
	constructor(params) {
		super(params);
		this.state = {
			domain: '',
			email: '',
			password: '',
			progress: false
		};
		this.onLoginClicked = this.onLoginClicked.bind(this);
		this.signUp = this.signUp.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.isNotEmpty = this.isNotEmpty.bind(this);
		this.saveAndLogin = this.saveAndLogin.bind(this);		
		this.resolveServerUrl = this.resolveServerUrl.bind(this);
		this.cleanDomain = this.cleanDomain.bind(this);
		this.onType = this.onType.bind(this);
		this.renderSignIn = this.renderSignIn.bind(this);
	}

	onLoginClicked() {
		this.setState({ progress: true });
		if (this.isNotEmpty()) {
			getData(APP_INFO)
			.then((res)=>{
				res = JSON.parse(res);
				if(res && res.email && res.email.toLowerCase() != this.state.email.toLowerCase()){
					AlertHelper.showAlert("Email doesn't match", 
						"Your previous email does not matches with entered email. All data will be erased. You want to continue?",
						(data)=>{
							if (data.Ok) {
								DatabaseHelper.eraseEverything((msg) => this.saveAndLogin());
							}
						});
				}
			});
		} else {
			AlertHelper.showAlert("Something went wrong.", "Please fill in all the details");
		}
	}

	signUp() {
		Linking.openURL('https://erpnext.com/login#signup');
	}

	forgotPassword() {
		Linking.openURL('https://erpnext.com/login#forgot');
	}

	saveAndLogin() {
		let domain = this.state.domain.trim().toLowerCase();
		let email = this.state.email.trim().toLowerCase();
		let password = this.state.password;
		let url = 'http://' + domain + '/api/method/login?' + 'usr=' + email + '&pwd=' + password;
		
		login(url)
		.then((res)=>{
			//login successfull now fetch the server url
			const data = {domain:domain, email:email, user_name:res.full_name, full_url:url}
			setData(APP_INFO, data)
			this.resolveServerUrl(res);
		}).catch((rej) => this.setState({ progress: false}));
	}

	isNotEmpty() {
		let state = this.state;
		let domain = state.domain;
		let email = state.email;
		let password = state.password;
		if (domain && email && password && domain.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0)
			return true;
		return false;
	}

	resolveServerUrl(full_url) {
		let index = full_url.lastIndexOf('api');
		let ping_url = full_url.substring(0, index);

		fetch(ping_url + '/api/method/frappe.utils.kickapp.bridge.get_dev_port')
		.then((res) => res.json(), (rej)=> AlertHelper.showAlert("Network request failed.",'Something went wrong. Please try in a little bit.'))
		.then((json) => {
			getData(APP_INFO)
			.then((dom)=>{
				dom = JSON.parse(dom).domain;
				const domain = dom.split(':');
				let url = 'http://' + domain[0];
				if (json[0] == 1) {
					url = url + ':' + json[1];
				}
				setData(SERVER_URL, url);
			})
		}, (rej) => AlertHelper.showAlert("Unable to convert to JSON.",'Something went wrong. Please try in a little bit.'));
	}

	cleanDomain(domain) {
		let array = domain.split("/");
		length = array.length;
		return array[length - 1];
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
		if (this.state.progress) {
			return (
				<View style={style.progress_ring_centered_view}>
					<Progress />
				</View>
			)
		}
		return null;
	}

	render() {
		return (
			<Image style={style.background_image_resize_mode_cover} source={backgroundImage}>
				<StatusBar backgroundColor='black' barStyle='light-content' />
				<View style={[style.align_center_justify_center, { marginTop: 20 }]}>
					<Image source={frappeIcon} style={style.small_image_80_height_and_width} />
				</View>

				<View style={style.container_with_flex_1}>
					<ScrollView style={style.container_with_flex_1} keyboardDismissMode='interactive'>
						<View style={[style.container_with_flex_1, { justifyContent: 'center', marginTop: 50 }]}>
							<View style={style.view_with_flex_1_and_margin_all_sides}>
								<TextInput style={style.text_input_standard_style}
									placeholder='Domain' editable={!this.state.progress}
									onChange={(e) => this.onType(e, 1)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false} autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true} underlineColorAndroid="transparent" />

								<TextInput style={[style.text_input_standard_style, {marginTop:10}]}
									placeholder='Email' editable={!this.state.progress}
									onChange={(e) => this.onType(e, 2)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false} autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true} underlineColorAndroid="transparent" />

								<TextInput style={[style.text_input_standard_style, {marginTop:10}]}
									placeholder='Password'
									editable={!this.state.progress}
									onChange={(e) => this.onType(e, 3)}
									placeholderTextColor={this.props.placeholderTextColor}
									multiline={false} autoCapitalize='sentences'
									enablesReturnKeyAutomatically={true} underlineColorAndroid="transparent" />

								<TouchableOpacity style={style.align_end_justify_end}
									disabled={this.state.progress}
									onPress={() => { this.forgotPassword() }}
									accessibilityTraits="button">
									<Text style={[style.text_with_flex_1_and_font_size_17_centered, { color: STATUS_BAR_COLOR, fontSize: 14 }]}>Forgot Password?</Text>
								</TouchableOpacity>

								<View style={{ minWidth: 100, backgroundColor: STATUS_BAR_COLOR }}>
									<TouchableOpacity style={[style.align_center_justify_center, { padding: 15, paddingBottom: 8, paddingTop: 8 }]}
										onPress={() => this.onLoginClicked()}
										accessibilityTraits="button">
										<Text style={[style.text_with_flex_1_and_font_size_17_centered, { color: 'white', fontSize: 16 }]}>Login</Text>
									</TouchableOpacity>
								</View>

								<TouchableOpacity style={style.align_center_justify_center}
									disabled={this.state.showProgress}
									onPress={() => { this.signUp() }}
									accessibilityTraits="button">
									<Text style={[style.text_with_flex_1_and_font_size_17_centered, { color: STATUS_BAR_COLOR, fontSize: 14 }]}>Don't have an account? Sign Up</Text>
								</TouchableOpacity>

							</View>

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
