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
class Gendernaut_Collection {

    /**
     * Text domain to use for string translation.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $textdomain    Text domain to use for string translation.
     */
    private $textdomain;

	/**
	 * Key to register the Taxonomy.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $taxonomy    Key string to register the Post Type.
	 */
	private $taxonomy;

	/**
	 * Title.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $title    Title of the collection.
	 */
	public $title;

	/**
	 * Description.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $description    Description of the collection.
	 */
	public $description;

	/**
	 * ID.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      integer    $id    ID of the collection.
	 */
	public $id;

    /**
     * Array of post IDs contained in the collection.
     *
     * @since    1.0.0
     * @access   public
     * @var      integer[]    $post_types    Array of post IDs contained in the collection.
     */
    public $posts;

	/**
	 * Code for editing.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $code    Code to edit a collection.
	 */
	public $code;

	/**
	 * Public.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      boolean    $public    Is the collection public?
	 */
	public $public;


    /**
	 * Populate the instance with options to register a Taxonomy.
	 *
	 * @since    1.0.0
     * @param    string            $taxonomy      Taxonomy.
     * @param    integer           $id            ID.
     * @param    string            $code          Code for editing.
     * @param    boolean           $public        Is the collection public?
	 * @param    string            $title         Title.
	 * @param    string            $description   Description.
     * @param    integer[]         $posts         Array of post IDs contained in the collection.
     * @param    string            $textdomain    Text domain to use for string translation.
	 */
	public function __construct($taxonomy, $id, $code, $public, $title, $description, $posts, $textdomain) {
		$this->taxonomy = $taxonomy;
		$this->id = $id;
		$this->code = $code;
		$this->public = $public;
		$this->title = $title;
		$this->description = $description;
		$this->posts = $posts;
		$this->textdomain = $textdomain;
	}

	/**
	 * Create a collection from wordpress
	 *
	 * @param string   $taxonomy     Taxonomy
	 * @param integer  $id           ID.
	 * @param string   $textdomain   Text domain to use for string translation.
	 *
	 * @return Gendernaut_Collection|null
	 */
	public static function get_from_id($taxonomy, $id, $textdomain) {
		$collection_term = get_term( $id, $taxonomy );
		if ( empty($collection_term) ) {
			return new Gendernaut_Collection($taxonomy, $id, "", false, "", "", [], $textdomain);
		}

		$collection_public = get_term_meta( get_queried_object_id(), "g_col_public", true );
		$collection_code = get_term_meta( get_queried_object_id(), "g_col_code", true );
		$collection_posts = Gendernaut_Collection::get_collection_posts($id);

		return new Gendernaut_Collection($taxonomy, $id, $collection_code, $collection_public, $collection_term->name, $collection_term->description, $collection_posts, $textdomain);
	}

    /**
     * Check if the taxonomy exists.
     *
     * @since    1.0.0
     */
    public function exists() {
        $collection_term = get_term( $this->id, $this->taxonomy );
        return ! empty($collection_term);
    }

    /**
     * Check if the code is valid.
     *
     * @since    1.0.0
     */
    public function code_is_valid() {
        $collection_code = get_term_meta( $this->id, 'g_col_code', true );
        return $collection_code === $this->code;
    }

    private function response($status, $message, $error = "") {
    	if ($this->id > 0) {
		    $url = get_term_link($this->id, 'gendernaut_col') . "edit/" . $this->code;
	    } else {
    		$url = "";
	    }

        print(json_encode([
            "status" => $status,
            "message" => $message,
            "error" => $error,
            "id" => $this->id,
            "code" => $this->code,
            "url" => $url,
            "title" => $this->title,
	        "description" => $this->description,
	        "posts" => $this->posts
        ]));
        die();
    }

    private function error_response($status, $message, $error) {
        $this->response($status, $message, $error->get_error_message());
    }

