<?php
?>
<div <?php gendernaut()->section_class('gendernaut-dropdown js-gendernaut-dropdown-group open'); ?> >
    <header class="<?php echo gendernaut()->subclass('header'); ?> gendernaut-dropdown__header">
        <button class="<?php echo gendernaut()->subclass('show'); ?> gendernaut-dropdown__show js-gendernaut-dropdown-show">
            <span class="<?php echo gendernaut()->subclass('title'); ?>"><?php _e("Editar Col·lecció", gendernaut()->get_plugin_name()); ?></span>
        </button>
    </header>
    <div class="<?php echo gendernaut()->subclass('content'); ?> gendernaut-dropdown__content">
        <div class="<?php echo gendernaut()->subclass('content-inner'); ?>">
            <form>
                <input id="title" name="title" type="text" required maxlength="64" value="" placeholder="<?php echo __("Títol de la col·lecció", gendernaut()->get_plugin_name()); ?>"/>
                <textarea id="description" name="description" required placeholder="<?php echo __("Descripció de la col·lecció", gendernaut()->get_plugin_name()); ?>"></textarea>
                <input type="hidden" id="_wpnonce" name="_wpnonce" value="<?php echo wp_create_nonce( 'collection_save' ); ?>" />
            </form>
            <div class="<?php echo gendernaut()->subclass('count'); ?>">
                <?php echo __("Hi ha", gendernaut()->get_plugin_name()); ?> <span id="<?php echo gendernaut()->subclass('collection_counter'); ?>">0</span> <?php echo __("elements a la col·lecció", gendernaut()->get_plugin_name()); ?><br />
            </div>
            <div class="<?php echo gendernaut()->subclass('filter'); ?>">
                <label class="<?php echo gendernaut()->subclass('filter-label'); ?>" ><?php echo __("Mostrar només elements de la col·lecció", gendernaut()->get_plugin_name()); ?>
                <input type="checkbox" class="<?php echo gendernaut()->subclass('filter-input'); ?> js-gendernaut-collection-filter"/></label>
            </div>

            <div id="<?php echo gendernaut()->subclass('collection_status'); ?>">
                <div class="updated">
                    <?php echo __("Estat: actualitzada", gendernaut()->get_plugin_name()) . ' ' . gendernaut()->renderer->get_icon("checkmark"); ?>
                </div>
                <div class="notupdated">
                    <a id="<?php echo gendernaut()->subclass('collection_save'); ?>">
                        <?php echo __("Guardar", gendernaut()->get_plugin_name()); ?>
                        <span class="save">
                            <?php echo gendernaut()->renderer->get_icon("save"); ?>
                        </span>
                        <span class="saving">
                            <img src="<?php echo plugin_dir_url( __DIR__ ) . 'images/ajax-loader.gif' ?>">
                        </span>
                    </a>
                </div>
            </div>
            <br />
            <a id="<?php echo gendernaut()->subclass('collection_stop'); ?>" href="#"><?php echo __("Sortir del mode d'edició", gendernaut()->get_plugin_name()); ?></a>
        </div>
    </div>
</div>
