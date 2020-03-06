<article <?php gendernaut()->item_class('js-gendernaut-item'); gendernaut()->item_atts(); ?>>
    <div class="<?php echo gendernaut()->subclass('content'); ?>">
        <a class="<?php echo gendernaut()->subclass('link'); ?>" href="<?php the_permalink(); ?>">
            <div class="<?php echo gendernaut()->subclass('thumb'); ?>">
                <?php the_post_thumbnail( 'gendernaut-thumbnail', array( 'class' => gendernaut()->subclass('thumb-img') ) ); ?>
            </div>
            <h3 class="<?php echo gendernaut()->subclass('title'); ?>"><?php the_title(); ?></h3>
        </a>
    </div>
    <div class="<?php echo gendernaut()->subclass('types'); ?>">
        <?php

        $tax_terms = gendernaut()->renderer->get_object_taxonomy_terms( null, 'gendernaut_tax', 'id=>name' );
        foreach ($tax_terms as $taxonomy => $terms ) {
            if ( $terms ) {
                foreach ( $terms as $id => $name ) {
                    ?>
                    <div title="<?php echo htmlspecialchars($name); ?>" class="<?php
                    echo gendernaut()->subclass('type') . " " . gendernaut()->term_color_class($id);
                    ?>"></div>
                    <?php
                }
            }
        }
        ?>
    </div>

</article>
