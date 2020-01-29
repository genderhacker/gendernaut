<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/public
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Public {

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
	 * Gendernaut_Renderer instance to render contents.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      Gendernaut_Renderer    $renderer    Gendernaut_Renderer instance.
	 */
	private $renderer;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param    string                 $plugin_name    The name of the plugin.
	 * @param    string                 $version        The version of this plugin.
	 * @param    Gendernaut_Renderer    $renderer       Instance used to render contents.
	 */
	public function __construct( $plugin_name, $version, $renderer ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		$this->renderer = $renderer;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
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

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/gendernaut-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
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

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/gendernaut-public.js', array( 'jquery' ), $this->version, false );

	}

	/**
	 * Set the appropiate template for an archive page.
	 *
	 * Hook to 'template_include' filter.
	 * If archive uses Gendernaut Archive, use the Page template and set the archive as its content in a fake query.
	 *
	 * @since     1.0.0
	 * @param     string    $template    Template file to filter.
	 * @return    string                 Template file to finally use.
	 */
	public function filter_archive_template( $template ) {
		if ( ( is_archive() || is_home() ) && gendernaut()->uses_gendernaut( get_post_type() ) ) {
			$this->build_custom_query();
			return get_page_template();
		}
		return $template;
	}

	/**
	 * Render the archive content.
	 *
	 * @since     1.0.0
	 * @return    string    Archive content.
	 */
	public function archive_content() {
		ob_start();
		$this->renderer->archive();
		return ob_get_clean();
	}

	/**
	 * Replace Main query with a fake one.
	 *
	 * New query contains a fake page with the archive as its content.
	 *
	 * @since     1.0.0
	 * @access    private
	 */
	private function build_custom_query() {
		global $wp_query, $wp;

		$page = $this->make_fake_page( get_the_archive_title(), $this->archive_content() );
		$wp_query = $this->make_fake_page_query($page);

		$this->bypass_the_content_filters($page->ID);

		$GLOBALS['wp_query'] = $wp_query;
		$wp->register_globals();
	}

	/**
	 * Create a fake WP_Post for a page.
	 *
	 * @since     1.0.0
	 * @param     string    $title      Page Title.
	 * @param     string    $content    Page Content.
	 * @param     int       $post_id    Page ID. Make it negative to avoid colliding with a real page. Default -1.
	 * @return    WP_Post               Fake Page.
	 * @access    private
	 */
	private function make_fake_page($title, $content, $post_id = null) {
		static $default_id = -1;

		if ( $post_id === null ) {
			$post_id = $default_id;
			$default_id--;
		}

		$page = new WP_Post( (object) array(
			'ID' => $post_id,
			'post_title' => $title,
			'post_content' => $content,
			'post_type' => 'page',
			'comment_status' => 'closed',
			'ping_status' => 'closed',
			'filter' => 'raw',
		) );
		wp_cache_add( $post_id, $page, 'posts' );

		return $page;
	}

	/**
	 * Construct a fake WP_Query from a page WP_Post.
	 *
	 * @since    1.0.0
	 * @param  WP_Post    $page    WP_Post object for a page.
	 * @return WP_Query            Fake WP_Query.
	 */
	private function make_fake_page_query( $page ) {
		$query = new WP_Query();
		$query->post = $page;
		$query->posts = array( $page );
		$query->queried_object = $page;
		$query->queried_object_id = $page->ID;
		$query->found_posts = 1;
		$query->post_count = 1;
		$query->max_num_pages = 1;
		$query->is_page = true;
		$query->is_singular = true;
		$query->is_single = false;
		$query->is_attachment = false;
		$query->is_archive = false;
		$query->is_category = false;
		$query->is_tag = false;
		$query->is_tax = false;
		$query->is_author = false;
		$query->is_date = false;
		$query->is_year = false;
		$query->is_month = false;
		$query->is_day = false;
		$query->is_time = false;
		$query->is_search = false;
		$query->is_feed = false;
		$query->is_comment_feed = false;
		$query->is_trackback = false;
		$query->is_home = false;
		$query->is_embed = false;
		$query->is_404 = false;
		$query->is_paged = false;
		$query->is_admin = false;
		$query->is_preview = false;
		$query->is_robots = false;
		$query->is_posts_page = false;
		$query->is_post_type_archive = false;

		return $query;
	}

	/**
	 * Bypass 'the_content' filters for a post id or list of post ids.
	 *
	 * @since     1.0.0
	 * @param     int|int[]    $post_id    Post id or list of post ids
	 * @access    private
	 */
	private function bypass_the_content_filters($post_id) {
		global $wp_filter;

		$hook = $wp_filter['the_content'];

		$callback = function($content) use ($post_id, $hook){
			if ( in_array( get_the_ID(), (array) $post_id ) ) {
				$callbacks = $hook->callbacks;
				$hook->remove_all_filters();
				$hook->callbacks = $callbacks;
			}
			return $content;
		};

		add_filter('the_content', $callback, 0);
	}
}
