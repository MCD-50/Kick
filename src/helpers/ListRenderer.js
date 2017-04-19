const no_value_fields = ['Section Break', 'Column Break', 'HTML', 'Table', 'Button', 'Image',
	'Fold', 'Heading']

const display_fieldtypes = ['Section Break', 'Column Break', 'HTML',
	'Button', 'Image', 'Fold', 'Heading']

const default_fields = ['doctype', 'name', 'owner', 'creation', 'modified', 'modified_by',
	'parent', 'parentfield', 'parenttype', 'idx', 'docstatus']

const optional_fields = ["_user_tags", "_comments", "_assign",
	"_liked_by", "_seen"]

const mapper = {
	Date: 'date',
	Data: 'text',
	Text: 'text',
}

export class ListRenderer {

	constructor(meta) {
		if (meta) {
			this.meta = meta;
			this.doctype = meta.name;
			this.title = this.get_title_field(meta);
			this.status = this.get_status_field(meta);
			this.fields = this.get_fields(meta);
		}
	}

	get_fields = (meta) => {
		return meta.fields.map((x) => {
			return {
				fieldname: x.fieldname,
				fieldtype: this.get_fieldtype(x.fieldtype),
				in_list_view: x.in_list_view,
				reqd: x.reqd,
			}
		});
	}

	get_fieldtype = (fieldtype) => {
		if (mapper[fieldtype] !== undefined)
			return mapper[fieldtype];
		return 'read';
	}

	get_title_field = (meta) => {
		if (meta.title_field)
			return meta.title_field;
		return null;
	}

	get_status_field = (meta) => {
		return meta.fields.filter((x) => x.fieldname === 'status').length > 0;
	}

	render_item_title = (item) => {
		if (this.title)
			return item[this.title];
		return item.name;
	}

	render_item_subtitle = (item) => {
		if (this.status)
			return item['status'];
		return item.creation;
	}
}