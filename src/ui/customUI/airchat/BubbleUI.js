import React from 'react';
import {
    Text,
    Clipboard,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import MessageTextUI from './MessageTextUI.js';
import MessageImageUI from './MessageImageUI.js';
import InteractiveChatUI from './InteractiveChatUI.js';
import InteractiveListUI from './InteractiveListUI.js';
import TimeUI from './TimeUI.js';

import { isSameDay, isSameUser, warnDeprecated } from './UtilsUI.js';

const styles = {
    left: StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'flex-start',
        },
        wrapper: {
            borderRadius: 4,
            backgroundColor: '#FFFFFF',
            marginRight: 60,
            minHeight: 20,
            justifyContent: 'flex-end',
        },
        containerToNext: {
            borderBottomLeftRadius: 2,
        },
        containerToPrevious: {
            borderTopLeftRadius: 2,
        },
    }),
    right: StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'flex-end',
        },
        wrapper: {
            borderRadius: 4,
            backgroundColor: '#E1FFC1',
            marginLeft: 60,
            minHeight: 20,
            justifyContent: 'flex-end',
        },
        containerToNext: {
            borderBottomRightRadius: 2,
        },
        containerToPrevious: {
            borderTopRightRadius: 2,
        },
    }),
    bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    tick: {
        fontSize: 10,
        backgroundColor: 'transparent',
        color: 'white',
    },
    tickView: {
        flexDirection: 'row',
        marginRight: 10,
    }
};

const contextTypes = {
    actionSheet: React.PropTypes.func,
};

const defaultProps = {
    touchableProps: {},
    onLongPress: null,
    renderMessageImage: null,
    renderMessageText: null,
    renderInteractiveChat:null,
    renderInteractiveList:null,
    renderCustomView: null,
    renderTime: null,
    position: 'left',
    currentMessage: {
        text: null,
        createdAt: null,
        image: null,
    },
    nextMessage: {},
    previousMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    tickStyle: {},
    containerToNextStyle: {},
    containerToPreviousStyle: {},

    isSameDay: warnDeprecated(isSameDay),
    isSameUser: warnDeprecated(isSameUser),
};

const propTypes = {
    touchableProps: React.PropTypes.object,
    onLongPress: React.PropTypes.func,
    renderMessageImage: React.PropTypes.func,
    renderMessageText: React.PropTypes.func,
    renderCustomView: React.PropTypes.func,
    renderInteractiveChat: React.PropTypes.func,
    renderInteractiveList: React.PropTypes.func,
    renderTime: React.PropTypes.func,
    position: React.PropTypes.oneOf(['left', 'right']),
    currentMessage: React.PropTypes.object,
    nextMessage: React.PropTypes.object,
    previousMessage: React.PropTypes.object,
    containerStyle: React.PropTypes.shape({
        center: View.propTypes.style,
        left: View.propTypes.style,
        right: View.propTypes.style,
    }),
    wrapperStyle: React.PropTypes.shape({
        center: View.propTypes.style,
        left: View.propTypes.style,
        right: View.propTypes.style,
    }),
    tickStyle: Text.propTypes.style,
    containerToNextStyle: React.PropTypes.shape({
        center: View.propTypes.style,
        left: View.propTypes.style,
        right: View.propTypes.style,
    }),
    containerToPreviousStyle: React.PropTypes.shape({
        center: View.propTypes.style,
        left: View.propTypes.style,
        right: View.propTypes.style,
    }),
    //TODO: remove in next major release
    isSameDay: React.PropTypes.func,
    isSameUser: React.PropTypes.func,
};


class BubbleUI extends React.Component {
    constructor(props) {
        super(props);
        this.onLongPress = this.onLongPress.bind(this);

    }

    handleBubbleToNext() {
        if (isSameUser(this.props.currentMessage, this.props.nextMessage) && isSameDay(this.props.currentMessage, this.props.nextMessage)) {
            return StyleSheet.flatten([styles[this.props.position].containerToNext, this.props.containerToNextStyle[this.props.position]]);
        }
        return null;
    }

