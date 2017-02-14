import React from 'react';
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ListView,
} from 'react-native';

const textStyle = {
    fontSize: 14,
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

const iStyle = StyleSheet.create({
    container: {

    },
    text: {
        fontSize: 14,
        color: '#527DA3',
        marginTop: 3,
        marginLeft: 8,
        marginRight: 8,
    },

    textSec: {
        fontSize: 13,
        marginTop: 3,
        marginBottom: 3,
        marginLeft: 8,
        color: '#777777',
        marginRight: 8,

    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#8E8E8E',
    },
});


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
            color: 'black',
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
    containerStyle: {},
    info: {
        buttonText: '',
        listItems: [],
    },
    action: {
        actionName: null,
        actionOnButtonClick: null,
        actionOnListItemClick: null
    },
    textStyle: {},
    headerStyle: {},
    onViewMore: () => { },
    onItemClicked: () => { },
};

const propTypes = {
    currentMessage: React.PropTypes.object,
    containerStyle: View.propTypes.style,
    info: React.PropTypes.object,
    textStyle: Text.propTypes.style,
    headerStyle: Text.propTypes.style,
    onViewMore: React.PropTypes.func,
    onItemClicked: React.PropTypes.func,
};

const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });


class InteractiveListUI extends React.Component {
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
        if (props.currentMessage.isGroupChat) {
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


    renderAllItems(props) {
        let list = props.currentMessage.info.listItems;
        return ds.cloneWithRows(list)
    }


    renderListItem(props, i) {
        let item = props.currentMessage.info.listItems[i];
        return (
            <TouchableOpacity style={[iStyle.container, { marginBottom: 3 }]} onPress={() => { props.onItemClicked(props.currentMessage, i) }} accessibilityTraits="button">
                <Text style={iStyle.text}> {item.name[0].toUpperCase() + item.name.substring(1)} </Text>
                <Text style={iStyle.textSec}> {item.description.substring(0, 40) + '...'} </Text>
            </TouchableOpacity>)
    }


    render() {
        return (
            <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position],]}>
                {
                    this.getHeader(this.props)
                }
                <View style={styles[this.props.position].innerContainer}>
                    <Text style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}>
                        {this.props.currentMessage.text}
                    </Text>

                    {this.renderListItem(this.props, 0)}
                    {this.renderListItem(this.props, 1)}
                    {this.renderListItem(this.props, 2)}


                    <TouchableOpacity
                        style={[styles[this.props.position].innerContainer]}
                        onPress={() => { this.props.onViewMore(this.props.currentMessage) }}
                        accessibilityTraits="button">
                        <Text style={[styles[this.props.position].text, {
                            color: '#527DA3',
                            fontSize: 12,
                            fontWeight: 'bold',
                            borderWidth: 1.2,
                            alignItems: 'flex-start',
                            marginTop: 3,
                            marginLeft: 10,
                            marginRight: 10,
                            borderColor: '#527DA3',
                            borderRadius: 3,
                            padding: 5,
                            paddingLeft: 10,
                            paddingRight: 10
                        }]}>
                            {this.props.currentMessage.info.buttonText.toUpperCase()}
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>
        );
    }
}


InteractiveListUI.propTypes = propTypes;
InteractiveListUI.defaultProps = defaultProps;
InteractiveListUI.contextTypes = contextTypes;

export default InteractiveListUI;