import $ from 'jquery';

/**
 * Classe per gestionar una col·lecció
 */
export default class Collection {

	constructor() {
		this.debug = false;

		this.updated = true; // Indica si l'estat està actualitzat a la BD

		this.storage = window.localStorage;
	}

	log() {
		if (this.debug) {
			console.log(arguments);
		}
	}

	/**
	 * Retorna la col·lecció guardada al localStorage
	 * @returns {any} objecte de la col·lecció
	 * @private
	 */
	_get_collection() {
		let collection = JSON.parse(this.storage.getItem('gendernaut_collection'));
		if (! collection) {
			collection = {};
		}
		return collection;
	}

	/**
	 * Guarda la col·lecció al localStorage
	 * @param {Object} collection objecte de la col·lecció
	 * @private
	 */
	_set_collection(collection) {
		// TODO: mirar quan fer-ho
		this.storage.setItem('gendernaut_collection', JSON.stringify(collection));
	}

	/**
	 * Retorna un atribut de la col·lecció
	 * @param {String} name La clau de l'atribut
	 * @param {*} def El valor per defecte de l'atribut si no existeix
	 * @returns {*} El valor de l'atribut
	 * @private
	 */
	_get_attr(name, def=null) {
		const collection = this._get_collection();
		let attr = collection[name];
		if (! attr) {
			attr = def;
		}
		return attr;
	}

	/**
	 * Guarda un atribut de la col·lecció
	 * @param {String} name La clau de l'atribut
	 * @param {*} val El valor de l'atribut
	 * @private
	 */
	_set_attr(name, val) {
		const collection = this._get_collection();
		collection[name] = val;
		this._set_collection(collection);
	}

	/**
	 * Retorna el llistat d'items de la col·lecció
	 * @returns {Array} array mapa de si els elements estan a la col·lecció
	 * @public
	 */
	// TODO: canviar el nom a posts
	get items() {
		return this._get_attr("items", []);
	}

	/**
	 * Guarda el llistat d'items de la col·lecció
	 * @param {Array} items array mapa de si els elements estan a la col·lecció
	 * @public
	 */
	set items(items) {
		this._set_attr("items", items);
	}

	/**
	 * Retorna el títol de la col·lecció
	 * @returns {String} Títol de la col·lecció
	 * @public
	 */
	get title() {
		return this._get_attr("title", "");
	}

	/**
	 * Guarda el títol de la col·lecció
	 * @param {String} title Títol de la col·leció
	 * @public
	 */
	set title(title) {
		this._set_attr("title", title);
	}

	/**
	 * Retorna la descripció de la col·lecció
	 * @returns {String} Descripció de la col·lecció
	 * @public
	 */
	get description() {
		return this._get_attr("description", "");
	}

	/**
	 * Guarda la descripció de la col·lecció
	 * @param {String} description Descripció de la col·leció
	 * @public
	 */
	set description(description) {
		this._set_attr("description", description);
	}

	/**
	 * Retorna el codi de la col·lecció
	 * @returns {String} Codi de la col·lecció
	 * @public
	 */
	get code() {
		return this._get_attr("code", "");
	}

	/**
	 * Guarda el codi de la col·lecció
	 * @param {String} code Codi de la col·leció
	 * @public
	 */
	set code(code) {
		this._set_attr("code", code);
	}

	/**
	 * Retorna l'id de la col·lecció
	 * @returns {Number} Id de la col·lecció
	 * @public
	 */
	get id() {
		return this._get_attr("id", -1);
	}

	/**
	 * Guarda l'id de la col·lecció
	 * @param {Number} id id de la col·leció
	 * @public
	 */
	set id(id) {
		this._set_attr("id", id);
	}
}
