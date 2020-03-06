<?php

/**
 * Define a class for managing Collections.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * Manages a Collection
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Collection_Manager {

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
	 * Load the required dependencies.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class for managing a Collection.
		 */
		/** @noinspection PhpIncludeInspection */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-gendernaut-collection.php';
	}

	/**
	 * Load a collection
	 */
	public function load_collection() {
		if (! array_key_exists('id', $_GET) ) {
			die ( 'No ID!');
		}

		$id = intval( $_GET['id'] );

		$collection = Gendernaut_Collection::get_from_id('gendernaut_col', $id, $this->textdomain);
		$collection->return_json();
	}

	/**
	 * Save a collection from post data
	 *
	 */
	public function save_collection() {
		$nonce = sanitize_text_field( $_POST['_wpnonce'] );

		if ( ! wp_verify_nonce( $nonce, 'collection_save' ) ) {
			die ( 'Busted!');
		}

		$taxonomy = 'gendernaut_col';
		$title = sanitize_text_field( $_POST['title'] );
		$description = sanitize_text_field( $_POST['description'] );
		$id = -1;
		if (array_key_exists('id', $_POST) ) {
			$id = intval( $_POST['id'] );
		}
		$posts = json_decode( $_POST['posts'] );
		$code = sanitize_text_field( $_POST['code'] );

		$collection = new Gendernaut_Collection($taxonomy, $id, $code, false, $title, $description, $posts, $this->textdomain);
		if ($collection->exists() && $collection->code_is_valid()) {
			$collection->update();
		} else {
			$collection->create();
		}
	}

	public function collection_columns( $columns ) {
		$columns['public'] = __("Pública", $this->textdomain);
		return $columns;
	}

	public function collection_column_content( $content, $column_name, $term_id ) {
		switch ($column_name) {
			case 'public':
				$coll_public = get_term_meta( $term_id, "g_col_public", true );
				$content = ($coll_public?__("Sí", $this->textdomain):__("No", $this->textdomain));
				break;
			default:
				break;
		}
		return $content;
	}
}
