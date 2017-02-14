import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    BackAndroid,
} from 'react-native';


import Toolbar from '../../customUI/ToolbarUI.js';
import Conatainer from '../../Container.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { ActionName } from '../../../enums/ActionName.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
        marginBottom: DOWNMARGIN,
        marginTop: UPMARGIN,
    },
    view: {
        marginBottom: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    headerText: {
        fontSize: 17,
    },

    text: {
        fontSize: 14,
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
    placeholder: 'Edit...',
    placeholderTextColor: '#b2b2b2',
    multiline: false,
    autoFocus: false,
};

class ViewInfo extends Component {

    constructor(params) {
        super(params);
        let data = this.props.route.data.message.info;
        let index = this.prop.route.data.index;
        this.state = {

            item: data.listItems[index],
            fields: data.fields,
            action: data.action,
            description: '',
        }

        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.onType = this.onType.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
    }

    onType(e) {
        this.setState({ description: e.nativeEvent.text });
    }


    isAllowed() {
        let state = this.state;
        let newDescription = state.description;
        if (newDescription && newDescription.trim().length > 0)
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


    onButtonClick() {
        this.props.route.data.callback(this.state.description, this.state.item.name, ActionName.UPDATE_ITEM);
        this.props.navigator.pop();
    }


    renderItem(key, value) {
        switch (key) {
            case 'name': return (
                <View key={key} style={styles.view}>
                    <Text style={styles.headerText}>{key[0].toUpperCase() + key.substring(1)} </Text>
                    <Text style={styles.text}>{value} </Text>
                </View>);
            case 'description':
                this.setState({ description: value });
                return (
                    <View key={key} style={styles.view}>
                        <Text style={styles.headerText}>{key[0].toUpperCase() + key.substring(1)} </Text>
                        <TextInput style={styles.textInput}
                            placeholder='Description...'
                            onChange={(e) => this.onType(e)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            value={thiss.state.description}
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid="transparent" />
                    </View>);
        }
    }

    renderButton() {
        if (this.isAllowed()) {
            return (
                <TouchableOpacity style={[styles.view, {
                    borderRadius: 3,
                    backgroundColor: '#5E64FF',
                }]}
                    onPress={() => { this.onButtonClick() }}
                    accessibilityTraits="button">
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[styles.text, {
                            padding: 10,
                            paddingLeft: 10,
                            paddingRight: 10
                        }]}>{this.state.action.actionOnListItemClick.toUpperCase()}</Text>
                    </View>

                </TouchableOpacity>
            )
        }
        return null;
    }


    renderItems() {
        let data = this.state.item;

        let components = this.state.fields.map((field) => {
            return this.renderItem(field, data[field])
        })

        return (
            <ScrollView style={styles.container}>
                {components}
                {this.renderButton()}
            </ScrollView>
        )
    }

    render() {
        return (
            <Container>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.navigator.pop();
                    }}
                    centerElement={this.props.route.name} />

                {this.renderItems()}
            </Container>)

    }

}

ViewInfo.propTypes = propTypes;
export default ViewInfo;
