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
	public $renderer; // FIXME: no fer-ho públic, però mirar una forma d'accedir a les funcions del renderer des de les vistes sense haver de crear una funció aquí

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
	 * Holds instance that manages collections definition.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Collection_Manager    $collection_manager    Gendernaut_Collection_Manager instance.
	 */
	protected $collection_manager;

	/**
	 * Holds instance that manages View types.
	 * @since    1.0.0
	 * @access   protected
	 * @var      Gendernaut_Views    $views_manager    Gendernaut_Views instance.
	 */
	protected $views_manager;

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

	// TODO: documentar
	public function get_post_type_option($option, $post_type, $default = '') {
		return $this->admin->get_post_type_option($option, $post_type, $default);
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
	 * Get sort options for a Post Type.
	 *
	 * @since    1.0.0
	 * @param     string    $post_type    Post Type slug
	 * @return    array                   Array of sort options.
	 */
	public function get_sort_options($post_type) {
		return $this->admin->get_sort_options($post_type);
	}

	/**
	 * Whether the sort can be performed natively by WP_Query or not.
	 *
	 * @since    1.0.0
	 * @param    string    $orderby    'orderby' string key.
	 * @return   boolean               Whether the sort can be performed natively by WP_Query or not.
	 */
	public function is_native_order($orderby) {
		return $this->admin->is_native_order($orderby);
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
	 * Render the menu.
	 *
	 * See {@see Gendernaut_Renderer::menu()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::menu()
	 */
	public function menu() {
		$this->renderer->menu();
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
     * Render the collections overlay.
     *
     * See {@see Gendernaut_Renderer::collections_overlay()}.
     *
     * @since    1.0.0
     * @see      Gendernaut_Renderer::collections_overlay()
     */
    public function collections_overlay() {
        $this->renderer->collections_overlay();
    }

    /**
     * Render the collections menu.
     *
     * See {@see Gendernaut_Renderer::collections_menu()}.
     *
     * @since    1.0.0
     * @see      Gendernaut_Renderer::collections_menu()
     */
    public function collections_menu() {
        $this->renderer->collections_menu();
    }

	/**
	 * Render a view selector.
	 *
	 * See {@see Gendernaut_Renderer::view_selector()}.
	 *
	 * @since    1.0.0
	 * @see      Gendernaut_Renderer::view_selector()
	 */
	public function view_selector( $views = null ) {
		if ( null === $views ) {
			$views = $this->get_views();
		}
		$this->renderer->view_selector( $views );
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
	 * See {@see Gendernaut_Renderer::get_item_classes()}.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $additional    Additional classes to add to the attribute.
	 * @param     array              $mods          Modifiers to append to main item class.
	 * @param     int|null           $post_id       ID of the post the item is related to. Current `$post` by default.
	 * @return    string[]                          List of html classes.
	 * @see       Gendernaut_Renderer::get_item_classes()
	 */
	public function get_item_classes( $additional = '', $mods = array(), $post_id = null ) {
		return $this->renderer->get_item_classes( $additional, $mods, $post_id );
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
	 * Render the class attribute for the current section.
	 *
	 * See {@see Gendernaut_Renderer::section_class()}.
	 *
	 * @since    1.0.0
	 * @param    string|string[]    $additional    Additional classes to add to the attribute.
	 * @param    array              $mods          Modifiers to append to main section class.
	 * @see      Gendernaut_Renderer::section_class()
	 */
	public function section_class( $additional = '', $mods = array() ) {
		$this->renderer->section_class( $additional, $mods );
	}

	/**
	 * Get a list of html classes for the current section.
	 *
	 * See {@see Gendernaut_Renderer::get_section_classes()}.
	 *
	 * @since     1.0.0
	 * @param     string|string[]    $additional    Additional classes to add to the attribute.
	 * @param     array              $mods          Modifiers to append to main section class.
	 * @return    string[]                          List of html classes.
	 * @see       Gendernaut_Renderer::get_section_classes()
	 */
	public function get_section_classes( $additional = '', $mods = array() ) {
		return $this->renderer->get_section_classes( $additional, $mods );
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

	// TODO: Comentar.
	public function term_color_class( $term_id, $taxonomy = 'gendernaut_tax' ) {
		return $this->renderer->term_color_class( $term_id, $taxonomy );
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
	 * This is a placeholder function. All views are returned, but in the future they will be set through the admin.
	 *
	 * @since     1.0.0
	 * @return    string[]    List of views to render.
	 */
	public function get_views($post_type = null) {
		if ( empty($post_type) ) {
			$post_type = get_post_type();
		}
		return $this->admin->get_views($post_type);
	}

	/**
	 * Retrieve the list of all registered views.
	 *
	 * @since     1.0.0
	 * @return    string[]    List of views.
	 */
	public function get_registered_views() {
		return $this->views_manager->get_views();
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
	 * Gets which filters have to be rendered from plugin options.
	 *
	 * @since     1.0.0
	 * @return    array[]    Each element in the returned list is a set of options for a filter.
	 */
	public function get_filters() {
		$post_type = get_post_type();
		return  $this->admin->get_filters($post_type);
	}

	// TODO: Comentar.
	public function get_term_index( $term_id, $tax ) {
		static $maps = array();

		if ( ! taxonomy_exists($tax) ) return false;

		if ( ! isset( $maps[$tax] ) ) {
			$maps[$tax] = array();

			$terms = get_terms( array(
				'taxonomy' => $tax,
				'orderby'  => 'id',
				'hide_empty' => true,
			) );

			foreach ($terms as $idx => $term) {
				$maps[$tax][$term->term_id] = $idx + 1;
			}
		}

		return $maps[$tax][$term_id];
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
         * The class that manages Collections.
         */
        require_once $plugin_path . 'includes/class-gendernaut-collection-manager.php';

        /**
		 * The class that manages View types.
		 */
		require_once $plugin_path . 'includes/class-gendernaut-views.php';

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

		$this->views_manager = new Gendernaut_Views( $this->get_plugin_name(), $this->get_version() );
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
		$this->collection_manager = new Gendernaut_Collection_Manager($this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'init', $this, 'global_setup' );
		$this->loader->add_action( 'after_setup_theme', $this->post_types_manager, 'theme_setup' );
		$this->loader->add_action( 'init', $this->post_types_manager, 'register_post_types', 15 );

		$this->loader->add_action("wp_ajax_collection_save", $this->collection_manager, 'save_collection');
		$this->loader->add_action("wp_ajax_nopriv_collection_save", $this->collection_manager, 'save_collection');
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
		$this->loader->add_action( 'init', $this->admin, 'init_settings', 10 );
		$this->loader->add_action( 'init', $this->admin, 'add_post_type_settings', 99 );
		$this->loader->add_action( 'admin_init', $this->admin, 'register_options' );
		$this->loader->add_action( 'admin_menu', $this->admin, 'add_options_page' );

		$this->loader->add_filter('manage_edit-gendernaut_col_columns', $this->collection_manager, 'collection_columns');
		$this->loader->add_filter('manage_gendernaut_col_custom_column', $this->collection_manager, 'collection_column_content', 10, 3);
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

		$this->loader->add_action( 'pre_get_posts', $this->public, 'modify_main_query' );
		$this->loader->add_filter('template_include', $this->public, 'filter_archive_template', 20);

		$this->loader->add_filter('the_content', $this->public, 'show_archive_metadata', 0);
		$this->loader->add_filter('the_content', $this->public, 'add_related_posts_after_post_content', 10);

        $this->loader->add_filter('the_posts', $this->public, 'add_fake_collections_page', -10);
		$this->loader->add_filter('the_posts', $this->public, 'reorder_posts', 10, 2);
		$this->loader->add_filter('the_title', $this->public, 'filter_title', 10, 2);
        $this->loader->add_filter('init', $this->public, 'add_edit_collection_rewrite');
        $this->loader->add_filter('query_vars', $this->public, 'add_edit_collection_var');

		$this->loader->add_action("wp_ajax_collection_load", $this->collection_manager, 'load_collection');
		$this->loader->add_action("wp_ajax_nopriv_collection_load", $this->collection_manager, 'load_collection');
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
