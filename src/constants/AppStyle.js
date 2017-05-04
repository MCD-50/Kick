//import from system
import { StyleSheet } from 'react-native';

//import from app
import { TOOLBAR_HEIGHT, MARGIN_10, MARGIN_5 } from './AppConstant.js'

export const uiTheme = {
	toolbar: {
		container: {
			height: TOOLBAR_HEIGHT,
		},
	},
};


export const style = StyleSheet.create({
	container_with_flex_1: {
		flex: 1,
	},
	small_image_80_height_and_width: {
		width: 80,
		height: 80,
		alignItems: 'center',
		justifyContent: 'center'
	},
	splash_page_render_outer_view: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'black'
	},
	splash_page_footer_touchable_opacity: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 15,
		paddingBottom: 5,
		paddingTop: 5
	},
	splash_page_footer_outer_view: {
		alignItems: 'flex-end',
		justifyContent: 'flex-end'
	},
	splash_page_footer_text: {
		color: 'white',
		fontSize: 16
	},
	view_with_flex_1_and_margin_all_sides: {
		flex: 1,
		marginLeft: MARGIN_10,
		marginRight: MARGIN_10,
		marginTop: MARGIN_5,
		marginBottom: MARGIN_5,
	},
	text_with_flex_1_and_font_size_17_centered: {
		flex: 1,
		color: 'white',
		fontSize: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text_with_margin_bottom_and_font_size_19: {
		color: 'white',
		fontSize: 19,
		marginBottom: 5
	},
	text_with_margin_bottom_and_font_size_14: {
		color: 'white',
		fontSize: 14,
		marginBottom: 5
	},
	text_with_black_color_and_font_size_17: {
		color: 'black',
		fontSize: 17,
	},
	text_with_gray_color_and_font_size_14: {
		color: '#b2b2b2',
		fontSize: 17,
	},
	text_input_standard_style: {
		color: 'black',
		fontSize: 17,
		borderWidth: 1.2,
		borderColor: 'transparent',
		backgroundColor: 'white',
		borderRadius: 3,
		padding: 5,
		paddingLeft: 10,
		paddingRight: 10
	},
	background_image_resize_mode_cover: {
		flex: 1,
		width: null,
		height: null,
		resizeMode: 'cover'
	},
	progress_ring_centered_view: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		marginBottom: 10
	},
	align_center_justify_center: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	align_end_justify_end: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatar_base: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: MARGIN_5,
		marginBottom: MARGIN_5
	},
	new_group_page_text_input: {
		flex: 1,
		borderRadius: 3,
		paddingLeft: 5,
		paddingRight: 5,
		alignItems: 'center',
		marginBottom: 5,
		flexDirection: 'row'
	},
	row_back_swipe_list_view: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	back_right_holder_swipe_list_view: {
		alignItems: 'flex-start',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		paddingLeft: 15,
		width: 120
	},
	back_right_button_swipe_list_view: {
		backgroundColor: '#ebb510',
		marginTop: 0,
		marginBottom: 1,
		right: 0
	},
	back_left_holder_swipe_list_view: {
		alignItems: 'flex-end',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		paddingRight: 15,
		width: 120
	},
	back_left_button_swipe_list_view: {
		backgroundColor: '#0eb244',
		marginTop: 0,
		marginBottom: 1,
		left: 0
	}
});



