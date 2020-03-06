import $ from 'jquery';
import Collection from './gendernaut-collection'

/**
 * Classe per gestionar les col·lecions
 */
export default class Collections {

    constructor() {
        this.debug = false;

        this.updated = true; // Indica si l'estat està actualitzat a la BD

        this.collection_item_selector = 'gendernaut-item__collection'; // El selector de la info de col·leccions dels elements

        this.$collections_overlay = $(".gendernaut-collections-overlay"); // L'overlay per editar la col·lecció
        this.$collections_status = this.$collections_overlay.find("#gendernaut-collections-overlay__collection_status"); // L'element d'estat de la col·lecció
        this.$collections_list = $(".gendernaut-collections"); // El contenidor del llistat de col·leccions de la pàgina de col·leccions

        this.$archive = $('.js-gendernaut-archive');
        this.$items = this.$archive.find('.js-gendernaut-items');
        this.items = this.$items[0];

        this.storage = window.localStorage;

        this.collection = new Collection();

        this.init(); // Inicialitzem el llistat d'items de la col·lecció
        this.unsaved_changes_event(); // Activem l'avís en cas de marxar sense guardar
        this.collection_mode(); // Mirem si activem el mode d'edició
        this.leave_edit_on_quit(); // Abandonem el mode d'edició al sortir de la pàgina

        this.create_collection_click(); // Event handler del botó de crear una col·lecció

        this.save_update_on_click(); // Event handler de guardar l'estat actual

        this.init_filter();
    }

    log() {
        if (this.debug) {
            console.log(arguments);
        }
    }

    /**
     * Posa un element a la col·lecció, tant modificant l'html per reflectir-ho com guardant-ho a localStorage
     * @param {jQuery} $item element html de l'item
     * @param {Boolean} state indica si està a la col·lecció o no
     * @private
     */
    _set_dom_item_in_collection($item, state) {
        const $item_collection = $item.find("." + this.collection_item_selector);
        if (state) {
            $item_collection.html("-");
            // $item_collection.data("gendernaut_collection", "true");
        } else {
            $item_collection.html("+");
            // $item_collection.data("gendernaut_collection", "false");
        }
    }

    _set_item_in_collection(item_id, state) {
        const collection_items = this.collection.items;
        collection_items[parseInt(item_id)] = state;
        this.collection.items = collection_items;

        this._update_collection_count();
    }

    _update_collection_count() {
        const collection_items = this.collection.items;
        const count = collection_items.reduce((acc, cur) => cur ? ++acc : acc, 0);
        this.$collections_overlay.find("#gendernaut-collections-overlay__collection_counter").html(count);
    }

    /**
     * Si estem a la pàgina d'edició agafem el llistat d'items
     */
    init() {
        const self = this;

        // TODO: fer-ho només si clica el botó d'editar?
        if (typeof gendernaut_collection !== 'undefined') { // Definit només a la pàgina d'edició
            this.collection.id = gendernaut_collection.id;
            this.collection.code = gendernaut_collection.code;
            self._set_collection_mode(true);
        }
    }

    unsaved_changes_event() {
        const self = this;
        this.$collections_overlay.find("#title, #description").on('input', function () {
            self._set_update_status(false);
        });

        window.addEventListener('beforeunload', function (e) {
            // If we are in collection edit mode and there ara unsaved changes
            if (self._get_collection_mode() && ! self.updated) {
                // Cancel the event
                e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will be allways shown
                // Chrome requires returnValue to be set
                e.returnValue = '';
            } else {
                // the absence of a returnValue property on the event will guarantee the browser unload happens
                delete e['returnValue'];
            }
        });
    }

    leave_edit_on_quit() {
        const self = this;

        window.addEventListener('unload', function (e) {
            // If we are in collection edit mode and there ara unsaved changes
            if (self._get_collection_mode()) {
                self._set_collection_mode(false);
            }
        });
    }

