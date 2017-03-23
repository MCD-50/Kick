import { View, StyleSheet, StatusBar, } from 'react-native';
import React, { Component, PropTypes } from 'react';

const propTypes = {
    children: PropTypes.node,
    color: PropTypes.string,
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


class Container extends Component {

    getColor() {
        if (this.props.color) {
            return this.props.color;
        }
        return '#0086ff';
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={this.getColor()} barStyle='light-content' />
                {this.props.children}
            </View>
        );
    }
}

Container.propTypes = propTypes;
export default Container;