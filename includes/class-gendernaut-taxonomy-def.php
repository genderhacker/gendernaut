<?php

/**
 * Define a class for managing Post Type Definitions.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * Manages a Taxonomy Definition.
 *
 * Holds Variables to define a new Post Type, applying some defaults.
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Taxonomy_Def {

	/**
	 * Key to register the Taxonomy.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $taxonomy    Key string to register the Post Type.
	 */
	private $taxonomy;

	/**
	 * Singular label.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $sing_name    Singular label name for the Taxonomy.
	 */
	private $sing_name;

	/**
	 * Plural label.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plur_name    Plural label name for the Taxonomy.
	 */
	private $plur_name;

	/**
	 * Whether to rewrite URL's for this Taxonomy.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      bool|string    $rewrite    String to rewrite the URL with, or `true` to use {@see $taxonomy}. `false` disables rewriting.
	 */
	private $rewrite;

	/**
	 * Array of Post Type names to associate this taxonomy with.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string[]    $post_types    Array of Post Type names.
	 */
	private $post_types;

	/**
	 * All the arguments for registering the Taxonomy.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array    $args    Arguments: {@see https://developer.wordpress.org/reference/functions/register_taxonomy/}.
	 * @see      https://developer.wordpress.org/reference/functions/register_taxonomy/
	 */
	private $args;

	/**
	 * Populate the instance with options to register a Taxonomy.
	 *
	 * @since    1.0.0
     * @param    string            $taxonomy      Taxonomy.
	 * @param    string|string[]   $post_types    Post Type name.
	 * @param    string            $sing_name     Singular Label.
	 * @param    string            $plur_name     Plural Label.
	 * @param    string            $textdomain    Textdomain for label translation.
	 * @param    string|boolean    $rewrite       String to rewrite the url with. `true` uses $post_type, `false` disables rewrite. Default `true`.
	 * @param    array             $args          Additional arguments to the Post Type registration. {@see https://developer.wordpress.org/reference/functions/register_post_type/}
	 */
	public function __construct($taxonomy, $post_types, $sing_name, $plur_name, $textdomain, $rewrite = true, $args = null) {

		$labels = array(
			'name'                       => _x( $plur_name, 'taxonomy general name', $textdomain ),
			'singular_name'              => _x( $sing_name, 'taxonomy singular name', $textdomain ),
			'search_items'               => __( "Search $plur_name", $textdomain ),
			'popular_items'              => __( "Popular $plur_name", $textdomain ),
			'all_items'                  => __( "All $plur_name", $textdomain ),
			'parent_item'                => __( "Parent $sing_name", $textdomain ),
			'parent_item_colon'          => __( "Parent $sing_name:", $textdomain ),
			'edit_item'                  => __( "Edit $sing_name", $textdomain ),
			'update_item'                => __( "Update $sing_name", $textdomain ),
			'add_new_item'               => __( "Add New $sing_name", $textdomain ),
			'new_item_name'              => __( "New $sing_name Name", $textdomain ),
			'separate_items_with_commas' => __( "Separate $plur_name with commas", $textdomain ),
			'add_or_remove_items'        => __( "Add or remove $plur_name", $textdomain ),
			'choose_from_most_used'      => __( "Choose from the most used $plur_name", $textdomain ),
			'not_found'                  => __( "No $plur_name found.", $textdomain ),
			'view_item'                  => __( "View $sing_name", $textdomain ),
		);

		$defaults = array(
			'public'            => true,
			'hierarchical'      => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'labels'            => array(),
			'rewrite'            => is_string($rewrite) ? array( 'slug' => $rewrite ) : $rewrite,
		);

		$args = wp_parse_args($args, $defaults);
		$args['labels'] = wp_parse_args($args['labels'], $labels);

		$this->taxonomy = $taxonomy;
		$this->post_types = (array) $post_types;
		$this->sing_name = $sing_name;
		$this->plur_name = $plur_name;
		$this->rewrite = $rewrite;
		$this->args = $args;
	}

	/**
	 * Register the Taxonomy.
	 *
	 * @since    1.0.0
	 */
	public function register() {
		register_taxonomy($this->taxonomy, $this->post_types, $this->args);
	}

	/**
	 * Get an array with properties of the Taxonomy Definition.
	 * @return    array {
	 *     @type    string         $taxonomy     Key string to register the Taxonomy.
	 *     @type    string[]       $post_types   Post Types this taxonomy is associated with.
	 *     @type    string         $sing_name    Singular label name for the Post Type.
	 *     @type    string         $plur_name    Plural label name for the Post Type.
	 *     @type    bool|string    $rewrite      String with which URLs for this Post Type are rewriten. `true` means 'post_type' is used. `false` means there's no rewriting.
	 *     @type    array          $args         Arguments to register the Post Type ({@see https://developer.wordpress.org/reference/functions/register_taxonomy/}).
	 * }
	 */
	public function get_props() {
		return array(
			'taxonomy' => $this->taxonomy,
			'post_types' => $this->post_types,
			'sing_name' => $this->sing_name,
			'plur_name' => $this->plur_name,
			'rewrite'   => $this->rewrite,
			'args'      => $this->args,
		);
	}
}