    handleBubbleToPrevious() {
        if (isSameUser(this.props.currentMessage, this.props.previousMessage) && isSameDay(this.props.currentMessage, this.props.previousMessage)) {
            return StyleSheet.flatten([styles[this.props.position].containerToPrevious, this.props.containerToPreviousStyle[this.props.position]]);
        }
        return null;
    }

    renderMessageText() {
        if (this.props.currentMessage.text) {
            const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
            if (this.props.renderMessageText) {
                return this.props.renderMessageText(messageTextProps);
            }
            return <MessageTextUI {...messageTextProps} />;
        }
        return null;
    }

    renderMessageImage() {
        if (this.props.currentMessage.image) {
            const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
            if (this.props.renderMessageImage) {
                return this.props.renderMessageImage(messageImageProps);
            }
            return <MessageImageUI {...messageImageProps} />;
        }
        return null;
    }

    renderInteractiveChat() {
        if (this.props.currentMessage.text) {
            const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
            if (this.props.renderInteractiveChat) {
                return this.props.renderInteractiveChat(messageTextProps);
            }
            return <InteractiveChatUI { ...messageTextProps} />;
        }
        return null;
    }

    renderInteractiveList() {
        if (this.props.currentMessage.text) {
            const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
            if (this.props.renderInteractiveList) {
                return this.props.renderInteractiveList(messageTextProps);
            }
            return <InteractiveListUI { ...messageTextProps } />;
        }
        return null;
    }

    renderTicks() {
        const {currentMessage} = this.props;
        if (this.props.renderTicks) {
            return this.props.renderTicks(currentMessage);
        }
        if (currentMessage.user._id !== this.props.user._id) {
            return;
        }
        if (currentMessage.sent || currentMessage.received) {
            return (
                <View style={styles.tickView}>
                    {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
                    {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
                </View>
            )
        }
    }

    renderTime() {
        if (this.props.currentMessage.createdAt) {
            const {containerStyle, wrapperStyle, ...timeProps} = this.props;
            if (this.props.renderTime) {
                return this.props.renderTime(timeProps);
            }
            return <TimeUI {...timeProps} />;
        }
        return null;
    }

    renderCustomView() {
        if (this.props.renderCustomView) {
            return this.props.renderCustomView(this.props);
        }
        return null;
    }

    onLongPress() {
        if (this.props.onLongPress) {
            this.props.onLongPress(this.context);
        } else {
            if (this.props.currentMessage.text) {
                const options = [
                    'Copy Text',
                    'Cancel',
                ];
                const cancelButtonIndex = options.length - 1;
                this.context.actionSheet().showActionSheetWithOptions({
                    options,
                    cancelButtonIndex,
                },
                    (buttonIndex) => {
                        switch (buttonIndex) {
                            case 0:
                                Clipboard.setString(this.props.currentMessage.text);
                                break;
                        }
                    });
            }
        }
    }

    renderExtra(info) {
        if (info.isInteractive) {
            if (info.isInteractiveChat)
                return this.renderInteractiveChat();
            else
                return this.renderInteractiveList();
        }
        else {
            return this.renderMessageText()
        }
    }

    render() {

        return (
            <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
                <View style={[styles[this.props.position].wrapper, this.props.wrapperStyle[this.props.position], this.handleBubbleToNext(), this.handleBubbleToPrevious()]}>
                    <TouchableWithoutFeedback
                        onLongPress={this.onLongPress}
                        accessibilityTraits="text"
                        {...this.props.touchableProps}>
                        <View>
                            {this.renderCustomView()}
                            {this.renderExtra(this.props.currentMessage.info)}
                            {this.renderMessageImage()}
                            <View style={styles.bottom}>
                                {this.renderTime()}
                                {this.renderTicks()}
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }
}


BubbleUI.PropTypes = propTypes;
BubbleUI.defaultProps = defaultProps;
BubbleUI.contextTypes = contextTypes;

export default BubbleUI;