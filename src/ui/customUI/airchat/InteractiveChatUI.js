import React from 'react';
import {
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Button,
} from 'react-native';


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
	info: {
		button_text: '',
	},
	containerStyle: {},
	textStyle: {},
	headerStyle: {},
	buttonStyle: {},
	onViewInfo: () => { },
};

const propTypes = {
	currentMessage: React.PropTypes.object,
	info: React.PropTypes.object,
	containerStyle: React.PropTypes.shape({
		left: View.propTypes.style,
		right: View.propTypes.style,
	}),

	textStyle: React.PropTypes.shape({
		left: Text.propTypes.style,
		right: Text.propTypes.style,
	}),
	headerStyle: React.PropTypes.shape({
		left: Text.propTypes.style,
		right: Text.propTypes.style,
	}),

	onViewInfo: React.PropTypes.func,
};

const colors = [
	'#e67e22', // carrot
	'#3498db', // peter river
	'#8e44ad', // wisteria
	'#e74c3c', // alizarin
	'#1abc9c', // turquoise
	'#2c3e50', // midnight blue
];

class InteractiveChatUI extends React.Component {
	constructor(props) {
		super(props);
		this.capitalize = this.capitalize.bind(this);
		this.getHeaderColor = this.getHeaderColor.bind(this);
		this.getHeader = this.getHeader.bind(this);
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

	render() {
		if (this.props.position == 'left') {
			return (
				<View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
					{
						this.getHeader(this.props)
					}
					<View style={styles[this.props.position].container}>
						<Text style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}>
							{this.props.currentMessage.text}
						</Text>

						<TouchableOpacity
							style={[styles[this.props.position].innerContainer]}
							onPress={() => { this.props.onViewInfo(this.props.currentMessage) }}
							accessibilityTraits="button">
							<Text style={[styles[this.props.position].text, {
								color: '#527DA3',
								fontSize: 12,
								fontWeight: 'bold',
								borderWidth: 1.2,
								marginTop: 7,
								marginLeft: 10,
								marginRight: 10,
								borderColor: '#527DA3',
								borderRadius: 3,
								borderLeftWidth: 0,
								padding: 5,
								paddingLeft: 10,
								paddingRight: 10
							}]}>
								{this.props.currentMessage.info.button_text.toUpperCase()}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		} else {
			return (
				<View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
					{
						this.getHeader(this.props)
					}
					<View style={styles[this.props.position].container}>
						<Text style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}>
							{this.props.currentMessage.text}
						</Text>
					</View>
				</View>);
		}
	}
}


InteractiveChatUI.propTypes = propTypes;
InteractiveChatUI.defaultProps = defaultProps;
InteractiveChatUI.contextTypes = contextTypes;

export default InteractiveChatUI;