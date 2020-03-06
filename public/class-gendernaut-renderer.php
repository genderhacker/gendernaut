<?php

/**
 * Content rendering.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/public
 */

/**
 * Class to manage content rendering.
 *
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/public
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Renderer {

	/**
	 * Namespace for html classes, hook names and theme templates folder.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $namespace.
	 */
	private $namespace;

	/**
	 * Holds the name of the view that is being rendered.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $current_view.
	 */
	private $current_view;

	/**
	 * Holds the name of the innermost section that is being rendered.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $current_section.
	 */
	private $current_section;

	/**
	 * Render array of html classes as a single string.
	 *
	 * @since     1.0.0
	 * @param     string[]    $classes    List of classes.
	 * @return    string                  Single string for class attribute.
	 */
	public static function render_class( $classes ) {
		return implode(' ', array_unique( $classes ) );
	}

	/**
	 * Render associative array as html attributes.
	 *
	 * @since     1.0.0
	 * @param     array     $atts    Array in the form 'name' => 'value'.
	 * @return    string             String of html attributes.
	 */
	public static function render_atts( $atts ) {
		$result = '';
		foreach ($atts as $key => $value) {
			$key = sanitize_key($key);
			if ( ! is_string($value) ) $value = json_encode($value);
			$value = esc_attr($value);
			$result .= "{$key}=\"{$value}\" ";
		}
		return $result;
	}

	/**
	 * Get default template file for a template name.
	 *
	 * Returns the path of a template with the sepcified name or `false` if the file doesn't exist.
	 *
	 * @param     string         $name    Name of the template.
	 * @return    string|bool             File path or `false` if file doesn't exist.
	 */
	public static function default_template( $name ) {
		static $dir;
		$dir || $dir = plugin_dir_path( __FILE__ ) . 'partials';
		$file = "{$dir}/{$name}.php";
		return file_exists( $file ) ? $file : false;
	}


	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param    string    $namespace    Namespace, mainly for html classes.
	 */
	public function __construct( $namespace ) {
		$this->namespace = $namespace;
	}

	/**
	 * Render the menu.
	 *
	 * @since    1.0.0
	 */
	public function menu() {
		$this->do_section( 'menu' );
	}

    /**
     * Render the archive.
     *
     * @since    1.0.0
     */
    public function archive() {
        $this->do_section( 'archive' );
    }

	/**
     * Render the archive.
     *
     * @since    1.0.0
     */
    public function collections() {
        $this->do_section( 'collections' );
    }

    /**
     * Render the collections overlay.
     *
     * @since    1.0.0
     */
    public function collections_overlay() {
        $this->do_section( 'collections-overlay' );
    }

    /**
     * Render the collections menu.
     *
     * @since    1.0.0
     */
    public function collections_menu() {
        $this->do_section( 'collections-menu' );
    }

	/**
	 * Render a view selector.
	 *
	 * @since    1.0.0
	 */
	public function view_selector( $views ) {
		$class = $this->build_class('view-selector');
		$item_class = $this->build_class('view-selector', 'item');
		$a_class = $this->build_class('view-selector', 'item-link') . ' ' . $this->build_js_class('view-select');

		if ( count($views) > 1 ) : ?>
			<ul class="<?php echo $class; ?>">
				<?php foreach ($views as $view) :

					$icon = $this->get_icon( $view, $this->build_classes('view-selector', 'item-icon', $view) );

					?>
					<li class="<?php echo $item_class; ?>">
						<a class="<?php echo $a_class; ?>" data-view="<?php echo $view; ?>" href="#<?php echo $view; ?>">
							<?php echo $icon; ?>
						</a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php endif;
	}

	/**
	 * Render a set of views.
	 *
	 * @since    1.0.0
	 * @param    string|string[]    $views    View or views to render.
	 */
	public function views( $views ) {
		foreach ( (array) $views as $view ) {
			$this->view( $view );
		}
	}

	/**
	 * Render a view.
	 *
	 * Render a view.
	 *
	 * @since    1.0.0
	 * @param    string    $view    View name.
	 */
	public function view( $view ) {
		if ( $view ) {
			$prev_view = $this->current_view;
			$this->current_view = $view;
			$class = $this->build_class('view');
			$class .= ' js-' . $class;
			$this->do_section( "view-{$view}", 'section', array( 'class' => $class, 'data-type' => $view ));
			$this->current_view = $prev_view;
		}
	}

	/**
	 * Render an item for a particular view.
	 *
	 * Loads the template for an item corresponding to the specified view. If no view name is provided uses `$this->current_view`.
	 *
	 * @since    1.0.0
	 * @param    string    $view    Name of view the item is associated with.
	 */
	public function item( $view = null ) {
		$view || $view = $this->current_view;

		$this->do_section( "{$view}-item", false );
	}

	/**
	 * Render the class attribute for a section.
	 *
	 * @since    1.0.0
	 * @param    string|string[]    $additional    Additional classes to add to the attribute.
	 * @param    array              $mods          Modifiers to append to main item class.
	 */
	public function section_class( $additional = '', $mods = array() ) {
		$class = esc_attr( self::render_class( $this->get_section_classes( $additional, $mods ) ) );
		echo "class='{$class}' ";
	}

	/**
	 * Get a list of html classes for a section.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $additional    Additional classes to add to the attribute.
	 * @param     array              $mods          Modifiers to append to main item class.
	 * @return    string[]                          List of html classes.
	 */
	public function get_section_classes( $additional = array(), $mods = array() ) {
		$section_name = $this->current_section;
		$classes = $this->build_section_classes( $section_name, $mods );

		$additional = $this->split_classes( $additional );

		$classes = array_merge( $additional, $classes );

		return $this->filter_classes( $section_name, $classes );
	}

	/**
	 * Render the class attribute for an item.
	 *
	 * @since    1.0.0
	 * @param    string|string[]    $additional    Additional classes to add to the attribute.
	 * @param    array              $mods          Modifiers to append to main item class.
	 * @param    int|null           $post_id       ID of the post the item is related to. Current `$post` by default.
	 */
	public function item_class( $additional = '', $mods = array(), $post_id = null ) {
		$tax_terms = $this->get_object_taxonomy_terms( $post_id );

		// TODO: fer-ho millor
		foreach ($tax_terms as $taxonomy => $ids) {
			if ( $ids ) {
				foreach ( $ids as $id ) {
					$additional .= " " . $this->build_class( $this->current_section ) . "-" . $taxonomy . "-" . $id;
			    }
			}
		}

		$class = esc_attr( self::render_class( $this->get_item_classes( $additional, $mods, $post_id ) ) );
		echo "class='{$class}' ";
	}

	/**
	 * Get a list of html classes for an item.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $additional    Additional classes to add to the attribute.
	 * @param     array              $mods          Modifiers to append to main item class.
	 * @param     int|null           $post_id       ID of the post the item is related to. Current `$post` by default.
	 * @return    string[]                          List of html classes.
	 */
	public function get_item_classes( $additional = '', $mods = array(), $post_id = null ) {
		$post_id || $post_id = get_the_ID();

		$classes = $this->build_classes( $this->current_section, null, $mods );
		$classes[] = $this->build_js_class( $this->current_section );

		$additional = $this->split_classes( $additional );

		$classes = array_merge( $additional, $classes );

		$classes = get_post_class( $classes, $post_id );

		return $this->filter_classes( 'item', $classes );
	}

	/**
	 * Get subclasses for the current section main class.
	 *
	 * Get subclasses, in a single string, based on the main class of the current section.
	 * See {@see Gendernaut_Renderer::build_class()} for a description of class structure.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $subclass    Subclass string or strings.
	 * @param     string|string[]    $mods        Modifier string or strings to append to resulting classes.
	 * @return    string                          Resulting classes in a single string.
	 */
	public function subclass( $subclass, $mods = array() ) {
		$classes = $this->build_classes( $this->current_section, $subclass, $mods );
		return self::render_class( $classes );
	}

	/**
	 * Returns the name of the view being rendered.
	 *
	 * @since     1.0.0
	 * @return    string|null    The name of the view being rendered.
	 */
	public function get_current_view() {
		return $this->current_view;
	}

	/**
	 * Returns the name of the innermost section being rendered.
	 *
	 * @since     1.0.0
	 * @return    string|null    The name of the section being rendered.
	 */
	public function get_current_section() {
		return $this->current_section;
	}

	/**
	 * Render a set of filter controls.
	 *
	 * @since     1.0.0
	 * @param     array[]    $filters    Each item is a set of options for a filter group.
	 */
	public function filters( $filters ) {
		$content = '';
		foreach ( (array) $filters as $filter ) {
			$content .= $this->get_filter_group( $filter );
		}

		if ( $content ) {
			$base_class = $this->build_class('filters');
			$class = "{$base_class} js-{$base_class}";

			$submit_class = $this->build_class($base_class, 'submit');
			$submit_class .= " js-{$base_class}-submit";
			?>
			<form class="<?php echo $class; ?>">
				<?php echo $content; ?>
				<input class="<?php echo $submit_class; ?>" type="submit" value="<?php _e('Filtrar', $this->namespace); ?>"/>
			</form>
			<?php
		}
	}

	/**
	 * Return a rendered filter group.
	 *
	 * @since     1.0.0
	 * @param     array     $options    {
	 *     Options for rendering the group. Each type has its own set of additional options.
	 *     See the corresponding functions `get_filter_group_content_{$type}` and `get_filter_group_atts_{$type}`.
	 *     @type    string    $label    Title of the filter group.
	 *     @type    string    $type     Type of filter.
	 * }
	 * @return    string    The rendered filter group.
	 */
	public function get_filter_group( $options ) {

		$method = "get_filter_group_{$options['type']}";

		if ( method_exists( $this, $method ) ) {
			return $this->$method( $options );
		}
		else {
			$content = $this->get_filter_group_content( $options );

			if ( $content ) {

				$atts = $this->get_filter_group_atts( $options );
				$atts = self::render_atts( $atts );

				$content_class  = $this->build_classes_and_render( array('filter-group', 'dropdown'), 'content' );

				return "
				<fieldset {$atts}>
					{$this->get_filter_group_header( $options )}
					<div class='{$content_class}'>
						{$content}
					</div>
				</fieldset>";
			}
		}

		return '';
	}

	// TODO: Comentar
	public function get_filter_group_index( $options ) {
		$choices = array_merge( array( '0-9' ), range( 'A', 'Z' ) );
		$atts = $this->get_filter_group_atts( $options );
		$atts = self::render_atts( $atts );

		$list_class = $this->build_class('filter-index', 'list');
		$list_item_class = $this->build_class('filter-index', 'list-item');
		$radio_class = $this->build_class('filter-index', 'option') . ' ' . $this->build_js_class('index-option');
		$label_class = $this->build_class('filter-index', 'option-label');
		$radio_name = $this->build_class('index-') . uniqid();

		$content = "<div {$atts}><ul class='{$list_class}'>";
		foreach ($choices as $choice) {
			$id = "{$radio_name}-{$choice}";
			$content .= "
			<li class='{$list_item_class}'>
				<input type='radio' name='{$radio_name}' id='{$id}' class='{$radio_class}' value='[{$choice}]'>
				<label for='{$id}' class='{$label_class}'>{$choice}</label>
			</li>";
		}
		$id = "{$radio_name}-all";
		$radio_class = $radio_class . ' ' . $this->build_class('filter-index', 'option', 'all') . ' ' . $this->build_js_class( 'filter-clear' );
		$label_class = $label_class . ' ' . $this->build_class('filter-index', 'option-label', 'all') . ' ' . $this->build_class('filter-clear');
		$clear_icon = $this->get_icon('cross');
		$content .= "
			<li class='{$list_item_class}'>
				<input type='radio' name='{$radio_name}' id='{$id}' class='{$radio_class}' value='' disabled >
				<label for='{$id}' class='{$label_class}'>{$clear_icon}</label>
			</li>
		</ul></div>";
		return $content;
	}

	// TODO: Comentar
	public function get_filter_group_search( $options ) {
		$atts = $this->get_filter_group_atts( $options );
		$atts = self::render_atts( $atts );

		$field_class = $this->build_class('filter-search', 'field');
		$input_class = $this->build_class('filter-search', 'input') . ' ' . $this->build_js_class('search-input');
		$placeholder = __('Cerca', $this->namespace );
		$search_icon = $this->get_icon( 'search', $this->build_class('filter-search', 'icon') );
		$clear_icon = $this->get_icon( 'cross' );
		$clear_class = $this->build_class('filter-search', 'clear') . ' ' . $this->build_class('filter-clear') . ' ' . $this->build_js_class( 'filter-clear' );
		return "
		<div {$atts}>
			<div class='{$field_class}'>
				<input type='search' class='{$input_class}' name='s' placeholder='{$placeholder}'/>
				{$search_icon}
			</div>
			<button class='{$clear_class}' disabled >{$clear_icon}</button>
		</div>";
	}

	/**
	 * Return the header for a filter group.
	 *
	 * See {@see Gendernaut_Renderer::get_filter_group()} for a list of options, although only 'label' is used here.
	 *
	 * @since     1.0.0
	 * @param     array    $options    Options of the filter group.
	 * @return    string               Header for a filter group.
	 */
	public function get_filter_group_header( $options ) {
		$header_class = $this->build_classes_and_render( array('filter-group', 'dropdown'), 'header' );
		$title_class  = $this->build_class( 'filter-group', 'title' );
		$clear_class  = $this->build_class( 'filter-group', 'clear' )
		        . ' ' . $this->build_class( 'filter-clear' )
		        . ' ' . $this->build_js_class( 'filter-clear' );
		$clear_icon = $this->get_icon( 'cross' );
		$show_class  = $this->build_classes_and_render( array('filter-group', 'dropdown'), 'show' );
		$show_js_class =
		$show_class  .= ' ' . $this->build_js_class( 'dropdown-show' );
		$title = esc_html( $options['label'] );
		return "
		<header class='$header_class'>
			<button class='$show_class'><span class='$title_class'>{$title}</span></button>
			<button class='$clear_class' disabled >{$clear_icon}</button>
		</header>";
	}

	/**
	 * Get the content for a filter group.
	 *
	 * @since     1.0.0
	 * @param     array     $options    Options of the filter group.
	 * @return    string                Content for a filter group.
	 */
	public function get_filter_group_content( $options ) {
		$method = "get_filter_group_content_{$options['type']}";

		if ( method_exists( $this, $method ) ) {
			$content = $this->$method( $options );
		}
		else {
			$content = '';
		}

		/**
		 * Filter the html content of a filter group.
		 *
		 * @since    1.0.0
		 * @param    string    $content    Html content of the group.
		 * @param    array     $options    Options of the filter group.
		 */
		return apply_filters( "{$this->namespace}_filter_group_content", $content, $options);
	}

	/**
	 * Get the html attributes for a filter group
	 *
	 * @since     1.0.0
	 * @param     array     $options    Options of the filter group.
	 * @return    string                Content for a filter group.
	 */
	public function get_filter_group_atts( $options ) {
		$type = $options['type'];
		$method = "get_filter_group_atts_{$type}";

		$classes = $this->build_classes( 'filter-group', '', $type );
		$classes[] = $this->build_class( "filter-{$type}" );
		$classes[] = $this->build_js_class( 'filter-group' );
		$classes[] = $this->build_js_class( "filter-{$type}"  );
		$classes = $this->filter_classes( 'filter_group', $classes );

		if ( method_exists( $this, $method ) ) {
			$atts = $this->$method( $options );
		}

		if ( empty( $atts['data-type'] ) ) {
			$atts['data-type'] = $type;
		}

		$atts = $this->filter_atts( 'filter_group', $atts, $classes );

		return $atts;
	}

	/**
	 * Get the html content of a filter group of the type 'taxonomy'.
	 *
	 * @since     1.0.0
	 * @param     array     $options    {
	 *     Options of the filter group.
	 *     @type    string    $taxonomy    Slug of the taxonomy to use.
	 * }
	 * @return    string    Html content of the filter group.
	 */
	public function get_filter_group_content_taxonomy( $options ) {
		$content = '';

		$terms = get_terms( array( 'taxonomy' => $options['taxonomy'] ) );

		if ( $terms ) {
			$container_class = $this->build_classes_and_render( 'filter-group', 'terms', $options['taxonomy'] );
			$item_class = $this->build_classes_and_render( 'filter-group', 'term', $options['taxonomy'] );
			$input_class = 'js-' . $this->build_class( 'term-input' );

			$content .= "<ul class='{$container_class}'>";

			$name = $this->build_class("filters[taxonomy][{$options['taxonomy']}][]");
			$icon = $this->get_icon('checkmark');

			foreach ( $terms as $term ) {
				$id = $this->build_class("filter-term-{$term->term_taxonomy_id}");
				$color_class = $this->term_color_class($term->term_id);
				$content .= "
				<li class='{$item_class} {$color_class}'>
					<input type='checkbox' id='{$id}' name='{$name}' value='{$term->term_id}' class='{$input_class}'>
					<label for='{$id}'>{$icon}{$term->name}</label>
				</li>";
			}
			$content .= "</ul>";
		}

		return $content;
	}

	/**
	 * Get the list of html attributes for a filter group of the type 'taxonomy'.
	 *
	 * @since     1.0.0
	 * @param     array    $options    Options of the filter group. None is used at the moment.
	 * @return    array                Array of attribute 'name' => 'value' pairs.
	 */
	public function get_filter_group_atts_taxonomy( $options ) {
		$filter = array(
			'field'   => $options['taxonomy'],
			'mode'    => 'SOME',
			'compare' => '=',
		);
		return array( 'data-filter' => $filter, 'class' => $this->build_class('dropdown') . ' ' . $this->build_js_class('dropdown-group') );
	}

	/**
	 * Render HTML attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if falsey.
	 */
	public function item_atts( $post_id = null ) {
		echo $this->render_atts( $this->get_item_atts( $post_id ) );
	}

	/**
	 * Get a list of HTML attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if falsey.
	 * @return    array                   HTML attribute key value pairs.
	 */
	public function get_item_atts( $post_id = null ) {
		$post = get_post( $post_id );
		$tax_terms = $this->get_object_taxonomy_terms( $post_id );

		$atts = array(
			'data-index-name' => $post->post_title,
			'data-gendernaut_id' => $post->ID,
		);

		foreach ($tax_terms as $taxonomy => $ids) {
			if ( $ids ) $atts["data-{$taxonomy}"] = $ids;
		}

		return $atts;
	}

	// TODO: Maybe move into an utils section.
	/**
	 * Get a list of terms associated with a Post grouped by taxonomy.
	 *
	 * Retrieves a list of all terms or terms from certain taxonomies associated with a Post grouped by taxonomy.
	 *
	 * @since     1.0.0
	 * @param     int|null         $post_id       ID of the Post from which to retrieve terms. If falsey uses current Post.
	 * @param     string[]|null    $taxonomies    List of taxonomies to search terms from. If falsey uses all taxonomies.
	 * @param     string           $fields        Fields to retrieve from the terms. See the fields argument in {@see https://developer.wordpress.org/reference/classes/wp_term_query/__construct/}.
	 * @return    array[]                         Associative array with taxonomies as keys ant term lists as values.
	 */
	public function get_object_taxonomy_terms( $post_id = null, $taxonomies = null, $fields = 'ids' ) {
		$taxonomies || $taxonomies = get_object_taxonomies( get_post( $post_id ) );
		$post_id || $post_id = get_the_ID();

		$terms = array();

		foreach ( (array) $taxonomies as $taxonomy ) {
			$terms[$taxonomy] = get_terms( array(
				'object_ids' => $post_id,
				'taxonomy'   => $taxonomy,
				'fields'     => $fields,
			));
		}

		return $terms;
	}

	/**
	 * Render HTML attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if false.
     * @return    string      HTML content
	 */
	public function item_meta( $post_id = null ) {
		return $this->render_meta( $this->get_item_meta( $post_id ) );
	}

	/**
	 * Get a list of meta attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if false.
	 * @return    array                   HTML attribute key value pairs.
	 */
	public function get_item_meta( $post_id = null ) {
		static $ignores = ['_', '*'];
	    $metas = [];

		$meta_fields = get_post_custom( $post_id );
		foreach ( $meta_fields as $key => $value ) {
			if ( in_array( mb_substr($key, 0, 1), $ignores ) )
				continue;

			$metas[$key] = $value;
		}

		return $metas;
	}

	/**
	 * Render meta array as html content.
	 *
	 * @since     1.0.0
	 * @param     array     $metas    Array in the form 'name' => 'value'.
	 * @return    string             html content.
	 */
	public static function render_meta( $metas ) {
		$result = '<div>';
		foreach ($metas as $key => $value) {
			$key = sanitize_text_field($key);

			$key = str_replace("_", " ", $key);
			$key = ucfirst($key);

			$result .= "<b>{$key}</b>: " . sanitize_text_field($value);
			if ( is_array( $value ) ) {
				foreach ( $value as $k => $v ) {
					$result .= sanitize_text_field($v) . " ";
				}
			}
			$result .= "<br />";
		}
		$result .= '</div>';
		return $result;
	}

	// TODO: Comentar.
	function get_icon( $icon_name, $classes = null ) {
		$icon_class = self::render_class( array_merge( (array) $classes, $this->build_classes('icon', null, $icon_name) ) );
		$icon_content = $this->get_icon_content( $icon_name );

		return "<span class='{$icon_class}'>{$icon_content}</span>";
	}

	function get_icon_content( $icon_name ) {
		$plugin_path = gendernaut()->plugin_path();
		$icon_path = "{$plugin_path}public/icons/{$icon_name}-icon.svg";
		$icon_path = apply_filters( "{$this->namespace}_icon_path", $icon_path, $icon_name );

		return file_exists($icon_path) ? file_get_contents($icon_path) : '';
	}

	/**
	 * Construct a namespaced html class name.
	 *
	 * Constructs an html class, prepending the namespace and appending optional subclass and modifier.
	 * Class is constructed as follows: `"{$namespace}-{$base_class}__{$subclass}--{$modifier}"`.
	 *
	 * @since     1.0.0
	 * @param     string    $base_class    Base string to construct the class.
	 * @param     string    $subclass      Specifies the class of an element that is a child of the one specified by `$base_class`.
	 * @param     string    $modifier      Serves as a qualifier that specifies a subtype of the class.
	 * @return    string                   Constructed html class name.
	 */
	public function build_class( $base_class, $subclass = '', $modifier = '' ) {
		$class = "{$this->namespace}-{$base_class}";

		if ( $subclass ) {
			$class .= "__{$subclass}";
		}
		if ( $modifier ) {
			$class .= "--$modifier";
		}
		return $class;
	}

	// TODO: comentar.
	public function build_js_class( $base_class, $subclass = '', $modifier = '' ) {
		return 'js-' . $this->build_class( $base_class, $subclass, $modifier );
	}

	/**
	 * Construct all possible class names combining given base classes, subclasses and modifiers.
	 *
	 * @since     1.0.0
	 * @param     string[]    $bases    Base classes.
	 * @param     string[]    $subs     Subclasses.
	 * @param     string[]    $mods     Modifiers.
	 * @return    string[]              Resulting classes.
	 * @see       Gendernaut_Renderer::build_class()
	 */
	public function build_classes( $bases, $subs = array(), $mods = array() ) {
		$bases = array_unique( (array) $bases );
		$subs = array_unique( (array) $subs );
		$mods = array_unique( (array) $mods );
		$classes = array();

		foreach ($bases as $base) {
			foreach ($subs as $sub) {
				if ( $sub ) {
					$classes[] = $this->build_class( $base, $sub );
					foreach ($mods as $mod) {
						if ( $mod ) {
							$classes[] = $this->build_class( $base, $sub, $mod );
						}
					}
				}
			}
			if ( ! $classes ) {
				$classes[] = $this->build_class( $base );
				foreach ($mods as $mod) {
					if ( $mod ) {
						$classes[] = $this->build_class( $base, '', $mod );
					}
				}
			}
		}

		return $classes;
	}

	// TODO: Comentar.
	public function term_color_class( $term_id, $taxonomy = 'gendernaut_tax' ) {
		$idx = gendernaut()->get_term_index( $term_id, $taxonomy );

		return $idx ? $this->build_class( "{$taxonomy}-color-{$idx}" ) : '';
	}

	/**
	 * Construct all possible class names combining given base classes, subclasses and modifiers, and render them in a single string.
	 *
	 * @since     1.0.0
	 * @param     string[]    $bases    Base classes.
	 * @param     string[]    $subs     Subclasses.
	 * @param     string[]    $mods     Modifiers.
	 * @return    string                Resulting class string.
	 * @see      Gendernaut_Renderer::build_classes()
	 * @see      Gendernaut_Renderer::render_class()
	 */
	public function build_classes_and_render( $bases, $subs = array(), $mods = array() ) {
		return self::render_class( $this->build_classes( $bases, $subs, $mods ) );
	}


	/**
	 * Render a section.
	 *
	 * Renders a section, including hooks before and after the opening and the closing tags.
	 * Calls the corresponding template as its content.
	 * If `$tag` is `false` the template is called directly without a wrapping tag.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name    Name of the section. Affects html classes, hook names and the loaded template name.
	 * @param     string    $tag             Html tag for the section.
	 * @param     array     $atts            Additional html attributes.
	 */
	private function do_section( $section_name, $tag = 'div', $atts = array() ) {
		$this->do_action("before_{$section_name}");

		$prev_section = $this->current_section;
		$this->current_section = $section_name;

		if ( empty( $prev_section ) && empty( $atts['id'] ) ) {
			$atts['id'] = $this->namespace;
		}

		$tag = $this->filter_tag( $section_name, $tag );

		if ( $tag ) {
			$this->section_start( $section_name, $tag, $atts );
		}

		$this->render_template( $section_name );

		if ( $tag ) {
			$this->section_end( $section_name, $tag );
		}

		$this->current_section = $prev_section;

		$this->do_action("after_{$section_name}");
	}

	/**
	 * Render opening tag for a section and do section start action.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name    Name of the section.
	 * @param     string    $tag             Html tag name to use.
	 * @param     array     $atts            Html attribute `'name' => 'value'` pairs.
	 */
	private function section_start( $section_name, $tag, $atts ) {
		$classes = $this->filter_classes( $section_name, $this->build_section_classes( $section_name ) );
		$atts = $this->filter_atts( $section_name, $atts, $classes );

		$atts = self::render_atts( $atts );

		echo "<{$tag} {$atts}>";
			$this->do_action("{$section_name}_start");
	}

	/**
	 * Render closing tag for a section and do section end action.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name    Name of the section.
	 * @param     string    $tag             Html tag name to use.
	 */
	private function section_end( $section_name, $tag ) {
			$this->do_action("{$section_name}_end");
		echo "</{$tag}>";
	}

	/**
	 * Returns html classes for a section.
	 *
	 * Returns a list of classes in the form:
	 * - `"{$namespace}-{$section_name}"`
	 * - `"{$namespace}-{$section_name}--{$post_type}"`
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name
	 * @return    string[]                   List of html classes.
	 */
	private function build_section_classes( $section_name, $mods = array() ) {
		$mods = array_merge( (array) $mods, (array) get_post_type() );
		$classes = $this->build_classes( $section_name, null, $mods );
		$classes[] = $this->build_js_class( $section_name );

		return $classes;
	}

	/**
	 * Filters html classes for a section.
	 *
	 * Applies filter `"{$namespace}_{$section_name}_class"`.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string      $section_name
	 * @param     string[]    $classes         List of html classes.
	 * @return    string[]                     List after applying the filter.
	 */
	private function filter_classes( $section_name, $classes ) {
		/**
		 * Filter a list of html classes.
		 *
		 * Used as:
		 * - "gendernaut_archive_class"
		 * - "gendernaut_view-grid_class"
		 * - "gendernaut_filter_group_class"
		 *
		 * @since    1.0.0
		 * @param    string[]    $classes    List of html classes.
		 */
		return apply_filters( "{$this->namespace}_{$section_name}_class", $classes );
	}

	/**
	 * Filters and sanitizes html tag for a section.
	 *
	 * Applies filter `"{$namespace}_{$section_name}_tag"` and sanitizes the result.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name
	 * @param     string    $tag             Html tag name.
	 * @return    string                     Filtered tag.
	 */
	private function filter_tag( $section_name, $tag ) {
		/**
		 * Filter the html tag used for a section.
		 *
		 * Used as:
		 * - "gendernaut_archive_tag"
		 * - "gendernaut_view-grid_tag"
		 *
		 * @since    1.0.0
		 * @param    string    $tag    Html tag name.
		 */
		return sanitize_key( apply_filters( "{$this->namespace}_{$section_name}_tag", $tag ) );
	}

	/**
	 * Filters an associative array of html attributes.
	 *
	 * Combines a list of classes with the array of attributes and applies the filter {$namespace}_{$section_name}_atts
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $section_name
	 * @param     array     $atts            Array of attribute `'name' => 'value'` pairs.
	 * @param     string    $classes         List of classes to combine with the attributes array.
	 * @return    array                      Filtered array.
	 */
	private function filter_atts( $section_name, $atts, $classes = array() ) {

		if ( ! empty( $classes ) ) {
			$class = self::render_class( $classes );
			$atts['class'] = empty( $atts['class'] ) ? $class : $class . ' ' . $atts['class'];
		}

		/**
		 * Filter an associative array of html attributes.
		 *
		 * Used as:
		 * - "gendernaut_archive_atts"
		 * - "gendernaut_view-grid_atts"
		 * - "gendernaut_filter_group_atts"
		 *
		 * @since    1.0.0
		 * @param    array    $atts    Array of attribute `'name' => 'value'` pairs.
		 */
		return apply_filters( "{$this->namespace}_{$section_name}_atts", $atts );
	}

	/**
	 * Does an action prepending namespace to the action name and another one specific for the current Post Type.
	 *
	 * Does two actions:
	 * - `"{$namespace}_{$name}"`
	 * - `"{$namespace}_{$name}_{$post_type}"`
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string     $name    Base name for the action.
	 */
	private function do_action( $name ) {
		$action_name = "{$this->namespace}_{$name}";
		/**
		 * Generic action.
		 *
		 * Used as:
		 * - `"gendernaut_before_archive"`
		 * - `"gendernaut_archive_start"`
		 * - `"gendernaut_before_view-grid"`
		 * - `"gendernaut_view-grid_start"`
		 *
		 * @since    1.0.0
		 */
		do_action($action_name);
		$post_type = get_post_type();
		if ($post_type) {
			/**
			 * Action for a specific Post Type.
			 *
			 * Used as:
			 * - `"gendernaut_before_archive_{$post_type}"`
			 * - `"gendernaut_archive_start_{$post_type}"`
			 * - `"gendernaut_before_view-grid_{$post_type}"`
			 * - `"gendernaut_view-grid_start_{$post_type}"`
			 *
			 * @since    1.0.0
			 */
			do_action("{$action_name}_{$post_type}");
		}
	}

	/**
	 * Locate and render the corresponding template for the given name.
	 *
	 * @since     1.0.0
	 * @access    private
	 * @param     string    $name    Name for the template.
	 */
	private function render_template( $name ) {
		$template = $this->locate_template( $name );

		if ( $template ) {
			load_template( $template, false );
		}
	}

	/**
	 * Locate the corresponding template for the given name.
	 *
	 * Checks if a template exists in this order:
	 * - `{$theme_folder}/{$namespace}/{$name}-{$post_type}.php`
	 * - `{$theme_folder}/{$namespace}/{$name}.php`
	 * - Default plugin template.
	 *
	 * Returns the template file path or `false` if it doesn't exist.
	 *
	 * @param     string         $name    Template name.
	 * @return    string|bool             Template file path or `false` if it doesn't exist.
	 */
	private function locate_template( $name ) {
		$post_type = get_post_type();

		$templates = $post_type ? array( "{$this->namespace}/{$name}-{$post_type}.php" ) : array();
		$templates[] = "{$this->namespace}/{$name}.php";

		$template = locate_template( $templates );

		return $template ? $template : self::default_template( $name );
	}

	// TODO: Comentar.
	private function split_classes( $classes ) {
		if ( is_string( $classes ) ) {
			$classes = preg_split( '#\s+#', $classes );
		}
		return $classes;
	}
}
