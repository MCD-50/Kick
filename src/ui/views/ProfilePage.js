//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ScrollView, TouchableOpacity, BackAndroid } from 'react-native';

//import from app
import { Toolbar, Avatar, Progress, Icon, Card, RippleFeedback } from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import { IS_LOGGED, GET_USER_BY_EMAIL } from '../../constants/AppConstant.js';
import { setData } from '../../helpers/AsyncStore.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getTitle, getLastActive, getTextColor } from '../../helpers/CollectionHelper.js';

const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,
};

class ProfilePage extends Component {
	constructor(params) {
		super(params);
		this.state = {
			data: [],
			isLoading: true,
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

	componentDidMount() {
		const url = GET_USER_BY_EMAIL.format(this.state.appInfo.domain);
		const data = { email: this.state.appInfo.email };
		resolveRequest(url, data)
		.then((res) => {
			if (res && res.message)
				this.setState({ isLoading: false, data: res.message })
		}).catch((rej) => this.setState({ isLoading: false, data: [] }))
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
				this.props.route.data.callback(Page.OWNER_INFO_PAGE)
			this.props.navigator.pop();
			return true;
		}
		return false;
	}



	renderElement() {
		if (this.state.data.length > 0) {
			const x = this.state.data[0];
			const title = getTitle(x.full_name);

			return (
				<View style={style.container_with_flex_1}>
					<View style={{ backgroundColor: STATUS_BAR_COLOR, height: 68, marginBottom: 2 }}>
						<View style={[style.view_with_flex_1_and_margin_all_sides, { flexDirection: 'row' }]}>
							<View>
								<Avatar size={55} bgcolor={getTextColor(chat.full_name)} text={title} />
							</View>
							<View style={{ flex: 1, marginLeft: 15, alignItems: 'flex-start', justifyContent: 'center' }}>
								<Text style={style.text_with_margin_bottom_and_font_size_19}>{chat.full_name}</Text>
								<Text style={style.text_with_margin_bottom_and_font_size_14}>{getLastActive(chat.last_active.split('.')[0])}</Text>
							</View>
						</View>
					</View>
					<ScrollView style={style.container_with_flex_1} keyboardDismissMode='interactive'>
						<Card fullWidth='0'>
							<View style={style.view_with_flex_1_and_margin_all_sides}>
								<Text style={[style.text_with_black_color_and_font_size_17, {marginBottom:5}]}>Email</Text>
								<Text style={style.text_with_gray_color_and_font_size_14}>{chat.email}</Text>
							</View>
							<View style={style.view_with_flex_1_and_margin_all_sides}>
								<Text style={[style.text_with_black_color_and_font_size_17, {marginBottom:5}]}>Current site</Text>
								<Text style={style.text_with_gray_color_and_font_size_14}>{this.state.owner.domain}</Text>
							</View>
						</Card>
						<Card fullWidth='0'>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6}}>
								<View style={style.view_with_flex_1_and_margin_all_sides}>
									<Text style={[style.text_with_black_color_and_font_size_17, {marginBottom:5}]}>Bio</Text>
									<Text style={style.text_with_gray_color_and_font_size_14}>Its empty in here</Text>
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
				<View style={style.progress_ring_centered_view}>
					<Progress />
				</View>
			);
		}
	}

	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					leftElement="arrow-back"
					rightElement={{
						menu: {
							labels: ['Logout']
						}
					}}
					centerElement=''
					onLeftElementPress={() => this.popPage()}
					onRightElementPress={(action) => {
						if (action.index == 0) {
							setData(IS_LOGGED, 'false');
							setTimeout(() => {
								const page = Page.LOGIN_PAGE;
								this.props.navigator.resetTo({ id: page.id, name: page.name });
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

ProfilePage.propTypes = propTypes;
export default ProfilePage;