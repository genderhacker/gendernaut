<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://tallerestampa.com
 * @since      1.0.0
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Gendernaut
 * @subpackage Gendernaut/includes
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_i18n {

	/**
	 * List of textdomains to load.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array    $textdomains    List of textdomains to load.
	 */
	private $textdomains = array();

	/**
	 * Add a textdomain to this instance.
	 *
	 * @since    1.0.0
	 * @param    string    $textdomain    A textdomain to load.
	 */
	public function add_textdomain($textdomain) {
		$this->textdomains[] = $textdomain;
	}

	/**
	 * Load registered text domains for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_textdomains() {

		foreach ($this->textdomains as $textdomain) {
			load_plugin_textdomain(
				$textdomain,
				false,
				dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
			);
		}

	}



}
