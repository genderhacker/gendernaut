<?php
global $wp;

// Is the plugin custom post type created?
$create_post_type = gendernaut()->get_option('create_post_type', 'gendernaut_post_type');
// Does the plugin custom post type use the plugin archive?
$post_type_uses_gendernaut = gendernaut()->get_post_type_option('use_gendernaut', 'gendernaut_archive');
// The collection entry is only shown if the custom post type is created and uses the plugin
$show_collections = ($create_post_type === 'on') && ($post_type_uses_gendernaut === 'on');

$show_sources = gendernaut()->get_option('create_post_type', 'gendernaut_sources_post_type');

// Check which section is active
$is_archive_page = is_post_type_archive( 'gendernaut_archive');
$archive_active = (is_tax( 'gendernaut_tax' ) || $is_archive_page?' active ':'');
$is_collections_page = ( home_url( $wp->request ) == site_url('collections') );
$collection_active = (is_tax( 'gendernaut_col' ) || $is_collections_page?' active ':'');
$is_fonts_page = is_post_type_archive( 'gendernaut_biblio');
$fonts_active = (is_tax( 'gendernaut_biblio_type' ) || $is_fonts_page?' active ':'');

?>
<?php if ($show_sources || $show_collections) { ?>
<a class="<?php echo gendernaut()->subclass('item') . $archive_active; ?>" href="<?php echo get_post_type_archive_link('gendernaut_archive'); ?>"><?php echo __("Arxiva", gendernaut()->get_plugin_name()); ?></a>
<?php } ?>
<?php if ($show_collections) { ?>
<a class="<?php echo gendernaut()->subclass('item') . $collection_active; ?>" href="<?php echo site_url('collections'); ?>"><?php echo __("Col·leccions", gendernaut()->get_plugin_name()); ?></a>
<?php } ?>
<?php if ($show_sources) { ?>
<a class="<?php echo gendernaut()->subclass('item') . $fonts_active; ?>" href="<?php echo get_post_type_archive_link('gendernaut_biblio'); ?>"><?php echo __("Fonts", gendernaut()->get_plugin_name()); ?></a>
<?php } ?>
