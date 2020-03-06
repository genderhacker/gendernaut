<?php gendernaut()->menu(); ?>
<div class="js-gendernaut-views-group">
	<?php

    if (is_tax( 'gendernaut_col' )) {
    	// TODO: crear una Collection
	    $collection = Gendernaut_Collection::get_from_id( 'gendernaut_col', get_queried_object_id(), gendernaut()->get_plugin_name() );


        $edit_mode = false;
        $user_code = get_query_var( 'code' );
        if (! empty($code) && ($collection->code === $user_code)) {
	        $edit_mode = true;
        }

        if (! $collection->public && ! $edit_mode && ! is_admin()) {
            echo "<br /><em>" . __("Aquesta col·lecció encara no ha estar aprovada i no es pública. Si tens la URL d'edició sí que pots veure-la i editar-la.") . "</em>";
            return;
        }

	    ?>
	    <h3><?php echo $collection->title; ?></h3>
	    <p><?php echo $collection->description; ?></p>
	    <p class="<?php echo gendernaut()->subclass('collection_edit_link'); ?>" data-collection_id="<?php echo get_queried_object_id(); ?>">
            <a href="<?php echo get_post_type_archive_link('gendernaut_archive'); ?>">
                <?php echo __("Editar", gendernaut()->get_plugin_name()) . ' ' . gendernaut()->renderer->get_icon("edit") ?>
            </a>
        </p>
	    <?php
        if ($edit_mode) {
            ?>
            <script type="application/javascript">
                const gendernaut_collection = {"id": <?php echo get_queried_object_id(); ?>, "code": "<?php echo $collection->code; ?>"};
                const gendernaut_collection_edit_url = "<?php echo get_post_type_archive_link('gendernaut_archive'); ?>";
            </script>
            <?php
        }
    } else if (get_post_type() === 'gendernaut_archive') {
	    gendernaut()->collections_overlay();
    }

	gendernaut()->view_selector();

	gendernaut()->filters();
	?>
	<div class="<?php echo gendernaut()->subclass('views'); ?>">
		<?php gendernaut()->views(); ?>
	</div>
</div>
