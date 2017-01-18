
import { View, StyleSheet, Image, StatusBar, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes, } from 'react';

import { Toolbar, Icon } from 'react-native-material-ui';
import Container from './Container.js';

const background = require('../res/images/Splash.png');

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

class SplashPage extends Component {

    componentDidMount() {
        var navigator = this.props.navigator;
        setTimeout(() => {
            navigator.replace({ id: 'Base', name: 'Splash', data: {} });
        }, 4000);
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor='white'
                    barStyle='light-content' />
              
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', }}>
                    <Image source={background} style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }} resizeMode="contain" />
                </View>
            </View>
        );
    }
}



SplashPage.propTypes = propTypes;

export default SplashPage;