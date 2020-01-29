<?php

/**
 * Class to manage Post Types and Taxonomies.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * Class to manage Post Types and Taxonomies.
 *
 *
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Post_Types_Manager {

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
	 * Stores Post Type Definitions to register.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      Gendernaut_Post_Type_Def[]    $post_type_defs    Post Type Definitions to register.
	 */
	private $post_type_defs = array();

	/**
	 * Stores Taxonomy Definitions to register.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      Gendernaut_Taxonomy_Def[]    $taxonomy_defs    Post Type Definitions to register.
	 */
	private $taxonomy_defs = array();

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

		$this->load_dependencies();
	}

	/**
	 * Register Post Types.
	 *
	 * @since    1.0.0
	 */
	public function register_post_types() {

		$this->populate_post_type_defs();

		/**
		 * Filter Post Type definitions before registering them.
		 * @since    1.0.0
		 * @param    Gendernaut_Post_Type_Def[]    List of Post Type Definitions.
		 */
		$post_type_defs = apply_filters('gendernaut_post_types', $this->post_type_defs);

		/**
		 * Filter Taxonomy definitions before registering them.
		 * @since    1.0.0
		 * @param    Gendernaut_Taxonomy_Def[]    List of Taxonomy Definitions.
		 */
		$taxonomy_defs = apply_filters('gendernaut_taxonomies', $this->taxonomy_defs);

		foreach ($post_type_defs as $def) {
			$def->register();
		}

		foreach ($taxonomy_defs as $def) {
			$def->register();
		}
	}

	/**
	 * Add a Post Type Definition to register.
	 *
	 * @since 1.0.0
	 * @param    string            $post_type    Post Type name.
	 * @param    string            $sing_name    Singular Label.
	 * @param    string            $plur_name    Plural Label.
	 * @param    string|boolean    $rewrite      String to rewrite the url with. `true` uses $post_type, `false` disables rewrite. Default `true`.
	 * @param    array             $args         Additional arguments to the Post Type registration. {@see https://developer.wordpress.org/reference/functions/register_post_type/}
	 */
	public function add_post_type_def($post_type, $sing_name, $plur_name, $rewrite = true, $args = null) {
		$this->post_type_defs[] = new Gendernaut_Post_Type_Def($post_type, $sing_name, $plur_name, $this->textdomain, $rewrite, $args);
	}

	/**
	 * Add a Taxonomy Definition to register.
	 *
	 * @since 1.0.0
	 * @param    string            $taxonomy     Taxonomy name.
	 * @param    string[]          $post_types   List of Post Types to associate the Taxonomy with.
	 * @param    string            $sing_name    Singular Label.
	 * @param    string            $plur_name    Plural Label.
	 * @param    string|boolean    $rewrite      String to rewrite the url with. `true` uses $taxonomy, `false` disables rewrite. Default `true`.
	 * @param    array             $args         Additional arguments to the Taxonomy registration. {@see https://developer.wordpress.org/reference/functions/register_taxonomy/}
	 */
	public function add_taxonomy_def($taxonomy, $post_types, $sing_name, $plur_name, $rewrite = true, $args = null) {
		$this->taxonomy_defs[] = new Gendernaut_Taxonomy_Def($taxonomy, $post_types, $sing_name, $plur_name, $this->textdomain, $rewrite, $args);
	}

	/**
	 * Retrieve the array of Post Type Definitions.
	 *
	 * @since 1.0.0
	 * @return    Gendernaut_Post_Type_Def[]    Array of Post Type Definitions.
	 */
	public function get_post_type_defs() {
		return $this->post_type_defs;
	}

	/**
	 * Retrieve the array of Taxonomy Definitions.
	 *
	 * @since 1.0.0
	 * @return    Gendernaut_Post_Type_Def[]    Array of Taxonomy Definitions.
	 */
	public function get_taxonomoy_defs() {
		return $this->taxonomy_defs;
	}

	/**
	 * Load the required dependencies.
	 *
	 * Include the following files:
	 *
	 * - Gendernaut_Post_Type_Def. Manages Post Type Definitions.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class for managing Post Type Definitions.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-post-type-def.php';

		/**
		 * The class for managing Taxonomy Definitions.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-taxonomy-def.php';

	}

	/**
	 * Add self-defined Post Type Definitions if needed.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function populate_post_type_defs() {
		$create_post_type = gendernaut()->get_option('create_post_type', 'gendernaut_post_type');

		if ( $create_post_type ) {
			$post_type = 'gendernaut_archive';
			$sing_name = __('Entry', $this->textdomain);
			$plur_name = __('Entries', $this->textdomain);
			$menu_name = __('Gendernaut Entries', $this->textdomain);
			$rewrite = 'archive';

			$this->add_post_type_def($post_type, $sing_name, $plur_name, $rewrite, array(
				'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
				'labels' => array( 'menu_name' => $menu_name )
			));

			$taxonomy = 'gendernaut_tax';
			$sing_name = __('Type', $this->textdomain);
			$plur_name = __('Types', $this->textdomain);
			$rewrite = 'type';

			$this->add_taxonomy_def($taxonomy, $post_type, $sing_name, $plur_name, $rewrite);
		}
	}
}
