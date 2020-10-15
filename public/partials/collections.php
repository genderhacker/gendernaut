<?php gendernaut()->menu(); ?>

<?php
$terms = get_terms( array(
	'taxonomy' => 'gendernaut_col',
	'hide_empty' => true,
	'meta_key' => 'g_col_public',
    'meta_value' => true
) );
?>

<!--<h2>--><?php //echo __("Colecciones", gendernaut()->get_plugin_name()); ?><!--</h2>-->
<a id="<?php echo gendernaut()->subclass('collection_create'); ?>" href="#"><?php echo __("Crear una nova col·lecció", gendernaut()->get_plugin_name()); ?></a>
<div id="<?php echo gendernaut()->subclass('collection_create_info'); ?>">
    <div id="<?php echo gendernaut()->subclass('collection_create_info__inner'); ?>">
        <div class="<?php echo gendernaut()->subclass('info-text'); ?>">
            <p><?php echo __("Aquest lloc permet crear col·leccions a les usuàries a partir dels continguts existents." , gendernaut()->get_plugin_name()); ?></p>
            <p><?php echo __("Per fer-ho clica al botó de crear i se t'obrirà l'arxiu en mode d'edició. Allà hauràs d'escriure un títol i una descripció i afegir els continguts que vulguis que formin part d'ella mitjançant les icones de + i -." , gendernaut()->get_plugin_name()); ?></p>
            <p><?php echo __("Quan guardis la col·lecció se't mostrarà una URL que hauràs de guardar ja que et permetrà editar la col·lecció en el futur." , gendernaut()->get_plugin_name()); ?></p>
            <p><?php echo __("La col·lecció no es farà pública automàticament, previament haurà de ser aprovada.", gendernaut()->get_plugin_name()); ?></p>
        </div>
        <div class="<?php echo gendernaut()->subclass('info-options'); ?> gendernaut-text-right">
			<a id="<?php echo gendernaut()->subclass('collection_create_cancel'); ?>" class="<?php echo gendernaut()->subclass('info-option', 'cancel'); ?>" href="#"><?php echo __("Cancel·lar", gendernaut()->get_plugin_name()); ?></a>
			<a id="<?php echo gendernaut()->subclass('collection_create_create'); ?>" class="<?php echo gendernaut()->subclass('info-option', 'create'); ?>" href="<?php echo get_post_type_archive_link('gendernaut_archive'); ?>"><?php echo __("Crear", gendernaut()->get_plugin_name()); ?></a>
		</div>
	</div>
</div>
<ul>
<?php
    if (! empty($terms)) {
        foreach ( $terms as $term ) {
            ?>
            <h3><a href="<?php echo esc_attr(get_term_link($term->term_id, 'gendernaut_col')) ?>"><?php echo $term->name ?></a></h3>
            <p><?php echo $term->description ?></p>
            <?php
    //		print_r($term);
        }
    } else {
	    echo __("No hi ha cap col·lecció", gendernaut()->get_plugin_name());
    }
?>
</ul>
<?php
