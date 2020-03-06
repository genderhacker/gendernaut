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
	 * @var      Gendernaut_Taxonomy_Def[]    $taxonomy_defs    Taxonomy Definitions to register.
	 */
	private $taxonomy_defs = array();

	/**
	 * Stores Taxonomy Field Definitions to register.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      Gendernaut_Taxonomy_Field_Def[]    $taxonomy_field_defs    Taxonomy Field Definitions to register.
	 */
	private $taxonomy_field_defs = array();

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

	// TODO: Comentar.
	public function theme_setup() {
		add_theme_support( 'post-thumbnails', array('gendernaut_archive', 'gendernaut_biblio') );
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
         * @var      Gendernaut_Post_Type_Def[]    $post_type_defs
		 */
		$post_type_defs = apply_filters('gendernaut_post_types', $this->post_type_defs);

		/**
		 * Filter Taxonomy definitions before registering them.
		 * @since    1.0.0
		 * @param    Gendernaut_Taxonomy_Def[]    List of Taxonomy Definitions.
         * @var      Gendernaut_Taxonomy_Def[]    $taxonomy_defs
		 */
		$taxonomy_defs = apply_filters('gendernaut_taxonomies', $this->taxonomy_defs);

		/**
		 * Filter Taxonomy definitions before registering them.
		 * @since    1.0.0
		 * @param    Gendernaut_Taxonomy_Field_Def[]    List of Taxonomy Definitions.
         * @var      Gendernaut_Taxonomy_Field_Def[]    $taxonomy_field_defs
		 */
		$taxonomy_field_defs = apply_filters('gendernaut_taxonomies_fields', $this->taxonomy_field_defs);


		foreach ($post_type_defs as $def) {
			$def->register();
		}

		foreach ($taxonomy_defs as $def) {
			$def->register();
		}

		foreach ($taxonomy_field_defs as $def) {
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
	 * @param    string|string[]   $post_types   List of Post Types to associate the Taxonomy with.
	 * @param    string            $sing_name    Singular Label.
	 * @param    string            $plur_name    Plural Label.
	 * @param    string|boolean    $rewrite      String to rewrite the url with. `true` uses $taxonomy, `false` disables rewrite. Default `true`.
	 * @param    array             $args         Additional arguments to the Taxonomy registration. {@see https://developer.wordpress.org/reference/functions/register_taxonomy/}
	 */
	public function add_taxonomy_def($taxonomy, $post_types, $sing_name, $plur_name, $rewrite = true, $args = null) {
		$this->taxonomy_defs[] = new Gendernaut_Taxonomy_Def($taxonomy, $post_types, $sing_name, $plur_name, $this->textdomain, $rewrite, $args);
	}

	/**
	 * Add a Taxonomy Field Definition to register.
	 *
	 * @since 1.0.0
	 * @param    string            $taxonomy     Taxonomy name.
     * @param    string            $field_key    Key of the field to use for the meta
     * @param    string            $field_name   Public name of the field
     * @param    string            $field_desc   Public description of the field
	 * @param    boolean           $editable     Singular Label.
	 * @param    boolean           $checkbox     Is the field a checkbox?
	 */
	public function add_taxonomy_field_def($taxonomy, $field_key, $field_name, $field_desc, $editable, $checkbox = false) {
		$this->taxonomy_field_defs[] = new Gendernaut_Taxonomy_Field_Def($taxonomy, $field_key, $field_name, $field_desc, $editable, $checkbox, $this->textdomain);
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
	 * @return    Gendernaut_Taxonomy_Def[]    Array of Taxonomy Definitions.
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
        /** @noinspection PhpIncludeInspection */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-post-type-def.php';

		/**
		 * The class for managing Taxonomy Definitions.
		 */
        /** @noinspection PhpIncludeInspection */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-taxonomy-def.php';

		/**
		 * The class for managing Taxonomy Field Definitions.
		 */
        /** @noinspection PhpIncludeInspection */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-taxonomy-field-def.php';

	}

	/**
	 * Add self-defined Post Type Definitions if needed.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function populate_post_type_defs() {
		$create_post_type = gendernaut()->get_option('create_post_type', 'gendernaut_post_type');

		if ( $create_post_type === 'on' ) {
			$post_type = 'gendernaut_archive';

			$sing_name = gendernaut()->get_option('post_type_singular', 'gendernaut_post_type' );

			$plur_name = gendernaut()->get_option('post_type_plural', 'gendernaut_post_type' );

			$menu_name = gendernaut()->get_option('post_type_menu', 'gendernaut_post_type' );

			$rewrite = gendernaut()->get_option('archive_slug', 'gendernaut_post_type' );

			$this->add_post_type_def($post_type, $sing_name, $plur_name, $rewrite, array(
				'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
				'labels' => array( 'menu_name' => $menu_name )
			));

			add_theme_support('post-thumbnails', ['gendernaut_archive']);

			$create_tax = gendernaut()->get_option('create_taxonomy', 'gendernaut_post_type');

			if ( $create_tax === 'on' ) {
				$taxonomy = 'gendernaut_tax';

				$sing_name = gendernaut()->get_option('taxonomy_singular', 'gendernaut_post_type' );

				$plur_name = gendernaut()->get_option('taxonomy_plural', 'gendernaut_post_type' );

				$rewrite = gendernaut()->get_option('taxonomy_slug', 'gendernaut_post_type' );

				$this->add_taxonomy_def($taxonomy, $post_type, $sing_name, $plur_name, $rewrite);
			}

			$taxonomy = 'gendernaut_col';
			$sing_name = __('Col·lecció', $this->textdomain);
			$plur_name = __('Col·leccions', $this->textdomain);
			$rewrite = 'collection';

			$this->add_taxonomy_def($taxonomy, $post_type, $sing_name, $plur_name, $rewrite);

			$this->add_taxonomy_field_def($taxonomy, 'g_col_code', __("Codi", $this->textdomain), __("Codi per poder editar la col·lecció", $this->textdomain), true, false);
			$this->add_taxonomy_field_def($taxonomy, 'g_col_public', __("Pública", $this->textdomain), __("Indica si la col·lecció és pública", $this->textdomain), false, true);
		}

		$post_type = 'gendernaut_biblio';
		$sing_name = __('Font', $this->textdomain);
		$plur_name = __('Fonts', $this->textdomain);
		$menu_name = __('Fonts', $this->textdomain);
		$rewrite = 'fonts';

		$this->add_post_type_def($post_type, $sing_name, $plur_name, $rewrite, array(
			'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
			'labels' => array( 'menu_name' => $menu_name )
		));

		$taxonomy = 'gendernaut_biblio_type';
		$sing_name = __('Tipus de Font', $this->textdomain);
		$plur_name = __('Tipus de Fonts', $this->textdomain);
		$rewrite = 'type';

		$this->add_taxonomy_def($taxonomy, $post_type, $sing_name, $plur_name, $rewrite);
	}
}
