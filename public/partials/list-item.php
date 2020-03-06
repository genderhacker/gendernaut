<?php
$current_view = gendernaut()->get_current_view();
$is_long = $current_view === 'long-list';
?>
<article <?php gendernaut()->item_class('js-gendernaut-item'); gendernaut()->item_atts(); ?> >
	<?php if ( ! $is_long ) : ?>
		<a class="<?php echo gendernaut()->subclass('link', 'thumb'); ?>" href="<?php the_permalink(); ?>">
	<?php endif; ?>
		<div class="<?php echo gendernaut()->subclass('thumb'); ?>">
			<?php the_post_thumbnail( 'gendernaut-thumbnail', array( 'class' => gendernaut()->subclass('thumb-img') ) ); ?>
		</div>
	<?php if ( ! $is_long ) : ?>
		</a>
	<?php endif; ?>
	<div class="<?php echo gendernaut()->subclass('text'); ?>">
		<?php if ( ! $is_long ) : ?>
			<a class="<?php echo gendernaut()->subclass('link', 'title'); ?>" href="<?php the_permalink(); ?>">
		<?php endif; ?>
			<h3 class="<?php echo gendernaut()->subclass('title'); ?>"><?php the_title(); ?></h3>
		<?php if ( ! $is_long ) : ?>
			</a>
		<?php endif; ?>
		<div class="<?php echo gendernaut()->subclass('content'); ?>">
			<?php
			if ( $is_long ) {
				the_content();
			}
			else {
				the_excerpt();
			}
			?>
		</div>
		<?php
		$post = get_post();
		$taxonomies = get_object_taxonomies( $post, 'objects' );
		if ($taxonomies) : ?>
			<dl class="gendernaut-tax-list <?php echo gendernaut()->subclass('tax-list'); ?>">
				<?php foreach ($taxonomies as $taxonomy) :
					$terms = get_the_terms($post, $taxonomy->name);
					if ($terms) : ?>
						<div class="gendernaut-tax <?php echo gendernaut()->subclass('tax', $taxonomy->name); ?>">
							<dt class="gendernaut-tax__label <?php echo gendernaut()->subclass('tax-label'); ?>"><?php echo $taxonomy->labels->singular_name; ?></dt>
							<dd class="gendernaut-tax__content <?php echo gendernaut()->subclass('tax-content'); ?>">
								<ul class="gendernaut-tax__terms <?php echo gendernaut()->subclass('terms'); ?>">
									<?php foreach ($terms as $term) :
										$link = $taxonomy->name === 'gendernaut_col' ? get_term_link($term, $taxonomy->name) : false;
										?><li class="gendernaut-tax__term <?php echo gendernaut()->subclass('term') . ' ' . gendernaut()->term_color_class($term->term_id); ?>"><?php
											if ($link) :
												?><a href="<?php echo $link; ?>" class="gendernaut-tax__term-link <?php echo gendernaut()->subclass('term-link'); ?>"><?php
											endif;
												echo $term->name;
											if ($link) :
												?></a><?php
											endif;
										?></li>
									<?php endforeach; ?>
								</ul>
							</dd>
						</div>
					<?php endif; ?>
				<?php endforeach; ?>
			</dl>
		<?php endif; ?>
	</div>
</article>
