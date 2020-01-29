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
 * Manages a Post Type Definition.
 *
 * Holds Variables to define a new Post Type, applying some defaults.
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Post_Type_Def {

	/**
	 * Key to register the Post Type.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $post_type    Key string to register the Post Type.
	 */
	private $post_type;

	/**
	 * Singular label.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $sing_name    Singular label name for the Post Type.
	 */
	private $sing_name;

	/**
	 * Plural label.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plur_name    Plural label name for the Post Type.
	 */
	private $plur_name;

	/**
	 * Whether to rewrite URL's for this Post Type.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      bool|string    $rewrite    String to rewrite the URL with, or `true` to use {@see $post_type}. `false` disables rewriting.
	 */
	private $rewrite;

	/**
	 * Slug for the archive page for this Post Type.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      bool|string    $archive    Slug for the archive page. `false` if there's no archive page.
	 */
	private $archive;

	/**
	 * All the arguments for registering the Post Type.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array    $args    Arguments: {@see https://developer.wordpress.org/reference/functions/register_post_type/}.
	 * @see      https://developer.wordpress.org/reference/functions/register_post_type/
	 */
	private $args;

	/**
	 * Populate the instance with options to register a Post Type.
	 *
	 * @since    1.0.0
	 * @param    string            $post_type     Post Type name.
	 * @param    string            $sing_name     Singular Label.
	 * @param    string            $plur_name     Plural Label.
	 * @param    string            $textdomain    Textdomain for label translation.
	 * @param    string|boolean    $rewrite       String to rewrite the url with. `true` uses $post_type, `false` disables rewrite. Default `true`.
	 * @param    array             $args          Additional arguments to the Post Type registration. {@see https://developer.wordpress.org/reference/functions/register_post_type/}
	 */
	public function __construct($post_type, $sing_name, $plur_name, $textdomain, $rewrite = true, $args = null) {

		$labels = array(
			'name'                  => _x( $plur_name, 'post type general name', $textdomain ),
			'singular_name'         => _x( $sing_name, 'post type singular name', $textdomain ),
			'add_new'               => _x( "Add New", $sing_name, $textdomain ),
			'add_new_item'          => __( "Add New $sing_name", $textdomain ),
			'new_item'              => __( "New $sing_name", $textdomain ),
			'edit_item'             => __( "Edit $sing_name", $textdomain ),
			'view_item'             => __( "View $sing_name", $textdomain ),
			'view_items'            => __( "View $plur_name", $textdomain ),
			'all_items'             => __( "All $plur_name", $textdomain ),
			'search_items'          => __( "Search $plur_name", $textdomain ),
			'parent_item_colon'     => __( "Parent $sing_name:", $textdomain ),
			'not_found'             => __( "No $plur_name found.", $textdomain ),
			'not_found_in_trash'    => __( "No $plur_name found in Trash.", $textdomain ),
			'archives'              => __( "$sing_name Archives", $textdomain ),
			'attributes'            => __( "$sing_name Attributes", $textdomain ),
			'insert_into_item'      => __( "Insert into content", $textdomain ),
			'uploaded_to_this_item' => __( "Uploaded to this $sing_name", $textdomain ),
		);

		$defaults = array(
			'public'             => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true,
			'hierarchical'       => false,
			'menu_position'      => $menu_pos,
			'supports'           => array( 'title', 'editor', 'thumbnail'),
			'single'             => true,
			'labels'             => array(),
			'rewrite'            => is_string($rewrite) ? array( 'slug' => $rewrite ) : $rewrite,
		);

		$args = wp_parse_args($args, $defaults);
		$args['labels'] = wp_parse_args($args['labels'], $labels);

		$has_archive = $args['has_archive'];
		$archive_slug = ! $has_archive ? false :
		                is_string($has_archive) ? $has_archive :
		                isset( $args['rewrite']['slug'] ) ? $args['rewrite']['slug'] :
		                $post_type;

		if ( ! $args['single'] ) {
			$args = wp_parse_args(array(
				'public' => false,
				'publicly_queryable' => true,
				'show_ui' => true,
				'exclude_from_search' => true,
				'show_in_nav_menus' => false,
				'rewrite' => false,
			), $args);

			if ( $has_archive ) {
				add_rewrite_rule( "$archive_slug/?$", array('post_type' => $post_type), 'top' );
				add_filter( 'post_type_archive_link', function($link, $pt)use($post_type, $archive_slug){return ($pt === $post_type ? home_url($archive_slug) : $link); }, 10, 2 );
			}
		}

		$this->post_type = $post_type;
		$this->sing_name = $sing_name;
		$this->plur_name = $plur_name;
		$this->rewrite = $rewrite;
		$this->archive = $archive_slug;
		$this->args = $args;
	}

	/**
	 * Register the Post Type.
	 *
	 * @since    1.0.0
	 */
	public function register() {
		register_post_type($this->post_type, $this->args);
	}

	/**
	 * Get an array with properties of the Post Type Definition.
	 * @return    array {
	 *     @type    string         $post_type    Key string to register the Post Type.
	 *     @type    string         $sing_name    Singular label name for the Post Type.
	 *     @type    string         $plur_name    Plural label name for the Post Type.
	 *     @type    bool|string    $rewrite      String with which URLs for this Post Type are rewriten. `true` means 'post_type' is used. `false` means there's no rewriting.
	 *     @type    bool|string    $archive      Slug for the archive page. `false` if there's no archive page.
	 *     @type    array          $args         Arguments to register the Post Type ({@see https://developer.wordpress.org/reference/functions/register_post_type/}).
	 * }
	 */
	public function get_props() {
		return array(
			'post_type' => $this->post_type,
			'sing_name' => $this->sing_name,
			'plur_name' => $this->plur_name,
			'rewrite'   => $this->rewrite,
			'archive'   => $this->archive,
			'args'      => $this->args,
		);
	}
}
