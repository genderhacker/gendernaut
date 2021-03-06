import $ from 'jquery';
import { register_view_type } from '../lib/view_manager.js';
import * as filter_manager from '../lib/filter_manager.js';

register_view_type(
	['list', 'long-list'],
	{
		init( $view ) {
			const self = this;
			self.$container = $view.find('.js-gendernaut-list');
			self.$container.gndr_isotope({
				itemSelector: '.js-gendernaut-item',
				layoutMode: 'vertical',
			});
			self.$container.gndr_imagesLoaded().progress( function() {
					self.$container.gndr_isotope('layout');
			});

		},
		display( $view ) {
			this.$container.gndr_isotope('layout');
		},
		filter( $view, filters ) {
			this.$container.gndr_isotope( {
				filter: function(){
					return filter_manager.item_apply_filters( $(this), filters );
				}
			} );
		}
	}
);
