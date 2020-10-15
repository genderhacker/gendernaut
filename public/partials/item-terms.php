<?php
$tax_terms = gendernaut()->renderer->get_object_taxonomy_terms( null, 'gendernaut_tax', 'id=>name' );
foreach ($tax_terms as $taxonomy => $terms ) {
	if ( ( $terms ) && ( ! is_wp_error($terms) ) ) {
		foreach ( $terms as $id => $name ) {
			?>
			<div title="<?php echo htmlspecialchars($name); ?>" class="<?php
			echo gendernaut()->subclass('type') . " " . gendernaut()->term_color_class($id);
			?>"></div>
			<?php
		}
	}
}