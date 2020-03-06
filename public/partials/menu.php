<?php
global $wp;
$is_archive_page = is_post_type_archive( 'gendernaut_archive');
$archive_active = (is_tax( 'gendernaut_tax' ) || $is_archive_page?' active ':'');
$is_collections_page = ( home_url( $wp->request ) == site_url('collections') );
$collection_active = (is_tax( 'gendernaut_col' ) || $is_collections_page?' active ':'');

?>
<a class="<?php echo gendernaut()->subclass('item') . $archive_active; ?>" href="<?php echo get_post_type_archive_link('gendernaut_archive'); ?>"><?php echo __("Arxiva", gendernaut()->get_plugin_name()); ?></a>
<a class="<?php echo gendernaut()->subclass('item') . $collection_active; ?>" href="<?php echo site_url('collections'); ?>"><?php echo __("Col·leccions", gendernaut()->get_plugin_name()); ?></a>
<a class="<?php echo gendernaut()->subclass('item'); ?>" href="<?php echo get_post_type_archive_link('gendernaut_biblio'); ?>"><?php echo __("Fonts", gendernaut()->get_plugin_name()); ?></a>
