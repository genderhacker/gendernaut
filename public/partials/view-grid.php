<?php if ( have_posts() ) : ?>
	<?php gendernaut()->filters(); ?>
	<div class="<?php echo gendernaut()->subclass('items'); ?> js-gendernaut-grid">
		<?php
		while ( have_posts() ) : the_post();
			gendernaut()->item();
		endwhile;
		?>
	</div>
<?php endif; ?>
