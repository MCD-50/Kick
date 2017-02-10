/* eslint-disable import/no-unresolved, import/extensions */
import React, { PureComponent, PropTypes } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
/* eslint-enable import/no-unresolved, import/extensions */
import Icon from './Icon.js';

const propTypes = {
    image: PropTypes.shape({ type: PropTypes.oneOf([Image]) }),
    icon: PropTypes.string,
    bgcolor: PropTypes.string,
    iconSize: PropTypes.number,
    text: PropTypes.string,
    size: PropTypes.number,
    style: PropTypes.shape({
        container: View.propTypes.style,
        content: Text.propTypes.style,
    }),
};
const defaultProps = {
    style: {},
};
const contextTypes = {
    uiTheme: PropTypes.object.isRequired,
};

function getStyles(props, context) {
    const { avatar } = context.uiTheme;
    const { size } = props;

    const local = {};

    if (size) {
        local.container = {
            height: size,
            width: size,
            borderRadius: size / 2,
        };
    }

    return {
        container: [
            avatar.container,
            local.container,
            props.style.container,
        ],
        content: [
            avatar.content,
            local.content,
            props.style,
        ],
    };
}

class Avatar extends PureComponent {

    renderAvatar(color, styles, content) {
        if (color) {
            return (
                <View style={[styles.container, { backgroundColor: color }]} >
                    {content}
                </View>);
        } else {
            return (
                <View style={styles.container}>
                    {content}
                </View>);
        }
    }

    render() {
       
        const { image, icon, iconSize, bgcolor, text } = this.props;

        let content = null;
        const { avatar, spacing } = this.context.uiTheme;
        const styles = getStyles(this.props, this.context);

        
        if (icon) {
            const color = bgcolor || StyleSheet.flatten(avatar.content).color;
            const size = iconSize || spacing.iconSize;
            content = <Icon name={icon} color={color} size={size} />;
        } else if (text) {
            content = <Text style={styles.content}>{text}</Text>;
        } else if (image) {
            content = image;
        }

        return (
            <View style={{ flexGrow: 1 }}>
                {this.renderAvatar(bgcolor, styles, content)}
            </View>
        );
    }
}

Avatar.propTypes = propTypes;
Avatar.defaultProps = defaultProps;
Avatar.contextTypes = contextTypes;

export default Avatar;