<?php
    $min_any = 10000;
    $max_any = 0;

    if ( have_posts() ) : ?>
    <div class="<?php echo gendernaut()->subclass('container'); ?>">
        <div class="<?php echo gendernaut()->subclass('arrow') . " " . gendernaut()->subclass('arrow_left'); ?>">
	        <?php echo gendernaut()->renderer->get_icon("left"); ?>
        </div>
        <div class="<?php echo gendernaut()->subclass('arrow') . " " . gendernaut()->subclass('arrow_right'); ?>">
	        <?php echo gendernaut()->renderer->get_icon("right"); ?>
        </div>
        <div class="<?php echo gendernaut()->subclass('items'); ?> js-gendernaut-timeline js-gendernaut-items" tabindex="0">
            <?php

            // TODO: Crear funcions i posar-les on correspongui!

            $posts_per_any = [];
            while ( have_posts() ) : the_post();
                $post_id = get_the_ID();
                $post = get_post();
                // Get array of WP_Term category terms for the current post
                $terms = get_the_terms( $post_id, 'gendernaut_tax' );
                // Save the first WP_Term object to the WP_Post object
                $sorted_terms = wp_list_sort($terms, 'term_id');
                $post->category = end($sorted_terms); // Agafem l'últim i no el primer ja que els css van de menys a més i la classe última mana

	            $post_type = get_post_type();
	            $custom_field_timeline = gendernaut()->get_post_type_option('custom_field_timeline', $post_type );

	            $any = get_post_meta($post_id, $custom_field_timeline, true);
                if ($any < $min_any) { $min_any = $any; }
                if ($any > $max_any) { $max_any = $any; }

                $posts_de_lany = (array_key_exists($any, $posts_per_any)?$posts_per_any[$any]:[]);
                if (! $posts_de_lany) {
                    $posts_de_lany = [];
                    $posts_per_any[$any] = $posts_de_lany;
                }
                $posts_de_lany[] = $post;
                $posts_per_any[$any] = $posts_de_lany;
            endwhile;

            // https://wpshout.com/sort-posts-taxonomy-terms/
            // Define sorting function to sort by category name
            function sort_posts_by_category( $a, $b ) {
                return strcmp(
                    wp_strip_all_tags( ($a->category != null)?$a->category->name:'' ),
                    wp_strip_all_tags( ($b->category != null)?$b->category->name:'' )
                );
            }

            ksort($posts_per_any);
            foreach ($posts_per_any as $any => $posts_de_lany) {
                ?>
                <div class="gendernaut-timeline-year" id="gendernaut-timeline-year-<?php print($any); ?>" data-year="<?php print($any); ?>">
                    <h2><?php print($any); ?></h2>
                    <?php
                    usort( $posts_de_lany, 'sort_posts_by_category' );
                    // Call global $post variable
                    global $post;

                    foreach( $posts_de_lany as $current_post ) :
                        // Set $post global variable to the current post object
                        $post = $current_post;
                        // Set up "environment" for template tags
                        setup_postdata( $post );
                        gendernaut()->item();
                    endforeach;
                    ?>
                </div>
                <?php
            }
            ?>
        </div>
    </div>
    <?php
    endif;

    ?>
    <div class="<?php echo gendernaut()->subclass('map'); ?>">
        <?php for($i = $min_any; $i <= $max_any; $i++): ?>
            <a class="<?php echo gendernaut()->subclass('map_item'); ?>" href="#gendernaut-timeline-year-<?php print($i); ?>" data-year="<?php print($i); ?>">
                <?php print($i); ?>
            </a>
        <?php endfor; ?>
        <div id="<?php echo gendernaut()->subclass('map_pointer'); ?>"></div>
    </div>
    <?php

?>