	private function send_email( ) {
		$email_admin = get_bloginfo('admin_email');
		$email_text = __("Títol", $this->textdomain) . ": " . $this->title . "\n" .
		              __("Descripció", $this->textdomain) . ": " . $this->description . "\n" .
		              "URL: " . esc_attr(get_term_link($this->id, 'gendernaut_col'));
		wp_mail($email_admin, __("S'ha creat una nova col·lecció", $this->textdomain), $email_text);
	}

	public function return_json() {
    	$this->response(3, __("La col·lecció s'ha carregat correctament", $this->textdomain));
	}

    /**
     * Create the taxonomy.
     *
     * @since    1.0.0
     */
    public function create() {
        $error_message = __("S'ha produït un problema creant la col·lecció", $this->textdomain);
        try {
            $term_id = wp_insert_term($this->title, $this->taxonomy, ["description" => $this->description]);
            if (is_wp_error($term_id)) {
                $this->error_response(-11, $error_message . ". " . __("Possiblement ja existeix una altra col·lecció amb aquest mateix nom. Canvia-li el nom i torna a intentar guardar-la."), $term_id);
            }
            $this->id = $term_id["term_id"];

            $this->code = md5(uniqid(rand(), true));
            $meta_id = update_term_meta( $this->id, "g_col_code", $this->code );
            if (is_wp_error($meta_id)) {
                $this->error_response(-12, $error_message, $meta_id);
            }

            foreach ( $this->posts as $post_id ) {
                $return = wp_set_object_terms( $post_id, $this->id, $this->taxonomy, true );
                if (is_wp_error($return)) {
                    $this->error_response(-13, $error_message, $return);
                }
            }

            $this->send_email();
            $this->response(1, __("La col·lecció s'ha creat correctament", $this->textdomain));
        } catch (Exception $e) {
            $this->response(-1, $error_message, $e->getMessage());
        }
    }

    /**
     * Update the taxonomy.
     *
     * @since    1.0.0
     */
    public function update() {
        $error_message = __("S'ha produït un problema modificant la col·lecció.", $this->textdomain);

        try {
            $return = wp_update_term($this->id, $this->taxonomy, [
                "name" => $this->title,
                "description" => $this->description
            ]);
            if (is_wp_error($return)) {
                $this->error_response(-21, $error_message, $return);
            }

            $curr_posts = Gendernaut_Collection::get_collection_posts($this->id);

            $new_posts = array_diff($this->posts, $curr_posts);
    //        $common_posts = array_intersect($this->posts, $curr_post_IDs);
            $old_posts = array_diff($curr_posts, $this->posts);

            foreach ($new_posts as $new_post_id) {
                $return = wp_set_object_terms( $new_post_id, [$this->id], $this->taxonomy, true );
                if (is_wp_error($return)) {
                    $this->error_response(-22, $error_message, $return);
                }
            }
            foreach ($old_posts as $old_post_id) {
                $old_post_collections = wp_get_object_terms( $old_post_id, $this->taxonomy );
                $old_post_collection_IDs = wp_list_pluck($old_post_collections, "term_id");
                $curr_collection_term_idx = array_search($this->id, $old_post_collection_IDs);
                unset($old_post_collection_IDs[$curr_collection_term_idx]);

                $return = wp_set_object_terms( $old_post_id, $old_post_collection_IDs, $this->taxonomy );
                if (is_wp_error($return)) {
                    $this->error_response(-23, $error_message, $return);
                }
            }

            $this->response(2, __("La col·lecció s'ha modificat correctament", $this->textdomain));
        } catch (Exception $e) {
            $this->response(-1, $error_message, $e->getMessage());
        }
    }

    /**
     * Returns the list of posts of the collection (term)
     * @param    integer           $collection_id            Term ID.
     * @return   array                                       Post list
     */
    public static function get_collection_posts($collection_id) {
        // TODO: fer que funcioni amb altre tipus de posts?
        $args = array(
            'post_type' => 'gendernaut_archive',
            'tax_query' => array(
                array(
                    'taxonomy' => 'gendernaut_col',
                    'field'    => 'term_id',
                    'terms'    => $collection_id,
                ),
            ),
        );
        $query = new WP_Query( $args );
        return wp_list_pluck($query->posts, "ID");
    }

}