    /**
     * Posa l'event handler de quan afegim o eliminem els elements de la col·lecció
     */
    _add_remove_on_click() {
        const self = this;
        this.$items.find("." + self.collection_item_selector).on("click", function() {
            const $item = $(this).closest(".js-gendernaut-item");
            const item_id = $item.data("gendernaut_id");

            const collection_items = self.collection.items;
            const curr_state = collection_items[parseInt(item_id)];
            self._set_item_in_collection(item_id, ! curr_state);

            const $items = self.$archive.find(".js-gendernaut-item[data-gendernaut_id=" + item_id + "]");
            $items.each(function () {
                self._set_dom_item_in_collection($(this), ! curr_state);
            });
            self._set_update_status(false);
            self.apply_filter();
        });
    }

    /**
     * Posa l'event handler de quan guardem l'estat de la col·lecció enviant-ho per ajax
     */
    save_update_on_click() {
        const self = this;
        this.$collections_status.find(".notupdated").on("click", function() {
            const valid = self.$collections_overlay.find("form")[0].reportValidity();
            if (! valid) {
                return;
            }

            const $save_link = $(this);
            $save_link.find(".save").hide();
            $save_link.find(".saving").show();
            const data = new FormData(self.$collections_overlay.find("form")[0]);
            data.append("action", "collection_save"); // Acció definida al plugin de wordpress
            const items = self.collection.items;
            const selected_items = items.reduce((a, o, i) => (o && a.push(i), a), []);
            data.append("posts", JSON.stringify(selected_items));
            data.append("id", self.collection.id.toString());
            data.append("code", self.collection.code);
            fetch(gendernaut_vars.ajax_url, {
                method: 'post',
                credentials: 'same-origin',
                body: data
            }).then(response => {
                return response.ok ? response.json() : 'Not Found...';
            }).then(json_response => {
                console.log(json_response);
                $save_link.find(".save").show();
                $save_link.find(".saving").hide();
                if (json_response.status >= 0) {
                    self._set_update_status(true);
                    if (json_response.status === 1) {
                        const creation_message = `<p>${json_response.message}</p><p>URL: ${json_response.url}</p><p>${gendernaut_vars.collection_url_message}</p>`;
                        self.collection.id = json_response.id;
                        $.featherlight(creation_message, {});
                    }
                } else {
                    const error_message = `<p>${json_response.message}</p><p># ${json_response.status}</p><p>${json_response.error}</p>`;
                    $.featherlight(error_message, {});
                }
            });
        });
    }

    /**
     * Marca l'estat de la col·lecció a actualitzat o no actualitzat
     * @param {Boolean} updated
     * @private
     */
    _set_update_status(updated) {
        this.updated = updated;
        if (updated) {
            this.$collections_status.children().hide();
            this.$collections_status.find(".updated").show();
        } else {
            this.$collections_status.children().hide();
            this.$collections_status.find(".notupdated").show();
        }
    }

    /**
     * Canvia l'estat d'edició i actualitzem l'html
     * @param state
     * @private
     */
    _set_collection_mode(state) {
        if (state) {
            this.storage.setItem('gendernaut_collection_mode', 'on');
            this.$archive.addClass("collection_mode");
            this.$collections_overlay.addClass("collection_mode");
        } else {
            this.storage.setItem('gendernaut_collection_mode', 'off');
            this.$archive.removeClass("collection_mode");
            this.$collections_overlay.removeClass("collection_mode");
        }
    }

    /**
     * Retorna l'estat d'edició
     * @private
     */
    _get_collection_mode() {
        return (this.storage.getItem('gendernaut_collection_mode') === 'on');
    }

    /**
     * Posa l'event handler de quan comencem a crear la col·lecció i els de cancel·lar i continuar
     */
    create_collection_click() {
        const $create_button = this.$collections_list.find("#gendernaut-collections__collection_create");
        const $create_info_div = $("#gendernaut-collections__collection_create_info > div");
        $create_button.featherlight($create_info_div, {});

        const $create_cancel_button = $create_info_div.find("#gendernaut-collections__collection_create_cancel");
        $create_cancel_button.on('click', function (ev) {
            ev.preventDefault();
            const current = $.featherlight.current();
            current.close();
        });

        const self = this;
        const $create_create_button = $create_info_div.find("#gendernaut-collections__collection_create_create");
        $create_create_button.on("click", function() {
            // ev.preventDefault();
            console.log("Collection mode: On");
            self.collection.items = [];
            self.collection.title = "";
            self.collection.description = "";
            self.collection.id = -1;
            self.collection.code = null;
            self.storage.setItem('gendernaut_collection_mode_on_next_page', 'on');
        });
    }

