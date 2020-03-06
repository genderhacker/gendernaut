import $ from 'jquery';

import 'isotope-layout/dist/isotope.pkgd';
import 'imagesloaded/imagesloaded.pkgd';
import 'featherlight'

import * as view_manager from './lib/view_manager.js';
import * as filter_manager from "./lib/filter_manager";
import './views/index.js';
import Collections from './gendernaut-collections'

'use strict';

 // Prevent our versions of isotope and imagesLoaded from being overwritten.
$.fn.gndr_isotope = $.fn.isotope;
$.fn.gndr_imagesLoaded = $.fn.imagesLoaded;

$(function() {
	const collections = new Collections();

	$('.js-gendernaut-view').each(function(){
		view_manager.init_view( $(this) );
	});


	$('.js-gendernaut-views-group').each(function(){
		let $view_group = $(this);
		let $all_views = $view_group.find('.js-gendernaut-view');
		let $view_select = $view_group.find('.js-gendernaut-view-select');

		let filters_collection = filter_manager.create_filters_collection();

		let $current_view = $all_views.first();
		let current_view_type = $current_view.data('type');
		console.log(current_view_type);
		let $current_select = get_select_for_view( current_view_type );

		$view_select.removeClass('current');
		$current_select.addClass('current');

		hide_views();
		show_view( $current_view );

		$view_select.on('click', function(e){
			e.preventDefault();

			let view_type = $(this).data('view');

			if ( view_type === current_view_type ) return;

			$current_view = $all_views.filter( '.js-gendernaut-view-' + view_type );
			current_view_type = view_type;

			$current_select.removeClass('current');
			$current_select = get_select_for_view( current_view_type );
			$current_select.addClass('current');

			hide_views();
			show_view( $current_view );
		});

		function hide_views() {
			$all_views.hide();
			$all_views.each(function(){
				view_manager.hide_view( $(this) );
			});
		}

		function show_view( $view ) {
			$view.show();
			view_manager.display_view( $view );
		}

		function get_select_for_view( view_type ) {
			return $view_select.filter( function() {
				return $(this).data('view') === view_type;
			});
		}

		// let $filters = $view.find('.js-gendernaut-filters');

		filters_collection.add( collections.filter );
		collections.add_filter_callback( request_update );

		$view_group.find('.js-gendernaut-filters-submit').remove();

		$view_group.find('.js-gendernaut-filter-group').each(function(){
			let $group = $(this);
			let filter = filter_manager.init_filter_group( $group, request_update );
			filters_collection.add( filter );
		});

		let timeout;
		function request_update() {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout( filter_views, 500);
		}

		function filter_views() {
			$all_views.each(function(){
				view_manager.filter_view( $(this), filters_collection.filters );
			});
		}

		filter_views();

	});

	$('.js-gendernaut-dropdown-group').each(function(){
		let $group = $(this);
		let $show_button = $group.find('.js-gendernaut-dropdown-show');

		$show_button.click(function(e){
			e.preventDefault();
			$group.toggleClass('open');
		});
	});
});
