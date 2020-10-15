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
	    <?php include( 'item-terms.php' ); ?>
    </div>

</article>
