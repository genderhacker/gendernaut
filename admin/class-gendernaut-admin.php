<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Text domain to use for string translation.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $textdomain    Text domain to use for string translation.
	 */
	private $textdomain;

	/**
	 * Settings page title.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $page_title    Settings page title.
	 */
	private $page_title;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name    The name of this plugin.
	 * @param      string    $version        The version of this plugin.
	 * @param      string    $textdomain     Textdomain to use in translation. Defaults to `$plugin_name`.
	 */
	public function __construct( $plugin_name, $version, $textdomain = null ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		$this->textdomain = $textdomain ? $textdomain : $plugin_name;
		$this->page_title = 'Gendernaut Archive Settings';
		$this->settings_manager = new WeDevs_Settings_API();
	}

	// TODO: Comentar.
	public function init_settings() {

		$this->sections = array(
			array(
				'id'    => 'gendernaut_post_type',
				'title' => __( 'Custom Post Type', $this->textdomain ),
			),
		);

		$this->settings = array(
			'gendernaut_post_type' => array(
				'create_post_type' => array(
					'name'  => 'create_post_type',
					'label' => __( 'Create Custom Post Type', $this->textdomain ),
					'type'  => 'checkbox',
				),
				'post_type_singular' => array(
					'name'  => 'post_type_singular',
					'label' => __( 'Post Type Singular Name (Default: Entry)', $this->textdomain ),
					'type'  => 'text',
					'default' => __('Entry', $this->textdomain),
					'sanitize_callback' => 'trim',
				),
				'post_type_plural' => array(
					'name'  => 'post_type_plural',
					'label' => __( 'Post Type Plural Name (Default: Entries)', $this->textdomain ),
					'type'  => 'text',
					'default' => __('Entries', $this->textdomain),
					'sanitize_callback' => 'trim',
				),
				'post_type_menu' => array(
					'name'  => 'post_type_menu',
					'label' => __( 'Name in the Admin Menu (Default: Archive)', $this->textdomain ),
					'type'  => 'text',
					'default' => __('Archive', $this->textdomain),
					'sanitize_callback' => 'trim',
				),
				'archive_slug' => array(
					'name'  => 'archive_slug',
					'label' => __( 'Post Type Archive slug (Default: archive)', $this->textdomain ),
					'type'  => 'text',
					'default' => 'archive',
					'sanitize_callback' => 'trim',
				),
				'create_taxonomy' => array(
					'name'  => 'create_taxonomy',
					'label' => __( 'Create Custom Taxonomy', $this->textdomain ),
					'type'  => 'checkbox',
				),
				'taxonomy_singular' => array(
					'name'  => 'taxonomy_singular',
					'label' => __( 'Taxonomy Singular Name (Default: Type)', $this->textdomain ),
					'type'  => 'text',
					'default' => __('Type', $this->textdomain),
					'sanitize_callback' => 'trim',
				),
				'taxonomy_plural' => array(
					'name'  => 'taxonomy_plural',
					'label' => __( 'Taxonomy Plural Name (Default: Types)', $this->textdomain ),
					'type'  => 'text',
					'default' => __('Types', $this->textdomain),
					'sanitize_callback' => 'trim',
				),
				'taxonomy_slug' => array(
					'name'  => 'taxonomy_slug',
					'label' => __( 'Taxonomy Archive slug (Default: type)', $this->textdomain ),
					'type'  => 'text',
					'default' => 'type',
					'sanitize_callback' => 'trim',
				),
			)
		);
	}

	// TODO: Comentar.
	public function add_post_type_settings() {
		$post_types = $this->post_type_labels();

		$this->sections[] = array(
			'id'    => 'gendernaut_shortcode',
			'title' => __( 'Shortcode Defaults', $this->textdomain ),
		);

		$this->settings['gendernaut_shortcode'] = array(
			'default_post_type' => array(
				'name'  => 'default_post_type',
				'label' => __( 'Default Archive Post Type', $this->textdomain ),
				'type'  => 'select',
				'options' => $post_types,
			),
		);

		$views = gendernaut()->get_registered_views();
		$views = array_combine($views, $views);

		foreach ($post_types as $post_type => $label) {
			$key = $this->get_post_type_section_key($post_type);
			$taxonomies = $this->taxonomy_labels($post_type);
			$sort_options = array_merge(
				$this->get_simple_sort_options(),
				$taxonomies,
				$this->get_meta_sort_options()
			);
			$this->sections[] = array(
				'id'    => $key,
				'title' => $label,
			);
			$this->settings[$key] = array(
				'use_gendernaut' => array(
					'name'  => 'use_gendernaut',
					'label' => __( 'Use Gendernaut Archive', $this->textdomain ),
					'type'  => 'checkbox',
				),
				'views' => array(
					'name'  => 'views',
					'label' => __( 'Show Views:', $this->textdomain ),
					'type'  => 'multicheck',
					'options' => $views,
				),
				'filter_by' => array(
					'name'  => 'filter_by',
					'label' => __( 'Filter By:', $this->textdomain ),
					'type'  => 'multicheck',
					'options' => array_merge(
						array(
							'index' => __('Alphabetic Index', $this->textdomain ),
						),
						$taxonomies,
						array(
							'search' => __('Search', $this->textdomain ),
						)
					),
				),
				'sort_by' => array(
					'name'  => 'sort_by',
					'label' => __( 'Sort By:', $this->textdomain ),
					'type'  => 'radio',
					'options' => $sort_options,
				),
				'custom_field' => array(
					'name'  => 'custom_field',
					'label' => __( 'Custom Field Name', $this->textdomain ),
					'type'  => 'text',
				),
				'sort_order' => array(
					'name'  => 'sort_order',
					'label' => __( 'Sort Order:', $this->textdomain ),
					'type'  => 'radio',
					'options' => array(
						'ASC' => __( 'Ascending', $this->textdomain ),
						'DESC' => __( 'Descending', $this->textdomain ),
					),
				),
				'custom_title_field' => array(
					'name'  => 'custom_title_field',
					'label' => __( 'Custom Field For Titles in the Archive Page', $this->textdomain ),
					'type'  => 'text',
					'sanitize_callback' => 'trim',
				),
			);
		}
	}

	/**
	 * Register Settings for this plugin.
	 *
	 * @since    1.0.0
	 */
	public function register_options() {

		/**
		 * Filter sections in the settings page.
		 *
		 * @since    1.0.0
		 * @param    array[]    $sections    {
		 *     Each item has the following structure.
		 *     @type    string    $id       Unique string id.
		 *     @type    string    $title    Label for the section.
		 * }
		 */
		$sections = apply_filters('gendernaut_settings_sections', $this->sections);
		$this->settings_manager->set_sections($sections);

		/**
		 * Filter fields in the settings page.
		 *
		 * Sample structure:
		 *
		 * 	array(
		 * 		'gendernaut_post_type' => array(
		 * 			array(
		 * 				'name'  => 'create_post_type',
		 * 				'label' => 'Create Custom Post Type',
		 * 				'type'  => 'checkbox',
		 * 			),
		 * 		),
		 * 		'gendernaut_shortcode' => array(
		 * 			array(
		 * 				'name'  => 'default_post_type',
		 * 				'label' => 'Default Archive Post Type',
		 * 				'type'  => 'select',
		 * 				'options' => $post_types,
		 * 			),
		 * 		),
		 * 	)
		 *
		 * @since    1.0.0
		 * @param    array    $settings {
		 *     An array with section names as keys and field options as values.
		 *     @type    array[]    ${$section_id}    {
		 *         An array of field options. Each item has the folowing possible values:
		 *         @type    string    $name     Field string identifier.
		 *         @type    string    $label    Field label.
		 *         @type    string    $type     Field type
		 *     }
		 * }
		 */
		$settings = apply_filters('gendernaut_settings_fields', $this->settings);
		$this->settings_manager->set_fields($settings);

		$this->settings_manager->admin_init();
	}

	/**
	 * Add options page to the menu.
	 *
	 * @since    1.0.0
	 */
	public function add_options_page() {
		$menu_name = 'Gendernaut Archive';
		$user_capability = 'manage_options';
		$page_slug = $this->plugin_name;
		$render_callback = array($this, 'render_options_page');

		add_options_page($this->page_title, $menu_name, $user_capability, $page_slug, $render_callback);
	}

	/**
	 * Render the options page.
	 *
	 * @since    1.0.0
	 */
	public function render_options_page() {

		// $id = 1;
		// $first_available = 0;
		// $last_available = 0;
		// $last_id = 1;
		//
		// while( $id <= 1150 ) {
		// 	if ( get_post($id) ) {
		// 		if ($last_available === $last_id) {
		// 			$range = $last_available - $first_available + 1;
		// 			echo "{$range}: {$first_available}-{$last_available}\n";
		// 		}
		// 		$last_id = $id;
		// 		$first_available = ++$id;
		// 	}
		// 	else {
		// 		$last_available = $id;
		// 		$last_id = $id;
		// 		$id++;
		// 	}
		// }
		//
		// if ($last_available === $last_id) {
		// 	$range = $last_available - $first_available + 1;
		// 	echo "{$range}: {$first_available}-{$last_available}\n";
		// }


		?>
		<h1><?= $this->page_title ?></h1>
		<div class="wrap">
			<?php
			$this->settings_manager->show_navigation();
			$this->settings_manager->show_forms();
			?>
		</div>
		<?php
	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Gendernaut_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Gendernaut_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/gendernaut-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Gendernaut_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Gendernaut_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/gendernaut-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	 * Get a settings field value.
	 *
	 * @since 1.0.0
	 * @param     string    $option     Field name.
	 * @param     string    $section    Section to which the field belongs.
	 * @param     string    $default    Default value if the field is not set.
	 * @return    string                Field value.
	 */
	public function get_option($option, $section, $default = '') {
		$value = $this->settings_manager->get_option($option, $section, $default);

		// if ( isset($this->settings[$section][$option]['type'])
		// 	&&  $this->settings[$section][$option]['type'] === 'checkbox') {
		// 	return $value === 'on';
		// }
		//


		if ( '' === $value && empty( $this->settings[$section][$option]['can_be_empty'] ) ) {
			if ( '' === $default ) {
				if ( isset( $this->settings[$section][$option]['default']) ) {
					$value = $this->settings[$section][$option]['default'];
				}
			}
			else {
				$value = $default;
			}
		}

		return $value;
	}

	//TODO: documentar
	public function get_post_type_option($option, $post_type, $default = '') {
		$section = $this->get_post_type_section_key($post_type);
		return $this->settings_manager->get_option($option, $section, $default);
	}

	/**
	 * Get section id for a specific Post Type settings.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type string id.
	 * @return    string                  Id for settings section.
	 */
	public function get_post_type_section_key($post_type) {
		return "gendernaut_{$post_type}";
	}

	/**
	 * Check if a Post Type archive has to be overriden with Gendernaut Archive.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type string id.
	 * @return    bool                    Whether Gendernaut Archive has to be used for this Post Type.
	 */
	public function uses_gendernaut($post_type) {
		$section_key = $this->get_post_type_section_key($post_type);
		return $this->get_option('use_gendernaut', $section_key, false) === 'on';
	}

	/**
	 * Get the filtering options for a post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    array[]                List of filter options.
	 */
	public function get_filters($post_type) {
		$filter_keys = $this->get_filter_keys($post_type);
		$filters = array();

		if ( $filter_keys ) {
			foreach ( $filter_keys as  $filter_key ) {
				switch($filter_key) {
					case 'index':
					case 'search':
						$filters[] = array(
							'type' => $filter_key
						);
						break;
					default:
						$taxonomy = get_taxonomy($filter_key);
						$filters[] = array(
							'type' => 'taxonomy',
							'taxonomy' => $filter_key,
							'label' => $taxonomy->labels->singular_name,
						);
				}
			}
		}

		return $filters;
	}

	/**
	 * Get the filtering field keys for a post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    string[]                List of fields to filter by.
	 */
	public function get_filter_keys($post_type) {
		$section_key = $this->get_post_type_section_key($post_type);
		return $this->get_option('filter_by', $section_key, array());
	}

	/**
	 * Get the views to render for a post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    string[]                List of views to render.
	 */
	public function get_views($post_type) {
		$default_view = gendernaut()->get_registered_views()[0];
		$section_key = $this->get_post_type_section_key($post_type);
		return $this->get_option('views', $section_key, array($default_view));
	}

	/**
	 * Get sort options for a Post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    array                   Array of sort options.
	 */
	public function get_sort_options($post_type) {
		$section_key = $this->get_post_type_section_key($post_type);

		$options =  array(
			'orderby' => $this->get_option('sort_by', $section_key, 'date'),
			'meta_key' => $this->get_option('custom_field', $section_key, ''),
			'order' => $this->get_option('sort_order', $section_key, 'DESC'),
		);

		if ( $options['orderby'] === 'meta_value_date' ) {
			$options['orderby'] = 'meta_value';
			$options['meta_type'] = 'DATE';
		}

		return $options;
	}

	/**
	 * Whether the sort can be performed natively by WP_Query or not.
	 *
	 * @since    1.0.0
	 * @param    string    $orderby    'orderby' string key.
	 * @return   boolean               Whether the sort can be performed natively by WP_Query or not.
	 */
	public function is_native_order($orderby) {
		$simple_keys = $this->get_simple_sort_keys();
		$meta_keys = $this->get_meta_sort_keys();
		return in_array($orderby, $simple_keys) || in_array($orderby, $meta_keys);
	}

	/**
	 * Get an array of single argument 'orderby' options supported by WP_Query.
	 *
	 * @since    1.0.0
	 * @return    array    Array of 'orderby' options.
	 */
	public function get_simple_sort_options() {
		static $options;

		$options || $options = array(
			'date' => __( 'Publication Date', $this->textdomain ),
			'title' => __( 'Title', $this->textdomain ),
		);

		return $options;
	}

	/**
	 * Get a list of single argument 'orderby' values supported by WP_Query.
	 *
	 * @since    1.0.0
	 * @return    string[]    List of 'orderby' keys.
	 */

	public function get_simple_sort_keys() {
		return array_keys( $this->get_simple_sort_options() );
	}

	/**
	 * Get an array of custom field sort options.
	 *
	 * @since    1.0.0
	 * @return    array    Array of custom field sort options.
	 */
	public function get_meta_sort_options() {
		static $options;

		$options || $options = array(
			'meta_value_num' => __( 'Custom Number Field', $this->textdomain ),
			'meta_value' => __( 'Custom Text Field', $this->textdomain ),
			'meta_value_date' => __( 'Custom Date Field', $this->textdomain ),
		);

		return $options;
	}

	/**
	 * Get a list of custom field sort options keys.
	 *
	 * @since    1.0.0
	 * @return    string[]    List of sort options keys.
	 */

	public function get_meta_sort_keys() {
		return array_keys( $this->get_meta_sort_options() );
	}

	/**
	 * Get a list of Post Type labels in the form 'post_type' => 'label'.
	 *
	 * Uses {@see Gendernaut_Admin::allowed_post_types()} by default, but a list of Post Type objects can be passed.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @param    array        $post_types    List of Post Type objects to use. Defaults to `$this->allowed_post_types()`.
	 * @return   array                       List of Post Type labels.
	 * @see      Gendernaut_Admin::allowed_post_types()
	 */
	private function post_type_labels($post_types = null) {

		$post_types = $post_types ? $post_types : $this->allowed_post_types();

		return array_map( function($item){
			return $item->labels->menu_name;
		}, $post_types );
	}

	/**
	 * Returns list of elegible Post Types to use in an archive.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return   array    List of Post Type Objects.
	 */
	private function allowed_post_types() {
		$banned_post_types = array('revision', 'nav_menu_item', 'custom_css', 'customize_changeset', 'oembed_cache', 'user_request', 'wp_block');

		/**
		 * Filter the list of banned Post Types.
		 *
		 * These Post Types Shoud not be considered by Gendernaut Archive as an option to apply the archive functionality to.
		 *
		 * @since    1.0.0
		 * @param    string[]    List of Post Types.
		 */
		$banned_post_types = apply_filters('gendernaut_banned_post_types', $banned_post_types);

		$banned = array_flip($banned_post_types);

		$post_types = get_post_types( array(), 'objects' );

		return array_diff_key($post_types, $banned);
	}

	/**
	 * Get a list of Taxonomy labels for a Post Type in the form 'taxonomy' => 'label'.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @param    string    $post_type    Taxonomy name.
	 * @return   array                   List of Taxonomoy labels.
	 */
	private function taxonomy_labels($post_type) {

		$taxonomies = get_object_taxonomies($post_type, 'object');

		return array_map( function($item){
			return $item->labels->singular_name;
		}, $taxonomies );
	}
}
