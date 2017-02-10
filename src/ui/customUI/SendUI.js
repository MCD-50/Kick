import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';

import Icon from './Icon.js';

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        height: 51,
    },
    icon: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

const defaultProps = {
    text: '',
    onSend: () => { },
    label: 'Send',
    containerStyle: {},
    textStyle: {},
};

const propTypes = {
    text: React.PropTypes.string,
    onSend: React.PropTypes.func,
    label: React.PropTypes.string,
    containerStyle: View.propTypes.style,
    textStyle: Text.propTypes.style,
};


class SendUI extends Component {
    render() {

        if (this.props.text.trim().length > 0) {
            return (<TouchableOpacity
                style={[styles.container, this.props.containerStyle]}
                onPress={() => {
                    this.props.onSend({ text: this.props.text.trim() }, true);
                } }
                accessibilityTraits="button">
                <View style={styles.icon}>
                    <Icon name='send' color='#527DA3' size={23} />
                </View>
            </TouchableOpacity>);
        }
        return (
            <TouchableOpacity
                style={[styles.container, this.props.containerStyle]}
                onPress={() => {

                } }
                accessibilityTraits="button">
                <View style={styles.icon}>
                    <Icon name='attach-file' color='#B8B8B8' size={23} />
                </View>
            </TouchableOpacity>);
    }
}

SendUI.propTypes = propTypes;
SendUI.defaultProps = defaultProps;

export default SendUI;