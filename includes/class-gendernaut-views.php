<?php

/**
 * Class to manage archive Views.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * Class to manage archive Views.
 *
 *
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Views {

	/**
	 * Default registered View names.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string[]    DEFAULT_VIEWS
	 */

	const DEFAULT_VIEWS = array(
		'grid',
		'timeline',
		'list',
		'long-list',
	);

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
	 * Stores Registered View types as array keys.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      boolean[string]    $views    Registered View types as array keys.
	 */
	private $views = array();

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

		$this->init_views();
	}

	/**
	 * Init registered Views to its default.
	 *
	 * @since 1.0.0
	 */
	public function init_views() {
		return $this->views = array_fill_keys(self::DEFAULT_VIEWS, true);
	}

	/**
	 * Register a View type.
	 *
	 * @since 1.0.0
	 * @param    string    $view    View name.
	 */
	public function register_view($view) {
		$this->views[$view] = true;
	}

	/**
	 * Deregister a View type.
	 *
	 * @since 1.0.0
	 * @param    string    $view    View name.
	 */
	public function deregister_view($view) {
		unset($this->views[$view]);
	}

	/**
	 * Retrieve the list of registered Views.
	 *
	 * @since 1.0.0
	 * @return    string[]    Array of View names.
	 */
	public function get_views() {
		return array_keys($this->views);
	}

	/**
	 * Check if a view is registered.
	 *
	 * @since 1.0.0
	 * @return    boolean
	 */
	public function is_registered($view) {
		return isset($this->views[$view]);
	}

	/**
	 * Check if a view is a default one.
	 *
	 * @since 1.0.0
	 * @return    boolean
	 */
	public function is_default($view) {
		return in_array($view, self::DEFAULT_VIEWS);
	}
}
