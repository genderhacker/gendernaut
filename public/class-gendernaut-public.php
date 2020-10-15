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
		wp_localize_script( $this->plugin_name, 'gendernaut_vars', array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
            'unsaved_message' => __('Hi ha canvis sense guardar, estàs segura que vols sortir del mode d\'edició?', $this->plugin_name),
            'collection_url_message' => __('Guarda la direcció per poder editar-la en el futur.', $this->plugin_name),
		) );
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
		global $wp_query;

		$post_type = $wp_query->get('post_type');
		$uses_gendernaut = false;

		if ( empty( $post_type ) && is_tax() ) {
			$term = get_queried_object();
			$taxonomy = get_taxonomy( $term->taxonomy );
			$post_types = $taxonomy->object_type;

			foreach ($post_types as $post_type) {
				if ( gendernaut()->uses_gendernaut( $post_type ) ) {
					$uses_gendernaut = true;
					break;
				}
			}
		}
		else {
			$uses_gendernaut = ( is_archive() || is_home() ) && gendernaut()->uses_gendernaut( $post_type );
		}

		if ( $uses_gendernaut ) {
			$this->build_custom_query();
			return get_page_template();
		}
		return $template;
	}

	/**
	 * Set the appropiate template for the custom post type based on the plugin settings.
	 *
	 * Hook to 'template_include' filter.
	 *
	 * @since     1.0.0
	 * @param     string    $template    Template file to filter.
	 * @return    string                 Template file to finally use.
	 */
	public function filter_post_template( $template ) {
		if ( is_singular( 'gendernaut_archive' ) ) {
			$template_option = gendernaut()->get_option('template', 'gendernaut_post_type');
			if (! empty($template_option) && ($template_option !== 'default') && (file_exists($template_option))) {
				return $template_option;
			} else {
				return $template;
			}
		} else {
			return $template;
		}

	}

	/**
	 * Modify main query to sort by year
	 *
	 * Hook to 'pre_get_posts' action.
	 * If archive uses Gendernaut Archive, use the Page template and set the archive as its content in a fake query.
	 *
	 * @since     1.0.0
	 * @param     object    $query       The main WP_Query object
	 */
	public function modify_main_query( $query ) {
		// TODO: no carregar tots els items (o sí)
		if (is_admin()) return;

		$post_type = $query->get('post_type');
		if ( ( is_archive() || is_home() ) && gendernaut()->uses_gendernaut( $post_type ) ) {

			$order_options = gendernaut()->get_sort_options($post_type);

			if ( gendernaut()->is_native_order( $order_options['orderby'] ) ) {
				foreach ($order_options as $key => $value) {
					$query->set( $key, $value );
				}
			}

			$query->set( 'posts_per_page', -1 );
		}
	}

	/**
	 * Reorder posts if they should be in a non native ordering.
	 *
	 * Hook to 'the_posts' filter.
	 * If archive uses Gendernaut Archive and a non native ordering is set reorder the posts array.
	 *
	 * @since     1.0.0
	 * @param     object    $posts       The main WP_Query object
	 *
	 */
	public function reorder_posts($posts, $query) {
		if (is_admin()) return $posts;

		$post_type = $query->get('post_type');

		if ( ( $query->is_archive() || $query->is_home() ) && gendernaut()->uses_gendernaut( $post_type ) ) {

			$order_options = gendernaut()->get_sort_options($post_type);
			$orderby = $order_options['orderby'];
			if ( ! gendernaut()->is_native_order( $orderby ) && in_array( $orderby, get_object_taxonomies($post_type) ) ) {

				$terms = get_terms( array('taxonomy' => $orderby) );

				$terms_index = array();

				foreach ($terms as $key => $term) {
					$terms_index[ $term->term_id ] = $key;
				}

				$lower_val = $order_options['order'] === 'ASC' ? -1 : 1;
				$higher_val = $lower_val * -1;

				usort($posts, function($a, $b) use ($orderby, $terms_index, $lower_val, $higher_val){
					$a_terms = get_the_terms($a, $orderby);
					$b_terms = get_the_terms($b, $orderby);

					$a_length = $a_terms ? count($a_terms) : 0;
					$b_length = $b_terms ? count($b_terms) : 0;

					for ($i=0; $i < min($a_length, $b_length); $i++) {
						$a_term = $a_terms[$i];
						$b_term = $b_terms[$i];

						if ( $a_term->term_id === $b_term->term_id ){
							continue;
						}
						else {
							return ($terms_index[ $a_term->term_id ] < $terms_index[ $b_term->term_id ]) ? $lower_val : $higher_val;
						}
					}

					if ($a_length === $b_length){
						return 0;
					}
					else {
						return ($a_length < $b_length) ? $lower_val : $higher_val;
					}
				});
			}
		}

		return $posts;
	}

	/**
	 * Filter Titles in Archive
	 *
	 * Hook to 'the_title' filter.
	 * Use a custom field for titles in the archive if there's one defined.
	 *
	 * @since     1.0.0
	 * @param     string    $title       The post title
	 * @param     int       $post_id     The post ID
	 */
	public function filter_title( $title, $post_id ) {

		$post_type = get_post_type($post_id);
		if ( ( is_archive() || is_home() ) && gendernaut()->uses_gendernaut( $post_type ) ) {
			$custom_field = gendernaut()->get_post_type_option('custom_title_field', $post_type);

			if ( $custom_field ) {
				$custom_title = get_post_meta($post_id, $custom_field, true);
				if ($custom_title) {
					return $custom_title;
				}
			}
		}

		return $title;
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
     * Render the collections content.
     *
     * @since     1.0.0
     * @return    string    Collections content.
     */
    public function collections_content() {
        ob_start();
        $this->renderer->collections();
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
     * @param     string    $url        Page URL.
	 * @return    WP_Post               Fake Page.
	 * @access    private
	 */
	private function make_fake_page($title, $content, $post_id = null, $url = '') {
		static $default_id = -1;

		if ( $post_id === null ) {
			$post_id = $default_id;
			$default_id--;
		}

		$page = new WP_Post( (object) array(
			'ID' => $post_id,
			'post_name' => $url,
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

	/**
	 * Show archive post metadata
	 *
	 * @since 1.0.0
	 * @param $content The post content
	 * @return string The modified post content
	 * @access public
	 */
	public function show_archive_metadata($content) {
		if ( is_single() && in_the_loop() && is_main_query() && gendernaut()->uses_gendernaut( get_post_type() )) {
			return $content . $this->renderer->item_meta();
		}

		return $content;
	}

	// A partir d'aquí sense comentar
    // TODO: comentar

    /**
     * Create a fake page called "collections"
     *
     * $fake_slug can be modified to match whatever string is required
     *
     *
     * @param   object  $posts  Original posts object
     * @global  object  $wp     The main WordPress object
     * @global  object  $wp     The main WordPress query object
     * @return  object  $posts  Modified posts object
     */
    public function add_fake_collections_page($posts) {
        global $wp;
        global $wp_query;

        $url_slug = 'collections';
        if ( ! defined( 'FAKE_PAGE' ) && ( strtolower( $wp->request ) == $url_slug ) ) {
            // stop interferring with other $posts arrays on this page (only works if the sidebar is rendered *after* the main page)
            define( 'FAKE_PAGE', true );

            $content = $this->collections_content();
            $page = $this->make_fake_page("Collections", $content, -1, 'collections');
	        $this->bypass_the_content_filters($page->ID);
            $posts[] = $page;

            $wp_query->set( 'collections', true);

            unset( $wp_query->query[ 'error' ] );
            $wp_query->query_vars[ 'error' ] = '';
            $wp_query->is_404 = false;
            $wp_query->is_page = true;
	        $wp_query->is_single = false;
        }

        return $posts;
    }

    function add_edit_collection_rewrite() {
        add_rewrite_rule(
            '^collection/(.*)/edit/(.*)/?$',
            'index.php?gendernaut_col=$matches[1]&code=$matches[2]',
            'top'
        );
    }

    function add_edit_collection_var( $vars ) {
        $vars[] = 'code';
        return $vars;
    }

	function add_related_posts_after_post_content( $content ) {
    	if (shortcode_exists( 'related_posts_by_tax' )) {
		    //check if it's a single post page.
		    if ( is_single() ) {

			    // check if we're inside the main loop
			    if ( in_the_loop() && is_main_query() ) {

				    // add your own attributes here (between the brackets [ ... ])
				    $shortcode = '[related_posts_by_tax posts_per_page="4" post_types="gendernaut_archive" taxonomies="gendernaut_tax, gendernaut_col" title="' . __("Entrades relacionades", gendernaut()->get_plugin_name()) . '"]';

				    // add the shortcode after the content
				    $content = $content . $shortcode;
			    }
		    }
	    }

		return $content;
	}
}
