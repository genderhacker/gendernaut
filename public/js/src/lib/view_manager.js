
let views = {};

function run_view_action( $view, action, args ) {
	let handler = $view.data('gendernaut-view-handler');

	if ( ! handler ) {
		let view_type = $view.data('type');

		if ( views[view_type] ) {
			let Handler = function(){};
			Handler.prototype = views[view_type];
			handler = new Handler();
			$view.data('gendernaut-view-handler', handler);
		}
	}

	if ( handler[action] ) {
		return handler[action]( ...args );
	}
}

export function init_view( $view ) {
	return run_view_action( $view, 'init', arguments );
}

export function display_view( $view ) {
	return run_view_action( $view, 'display', arguments );
}

export function update_view( $view ) {
	return run_view_action( $view, 'update', arguments );
}

export function hide_view( $view ) {
	return run_view_action( $view, 'hide', arguments );
}

export function filter_view( $view, filters ) {
	return run_view_action( $view, 'filter', arguments );
}

export function register_view_type( view_types, handler ) {
	if ( ! (view_types instanceof Array) ) {
		view_types = [view_types];
	}
	for (let view_type of view_types) {
		if ( ! views[view_type] ) {
			views[view_type] = handler;
		}
	}
}
