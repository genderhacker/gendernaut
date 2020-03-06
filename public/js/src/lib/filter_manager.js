import $ from 'jquery';

'use strict';

let filter_types = {};

function FiltersCollection( op='AND' ) {
	this.filters = {
		operator: op,
		props: [],
	}
}
FiltersCollection.prototype = {
	add(filter) {
		this.filters.props.push(filter);
	},
	apply_to( $item ) {
		return item_apply_filters( $item, this.filters );
	},
	clear() {
		this.filters.props = [];
	}
}

export function create_filters_collection( op='AND' ) {
	return new FiltersCollection( op );
}

function run_filter_action( $group, action, args, def) {
	let type = $group.data('type');
	if ( filter_types[type] && filter_types[type][action] ) {
		return filter_types[type][action]( ...args );
	}
	return def;
}

export function init_filter_group( $group, update_callback ) {
	return run_filter_action( $group, 'init_group', arguments, {});
}

export function update_filter( filter, $group ) {
	return run_filter_action( $group, 'update_filter', arguments, filter);
}

export function clear_filter( filter, $group ) {
	return run_filter_action( $group, 'clear_filter', arguments, filter);
}

export function update_ui( filter, $group ) {
	return run_filter_action( $group, 'update_ui', arguments );
}

export function is_filter_enabled( filter, $group ) {
	return run_filter_action( $group, 'is_enabled', arguments );
}

export function register_filter_type( type, handler ) {
	if ( ! filter_types[type] ) {
		filter_types[type] = handler;
	}
}

register_filter_type(
	'taxonomy',
	{
		init_group( $group, update_callback ) {

			let self = this;
			let filter = self.init_filter( $group );
			update_callback = typeof update_callback === 'function' && update_callback;

			let $clear = this.get_clear_button( $group );

			$group.on('change', function(e){
				let $el = $(e.target);
				self.apply_changes( filter, $el, $group );
				update_callback && update_callback(filter);
			});

			$clear.on('click', function(e){
				e.preventDefault();
				self.clear_filter( filter, $group );
				update_callback && update_callback(filter);
			});

			return filter;
		},
		init_filter( $group ) {
			let filter = {
				operator: 'OR',
				props: {},
			};
			return this.update_filter( filter, $group );;
		},
		update_filter( filter, $group ) {
			let $checkboxes = this.get_checkboxes( $group );
			return this.apply_changes( filter, $checkboxes, $group);
		},
		apply_changes( filter, $changed, $group ) {
			$changed.each(function(){
				let $checkbox = $(this);
				let id = $checkbox.attr('id');

				if ( ! $checkbox.prop('checked') ) {
					delete filter.props[id];
				}
				else {
					filter.props[id] = $.extend( {}, $group.data('filter'), $checkbox.data('filter') );
					if ( typeof filter.props[id].value === 'undefined' ) filter.props[id].value = $checkbox.val();
				}
			});

			this.check_clear( filter, $group );

			return filter;
		},
		clear_filter( filter, $group ) {
			let $checkboxes = this.clear_ui( $group );
			this.apply_changes( filter, $checkboxes, $group);
		},
		clear_ui( $group ) {
			let $checkboxes = this.get_checkboxes( $group );
			$checkboxes.prop('checked', false);
			return $checkboxes;
		},
		update_ui( filter, $group ) {
			let $checkboxes = this.get_checkboxes( $group );
			$checkboxes.each( function() {
				let $checkbox = $(this);
				let id = $checkbox.attr('id');

				this.checked = 	filter.props && filter.props[id];
			});
			this.check_clear( filter, group );
		},
		is_enabled( filter, $group ) {
			return filter.props && Object.keys( filter.props ).length > 0;
		},
		check_clear( filter, $group, $clear ) {
			$clear = $clear || this.get_clear_button( $group );

			if ( this.is_enabled( filter, $group ) ) {
				$clear.prop('disabled', false);
			}
			else {
				$clear.prop('disabled', true);
			}
		},
		get_checkboxes( $group ) {
			return $group.find('.js-gendernaut-term-input');
		},
		get_clear_button( $group ) {
			return $group.find('.js-gendernaut-filter-clear');
		},
	}
);

register_filter_type(
	'index',
	{
		init_group( $group, update_callback ) {
			let $options = this.get_options( $group );

			let filter = this.init_filter( $group );

			let self = this;

			$options.change(function(e){
				e.preventDefault();
				self.apply_option( filter, $(this), $group );
				update_callback && update_callback( filter );
			});

			return filter;
		},
		init_filter( $group ) {
			let filter = {
				field: 'index-name',
				mode: 'IS',
				compare: 'regexp',
			};

			return this.update_filter( filter, $group );
		},
		update_filter( filter, $group ) {
			let $current = this.get_options( $group ).filter(':checked');
			return this.apply_option( filter, $current, $group );
		},
		apply_option( filter, $option, $group ) {
			let val = $option.attr('value');

			if (val) {
				filter.value = new RegExp( `^${val}`, 'i' );
			}
			else {
				delete filter.value;
			}

			this.check_clear( filter, $group );

			return filter;
		},
		clear_filter( filter, $group ) {
			delete filter.value;
			return filter;
		},
		check_clear( filter, $group, $clear ) {
			$clear = $clear || this.get_clear_button( $group );

			if ( this.is_enabled( filter, $group ) ) {
				$clear.prop('disabled', false);
			}
			else {
				$clear.prop('disabled', true);
			}
		},
		is_enabled( filter, $group ) {
			return !! filter.value;
		},
		get_options( $group ) {
			return $group.find('.js-gendernaut-index-option');
		},
		get_clear_button( $group ) {
			return $group.find('.js-gendernaut-filter-clear');
		},
	}
);

