
import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    ScrollView,
    Picker,
    Alert
} from 'react-native'

import { setData } from '../../../helpers/AppStore.js';
import Container from '../../Container.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN, FIRST_NAME, LAST_NAME, FIRST_RUN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
    },

    innerContainer: {
        flex: 1,
    },

    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#777777'
    },

    textInput: {
        fontSize: 18,
        fontWeight: '300',
        color: 'black',
    },
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    placeholderTextColor: React.PropTypes.string,
    multiline: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool,
};

const defaultProps = {
    text: '',
    placeholder: 'Text...',
    placeholderTextColor: '#b2b2b2',
    multiline: false,
    autoFocus: false,
};

class FirstRunPage extends Component {
    constructor(params) {
        super(params);
        this.state = {
            firstName: '',
            lastName: '',
        }

        this.onType = this.onType.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.saveName = this.saveName.bind(this);
    }

    onType(e, whichState) {
        if (whichState == 1) {
            this.setState({ firstName: e.nativeEvent.text });
        } else if (whichState == 2) {
            this.setState({ lastName: e.nativeEvent.text });
        }
    }



    isAllowed() {
        let state = this.state;

        let firstName = state.firstName;
        let lastName = state.lastName;

        if (firstName && lastName && firstName.trim().length > 0 && lastName.trim().length > 0)
            return true;
        return false;
    }


    showAlert(title, body) {
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }


    saveName() {
        if (this.isAllowed()) {
            setData(FIRST_NAME, this.state.firstName);
            setData(LAST_NAME, this.state.lastName);
            setData(FIRST_RUN, 'false');
            CollectionUtils.addDefaultBots(() => {
                let page = Page.CHAT_LIST_PAGE;
                this.props.navigator.replace({ id: page.id, name: page.name });
            })

        } else {
            this.showAlert('Info...', 'Please fill in all the fields');
        }
    }


    render() {
        return (
            <Container>
                <Toolbar centerElement={this.props.route.name}
                    rightElement='done'
                    onRightElementPress={() => this.saveName()} />
                <ScrollView style={styles.container} keyboardDismissMode='interactive'>

                    <View style={styles.innerContainer}>
                        <TextInput style={styles.textInput}
                            placeholder='First name (required)'
                            onChange={(e) => this.onType(e, 1)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid='#2e3c98' />

                    </View>

                    <View style={styles.innerContainer}>
                        <TextInput style={styles.textInput}
                            placeholder='Last name (required)'
                            onChange={(e) => this.onType(e, 2)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid='#2e3c98' />
                    </View>



                </ScrollView>
            </Container>

        )
    }
}

FirstRunPage.propTypes = propTypes;
FirstRunPage.defaultProps = defaultProps;

export default FirstRunPage;

