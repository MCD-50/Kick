//import from system
import React, { Component, PropTypes } from 'react';
import { View, Text, ScrollView, ListView, TouchableOpacity, BackAndroid } from 'react-native';

//import from app
import { Toolbar, Avatar, Progress, Card, Icon } from 'react-native-material-component';
import { Page } from '../../enums/Page.js';
import { resolveRequest } from '../../helpers/InternetHelper.js';
import { setData, getData } from '../../helpers/AsyncStore.js';
import { style } from '../../constants/AppStyle.js';
import { STATUS_BAR_COLOR } from '../../constants/AppColor.js'
import { getTitle, getTextColor } from '../../helpers/CollectionHelper.js';




const propTypes = {
	navigator: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
	chats: PropTypes.array.isRequired,
	messages: PropTypes.array.isRequired,
	chat: PropTypes.object.isRequired,
};


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class GroupInfoPage extends Component {

	constructor(params) {
		super(params);
		const chat = this.props.route.data.chat;
		this.state = {
			chat: chat,
			dataSource: ds.cloneWithRows(chat.info.users),
		}

		this.addBackEvent = this.addBackEvent.bind(this);
		this.removeBackEvent = this.removeBackEvent.bind(this);
		this.popPage = this.popPage.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.renderListItem = this.renderListItem.bind(this);
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
				this.props.route.data.callback(Page.GROUP_INFO_PAGE)
			this.props.navigator.pop();
			return true;
		}
		return false;
	}

	renderElement() {
		const chat = this.state.chat;
		const title = getTitle(chat.title);
		return (
			<View style={style.container_with_flex_1}>
				<View style={{ backgroundColor: STATUS_BAR_COLOR, height: 68, marginBottom: 2 }}>
					<View style={[style.view_with_flex_1_and_margin_all_sides, { flexDirection: 'row' }]}>
						<View>
							<Avatar size={55} bgcolor={getTextColor(chat.title)} text={title} />
						</View>
						<View style={{ flex: 1, marginLeft: 15, alignItems: 'flex-start', justifyContent: 'center' }}>
							<Text style={style.text_with_margin_bottom_and_font_size_19}>{chat.title}</Text>
							<Text style={style.text_with_margin_bottom_and_font_size_14}>{chat.info.users.length + ' People'}</Text>
						</View>
					</View>
				</View>
				<ScrollView style={style.container_with_flex_1} keyboardDismissMode='interactive'>
					<Card fullWidth='0'>
						<View style={style.view_with_flex_1_and_margin_all_sides}>
							<Text style={[style.text_with_black_color_and_font_size_17, { marginBottom: 5 }]}>Encryption</Text>
							<Text style={style.text_with_gray_color_and_font_size_14}>Messages you send to this group is secured with end-to-end encyption.</Text>
						</View>
					</Card>
					<Card fullWidth='0'>
						<View style={style.view_with_flex_1_and_margin_all_sides}>
							<View style={[style.container_with_flex_1, { flexDirection: 'row', alignItems: 'center' }]}>
								<Icon color='black' name='people' />
								<Text style={[style.text_with_black_color_and_font_size_17, { fontSize: 14 }]}>  Members</Text>
							</View>
						</View>
						<View>
							<ListView
								dataSource={this.state.dataSource}
								keyboardShouldPersistTaps='always'
								keyboardDismissMode='interactive'
								enableEmptySections={true}
								ref={'LISTVIEW'}
								renderRow={(item) => this.renderListItem(item)}
							/>
						</View>
					</Card>
				</ScrollView>
			</View>
		)
	}


	renderListItem(chat) {
		const title = getTitle(chat.title);
		return (
			<ListItem
				divider
				leftElement={<Avatar bgcolor={getTextColor(chat.title)} text={title} />}
				centerElement={{
					primaryElement: {
						primaryText: chat.title,
					},
					secondaryText: chat.email,
				}} />
		);
	}

	render() {
		return (
			<View style={style.container_with_flex_1}>
				<Toolbar
					leftElement="arrow-back"
					onLeftElementPress={() => this.popPage()}
					translucent={true} />
				{this.renderElement()}
			</View>
		)
	}
}

GroupInfoPage.propTypes = propTypes;
export default GroupInfoPage;