register_filter_type(
	'search',
	{
		init_group( $group, update_callback ) {
			let $input = this.get_input( $group );
			let $clear = this.get_clear_button( $group );

			let filter = this.init_filter( $group );

			let self = this;

			$input.keyup(function(e){
				e.preventDefault();
				self.apply_input( filter, $input, $group );
				update_callback && update_callback( filter );
			});

			$clear.click(function(e){
				e.preventDefault();
				$input.val("");
				self.apply_input( filter, $input, $group );
				update_callback && update_callback( filter );
			});

			return filter;
		},
		init_filter( $group ) {
			let filter = {
				field: function ($item) {
					return $item.data( 'index-title' ) + '\n' + $item.text();
				},
				mode: 'IS',
				compare: 'str_includes_i',
			};

			return this.update_filter( filter, $group );
		},
		update_filter( filter, $group ) {
			let $input = this.get_input( $group );
			return this.apply_input( filter, $input, $group );
		},
		apply_input( filter, $input, $group ) {
			let val = $input.prop('value');

			if (val) {
				filter.value = val;
			}
			else {
				delete filter.value;
			}

			this.check_clear( filter, $group );

			return filter;
		},
		clear_filter( filter, $group ) {
			let $input = this.get_input( $group );
			$input.val("");
			return self.apply_input( filter, $input, $group );
		},
		check_clear( filter, $group, $clear ) {
			$clear = $clear || this.get_clear_button( $group );

			if ( this.is_enabled( filter, $group ) ) {
				$clear.prop('disabled', false);
			}
			else {
				$clear.prop('disabled', true);
			}
		},
		is_enabled( filter, $group ) {
			return !! filter.value;
		},
		get_input( $group ) {
			return $group.find('.js-gendernaut-search-input');
		},
		get_clear_button( $group ) {
			return $group.find('.js-gendernaut-filter-clear');
		},
	}
);

export function item_apply_filters($item, filters) {
	if ( filters.props ) {

		let props = filters.props instanceof Array ? filters.props : Object.values( filters.props );

		if ( ! props.length ) return true;

		switch ( filters.operator ) {
			case 'AND':
				return props.reduce((acc, val) => ( item_apply_filters($item, val) && acc ), true);
			case 'OR':
				return props.reduce((acc, val) => ( item_apply_filters($item, val) || acc ), false);
			case 'XOR':
				let sum = props.reduce((acc, val) => ( item_apply_filters($item, val) + acc ), 0);
				return sum === 1;
		}
	}
	else {

		if (typeof filters.value === 'undefined' || typeof filters.compare === 'undefined')
			return true;

		let field = typeof filters.field === 'function' ? filters.field($item) : $item.data(filters.field);

		let test_value = (field_value) => {
			let result = compare_values(field_value, filters.value, filters.compare);
			return result
		};

		if ( filters.mode === 'IS' ) {
			return test_value(field);
		}
		else if ( field instanceof Array ) {
			switch ( filters.mode ) {
				case 'SOME':
					return field.some( test_value );
					break;
				case 'EVERY':
					return field.every( test_value );
					break;
				case 'COUNT':
					return test_value( field.length );
			}
			// TODO: mode error
		}
		else {
			return filters.mode === 'COUNT' ? test_value( 1 ) : test_value( field );
		}
	}
	return true;
}

export function compare_values( val1, val2, op ) {
	switch ( typeof op ) {
		case 'string':
			switch ( op ) {
				case '=':
					return val1 == val2;
					break;
				case '!=':
					return val1 != val2;
					break;
				case '<':
					return val1 < val2;
					break;
				case '>':
					return val1 > val2;
					break;
				case '<=':
					return val1 <= val2;
					break;
				case '>=':
					return val1 >= val2;
					break;
				case 'str_includes':
					return val1.includes( val2 );
					break;
				case 'str_includes_not':
					return ! val1.includes( val2 );
					break;
				case 'str_includes_i':
					return val1.toLowerCase().includes( val2.toLowerCase() );
					break;
				case 'str_includes_not_i':
					return ! val1.toLowerCase().includes( val2.toLowerCase() );
					break;
				case 'regexp':
					return RegExp(val2).test(val1);
					break;
				case 'regexp_not':
					return ! RegExp(val2).test(val1);
					break;
			}
			break;
		case 'function':
			return op(val1, val2);

	}
	// TODO: Op error.
	console.log( 'Operation error!');
	return false;
}
