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
		$this->settings = new WeDevs_Settings_API();
	}

	/**
	 * Register Settings for this plugin.
	 *
	 * @since    1.0.0
	 */
	public function register_options() {

		$post_types = $this->post_type_labels();

		$sections = array(
			array(
				'id'    => 'gendernaut_post_type',
				'title' => __( 'Custom Post Type', $this->textdomain ),
			),
			array(
				'id'    => 'gendernaut_shortcode',
				'title' => __( 'Shortcode Defaults', $this->textdomain ),
			),
		);

		$settings = array(
			'gendernaut_post_type' => array(
				array(
					'name'  => 'create_post_type',
					'label' => __( 'Create Custom Post Type', $this->textdomain ),
					'type'  => 'checkbox',
				),
			),
			'gendernaut_shortcode' => array(
				array(
					'name'  => 'default_post_type',
					'label' => __( 'Default Archive Post Type', $this->textdomain ),
					'type'  => 'select',
					'options' => $post_types,
				),
			),
		);

		foreach ($post_types as $post_type => $label) {
			$key = $this->get_post_type_section_key($post_type);
			$taxonomies = $this->taxonomy_labels($post_type);
			$sections[] = array(
				'id'    => $key,
				'title' => $label,
			);
			$settings[$key] = array(
				array(
					'name'  => 'use_gendernaut',
					'label' => __( 'Use Gendernaut Archive', $this->textdomain ),
					'type'  => 'checkbox',
				),
				array(
					'name'  => 'filter_by',
					'label' => __( 'Filter By:', $this->textdomain ),
					'type'  => 'multicheck',
					'options' => $taxonomies,
				),
			);
		}

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
		$sections = apply_filters('gendernaut_settings_sections', $sections);
		$this->settings->set_sections($sections);

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
		$settings = apply_filters('gendernaut_settings_fields', $settings);
		$this->settings->set_fields($settings);

		$this->settings->admin_init();
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
		?>
		<h1><?= $this->page_title ?></h1>
		<div class="wrap">
			<?php
			$this->settings->show_navigation();
			$this->settings->show_forms();
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
		return $this->settings->get_option($option, $section, $default);
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
		return $this->get_option('use_gendernaut', $section_key, false);
	}

	/**
	 * Get the filtering options for a post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    string[]                List of taxonomies to filter by.
	 */
	public function get_filters($post_type) {
		$section_key = $this->get_post_type_section_key($post_type);
		return $this->get_option('filter_by', $section_key, array());
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
