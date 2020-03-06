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
 * Manages a Taxonomy Field Definition.
 *
 * @package    Gendernaut
 * @subpackage Gendernaut/admin
 * @author     Taller Estampa <estampa@tallerestampa.com>
 */
class Gendernaut_Taxonomy_Field_Def {

	/**
	 * Key of the Taxonomy.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $taxonomy    Key string to register the Post Type.
	 */
	private $taxonomy;

	/**
	 * Field key.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $field_key    Field key.
	 */
	private $field_key;

	/**
	 * Field name.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $field_key    Field name.
	 */
	private $field_name;

	/**
	 * Field description.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $field_desc    Field description.
	 */
	private $field_desc;

	/**
	 * Editable.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      boolean    $readonly    Is the field editable?
	 */
	private $readonly;

	/**
	 * Checkbox.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      boolean    $editable    Is the field a checkbox?
	 */
	private $checkbox;

	/**
	 * Text domain to use for string translation.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $textdomain    Text domain to use for string translation.
	 */
	private $textdomain;

	/**
	 * Populate the instance with options to register a field for a Taxonomy.
	 *
	 * @param    string            $taxonomy     Taxonomy.
	 * @param    string            $field_key    Field key.
	 * @param    string            $field_name   Field name.
	 * @param    string            $field_desc   Field description.
	 * @param    boolean           $readonly     Read only.
	 * @param    boolean           $checkbox     Is the field a checkbox?
	 * @param    string            $textdomain   Text domain.
	 *
	 *@since    1.0.0
	 */
	public function __construct($taxonomy, $field_key, $field_name, $field_desc, $readonly, $checkbox, $textdomain) {
		$this->taxonomy   = $taxonomy;
		$this->field_key  = $field_key;
		$this->field_name = $field_name;
		$this->field_desc = $field_desc;
		$this->readonly   = $readonly;
		$this->checkbox   = $checkbox;
		$this->textdomain = $textdomain;
	}

	/**
	 * Register the Taxonomy Field.
	 *
	 * @since    1.0.0
	 */
	public function register() {
		register_term_meta( $this->taxonomy, $this->field_key, array('single' => true) );

	    # TODO: usar el loader?
		add_action( "{$this->taxonomy}_add_form_fields", array( $this, "taxonomy_add_field" ), 10, 2 );
		add_action( "{$this->taxonomy}_edit_form_fields", array( $this, "category_edit_field"), 10 );
		add_action( "edited_{$this->taxonomy}", array( $this, "category_save_field" ) );
		add_action( "create_{$this->taxonomy}", array( $this, "category_save_field" ) );
	}

	/**
	 * Adding Field
	 * @return void
	 */
	function taxonomy_add_field( $taxonomy ) {
        if (! $this->readonly) {
	        ?>
	        <div class="form-field term-group">
		        <label for="<?php echo $this->field_key; ?>"><?php echo $this->field_name; ?></label>
		        <?php if ( $this->checkbox ) { ?>
			        <input type="checkbox" name="<?php echo $this->field_key; ?>" id="<?php echo $this->field_key; ?>"
			               value="No">
		        <?php } else { ?>
			        <input type="text" name="<?php echo $this->field_key; ?>" id="<?php echo $this->field_key; ?>"
			               value="">
		        <?php } ?>
		        <p><?php echo $this->field_desc; ?></p>
	        </div>
	        <?php
        }
	}

	/**
	 * Edit Field
	 * @param WP_Term $term The term
	 * @return void
	 */
	function category_edit_field( $term ) {
		$readonly = "";
		if ($this->readonly) {
			$readonly = ' readonly="readonly" ';
		}

		$term_field = get_term_meta( $term->term_id, $this->field_key, true );
		?>
		<tr class="form-field term-group-wrap">
			<th><label for="<?php echo $this->field_key; ?>>"><?php echo $this->field_name; ?></label></th>
			<td>
				<?php if ($this->checkbox) {?>
					<input type="checkbox" name="<?php echo $this->field_key; ?>" id="<?php echo $this->field_key; ?>" <?php checked($term_field); ?> <?php echo $readonly; ?>>
				<?php } else { ?>
					<input type="text" name="<?php echo $this->field_key; ?>" id="<?php echo $this->field_key; ?>" value="<?php echo esc_attr( $term_field ) ? esc_attr( $term_field ) : ''; ?>" <?php echo $readonly; ?>>
				<?php } ?>
                <p class="description"><?php echo $this->field_desc; ?></p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Saving Field
	 */
	function category_save_field( $term_id ) {

		if ( isset( $_POST[$this->field_key] ) ) {
			if ($this->checkbox) {
				$term_field = true;
			} else {
				$term_field = sanitize_text_field( $_POST[ $this->field_key ] );
			}
			if( $term_field ) {
				update_term_meta( $term_id, $this->field_key, $term_field );
			}
		} else if ($this->checkbox && ! wp_doing_ajax()) { // FIXME: això és una xapuza per que public no passi a fals al guardar des de JS ja que aquest codi es crida quan ho fem !!!
			update_term_meta( $term_id, $this->field_key, false );
		}

	}
}
