<article <?php gendernaut()->item_class();  gendernaut()->item_atts(); ?>>
	<a class="<?php echo gendernaut()->subclass('link'); ?>" href="<?php the_permalink(); ?>">
		<div class="<?php echo gendernaut()->subclass('thumb'); ?>">
			<?php the_post_thumbnail( 'gendernaut-thumbnail', array( 'class' => gendernaut()->subclass('thumb-img') ) ); ?>
		</div>
		<h3 class="<?php echo gendernaut()->subclass('title'); ?>"><?php the_title(); ?></h3>
	</a>
</article>
