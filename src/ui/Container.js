import { View, StyleSheet, StatusBar, } from 'react-native';
import React, { Component, PropTypes } from 'react';

const propTypes = {
    children: PropTypes.node,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

class Container extends Component {
    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor='#333333'
                    barStyle='light-content' />

                {this.props.children}
            </View>
        );
    }
}

Container.propTypes = propTypes;

export default Container;