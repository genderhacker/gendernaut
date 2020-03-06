import $ from 'jquery';
import { register_view_type } from '../lib/view_manager.js';
import * as filter_manager from '../lib/filter_manager.js';

register_view_type(
	'timeline',
	{
		init( $view ) {
			this.debug = false;

			this.$timeline = $(".gendernaut-view-timeline"); // Element principal
			this.$timeline_items = $('.gendernaut-view-timeline__items'); // Element amb els elements que fa scroll
			this.timeline_items = this.$timeline_items[0];
			this.$timeline_map = $('.gendernaut-view-timeline__map'); // Element amb els anys
			this.timeline_map = this.$timeline_map[0];

			this.number_of_years = this.timeline_map.children.length;
			this.min_px_per_year = 100; // px
			this.scroll_amount = 200; // píxels moguts amb el teclat o les fletxes
			this.scroll_time = 100; // temps d'scroll amb el teclat o les fletxes

			this.scroll_on_year_click(); // Scroll al clicar els anys de la barra de baix
			this.scroll_on_arrow_click(); // Scroll al clicar les fletxes dels extrems
			this.scroll_on_drag(); // Scroll a l'arrossegar el timeline
			this.scroll_on_mousewheel(); // Scroll amb la roda del ratolí (vertical)
			this.move_map_position(); // Actualitzem la posició de la bola a la barra dels anys de baix
			this.adaptive_show_years(); // Decidim quants anys es mostren a la barra dels anys de baix
			this.keyboard(); // Fem scroll amb el teclat
			this.set_timeline_size();
		},

		display( $view ) {
			this.update( $view );
			this._update_map_position();
		},

		update( $view ) {

		},

		hide( $view ) {

		},

		// Mètodes interns

		log() {
			if (this.debug) {
				console.log(arguments);
			}
		},

		/**
		 * Retorna el primer any posterior visible, sinó anterior
		 * @param year_id identificador de l'any
		 * @returns jQuery l'any
		 * @private
		 */
		_get_visible_year(year_id) {
			const $year = $(year_id);
			if ($year.is(":visible")) {
				return $year;
			} else {
				const $next_visible_year = $year.nextAll(":visible").first();
				if ($next_visible_year.length > 0) {
					return $next_visible_year
				} else {
					return $year.prevAll(":visible").first();
				}
			}
		},

		/**
		 * Fa scroll del timeline d'anys
		 * @param scroll_position nova posició d'scroll del timeline
		 * @param time temps de transició
		 * @private
		 */
		_scroll(scroll_position, time) {
			this.$timeline_items.stop().animate({
				scrollLeft: scroll_position
			}, time);
		},

		/**
		 * Fem scroll a l'esquerra
		 * @private
		 */
		_scroll_left() {
			const current_scroll = this.$timeline_items.scrollLeft();
			this._scroll(current_scroll - this.scroll_amount, this.scroll_time);
		},

		/**
		 * Fem scroll a la dreta
		 * @private
		 */
		_scroll_right() {
			const current_scroll = this.$timeline_items.scrollLeft();
			this._scroll(current_scroll + this.scroll_amount, this.scroll_time);
		},

		/**
		 * Scroll al clicar els anys de la barra de baix
		 */
		scroll_on_year_click() {
			const self = this;
			this.$timeline_map.find('a').on('click',function(event){
				const $year_link = $(this);
				const year_id = $year_link.attr('href');
				const $year = self._get_visible_year(year_id);
				const year_left = $year.position().left;
				const current_scroll = self.$timeline_items.scrollLeft();
				self._scroll(current_scroll + year_left, 1000);

				// Canvis el focus a l'any de l'enllaç (https://css-tricks.com/snippets/jquery/smooth-scrolling/)
				const $target = $year;
				$target.focus();
				if ($target.is(":focus")) { // Checking if the target was focused
					return false;
				} else {
					$target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
					$target.focus(); // Set focus again
				}

				event.preventDefault();
			});
		},

		/**
		 * Scroll al clicar les fletxes dels extrems
		 */
		scroll_on_arrow_click() {
			const self = this;
			this.$timeline.find('.gendernaut-view-timeline__arrow_left').on('click', self._scroll_left.bind(self));
			this.$timeline.find('.gendernaut-view-timeline__arrow_right').on('click',self._scroll_right.bind(self));
		},

		/**
		 * Scroll a l'arrossegar el timeline
		 */
		scroll_on_drag() {
			// TODO: revisar en tàctil

			if (! this.timeline_items) {
				return;
			}

			let isDown = false;
			let startX;
			let scrollLeft;

			const onmousedown = (e) => {
				isDown = true;
				this.timeline_items.classList.add('active');

				let touch = undefined;
				if (e.touches) {
					touch = e.touches[0];
				}
				const pageX = e.pageX || touch.pageX;

				startX = pageX - this.timeline_items.offsetLeft;
				scrollLeft = this.timeline_items.scrollLeft;
			};

			const onmouseleave = () => {
				isDown = false;
				this.timeline_items.classList.remove('active');
			};

			const onmouseup = () => {
				isDown = false;
				this.timeline_items.classList.remove('active');
			};

			const onmousemove = (e) => {
				if(!isDown) return;
				e.preventDefault();

				let touch = undefined;
				if (e.touches) {
					touch = e.touches[0];
				}
				const pageX = e.pageX || touch.pageX;

				const x = pageX - this.timeline_items.offsetLeft;
				const walk = (x - startX) * 2; //scroll-fast
				this.timeline_items.scrollLeft = scrollLeft - walk;
			};

			this.timeline_items.addEventListener('mousedown', onmousedown);
			this.timeline_items.addEventListener('touchstart', onmousedown);

			this.timeline_items.addEventListener('mouseleave', onmouseleave);

			this.timeline_items.addEventListener('mouseup', onmouseup);
			this.timeline_items.addEventListener('ontouchend', onmouseup);

			this.timeline_items.addEventListener('mousemove', onmousemove);
			this.timeline_items.addEventListener('touchmove', onmousemove);
		},

		/**
		 * Scroll amb la roda del ratolí (vertical)
		 */
		scroll_on_mousewheel() {
			const self = this;
			this.$timeline_items.on('mousewheel', function(event) {
				const current_scroll = self.$timeline_items.scrollLeft();
				self.$timeline_items[0].scrollLeft -= (event.deltaY * event.deltaFactor);
				event.preventDefault();
			});
		},

		/**
		 * Actualitzem la posició de la bola a la barra dels anys de baix
		 */
		move_map_position() {
			this.timeline_items.addEventListener("scroll", this._update_map_position.bind(this));
		},

		_update_map_position() {
			const pointer = document.getElementById("gendernaut-view-timeline__map_pointer");

			// Mirem quin any està al principi del timeline (cantonada dalt esquerra del timeline)
			const offset = this.timeline_items.getBoundingClientRect();
			let x = offset.left + 32 + 20; // 32 per la barra lateral i 20 de marge
			let y = offset.top + 20;
			let element = document.elementFromPoint(x, y);
			let year_element = element.closest(".gendernaut-timeline-year");
			let year = year_element.getAttribute("data-year");

			// Agafem l'any a la barra de temps
			let map_year_selector = '[data-year="' + year + '"]';
			let map_year = this.timeline_map.querySelector(map_year_selector);

			function isHidden(el) {
				return (el.offsetParent === null)
			}

			if (! isHidden(map_year)) {
				// Si l'any està visible a la barra movem el punter allà
				pointer.style.left = map_year.offsetLeft + Math.floor(map_year.offsetWidth/2 - pointer.offsetWidth/2) + "px";
			} else {
				// Si l'any no està visible calculem el % entre l'anterior i el següent visibles
				const $nextVisibleYear = $(map_year).nextAll(".gendernaut-view-timeline__map_item:visible").first();
				const $prevVisibleYear = $(map_year).prevAll(".gendernaut-view-timeline__map_item:visible").first();
				const nextYear = $nextVisibleYear.data("year");
				const prevYear = $prevVisibleYear.data("year");
				const px_per_year = ($nextVisibleYear[0].offsetLeft - $prevVisibleYear[0].offsetLeft) / (nextYear - prevYear);
				const years_past_last = year - prevYear;
				pointer.style.left = $prevVisibleYear[0].offsetLeft + Math.floor(years_past_last*px_per_year + $nextVisibleYear[0].offsetWidth/2 - pointer.offsetWidth/2) + "px";
			}
		},

		/**
		 * Decidim cada quants anys es mostra el número a la barra
		 * @private
		 */
		_calculate_show_one_each_year() {
			const px_per_year = this.timeline_map.offsetWidth / this.number_of_years;
			const factor = Math.ceil(this.min_px_per_year / px_per_year);

			function removeClassByPrefix(node, prefix) {
				const regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
				node.className = node.className.replace(regx, '');
				return node;
			}

			removeClassByPrefix(this.timeline_map, "show_one_each_");
			this.timeline_map.classList.add("show_one_each_" + factor);
		},

		/**
		 * Adaptem quants anys es mostren a la barra de baix
		 */
		adaptive_show_years() {
			const self = this;

			// Controlem quants anys es mostren
			this._calculate_show_one_each_year();

			// Fem que es recalculi al canviar la mida del navegador
			let resizeTimer;
			$(window).on('resize', function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function() {
					self._calculate_show_one_each_year();
				}, 250);
			});
		},

		/**
		 * Funció que aplica els filtres als continguts del timeline
		 * @param $view Element de la vista
		 * @param filters Filtres a aplicar
		 */
		filter($view, filters) {
			let $timeline_container = $view.find('.js-gendernaut-timeline');

			// Filtrem els elemnts individualment
			$timeline_container.find('.gendernaut-timeline-item').each(function () {
				if (filter_manager.item_apply_filters( $(this), filters )) {
					$(this).removeClass("hidden");
				} else {
					$(this).addClass("hidden");
				}
			});

			// Amaguem els anys que no tenen cap element visible
			$timeline_container.find('.gendernaut-timeline-year').each(function () {
				if ($(this).children('.gendernaut-timeline-item').not(".hidden").length > 0) {
					$(this).removeClass("hidden");
				} else {
					$(this).addClass("hidden");
				}
			});
		},

		/**
		 * Fem scroll amb el teclat
		 */
		keyboard() {
			const self = this;

			let interval = null;

			// A l'apretar la tecla fem scroll i posem un interval per seguir movent-se si mantenim la tecla apretada
			this.$timeline_items[0].addEventListener('keydown', function (event) {
				if (event.defaultPrevented) {
					return;
				}

				const key = event.key || event.keyCode;
				if ((key === "ArrowLeft" ) || (key === 37)) {
					if (interval == null) { // Si no tenim la tecla ja apretada
						self._scroll_left();
						interval = window.setInterval(self._scroll_left.bind(self), self.scroll_time);
					}
				} else if ((key === "ArrowRight" ) || (key === 39)) {
					if (interval == null) { // Si no tenim la tecla ja apretada
						self._scroll_right();
						interval = window.setInterval(self._scroll_right.bind(self), self.scroll_time);
					}
				}
			});

			// Si deixem anar la tecla parem l'interval per seguir movent
			this.$timeline_items[0].addEventListener('keyup', function (event) {
				if (event.defaultPrevented) {
					return;
				}

				const key = event.key || event.keyCode;
				if ((key === "ArrowLeft" ) || (key === 37) || (key === "ArrowRight" ) || (key === 39)) {
					if (interval != null) {
						self.$timeline_items.stop();
						clearInterval(interval);
						interval = null;
					}
				}
			});
		},

		/**
		 * Adapta la mida del timeline en funció de la mida de pantalla pel tema de Filsfem (peak)
		 */
		_set_timeline_size() {
			const peak_logo = document.querySelector(".oy-logo");
			if (peak_logo) {
				const $main_container = $(".main-container");
				const timeline_container = $main_container[0].querySelector(".main-content .page-content");

				if ($main_container.outerWidth() < 940) {
					timeline_container.style.width = "";
					return;
				}

				const $menu_container = $(".menu-container");
				const avialable_space = $main_container.width() - $menu_container.outerWidth();
				timeline_container.style.width = avialable_space + "px";
			}
		},

		set_timeline_size() {
			const self = this;

			this._set_timeline_size();

			let resizeTimer;
			$(window).on('resize', function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function() {
					self._set_timeline_size();
				}, 250);
			});
		}
	}
);