    _add_collection_info($item) {
        $item.append('<div class="' + this.collection_item_selector + '"></div>');
    }

    _fetch_collection_data() {
        const url = new URL(gendernaut_vars.ajax_url);
        const params = [["action", "collection_load"], ["id", this.collection.id], ["code", this.collection.code]];
        url.search = new URLSearchParams(params).toString();

        fetch(url, {
            credentials: 'same-origin',
        }).then(response => {
            return response.ok ? response.json() : 'Not Found...';
        }).then(json_response => {
            if (json_response.status >= 0) {
                if (this.collection.id < 0) {
                    this._set_update_status(false);
                }

                this.collection.title = json_response.title;
                this.collection.description = json_response.description;
                const collection_items = [];
                for (let item_id of json_response.posts) {
                    collection_items[item_id] = true;
                }
                this.collection.items = collection_items;

                this._load_collection_data();
            } else {
                // TODO: com ho fem?
                // const error_message = `<p>${json_response.message}</p><p># ${json_response.status}</p><p>${json_response.error}</p>`;
                // $.featherlight(error_message, {});
            }

        });

    }

    _load_collection_data() {
        const self = this;

        this._set_collection_mode(true);

        const $stop_button = this.$collections_overlay.find("#gendernaut-collections-overlay__collection_stop");
        $stop_button.on("click", function(ev) {
            ev.preventDefault();

            if (! self.updated) {
                const t = confirm(gendernaut_vars.unsaved_message);
                if(t === false) {
                    return;
                }
            }

            self._set_collection_mode(false);
            self.update_filter();
            self.apply_filter();
        });

        const items = this.collection.items;
        this.$items.find(".js-gendernaut-item").each(function(idx, el) {
            const $item = $(el);
            self._add_collection_info($item);
            const item_id = $item.data("gendernaut_id");
            self._set_dom_item_in_collection($item, (item_id in items && items[parseInt(item_id)] === true));
        });

        this._update_collection_count();
        this._add_remove_on_click(); // Event handler d'afegir o eliminar elements

        const $form = this.$collections_overlay.find("form");
        $form.find("#title").attr("value", this.collection.title);
        $form.find("#description").val(this.collection.description);
    }

    /**
     * Detecta si estem en mode edició i ho activa
     */
    collection_mode() {
        const self = this;

        const $collection_edit_link = $(".gendernaut-archive__collection_edit_link");
        if ($collection_edit_link.data("collection_id") === this.collection.id) {
            $collection_edit_link[0].style.display = "block";
            $collection_edit_link.on("click", function () {
                self.storage.setItem('gendernaut_collection_mode_on_next_page', 'on');
            });
        }

        // TODO: revisar més la condició
        if ((this.storage.getItem('gendernaut_collection_mode_on_next_page') === "on") &&
            (this.$collections_overlay.length > 0)) {
            this.storage.setItem('gendernaut_collection_mode_on_next_page', 'off');
            this._fetch_collection_data();
        }
    }

    init_filter() {
        const self = this;

        self.filter = {
            field: 'gendernaut_id',
            mode: 'IS',
            compare: function(id, state) {
                return ( id in self.collection.items && self.collection.items[parseInt(id)] ) === state;
            }
        }

        self.filter_callbacks = [];

        self.$filter_activate = self.$collections_overlay.find( '.js-gendernaut-collection-filter' );

        self.$filter_activate.change( function() {
            self.update_filter();
            self.apply_filter();
        });

        return self.update_filter();
    }

    update_filter() {
        if ( this._get_collection_mode() && this.$filter_activate.prop('checked') ) {
            this.filter.value = true;
        }
        else {
            delete this.filter.value;
        }

        return this.filter;
    }

    add_filter_callback(callback) {
        if ( typeof callback === 'function' ) {
            this.filter_callbacks.push( callback );
        }
    }

    apply_filter() {
        for ( let callback of this.filter_callbacks ) {
            callback( this.filter );
        }
    }
}
