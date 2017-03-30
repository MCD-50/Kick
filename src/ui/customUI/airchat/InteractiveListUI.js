import React from 'react';
import {
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ListView,
} from 'react-native';

import AvatarUI from './AvatarUI.js';
const textStyle = {
	fontSize: 15,
	marginTop: 3,
	marginLeft: 10,
	marginRight: 10,
}

const headerStyle = {
	fontSize: 14,
	marginTop: 3,
	marginLeft: 10,
	marginRight: 10,
	fontWeight: '400',
};

const iStyle = StyleSheet.create({
	container: {
	},
	text: {
		fontSize: 14,
		color: 'black',
		marginTop: 3,
		marginLeft: 8,
		marginRight: 8,
	},

	textSec: {
		fontSize: 13,
		marginTop: 3,
		marginBottom: 3,
		marginLeft: 8,
		color: '#ababab',
		marginRight: 8,

	},
	separator: {
		height: StyleSheet.hairlineWidth,
		marginLeft: 10,
		marginRight: 10,
		backgroundColor: '#8E8E8E',
	},
});


const styles = {

	left: StyleSheet.create({
		container: {
		},
		innerContainer: {
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
		},
		header: {
			color: 'black',
			...headerStyle
		},
		text: {
			color: 'black',
			...textStyle,
		},
	}),

	right: StyleSheet.create({
		container: {
		},
		innerContainer: {
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
		},
		header: {
			color: 'black',
			...headerStyle
		},
		text: {
			color: 'white',
			...textStyle,
		},
	})
}

const contextTypes = {
	actionSheet: React.PropTypes.func,
};

const defaultProps = {
	currentMessage: {
		text: '',
	},
	containerStyle: {},
	info: {
		base_action: null,
		button_text: '',
		items: []
	},
	textStyle: {},
	headerStyle: {},
	onViewMore: () => { },
	onItemClicked: () => { },
};

const propTypes = {
	currentMessage: React.PropTypes.object,
	containerStyle: View.propTypes.style,
	info: React.PropTypes.object,
	textStyle: Text.propTypes.style,
	headerStyle: Text.propTypes.style,
	onViewMore: React.PropTypes.func,
	onItemClicked: React.PropTypes.func,
};

const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });


class InteractiveListUI extends React.Component {
	constructor(props) {
		super(props);
		this.capitalize = this.capitalize.bind(this);
		this.getHeaderColor = this.getHeaderColor.bind(this);
		this.getHeader = this.getHeader.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.renderElement = this.renderElement.bind(this);
	}

	capitalize(str) {
		var pieces = str.split(" ");
		for (var i = 0; i < pieces.length; i++) {
			var j = pieces[i].charAt(0).toUpperCase();
			pieces[i] = j + pieces[i].substr(1);
		}
		return pieces.join(" ");
	}

	getHeaderColor(headerText) {
		const length = headerText.length;
		return colors[length % colors.length];
	}

	getHeader(props) {
		if (props.currentMessage.isGroupChat && props.position.toString() == 'left') {
			return (
				<Text style={[styles[props.position].header, props.headerStyle[props.position], {
					color: this.getHeaderColor(props.currentMessage.user.name)
				}]}>
					{this.capitalize(props.currentMessage.user.name)}
				</Text>
			);
		}
		return null;
	}

	renderItem(item) {
		let x = Object.keys(item).map((key) => {
			if (item[key].list_title_field != 0)
				return item[key]
		}).filter((nn) => nn != undefined || nn != null);
		x = x.sort((x, y) => x.list_title_field > y.list_title_field ? 1 : -1);
		if (x && x.length > 0) {
			if (x.length > 1) {
				return (
					<View style={{ flexDirection: 'row' }}>
						<AvatarUI text={x[0].fieldvalue.toUpperCase()} size={14} />
						<View style={{ flexDirection: 'column' }}>
							<Text style={iStyle.text}> {x[0].fieldvalue.substring(0, 30) + '...'} </Text>
							<Text style={iStyle.textSec}> {x[1].fieldvalue.split(' ')[0]} </Text>
						</View>
					</View>
				);
			} else {
				return (
					<View style={{ flexDirection: 'row' }}>
						<AvatarUI text={x[0].fieldvalue.toUpperCase()} size={14} />
						<View style={{ flexDirection: 'column' }}>
							<Text style={iStyle.text}> {x[0].fieldvalue.substring(0, 30) + '...'} </Text>
							<Text style={iStyle.textSec}> {x[0].fieldvalue.split(' ')[0]} </Text>
						</View>
					</View>
				);
			}
		} else {
			return null;
		}
	}

	renderListItem(props) {
		let listItems = props.currentMessage.info.items;
		if (listItems.length > 3)
			listItems = listItems.slice(0, 3);
		const views = listItems.map((item, key) => {
			return (
				<TouchableOpacity key={key} style={[iStyle.container, { marginBottom: 3 }]} onPress={() => { props.onItemClicked(props.currentMessage, key) }} accessibilityTraits="button">
					{this.renderItem(item)}
				</TouchableOpacity>
			);
		});
		return views
	}

	renderElement(props) {
		if (props.currentMessage.info.items.length < 1) {
			return (<Text style={iStyle.text}>Its empty in here.</Text>);
		}
		return (<View style={[styles[props.position].innerContainer]}>
			<Text style={[styles[props.position].text, props.textStyle[props.position], { marginBottom: 5 }]}>
				{props.currentMessage.text}
			</Text>

			{this.renderListItem(props)}

			<TouchableOpacity
				style={[styles[props.position].innerContainer, { marginTop: 5 }]}
				onPress={() => { props.onViewMore(props.currentMessage) }}
				accessibilityTraits="button">
				<Text style={[styles[props.position].text, {
					color: '#527DA3', fontSize: 12, fontWeight: 'bold', borderWidth: 1.2,
					alignItems: 'flex-start', marginTop: 3, marginLeft: 10, marginRight: 10,
					borderColor: '#527DA3', borderRadius: 3, padding: 5, paddingLeft: 10, paddingRight: 10
				}]}>
					{props.currentMessage.info.button_text.toUpperCase()}
				</Text>
			</TouchableOpacity>
		</View>);
	}

	render() {
		if (this.props.position == 'left') {
			return (
				<View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
					{
						this.getHeader(this.props)
					}
					{this.renderElement(this.props)}
				</View>
			);
		} else {
			return (
				<View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
					{
						this.getHeader(this.props)
					}
					<View style={[styles[this.props.position].innerContainer]}>
						<Text style={[styles[this.props.position].text, this.props.textStyle[this.props.position], { marginBottom: 5 }]}>
							{this.props.currentMessage.text}
						</Text>
					</View>
				</View>
			)
		}
	}
}


InteractiveListUI.propTypes = propTypes;
InteractiveListUI.defaultProps = defaultProps;
InteractiveListUI.contextTypes = contextTypes;

export default InteractiveListUI;