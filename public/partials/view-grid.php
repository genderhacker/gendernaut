<?php if ( have_posts() ) : ?>
	<div class="<?php echo gendernaut()->subclass('items'); ?> js-gendernaut-grid js-gendernaut-items">
		<?php
		while ( have_posts() ) : the_post();
			gendernaut()->item();
		endwhile;
		?>
	</div>
<?php endif; ?>
