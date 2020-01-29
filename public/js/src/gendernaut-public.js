import $ from 'jquery';
import 'isotope-layout/dist/isotope.pkgd';
import 'imagesloaded/imagesloaded.pkgd';

'use strict';

 // Prevent our versions of isotope and imagesLoaded from being overwritten.
$.fn.gndr_isotope = $.fn.isotope;
$.fn.gndr_imagesLoaded = $.fn.imagesLoaded;

$(function() {
	$('.js-gendernaut-view-grid').each(function(){
		let $filters = $(this).find('.js-gendernaut-filters');
		let $groups = $(this).find('.js-gendernaut-filter-group');
		let $container = $(this).find('.js-gendernaut-grid');
		$container.gndr_isotope({
			itemSelector: '.js-gendernaut-grid-item',
			layoutMode: 'fitRows',
		});
		$container.gndr_imagesLoaded().progress( function() {
				$container.gndr_isotope('layout');
		});
		let $submit = $(this).find('.js-gendernaut-filters-submit').remove();

		let filters = {
			operator: 'AND',
			props: [],
		}

		$groups.each(function(){
			let $group = $(this);
			let $clear = $group.find('.js-gendernaut-filter-clear');
			let filter = get_filter( $group );
			let update_filter = get_updater( $group );
			check_clear();

			filters.props.push(filter);

			update_filter && $group.on('change', function(e){

				let $el = $(e.target);
				update_filter( filter, $el, $group );
				check_clear();
				request_update();
			});

			$clear.click(function(){
				clear_filter( filter, $group );
				check_clear();
				request_update();
			});

			function check_clear() {
				if ( is_enabled( filter, $group ) ) {
					$clear.prop('disabled', false);
				}
				else {
					$clear.prop('disabled', true);
				}
			}
		});

		filter();

		let timeout;
		function request_update() {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout( filter, 500);
		}
		function filter() {
			$container.gndr_isotope( {
				filter: function(){
					return apply_filters( $(this), filters );
				}
			} );
		}
	});

});

function apply_filters($item, filters) {
	if ( filters.props ) {

		let props = filters.props instanceof Array ? filters.props : Object.values( filters.props );

		if ( ! props.length ) return true;

		switch ( filters.operator ) {
			case 'AND':
				return props.reduce((acc, val) => ( apply_filters($item, val) && acc ), true);
			case 'OR':
				return props.reduce((acc, val) => ( apply_filters($item, val) || acc ), false);
			case 'XOR':
				let sum = props.reduce((acc, val) => ( apply_filters($item, val) + acc ), 0);
				return sum === 1;
		}
	}
	else {
		let field = $item.data(filters.field);

		let test_value = (field_value) => {
			let result = compare(field_value, filters.value, filters.compare);
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
			return false;
		}
		else {
			return filters.mode === 'COUNT' ? test_value( 1 ) : test_value( field );
		}
	}
	return true;
}

function compare( val1, val2, op ) {
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

let filter_types = {};

function get_filter( $group ) {
	let type = $group.data('type');
	if ( filter_types[type] && filter_types[type].get_filter ) {
		return filter_types[type].get_filter( $group );
	}
	return {};
}

function get_updater( $group ) {
	let type = $group.data('type');
	if ( filter_types[type] && filter_types[type].update_filter ) {
		return filter_types[type].update_filter;
	}
	return false;
}

function clear_filter( filter, $group ) {
	let type = $group.data('type');
	if ( filter_types[type] && filter_types[type].clear_filter ) {
		return filter_types[type].clear_filter( filter, $group );
	}
}

function is_enabled( filter, $group ) {
	let type = $group.data('type');
	if ( filter_types[type] && filter_types[type].is_enabled ) {
		return filter_types[type].is_enabled( filter, $group );
	}
}

function register_type( type, handler ) {
	if ( ! filter_types[type] ) {
		filter_types[type] = handler;
	}
}

register_type(
	'taxonomy',
	{
		get_filter( $group ) {
			let filter = {
				operator: 'OR',
				props: {},
			};
			let self = this;
			$group.find('.js-gendernaut-term-input').each(function(){
				this.checked && self.update_filter( filter, $(this), $group);
			});
			return filter;
		},
		update_filter( filter, $changed, $group ) {
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

			return filter;
		},
		clear_filter( filter, $group ) {
			let $checkboxes = $group.find('.js-gendernaut-term-input');
			$checkboxes.prop('checked', false);
			this.update_filter( filter, $checkboxes, $group);
		},
		is_enabled( filter, $group ) {
			return filter.props && Object.keys( filter.props ).length > 0;
		},
	}
);
