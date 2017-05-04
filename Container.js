//import from system
import { View, StyleSheet, StatusBar, } from 'react-native';
import React, { Component, PropTypes } from 'react';


//import from app
import { style } from './src/constants/AppStyle.js';
import { STATUS_BAR_COLOR } from './src/constants/AppColor.js';
 
//define propTypes
const propTypes = {
	children: PropTypes.node,
	color: PropTypes.string,
};

class Container extends Component {
	getColor() {
		if (this.props.color) {
			return this.props.color;
		}
		return STATUS_BAR_COLOR;
	}

	render() {
		return (
			<View style={style.container_with_flex_1}>
				<StatusBar backgroundColor={this.getColor()} barStyle='light-content' />
				{this.props.children}
			</View>
		);
	}
}

Container.propTypes = propTypes;
export default Container;