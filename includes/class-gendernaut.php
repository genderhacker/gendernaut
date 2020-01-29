<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Holds instance that manages admin side.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Admin    $admin    Gendernaut_Admin instance.
	 */
	protected $admin;

	/**
	 * Holds instance that manages public side.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Public    $public    Gendernaut_Public instance.
	 */
	protected $public;

	/**
	 * Holds instance that renders content.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Renderer    $renderer    Gendernaut_Renderer instance.
	 */
	protected $renderer;

	/**
	 * Holds instance that manages i18n.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_i18n    $i18n    Gendernaut_i18n instance.
	 */
	protected $i18n;

	/**
	 * Holds instance that manages Post Types.
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Post_Types_Manager    $post_types_manager    Gendernaut_Post_Types_Manager instance.
	 */
	protected $post_types_manager;

	/**
	 * Create a unique instance of Gendernaut if it doesn't already exist.
	 * @return    Gendernaut    Unique instance.
	 */
	public static function instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new Gendernaut();
			$instance->init();
			$instance->run();
		}

		return $instance;
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Gendernaut_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

	/**
	 * Get the absolute path to the plugin directory.
	 *
	 * @since     1.0.0
	 * @return    string    Absolute path to the plugin directory.
	 */
	public function plugin_path() {
		return plugin_dir_path( __DIR__ );
	}

	/**
	 * Get a settings field value.
	 *
	 * @since     1.0.0
	 * @param     string    $option     Field name.
	 * @param     string    $section    Section to which the field belongs.
	 * @param     string    $default    Default value if the field is not set.
	 * @return    string                Field value.
	 */
	public function get_option($option, $section, $default = '') {
		return $this->admin->get_option($option, $section, $default);
	}

	/**
	 * Check if a Post Type archive has to be overriden with Gendernaut Archive.
	 *
	 * @since     1.0.0
	 * @param     string    $post_type    Post Type string id.
	 * @return    bool                    Whether Gendernaut Archive has to be used for this Post Type.
	 */
	public function uses_gendernaut($post_type) {
		return $this->admin->uses_gendernaut($post_type);
	}

	/**
	 * Sets image sizes.
	 *
	 * @since     1.0.0
	 */
	public function global_setup() {
		$image_sizes = array(
			'gendernaut-thumbnail' => array(220, 220, true),
			'gendernaut-thumbnail-2x' => array(440, 440, true),
		);

		$image_sizes = apply_filters('gendernaut_image_sizes', $image_sizes);

		foreach ($image_sizes as $name => $attrs) {
			add_image_size($name, $attrs[0], $attrs[1], $attrs[2]);
		}
	}

	/**
	 * Render the archive.
	 *
	 * See {@see Gendernaut_Renderer::archive()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::archive()
	 */
	public function archive() {
		$this->renderer->archive();
	}

	/**
	 * Render a set of views.
	 *
	 * See {@see Gendernaut_Renderer::views()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::views()
	 */
	public function views( $views = null ) {
		if ( null === $views ) {
			$views = $this->get_views();
		}
		$this->renderer->views( $views );
	}

	/**
	 * Render a view.
	 *
	 * See {@see Gendernaut_Renderer::view()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::view()
	 */
	public function view( $view ) {
		$this->renderer->view( $view );
	}

	/**
	 * Render an item for a particular view.
	 *
	 * See {@see Gendernaut_Renderer::item()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::item()
	 */
	public function item( $view = null ) {
		$this->renderer->item( $view );
	}

	/**
	 * Render the class attribute for an item.
	 *
	 * See {@see Gendernaut_Renderer::item_class()}.
	 *
	 * @since    1.0.0
	 * @param    string|string[]    $additional    Additional classes to add to the attribute.
	 * @param    array              $mods          Modifiers to append to main item class.
	 * @param    int|null           $post_id       ID of the post the item is related to. Current `$post` by default.
	 * @see      Gendernaut_Renderer::item_class()
	 */
	public function item_class( $additional = '', $mods = array(), $post_id = null ) {
		$this->renderer->item_class( $additional, $mods, $post_id );
	}

	/**
	 * Get a list of html classes for an item.
	 *
	 * See {@see Gendernaut_Renderer::get_item_class()}.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $additional    Additional classes to add to the attribute.
	 * @param     array              $mods          Modifiers to append to main item class.
	 * @param     int|null           $post_id       ID of the post the item is related to. Current `$post` by default.
	 * @return    string[]                          List of html classes.
	 * @see       Gendernaut_Renderer::get_item_class()
	 */
	public function get_item_class( $additional = '', $mods = array(), $post_id = null ) {
		return $this->renderer->get_item_class( $additional, $mods, $post_id );
	}

	/**
	 * Render HTML attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if falsey.
	 */
	public function item_atts( $post_id = null ) {
		$this->renderer->item_atts( $post_id );
	}

	/**
	 * Get a list of HTML attributes for an item.
	 *
	 * @since     1.0.0
	 * @param     int|null    $post_id    ID of the Post the item corresponds to. Current Post if falsey.
	 * @return    array                   HTML attribute key value pairs.
	 */
	public function get_item_atts( $post_id = null ) {
		return $this->renderer->get_item_atts( $post_id );
	}

	/**
	 * Get subclasses for the current section main class.
	 *
	 * See {@see Gendernaut_Renderer::subclass()}.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $subclass    Subclass string or strings.
	 * @param     string|string[]    $mods        Modifier string or strings to append to resulting classes.
	 * @return    string                          Resulting classes in a single string.
	 * @see       Gendernaut_Renderer::subclass()
	 */
	public function subclass( $subclass, $mods = array() ) {
		return $this->renderer->subclass( $subclass, $mods );
	}

	/**
	 * @since     1.0.0
	 * @return    string|null    The name of the view being rendered.
	 * @see       Gendernaut_Renderer::get_current_view()
	 */
	public function get_current_view() {
		return $this->renderer->get_current_view();
	}

	/**
	 * Returns the name of the innermost section being rendered.
	 *
	 * @since     1.0.0
	 * @return    string|null    The name of the section being rendered.
	 * @see       Gendernaut_Renderer::get_current_section()
	 */
	public function get_current_section() {
		return $this->renderer->get_current_section();
	}

	/**
	 * Retrieve the list of views that have to be rendered.
	 *
	 * This is a placeholder function. Only the 'grid' view exists at the moment.
	 *
	 * @since     1.0.0
	 * @return    string[]    List of views to render.
	 */
	public function get_views() {
		return array( 'grid' );
	}

	/**
	 * Render filter controls.
	 *
	 * Each element in `$filters` is a set of filter group options. See {@see Gendernaut_Renderer::filter_group()} for a list of options.
	 *
	 * @since     1.0.0
	 * @param     array[]    $filters    List of filter group options.
	 * @see       Gendernaut_Renderer::filter_group()
	 */
	public function filters( $filters = null ) {
		if ( null === $filters ) {
			$filters = $this->get_filters();
		}
		$this->renderer->filters( $filters );
	}

	/**
	 * Get the filters to render.
	 *
	 * Gets which filters have to be rendered prom plugin options.
	 *
	 * @since     1.0.0
	 * @return    array[]    Each element in the returned list is a set of options for a filter.
	 */
	public function get_filters() {
		$post_type = get_post_type();
		$tax_keys = $this->admin->get_filters($post_type);
		$filters = array();

		if ( $tax_keys ) {
			foreach ( $tax_keys as  $tax_key ) {
				$taxonomy = get_taxonomy($tax_key);
				$filters[] = array(
					'type' => 'taxonomy',
					'taxonomy' => $tax_key,
					'label' => $taxonomy->labels->singular_name,
				);
			}
		}

		return $filters;
	}

	/**
	 * Dummy private constructor.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function __construct() {/* Do nothing here */}

	/**
	 * Dummy private clone method.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function __clone() {/* Do nothing here */}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Gendernaut_Loader. Orchestrates the hooks of the plugin.
	 * - Gendernaut_i18n. Defines internationalization functionality.
	 * - Gendernaut_Admin. Defines all hooks for the admin area.
	 * - Gendernaut_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		$plugin_path = $this->plugin_path();

		/**
		 * Require composer dependencies.
		 */
		require $plugin_path . 'vendor/autoload.php';

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once $plugin_path . 'includes/class-gendernaut-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once $plugin_path . 'includes/class-gendernaut-i18n.php';

		/**
		 * The class that manages Post Types and Taxonomies.
		 */
		require_once $plugin_path . 'includes/class-gendernaut-post-types-manager.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once $plugin_path . 'admin/class-gendernaut-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once $plugin_path . 'public/class-gendernaut-public.php';

		/**
		 * The class responsible for rendering content.
		 */
		require_once $plugin_path . 'public/class-gendernaut-renderer.php';

		$this->loader = new Gendernaut_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Gendernaut_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$this->i18n = new Gendernaut_i18n();
		$this->i18n->add_textdomain( $this->get_plugin_name() );

		$this->loader->add_action( 'plugins_loaded', $this->i18n, 'load_textdomains' );

	}

	/**
	 * Register all of the hooks not specifically related to only the admin or the public side.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_global_hooks() {

		$this->post_types_manager = new Gendernaut_Post_Types_Manager( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'init', $this, 'global_setup' );
		$this->loader->add_action( 'init', $this->post_types_manager, 'register_post_types' );
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$this->admin = new Gendernaut_Admin( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'admin_enqueue_scripts', $this->admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $this->admin, 'enqueue_scripts' );
		$this->loader->add_action( 'admin_init', $this->admin, 'register_options' );
		$this->loader->add_action( 'admin_menu', $this->admin, 'add_options_page' );

	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$this->renderer = new Gendernaut_Renderer( $this->get_plugin_name() );
		$this->public = new Gendernaut_Public( $this->get_plugin_name(), $this->get_version(), $this->renderer );


		$this->loader->add_action( 'wp_enqueue_scripts', $this->public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $this->public, 'enqueue_scripts' );

		$this->loader->add_filter('template_include', $this->public, 'filter_archive_template', 20);
	}

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function init() {
		if ( defined( 'GENDERNAUT_VERSION' ) ) {
			$this->version = GENDERNAUT_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'gendernaut';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_global_hooks();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function run() {
		$this->loader->run();
	}
}
