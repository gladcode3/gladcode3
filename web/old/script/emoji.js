"use strict";

;(function() {

	var root = this;
	var previous_emoji = root.EmojiConvertor;


	/**
	 * @global
	 * @namespace
	 */

	var emoji = function(){

		var self = this;

		/**
		 * The set of images to use for graphical emoji.
		 *
		 * @memberof emoji
		 * @type {string}
		 */
		self.img_set = 'apple';

		/**
		 * Configuration details for different image sets. This includes a path to a directory containing the
		 * individual images (`path`) and a URL to sprite sheets (`sheet`). All of these images can be found
		 * in the [emoji-data repository]{@link https://github.com/iamcal/emoji-data}. Using a CDN for these
		 * is not a bad idea.
		 *
		 * @memberof emoji
		 * @type {object}
		 */
		self.img_sets = {
			'apple' : {'path' : '/emoji-data/img-apple-64/', 'sheet' : '/emoji-data/sheet_apple_64.png', 'sheet_size' : 64, 'mask' : 1},
			'google' : {'path' : '/emoji-data/img-google-64/', 'sheet' : '/emoji-data/sheet_google_64.png', 'sheet_size' : 64, 'mask' : 2},
			'twitter' : {'path' : '/emoji-data/img-twitter-64/', 'sheet' : '/emoji-data/sheet_twitter_64.png', 'sheet_size' : 64, 'mask' : 4},
			'emojione' : {'path' : '/emoji-data/img-emojione-64/', 'sheet' : '/emoji-data/sheet_emojione_64.png', 'sheet_size' : 64, 'mask' : 8},
			'facebook' : {'path' : '/emoji-data/img-facebook-64/', 'sheet' : '/emoji-data/sheet_facebook_64.png', 'sheet_size' : 64, 'mask' : 16},
			'messenger' : {'path' : '/emoji-data/img-messenger-64/', 'sheet' : '/emoji-data/sheet_messenger_64.png', 'sheet_size' : 64, 'mask' : 32},
		};

		/**
		 * Use a CSS class instead of specifying a sprite or background image for
		 * the span representing the emoticon. This requires a CSS sheet with
		 * emoticon data-uris.
		 *
		 * @memberof emoji
		 * @type bool
		 * @todo document how to build the CSS stylesheet self requires.
		 */
		self.use_css_imgs = false;

		/**
		 * Instead of replacing emoticons with the appropriate representations,
		 * replace them with their colon string representation.
		 * @memberof emoji
		 * @type bool
		 */
		self.colons_mode = false;
		self.text_mode = false;

		/**
		 * If true, sets the "title" property on the span or image that gets
		 * inserted for the emoticon.
		 * @memberof emoji
		 * @type bool
		 */
		self.include_title = false;

		/**
		 * If true, sets the text of the span or image that gets inserted for the
		 * emoticon.
		 * @memberof emoji
		 * @type bool
		 */
		self.include_text = false;

		/**
		 * If the platform supports native emoticons, use those instead
		 * of the fallbacks.
		 * @memberof emoji
		 * @type bool
		 */
		self.allow_native = true;

		/**
		 * Wrap native with a <span class="emoji-native"></span> to allow styling
		 * @memberof emoji
		 * @type bool
		 */
		self.wrap_native = false;

		/**
		 * Set to true to use CSS sprites instead of individual images on 
		 * platforms that support it.
		 *
		 * @memberof emoji
		 * @type bool
		 */
		self.use_sheet = false;

		/**
		 *
		 * Set to true to avoid black & white native Windows emoji being used.
		 *
		 * @memberof emoji
		 * @type bool
		 */
		self.avoid_ms_emoji = true;

		/**
		 *
		 * Set to true to allow :CAPITALIZATION:
		 *
		 * @memberof emoji
		 * @type bool
		 */
		self.allow_caps = false;


		/**
		 *
		 * Suffix to allow for individual image cache busting
		 *
		 * @memberof emoji
		 * @type string
		 */
		self.img_suffix = '';


		// Keeps track of what has been initialized.
		/** @private */
		self.inits = {};
		self.map = {};

		// discover the environment settings
		self.init_env();

		return self;
	}

	emoji.prototype.noConflict = function(){
		root.EmojiConvertor = previous_emoji;
		return emoji;
	}


	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by a representatation that's supported by the current
	 * environtment.
	 */
	emoji.prototype.replace_emoticons = function(str){
		var self = this;
		var colonized = self.replace_emoticons_with_colons(str);
		return self.replace_colons(colonized);
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing ascii emoticons
	 * (ie. `:)`)
	 *
	 * @returns {string} A new string with all emoticons in `str`
	 * replaced by their colon string representations (ie. `:smile:`)
	 */
	emoji.prototype.replace_emoticons_with_colons = function(str){
		var self = this;
		self.init_emoticons();
		var _prev_offset = 0;
		var emoticons_with_parens = [];
		var str_replaced = str.replace(self.rx_emoticons, function(m, $1, emoticon, offset){
			var prev_offset = _prev_offset;
			_prev_offset = offset + m.length;

			var has_open_paren = emoticon.indexOf('(') !== -1;
			var has_close_paren = emoticon.indexOf(')') !== -1;

			/*
			 * Track paren-having emoticons for fixing later
			 */
			if ((has_open_paren || has_close_paren) && emoticons_with_parens.indexOf(emoticon) == -1) {
				emoticons_with_parens.push(emoticon);
			}

			/*
			 * Look for preceding open paren for emoticons that contain a close paren
			 * This prevents matching "8)" inside "(around 7 - 8)"
			 */
			if (has_close_paren && !has_open_paren) {
				var piece = str.substring(prev_offset, offset);
				if (piece.indexOf('(') !== -1 && piece.indexOf(')') === -1) return m;
			}

			/*
			 * See if we're in a numbered list
			 * This prevents matching "8)" inside "7) foo\n8) bar"
			 */
			if (m === '\n8)') {
				var before_match = str.substring(0, offset);
				if (/\n?(6\)|7\))/.test(before_match)) return m;
			}

			var val = self.data[self.map.emoticons[emoticon]][3][0];
			return val ? $1+':'+val+':' : m;
		});

		/*
		 * Come back and fix emoticons we ignored because they were inside parens.
		 * It's useful to do self at the end so we don't get tripped up by other,
		 * normal emoticons
		 */
		if (emoticons_with_parens.length) {
			var escaped_emoticons = emoticons_with_parens.map(self.escape_rx);
			var parenthetical_rx = new RegExp('(\\(.+)('+escaped_emoticons.join('|')+')(.+\\))', 'g');

			str_replaced = str_replaced.replace(parenthetical_rx, function(m, $1, emoticon, $2) {
				var val = self.data[self.map.emoticons[emoticon]][3][0];
				return val ? $1+':'+val+':'+$2 : m;
			});
		}

		return str_replaced;
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing colon string
	 * representations of emoticons (ie. `:smile:`)
	 *
	 * @returns {string} A new string with all colon string emoticons replaced
	 * with the appropriate representation.
	 */
	emoji.prototype.replace_colons = function(str){
		var self = this;
		self.init_colons();

		return str.replace(self.rx_colons, function(m){
			var idx = m.substr(1, m.length-2);
			if (self.allow_caps) idx = idx.toLowerCase();

			// special case - an emoji with a skintone modified
			if (idx.indexOf('::skin-tone-') > -1){

				var skin_tone = idx.substr(-1, 1);
				var skin_idx = 'skin-tone-'+skin_tone;
				var skin_val = self.map.colons[skin_idx];

				idx = idx.substr(0, idx.length - 13);

				var val = self.map.colons[idx];
				if (val){
					return self.replacement(val, idx, ':', {
						'idx'		: skin_val,
						'actual'	: skin_idx,
						'wrapper'	: ':'
					});
				}else{
					return ':' + idx + ':' + self.replacement(skin_val, skin_idx, ':');
				}
			}else{
				var val = self.map.colons[idx];
				return val ? self.replacement(val, idx, ':') : m;
			}
		});
	};

	/**
	 * @memberof emoji
	 * @param {string} str A string potentially containing unified unicode
	 * emoticons. (ie. 😄)
	 *
	 * @returns {string} A new string with all unicode emoticons replaced with
	 * the appropriate representation for the current environment.
	 */
	emoji.prototype.replace_unified = function(str){
		var self = this;
		self.init_unified();
		return str.replace(self.rx_unified, function(m, p1, p2){
			var val = self.map.unicode[p1].unified;
 			if (val){
				var idx = null;
				if (p2 == '\uD83C\uDFFB') idx = '1f3fb';
				if (p2 == '\uD83C\uDFFC') idx = '1f3fc';
				if (p2 == '\uD83C\uDFFD') idx = '1f3fd';
				if (p2 == '\uD83C\uDFFE') idx = '1f3fe';
				if (p2 == '\uD83C\uDFFF') idx = '1f3ff';
				if (idx){
					return self.replacement(val, null, null, {
						idx	: idx,
						actual	: p2,
						wrapper	: ''
					});
					}
				return self.replacement(val);
			}

			val = self.map.unified_vars[p1];
			if (val){
				return self.replacement(val[0], null, null, {
					'idx'		: val[1],
					'actual'	: '',
					'wrapper'	: '',
				});
			}

			return m;
		});
	};

	emoji.prototype.addAliases = function(map){
		var self = this;

		self.init_colons();
		for (var i in map){
			self.map.colons[i] = map[i];
		}
	};

	emoji.prototype.removeAliases = function(list){
		var self = this;

		for (var i=0; i<list.length; i++){
			var alias = list[i];

			// first, delete the alias mapping
			delete self.map.colons[alias];

			// now reset it to the default, if one exists
			finder_block: {
				for (var j in self.data){
					for (var k=0; k<self.data[j][3].length; k++){
						if (alias == self.data[j][3][k]){
							self.map.colons[alias] = j;
							break finder_block;
						}
					}
				}
			}
		}
	};


	// Does the actual replacement of a character with the appropriate
	/** @private */
	emoji.prototype.replacement = function(idx, actual, wrapper, variation, is_extra){
		var self = this;

		var full_idx = idx;

		// for emoji with variation modifiers, set `extra` to the standalone output for the
		// modifier (used if we can't combine the glyph) and set variation_idx to key of the
		// variation modifier (used below)
		var extra = '';
		var var_idx = null;
		if (typeof variation === 'object'){
			extra = self.replacement(variation.idx, variation.actual, variation.wrapper, undefined, true);
			var_idx = variation.idx;
		}

		// deal with simple modes (colons and text) first
		wrapper = wrapper || '';
		if (self.colons_mode) return ':'+self.data[idx][3][0]+':'+extra;
		var text_name = (actual) ? wrapper+actual+wrapper : self.data[idx][8] || wrapper+self.data[idx][3][0]+wrapper;
		if (self.text_mode) return text_name + extra;

		// figure out which images and code points to use, based on the skin variations. this information is also used for
		// unified native output mode
		var img = self.find_image(idx, var_idx);

		// native modes next.
		// for variations selectors, we just need to output them raw, which `extra` will contain. since softbank and google don't
		// support skin variations, we'll keep `extra` around, every if we have a valid variation selector
		self.init_env();
		if (self.replace_mode == 'softbank' && self.allow_native && self.data[idx][1]) return self.format_native(self.data[idx][1] + extra, !is_extra);
		if (self.replace_mode == 'google'   && self.allow_native && self.data[idx][2]) return self.format_native(self.data[idx][2] + extra, !is_extra);

		// for unified (and images, below), we can use the variation info and throw away the `extra` contents
		if (img.is_var){
			extra = '';
		}
		if (self.replace_mode == 'unified' && self.allow_native) return self.format_native(img.unified + extra, !is_extra);


		// finally deal with image modes.
		// the call to .find_image() earlier checked if the image set and particular emoji supports variations,
		// otherwise we can return it as a separate image (already calculated in `extra`).
		// first we set up the params we'll use if we can't use a variation.
		var title = self.include_title ? ' title="'+(actual || self.data[idx][3][0])+'"' : '';
		var text  = self.include_text  ? wrapper+(actual || self.data[idx][3][0])+wrapper : '';

		// custom image for this glyph?
		if (self.data[idx][7]){
			img.path = self.data[idx][7];
			img.px = null;
			img.py = null;
			img.is_var = false;
		}

		// if we're displaying a variation, include it in the text
		if (img.is_var && self.include_text && variation && variation.actual && variation.wrapper) {
			text += variation.wrapper+variation.actual+variation.wrapper;
		}

		// output
		if (self.supports_css) {
			if (self.use_sheet && img.px != null && img.py != null){
				var sheet_size = self.sheet_size * (img.sheet_size+2); // size of image in pixels
				var sheet_x = 100 * (((img.px * (img.sheet_size+2)) + 1) / (sheet_size - img.sheet_size));
				var sheet_y = 100 * (((img.py * (img.sheet_size+2)) + 1) / (sheet_size - img.sheet_size));
				var sheet_sz = 100 * (sheet_size / img.sheet_size);

				var style = 'background: url('+img.sheet+');background-position:'+(sheet_x)+'% '+(sheet_y)+'%;background-size:'+sheet_sz+'% '+sheet_sz+'%';
				return '<span class="emoji-outer emoji-sizer"><span class="emoji-inner" style="'+style+'"'+title+' data-codepoints="'+img.full_idx+'">'+text+'</span></span>'+extra;
			}else if (self.use_css_imgs){
				return '<span class="emoji emoji-'+idx+'"'+title+' data-codepoints="'+img.full_idx+'">'+text+'</span>'+extra;
			}else{
				return '<span class="emoji emoji-sizer" style="background-image:url('+img.path+')"'+title+' data-codepoints="'+img.full_idx+'">'+text+'</span>'+extra;
			}
		}
		return '<img src="'+img.path+'" class="emoji" data-codepoints="'+img.full_idx+'" '+title+'/>'+extra;
	};

	// Wraps the output of a native endpoint, if configured
	/** @private */
	emoji.prototype.format_native = function(native, allow_wrap){
		var self = this;

		if (self.wrap_native && allow_wrap){
			return '<span class="emoji-native">'+ native + '</span>';
		}
		return native;
	};

	// Finds the best image to display, taking into account image set precedence and obsoletes
	/** @private */
	emoji.prototype.find_image = function(idx, var_idx){
		var self = this;

		// set up some initial state
		var out = {
			'path'		: '',
			'sheet'		: '',
			'sheet_size'	: 0,
			'px'		: self.data[idx][4],
			'py'		: self.data[idx][5],
			'full_idx'	: idx,
			'is_var'	: false,
			'unified'	: self.data[idx][0][0]
		};
		var use_mask = self.data[idx][6];

		// can we use a variation?
		if (var_idx && self.variations_data[idx] && self.variations_data[idx][var_idx]){
			var var_data = self.variations_data[idx][var_idx];

			out.px = var_data[1];
			out.py = var_data[2];
			out.full_idx = var_data[0];
			out.is_var = true;
			out.unified = var_data[4];
			use_mask = var_data[3];
		}

		// this matches `build/build_image.php` `in emoji-data`, so that sheet and images modes always
		// agree about the image to use.
		var try_order = [self.img_set, 'apple', 'emojione', 'google', 'twitter', 'facebook', 'messenger'];

		// for each image set, see if we have the image we need. otherwise check for an obsolete in
		// that image set
		for (var j=0; j<try_order.length; j++){
			if (use_mask & self.img_sets[try_order[j]].mask){
				out.path = self.img_sets[try_order[j]].path+out.full_idx+'.png' + self.img_suffix;
				// if we're not changing glyph, use our base set for sheets - it has every glyph
				out.sheet = self.img_sets[self.img_set].sheet;
				out.sheet_size = self.img_sets[self.img_set].sheet_size;
				return out;
            }

			if (self.obsoletes_data[out.full_idx]){
				var ob_data = self.obsoletes_data[out.full_idx];

				if (ob_data[3] & self.img_sets[try_order[j]].mask){
					out.path = self.img_sets[try_order[j]].path+ob_data[0]+'.png' + self.img_suffix;
					out.sheet = self.img_sets[try_order[j]].sheet;
					out.sheet_size = self.img_sets[try_order[j]].sheet_size;
					out.px = ob_data[1];
					out.py = ob_data[2];
					return out;
				}
			}
		}

		return out;
	};

	// Initializes the text emoticon data
	/** @private */
	emoji.prototype.init_emoticons = function(){
		var self = this;
		if (self.inits.emoticons) return;
		self.init_colons(); // we require this for the emoticons map
		self.inits.emoticons = 1;
		
		var a = [];
		self.map.emoticons = {};
		for (var i in self.emoticons_data){
			// because we never see some characters in our text except as entities, we must do some replacing
			var emoticon = i.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
			
			if (!self.map.colons[self.emoticons_data[i]]) continue;

			self.map.emoticons[emoticon] = self.map.colons[self.emoticons_data[i]];
			a.push(self.escape_rx(emoticon));
		}
		self.rx_emoticons = new RegExp(('(^|\\s)('+a.join('|')+')(?=$|[\\s|\\?\\.,!])'), 'g');
	};

	// Initializes the colon string data
	/** @private */
	emoji.prototype.init_colons = function(){
		var self = this;
		if (self.inits.colons) return;
		self.inits.colons = 1;
		self.rx_colons = new RegExp('\:[a-zA-Z0-9-_+]+\:(\:skin-tone-[2-6]\:)?', 'g');
		self.map.colons = {};
		for (var i in self.data){
			for (var j=0; j<self.data[i][3].length; j++){
				self.map.colons[self.data[i][3][j]] = i;
			}
		}
	};

	// initializes the unified unicode emoticon data
	/** @private */
	emoji.prototype.init_unified = function(){
		var self = this;
		if (self.inits.unified) return;
		self.inits.unified = 1;

		var a = [];
		self.map.unicode = {};
		self.map.unified_vars = {};

		for (var i in self.data){
			for (var j=0; j<self.data[i][0].length; j++){
				a.push(self.data[i][0][j].replace('*', '\\*'));
                self.map.unicode[self.data[i][0][j]] = {
                    unified: i,
                    category: self.data[i][8],
                    order: self.data[i][9]
                };
			}
		}
		for (var i in self.variations_data){
			// skip simple append-style skin tones
			if (self.variations_data[i]['1f3fb'][0] == i+'-1f3fb') continue;

			for (var k in self.variations_data[i]){
				for (var j=0; j<self.variations_data[i][k][4].length; j++){
					a.push(self.variations_data[i][k][4][j].replace('*', '\\*'));
					self.map.unified_vars[self.variations_data[i][k][4][j]] = [i, k];
				}
			}
		}

		a = a.sort(function(a,b){
			 return b.length - a.length;
		});

		self.rx_unified = new RegExp('('+a.join('|')+')(\uD83C[\uDFFB-\uDFFF])?', "g");
	};

	// initializes the environment, figuring out what representation
	// of emoticons is best.
	/** @private */
	emoji.prototype.init_env = function(){
		var self = this;
		if (self.inits.env) return;
		self.inits.env = 1;
		self.replace_mode = 'img';
		self.supports_css = false;
		if (typeof(navigator) !== 'undefined') {
			var ua = navigator.userAgent;
			if (typeof window !== 'undefined' && window.getComputedStyle){
				try {
					var st = window.getComputedStyle(document.body);
					if (st['background-size'] || st['backgroundSize']){
						self.supports_css = true;
					}
				} catch(e){
					// Swallow an exception caused by hidden iFrames on Firefox
					// https://github.com/iamcal/js-emoji/issues/73
					if (ua.match(/Firefox/i)){
						self.supports_css = true;
					}
				}
			}
			if (ua.match(/(iPhone|iPod|iPad|iPhone\s+Simulator)/i)){
				if (ua.match(/OS\s+[12345]/i)){
					self.replace_mode = 'softbank';
					return;
				}
				if (ua.match(/OS\s+[6789]/i)){
					self.replace_mode = 'unified';
					return;
				}
			}
			if (ua.match(/Mac OS X 10[._ ](?:[789]|1\d)/i)){
				self.replace_mode = 'unified';
				return;
			}
			if (!self.avoid_ms_emoji){
				if (ua.match(/Windows NT 6.[1-9]/i) || ua.match(/Windows NT 10.[0-9]/i)){
					if (!ua.match(/Chrome/i) && !ua.match(/MSIE 8/i)){
						self.replace_mode = 'unified';
						return;
					}
				}
			}
		}

		// Need a better way to detect android devices that actually
		// support emoji.
		if (false && ua.match(/Android/i)){
			self.replace_mode = 'google';
			return;
		}
		if (self.supports_css){
			self.replace_mode = 'css';
		}
		// nothing fancy detected - use images
	};
	/** @private */
	emoji.prototype.escape_rx = function(text){
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	emoji.prototype.sheet_size = 52;
	/** @private */
	emoji.prototype.data = {"2614":[["☔"],"","󾀂",["umbrella_with_rain_drops"],47,23,63,0,"Travel & Places",193],"2615":[["☕"],"","󾦁",["coffee"],47,24,63,0,"Food & Drink",91],"2648":[["♈"],"","󾀫",["aries"],47,44,63,0,"Symbols",60],"2649":[["♉"],"","󾀬",["taurus"],47,45,63,0,"Symbols",61],"2650":[["♐"],"","󾀳",["sagittarius"],48,0,63,0,"Symbols",68],"2651":[["♑"],"","󾀴",["capricorn"],48,1,63,0,"Symbols",69],"2652":[["♒"],"","󾀵",["aquarius"],48,2,63,0,"Symbols",70],"2653":[["♓"],"","󾀶",["pisces"],48,3,63,0,"Symbols",71],"2693":[["⚓"],"","󾓁",["anchor"],48,12,63,0,"Travel & Places",105],"2705":[["✅"],"","󾭊",["white_check_mark"],49,15,63,0,"Symbols",107],"2728":[["✨"],"","󾭠",["sparkles"],49,48,63,0,"Activities",6],"2753":[["❓"],"","󾬉",["question"],50,3,63,0,"Symbols",124],"2754":[["❔"],"","󾬊",["grey_question"],50,4,63,0,"Symbols",125],"2755":[["❕"],"","󾬋",["grey_exclamation"],50,5,63,0,"Symbols",126],"2757":[["❗"],"","󾬄",["exclamation","heavy_exclamation_mark"],50,6,63,0,"Symbols",127],"2795":[["➕"],"","󾭑",["heavy_plus_sign"],50,9,63,0,"Symbols",113],"2796":[["➖"],"","󾭒",["heavy_minus_sign"],50,10,63,0,"Symbols",114],"2797":[["➗"],"","󾭔",["heavy_division_sign"],50,11,63,0,"Symbols",115],"0023-fe0f-20e3":[["#️⃣","#⃣"],"","󾠬",["hash"],0,0,15,0,"Symbols",132],"002a-fe0f-20e3":[["*️⃣","*⃣"],"","",["keycap_star"],0,1,15,0,"Symbols",133],"0030-fe0f-20e3":[["0️⃣","0⃣"],"","󾠷",["zero"],0,2,15,0,"Symbols",134],"0031-fe0f-20e3":[["1️⃣","1⃣"],"","󾠮",["one"],0,3,15,0,"Symbols",135],"0032-fe0f-20e3":[["2️⃣","2⃣"],"","󾠯",["two"],0,4,15,0,"Symbols",136],"0033-fe0f-20e3":[["3️⃣","3⃣"],"","󾠰",["three"],0,5,15,0,"Symbols",137],"0034-fe0f-20e3":[["4️⃣","4⃣"],"","󾠱",["four"],0,6,15,0,"Symbols",138],"0035-fe0f-20e3":[["5️⃣","5⃣"],"","󾠲",["five"],0,7,15,0,"Symbols",139],"0036-fe0f-20e3":[["6️⃣","6⃣"],"","󾠳",["six"],0,8,15,0,"Symbols",140],"0037-fe0f-20e3":[["7️⃣","7⃣"],"","󾠴",["seven"],0,9,15,0,"Symbols",141],"0038-fe0f-20e3":[["8️⃣","8⃣"],"","󾠵",["eight"],0,10,15,0,"Symbols",142],"0039-fe0f-20e3":[["9️⃣","9⃣"],"","󾠶",["nine"],0,11,15,0,"Symbols",143],"00a9-fe0f":[["©️","©"],"","󾬩",["copyright"],0,12,11,0,"Symbols",129],"00ae-fe0f":[["®️","®"],"","󾬭",["registered"],0,13,11,0,"Symbols",130],"1f004":[["🀄"],"","󾠋",["mahjong"],0,14,63,0,"Activities",70],"1f0cf":[["🃏"],"","󾠒",["black_joker"],0,15,63,0,"Activities",69],"1f170-fe0f":[["🅰️","🅰"],"","󾔋",["a"],0,16,63,0,"Symbols",151],"1f171-fe0f":[["🅱️","🅱"],"","󾔌",["b"],0,17,63,0,"Symbols",153],"1f17e-fe0f":[["🅾️","🅾"],"","󾔎",["o2"],0,18,63,0,"Symbols",162],"1f17f-fe0f":[["🅿️","🅿"],"","󾟶",["parking"],0,19,63,0,"Symbols",164],"1f18e":[["🆎"],"","󾔍",["ab"],0,20,63,0,"Symbols",152],"1f191":[["🆑"],"","󾮄",["cl"],0,21,63,0,"Symbols",154],"1f192":[["🆒"],"","󾬸",["cool"],0,22,63,0,"Symbols",155],"1f193":[["🆓"],"","󾬡",["free"],0,23,63,0,"Symbols",156],"1f194":[["🆔"],"","󾮁",["id"],0,24,63,0,"Symbols",158],"1f195":[["🆕"],"","󾬶",["new"],0,25,63,0,"Symbols",160],"1f196":[["🆖"],"","󾬨",["ng"],0,26,63,0,"Symbols",161],"1f197":[["🆗"],"","󾬧",["ok"],0,27,63,0,"Symbols",163],"1f198":[["🆘"],"","󾭏",["sos"],0,28,63,0,"Symbols",165],"1f199":[["🆙"],"","󾬷",["up"],0,29,63,0,"Symbols",166],"1f19a":[["🆚"],"","󾬲",["vs"],0,30,63,0,"Symbols",167],"1f1e6-1f1e8":[["🇦🇨"],"","",["flag-ac"],0,31,63,0,"Flags",8],"1f1e6-1f1e9":[["🇦🇩"],"","",["flag-ad"],0,32,63,0,"Flags",9],"1f1e6-1f1ea":[["🇦🇪"],"","",["flag-ae"],0,33,63,0,"Flags",10],"1f1e6-1f1eb":[["🇦🇫"],"","",["flag-af"],0,34,63,0,"Flags",11],"1f1e6-1f1ec":[["🇦🇬"],"","",["flag-ag"],0,35,63,0,"Flags",12],"1f1e6-1f1ee":[["🇦🇮"],"","",["flag-ai"],0,36,63,0,"Flags",13],"1f1e6-1f1f1":[["🇦🇱"],"","",["flag-al"],0,37,63,0,"Flags",14],"1f1e6-1f1f2":[["🇦🇲"],"","",["flag-am"],0,38,63,0,"Flags",15],"1f1e6-1f1f4":[["🇦🇴"],"","",["flag-ao"],0,39,63,0,"Flags",16],"1f1e6-1f1f6":[["🇦🇶"],"","",["flag-aq"],0,40,63,0,"Flags",17],"1f1e6-1f1f7":[["🇦🇷"],"","",["flag-ar"],0,41,63,0,"Flags",18],"1f1e6-1f1f8":[["🇦🇸"],"","",["flag-as"],0,42,63,0,"Flags",19],"1f1e6-1f1f9":[["🇦🇹"],"","",["flag-at"],0,43,63,0,"Flags",20],"1f1e6-1f1fa":[["🇦🇺"],"","",["flag-au"],0,44,63,0,"Flags",21],"1f1e6-1f1fc":[["🇦🇼"],"","",["flag-aw"],0,45,63,0,"Flags",22],"1f1e6-1f1fd":[["🇦🇽"],"","",["flag-ax"],0,46,63,0,"Flags",23],"1f1e6-1f1ff":[["🇦🇿"],"","",["flag-az"],0,47,63,0,"Flags",24],"1f1e7-1f1e6":[["🇧🇦"],"","",["flag-ba"],0,48,31,0,"Flags",25],"1f1e7-1f1e7":[["🇧🇧"],"","",["flag-bb"],0,49,63,0,"Flags",26],"1f1e7-1f1e9":[["🇧🇩"],"","",["flag-bd"],0,50,63,0,"Flags",27],"1f1e7-1f1ea":[["🇧🇪"],"","",["flag-be"],0,51,63,0,"Flags",28],"1f1e7-1f1eb":[["🇧🇫"],"","",["flag-bf"],1,0,63,0,"Flags",29],"1f1e7-1f1ec":[["🇧🇬"],"","",["flag-bg"],1,1,63,0,"Flags",30],"1f1e7-1f1ed":[["🇧🇭"],"","",["flag-bh"],1,2,63,0,"Flags",31],"1f1e7-1f1ee":[["🇧🇮"],"","",["flag-bi"],1,3,63,0,"Flags",32],"1f1e7-1f1ef":[["🇧🇯"],"","",["flag-bj"],1,4,63,0,"Flags",33],"1f1e7-1f1f1":[["🇧🇱"],"","",["flag-bl"],1,5,61,0,"Flags",34],"1f1e7-1f1f2":[["🇧🇲"],"","",["flag-bm"],1,6,63,0,"Flags",35],"1f1e7-1f1f3":[["🇧🇳"],"","",["flag-bn"],1,7,31,0,"Flags",36],"1f1e7-1f1f4":[["🇧🇴"],"","",["flag-bo"],1,8,63,0,"Flags",37],"1f1e7-1f1f6":[["🇧🇶"],"","",["flag-bq"],1,9,61,0,"Flags",38],"1f1e7-1f1f7":[["🇧🇷"],"","",["flag-br"],1,10,63,0,"Flags",39],"1f1e7-1f1f8":[["🇧🇸"],"","",["flag-bs"],1,11,63,0,"Flags",40],"1f1e7-1f1f9":[["🇧🇹"],"","",["flag-bt"],1,12,63,0,"Flags",41],"1f1e7-1f1fb":[["🇧🇻"],"","",["flag-bv"],1,13,63,0,"Flags",42],"1f1e7-1f1fc":[["🇧🇼"],"","",["flag-bw"],1,14,63,0,"Flags",43],"1f1e7-1f1fe":[["🇧🇾"],"","",["flag-by"],1,15,63,0,"Flags",44],"1f1e7-1f1ff":[["🇧🇿"],"","",["flag-bz"],1,16,63,0,"Flags",45],"1f1e8-1f1e6":[["🇨🇦"],"","",["flag-ca"],1,17,63,0,"Flags",46],"1f1e8-1f1e8":[["🇨🇨"],"","",["flag-cc"],1,18,63,0,"Flags",47],"1f1e8-1f1e9":[["🇨🇩"],"","",["flag-cd"],1,19,63,0,"Flags",48],"1f1e8-1f1eb":[["🇨🇫"],"","",["flag-cf"],1,20,63,0,"Flags",49],"1f1e8-1f1ec":[["🇨🇬"],"","",["flag-cg"],1,21,63,0,"Flags",50],"1f1e8-1f1ed":[["🇨🇭"],"","",["flag-ch"],1,22,63,0,"Flags",51],"1f1e8-1f1ee":[["🇨🇮"],"","",["flag-ci"],1,23,63,0,"Flags",52],"1f1e8-1f1f0":[["🇨🇰"],"","",["flag-ck"],1,24,63,0,"Flags",53],"1f1e8-1f1f1":[["🇨🇱"],"","",["flag-cl"],1,25,63,0,"Flags",54],"1f1e8-1f1f2":[["🇨🇲"],"","",["flag-cm"],1,26,63,0,"Flags",55],"1f1e8-1f1f3":[["🇨🇳"],"","󾓭",["cn","flag-cn"],1,27,63,0,"Flags",56],"1f1e8-1f1f4":[["🇨🇴"],"","",["flag-co"],1,28,63,0,"Flags",57],"1f1e8-1f1f5":[["🇨🇵"],"","",["flag-cp"],1,29,31,0,"Flags",58],"1f1e8-1f1f7":[["🇨🇷"],"","",["flag-cr"],1,30,63,0,"Flags",59],"1f1e8-1f1fa":[["🇨🇺"],"","",["flag-cu"],1,31,63,0,"Flags",60],"1f1e8-1f1fb":[["🇨🇻"],"","",["flag-cv"],1,32,63,0,"Flags",61],"1f1e8-1f1fc":[["🇨🇼"],"","",["flag-cw"],1,33,63,0,"Flags",62],"1f1e8-1f1fd":[["🇨🇽"],"","",["flag-cx"],1,34,63,0,"Flags",63],"1f1e8-1f1fe":[["🇨🇾"],"","",["flag-cy"],1,35,63,0,"Flags",64],"1f1e8-1f1ff":[["🇨🇿"],"","",["flag-cz"],1,36,63,0,"Flags",65],"1f1e9-1f1ea":[["🇩🇪"],"","󾓨",["de","flag-de"],1,37,63,0,"Flags",66],"1f1e9-1f1ec":[["🇩🇬"],"","",["flag-dg"],1,38,61,0,"Flags",67],"1f1e9-1f1ef":[["🇩🇯"],"","",["flag-dj"],1,39,63,0,"Flags",68],"1f1e9-1f1f0":[["🇩🇰"],"","",["flag-dk"],1,40,63,0,"Flags",69],"1f1e9-1f1f2":[["🇩🇲"],"","",["flag-dm"],1,41,63,0,"Flags",70],"1f1e9-1f1f4":[["🇩🇴"],"","",["flag-do"],1,42,63,0,"Flags",71],"1f1e9-1f1ff":[["🇩🇿"],"","",["flag-dz"],1,43,63,0,"Flags",72],"1f1ea-1f1e6":[["🇪🇦"],"","",["flag-ea"],1,44,61,0,"Flags",73],"1f1ea-1f1e8":[["🇪🇨"],"","",["flag-ec"],1,45,63,0,"Flags",74],"1f1ea-1f1ea":[["🇪🇪"],"","",["flag-ee"],1,46,63,0,"Flags",75],"1f1ea-1f1ec":[["🇪🇬"],"","",["flag-eg"],1,47,63,0,"Flags",76],"1f1ea-1f1ed":[["🇪🇭"],"","",["flag-eh"],1,48,61,0,"Flags",77],"1f1ea-1f1f7":[["🇪🇷"],"","",["flag-er"],1,49,63,0,"Flags",78],"1f1ea-1f1f8":[["🇪🇸"],"","󾓫",["es","flag-es"],1,50,63,0,"Flags",79],"1f1ea-1f1f9":[["🇪🇹"],"","",["flag-et"],1,51,63,0,"Flags",80],"1f1ea-1f1fa":[["🇪🇺"],"","",["flag-eu"],2,0,63,0,"Flags",81],"1f1eb-1f1ee":[["🇫🇮"],"","",["flag-fi"],2,1,63,0,"Flags",82],"1f1eb-1f1ef":[["🇫🇯"],"","",["flag-fj"],2,2,63,0,"Flags",83],"1f1eb-1f1f0":[["🇫🇰"],"","",["flag-fk"],2,3,61,0,"Flags",84],"1f1eb-1f1f2":[["🇫🇲"],"","",["flag-fm"],2,4,63,0,"Flags",85],"1f1eb-1f1f4":[["🇫🇴"],"","",["flag-fo"],2,5,63,0,"Flags",86],"1f1eb-1f1f7":[["🇫🇷"],"","󾓧",["fr","flag-fr"],2,6,63,0,"Flags",87],"1f1ec-1f1e6":[["🇬🇦"],"","",["flag-ga"],2,7,63,0,"Flags",88],"1f1ec-1f1e7":[["🇬🇧"],"","󾓪",["gb","uk","flag-gb"],2,8,63,0,"Flags",89],"1f1ec-1f1e9":[["🇬🇩"],"","",["flag-gd"],2,9,63,0,"Flags",90],"1f1ec-1f1ea":[["🇬🇪"],"","",["flag-ge"],2,10,63,0,"Flags",91],"1f1ec-1f1eb":[["🇬🇫"],"","",["flag-gf"],2,11,61,0,"Flags",92],"1f1ec-1f1ec":[["🇬🇬"],"","",["flag-gg"],2,12,63,0,"Flags",93],"1f1ec-1f1ed":[["🇬🇭"],"","",["flag-gh"],2,13,63,0,"Flags",94],"1f1ec-1f1ee":[["🇬🇮"],"","",["flag-gi"],2,14,63,0,"Flags",95],"1f1ec-1f1f1":[["🇬🇱"],"","",["flag-gl"],2,15,63,0,"Flags",96],"1f1ec-1f1f2":[["🇬🇲"],"","",["flag-gm"],2,16,63,0,"Flags",97],"1f1ec-1f1f3":[["🇬🇳"],"","",["flag-gn"],2,17,63,0,"Flags",98],"1f1ec-1f1f5":[["🇬🇵"],"","",["flag-gp"],2,18,61,0,"Flags",99],"1f1ec-1f1f6":[["🇬🇶"],"","",["flag-gq"],2,19,63,0,"Flags",100],"1f1ec-1f1f7":[["🇬🇷"],"","",["flag-gr"],2,20,63,0,"Flags",101],"1f1ec-1f1f8":[["🇬🇸"],"","",["flag-gs"],2,21,61,0,"Flags",102],"1f1ec-1f1f9":[["🇬🇹"],"","",["flag-gt"],2,22,63,0,"Flags",103],"1f1ec-1f1fa":[["🇬🇺"],"","",["flag-gu"],2,23,63,0,"Flags",104],"1f1ec-1f1fc":[["🇬🇼"],"","",["flag-gw"],2,24,63,0,"Flags",105],"1f1ec-1f1fe":[["🇬🇾"],"","",["flag-gy"],2,25,63,0,"Flags",106],"1f1ed-1f1f0":[["🇭🇰"],"","",["flag-hk"],2,26,63,0,"Flags",107],"1f1ed-1f1f2":[["🇭🇲"],"","",["flag-hm"],2,27,63,0,"Flags",108],"1f1ed-1f1f3":[["🇭🇳"],"","",["flag-hn"],2,28,63,0,"Flags",109],"1f1ed-1f1f7":[["🇭🇷"],"","",["flag-hr"],2,29,63,0,"Flags",110],"1f1ed-1f1f9":[["🇭🇹"],"","",["flag-ht"],2,30,63,0,"Flags",111],"1f1ed-1f1fa":[["🇭🇺"],"","",["flag-hu"],2,31,63,0,"Flags",112],"1f1ee-1f1e8":[["🇮🇨"],"","",["flag-ic"],2,32,63,0,"Flags",113],"1f1ee-1f1e9":[["🇮🇩"],"","",["flag-id"],2,33,63,0,"Flags",114],"1f1ee-1f1ea":[["🇮🇪"],"","",["flag-ie"],2,34,63,0,"Flags",115],"1f1ee-1f1f1":[["🇮🇱"],"","",["flag-il"],2,35,63,0,"Flags",116],"1f1ee-1f1f2":[["🇮🇲"],"","",["flag-im"],2,36,63,0,"Flags",117],"1f1ee-1f1f3":[["🇮🇳"],"","",["flag-in"],2,37,63,0,"Flags",118],"1f1ee-1f1f4":[["🇮🇴"],"","",["flag-io"],2,38,63,0,"Flags",119],"1f1ee-1f1f6":[["🇮🇶"],"","",["flag-iq"],2,39,63,0,"Flags",120],"1f1ee-1f1f7":[["🇮🇷"],"","",["flag-ir"],2,40,63,0,"Flags",121],"1f1ee-1f1f8":[["🇮🇸"],"","",["flag-is"],2,41,63,0,"Flags",122],"1f1ee-1f1f9":[["🇮🇹"],"","󾓩",["it","flag-it"],2,42,63,0,"Flags",123],"1f1ef-1f1ea":[["🇯🇪"],"","",["flag-je"],2,43,63,0,"Flags",124],"1f1ef-1f1f2":[["🇯🇲"],"","",["flag-jm"],2,44,63,0,"Flags",125],"1f1ef-1f1f4":[["🇯🇴"],"","",["flag-jo"],2,45,63,0,"Flags",126],"1f1ef-1f1f5":[["🇯🇵"],"","󾓥",["jp","flag-jp"],2,46,63,0,"Flags",127],"1f1f0-1f1ea":[["🇰🇪"],"","",["flag-ke"],2,47,63,0,"Flags",128],"1f1f0-1f1ec":[["🇰🇬"],"","",["flag-kg"],2,48,63,0,"Flags",129],"1f1f0-1f1ed":[["🇰🇭"],"","",["flag-kh"],2,49,63,0,"Flags",130],"1f1f0-1f1ee":[["🇰🇮"],"","",["flag-ki"],2,50,63,0,"Flags",131],"1f1f0-1f1f2":[["🇰🇲"],"","",["flag-km"],2,51,63,0,"Flags",132],"1f1f0-1f1f3":[["🇰🇳"],"","",["flag-kn"],3,0,63,0,"Flags",133],"1f1f0-1f1f5":[["🇰🇵"],"","",["flag-kp"],3,1,63,0,"Flags",134],"1f1f0-1f1f7":[["🇰🇷"],"","󾓮",["kr","flag-kr"],3,2,63,0,"Flags",135],"1f1f0-1f1fc":[["🇰🇼"],"","",["flag-kw"],3,3,63,0,"Flags",136],"1f1f0-1f1fe":[["🇰🇾"],"","",["flag-ky"],3,4,63,0,"Flags",137],"1f1f0-1f1ff":[["🇰🇿"],"","",["flag-kz"],3,5,63,0,"Flags",138],"1f1f1-1f1e6":[["🇱🇦"],"","",["flag-la"],3,6,63,0,"Flags",139],"1f1f1-1f1e7":[["🇱🇧"],"","",["flag-lb"],3,7,63,0,"Flags",140],"1f1f1-1f1e8":[["🇱🇨"],"","",["flag-lc"],3,8,63,0,"Flags",141],"1f1f1-1f1ee":[["🇱🇮"],"","",["flag-li"],3,9,63,0,"Flags",142],"1f1f1-1f1f0":[["🇱🇰"],"","",["flag-lk"],3,10,63,0,"Flags",143],"1f1f1-1f1f7":[["🇱🇷"],"","",["flag-lr"],3,11,63,0,"Flags",144],"1f1f1-1f1f8":[["🇱🇸"],"","",["flag-ls"],3,12,63,0,"Flags",145],"1f1f1-1f1f9":[["🇱🇹"],"","",["flag-lt"],3,13,63,0,"Flags",146],"1f1f1-1f1fa":[["🇱🇺"],"","",["flag-lu"],3,14,63,0,"Flags",147],"1f1f1-1f1fb":[["🇱🇻"],"","",["flag-lv"],3,15,63,0,"Flags",148],"1f1f1-1f1fe":[["🇱🇾"],"","",["flag-ly"],3,16,63,0,"Flags",149],"1f1f2-1f1e6":[["🇲🇦"],"","",["flag-ma"],3,17,63,0,"Flags",150],"1f1f2-1f1e8":[["🇲🇨"],"","",["flag-mc"],3,18,63,0,"Flags",151],"1f1f2-1f1e9":[["🇲🇩"],"","",["flag-md"],3,19,63,0,"Flags",152],"1f1f2-1f1ea":[["🇲🇪"],"","",["flag-me"],3,20,63,0,"Flags",153],"1f1f2-1f1eb":[["🇲🇫"],"","",["flag-mf"],3,21,61,0,"Flags",154],"1f1f2-1f1ec":[["🇲🇬"],"","",["flag-mg"],3,22,63,0,"Flags",155],"1f1f2-1f1ed":[["🇲🇭"],"","",["flag-mh"],3,23,63,0,"Flags",156],"1f1f2-1f1f0":[["🇲🇰"],"","",["flag-mk"],3,24,63,0,"Flags",157],"1f1f2-1f1f1":[["🇲🇱"],"","",["flag-ml"],3,25,63,0,"Flags",158],"1f1f2-1f1f2":[["🇲🇲"],"","",["flag-mm"],3,26,63,0,"Flags",159],"1f1f2-1f1f3":[["🇲🇳"],"","",["flag-mn"],3,27,63,0,"Flags",160],"1f1f2-1f1f4":[["🇲🇴"],"","",["flag-mo"],3,28,63,0,"Flags",161],"1f1f2-1f1f5":[["🇲🇵"],"","",["flag-mp"],3,29,63,0,"Flags",162],"1f1f2-1f1f6":[["🇲🇶"],"","",["flag-mq"],3,30,61,0,"Flags",163],"1f1f2-1f1f7":[["🇲🇷"],"","",["flag-mr"],3,31,63,0,"Flags",164],"1f1f2-1f1f8":[["🇲🇸"],"","",["flag-ms"],3,32,63,0,"Flags",165],"1f1f2-1f1f9":[["🇲🇹"],"","",["flag-mt"],3,33,63,0,"Flags",166],"1f1f2-1f1fa":[["🇲🇺"],"","",["flag-mu"],3,34,63,0,"Flags",167],"1f1f2-1f1fb":[["🇲🇻"],"","",["flag-mv"],3,35,63,0,"Flags",168],"1f1f2-1f1fc":[["🇲🇼"],"","",["flag-mw"],3,36,63,0,"Flags",169],"1f1f2-1f1fd":[["🇲🇽"],"","",["flag-mx"],3,37,63,0,"Flags",170],"1f1f2-1f1fe":[["🇲🇾"],"","",["flag-my"],3,38,63,0,"Flags",171],"1f1f2-1f1ff":[["🇲🇿"],"","",["flag-mz"],3,39,63,0,"Flags",172],"1f1f3-1f1e6":[["🇳🇦"],"","",["flag-na"],3,40,63,0,"Flags",173],"1f1f3-1f1e8":[["🇳🇨"],"","",["flag-nc"],3,41,61,0,"Flags",174],"1f1f3-1f1ea":[["🇳🇪"],"","",["flag-ne"],3,42,63,0,"Flags",175],"1f1f3-1f1eb":[["🇳🇫"],"","",["flag-nf"],3,43,63,0,"Flags",176],"1f1f3-1f1ec":[["🇳🇬"],"","",["flag-ng"],3,44,63,0,"Flags",177],"1f1f3-1f1ee":[["🇳🇮"],"","",["flag-ni"],3,45,63,0,"Flags",178],"1f1f3-1f1f1":[["🇳🇱"],"","",["flag-nl"],3,46,63,0,"Flags",179],"1f1f3-1f1f4":[["🇳🇴"],"","",["flag-no"],3,47,63,0,"Flags",180],"1f1f3-1f1f5":[["🇳🇵"],"","",["flag-np"],3,48,63,0,"Flags",181],"1f1f3-1f1f7":[["🇳🇷"],"","",["flag-nr"],3,49,63,0,"Flags",182],"1f1f3-1f1fa":[["🇳🇺"],"","",["flag-nu"],3,50,63,0,"Flags",183],"1f1f3-1f1ff":[["🇳🇿"],"","",["flag-nz"],3,51,63,0,"Flags",184],"1f1f4-1f1f2":[["🇴🇲"],"","",["flag-om"],4,0,63,0,"Flags",185],"1f1f5-1f1e6":[["🇵🇦"],"","",["flag-pa"],4,1,63,0,"Flags",186],"1f1f5-1f1ea":[["🇵🇪"],"","",["flag-pe"],4,2,63,0,"Flags",187],"1f1f5-1f1eb":[["🇵🇫"],"","",["flag-pf"],4,3,63,0,"Flags",188],"1f1f5-1f1ec":[["🇵🇬"],"","",["flag-pg"],4,4,63,0,"Flags",189],"1f1f5-1f1ed":[["🇵🇭"],"","",["flag-ph"],4,5,63,0,"Flags",190],"1f1f5-1f1f0":[["🇵🇰"],"","",["flag-pk"],4,6,63,0,"Flags",191],"1f1f5-1f1f1":[["🇵🇱"],"","",["flag-pl"],4,7,63,0,"Flags",192],"1f1f5-1f1f2":[["🇵🇲"],"","",["flag-pm"],4,8,61,0,"Flags",193],"1f1f5-1f1f3":[["🇵🇳"],"","",["flag-pn"],4,9,63,0,"Flags",194],"1f1f5-1f1f7":[["🇵🇷"],"","",["flag-pr"],4,10,63,0,"Flags",195],"1f1f5-1f1f8":[["🇵🇸"],"","",["flag-ps"],4,11,63,0,"Flags",196],"1f1f5-1f1f9":[["🇵🇹"],"","",["flag-pt"],4,12,63,0,"Flags",197],"1f1f5-1f1fc":[["🇵🇼"],"","",["flag-pw"],4,13,63,0,"Flags",198],"1f1f5-1f1fe":[["🇵🇾"],"","",["flag-py"],4,14,63,0,"Flags",199],"1f1f6-1f1e6":[["🇶🇦"],"","",["flag-qa"],4,15,63,0,"Flags",200],"1f1f7-1f1ea":[["🇷🇪"],"","",["flag-re"],4,16,61,0,"Flags",201],"1f1f7-1f1f4":[["🇷🇴"],"","",["flag-ro"],4,17,63,0,"Flags",202],"1f1f7-1f1f8":[["🇷🇸"],"","",["flag-rs"],4,18,63,0,"Flags",203],"1f1f7-1f1fa":[["🇷🇺"],"","󾓬",["ru","flag-ru"],4,19,63,0,"Flags",204],"1f1f7-1f1fc":[["🇷🇼"],"","",["flag-rw"],4,20,63,0,"Flags",205],"1f1f8-1f1e6":[["🇸🇦"],"","",["flag-sa"],4,21,63,0,"Flags",206],"1f1f8-1f1e7":[["🇸🇧"],"","",["flag-sb"],4,22,63,0,"Flags",207],"1f1f8-1f1e8":[["🇸🇨"],"","",["flag-sc"],4,23,63,0,"Flags",208],"1f1f8-1f1e9":[["🇸🇩"],"","",["flag-sd"],4,24,63,0,"Flags",209],"1f1f8-1f1ea":[["🇸🇪"],"","",["flag-se"],4,25,63,0,"Flags",210],"1f1f8-1f1ec":[["🇸🇬"],"","",["flag-sg"],4,26,63,0,"Flags",211],"1f1f8-1f1ed":[["🇸🇭"],"","",["flag-sh"],4,27,63,0,"Flags",212],"1f1f8-1f1ee":[["🇸🇮"],"","",["flag-si"],4,28,63,0,"Flags",213],"1f1f8-1f1ef":[["🇸🇯"],"","",["flag-sj"],4,29,63,0,"Flags",214],"1f1f8-1f1f0":[["🇸🇰"],"","",["flag-sk"],4,30,63,0,"Flags",215],"1f1f8-1f1f1":[["🇸🇱"],"","",["flag-sl"],4,31,63,0,"Flags",216],"1f1f8-1f1f2":[["🇸🇲"],"","",["flag-sm"],4,32,63,0,"Flags",217],"1f1f8-1f1f3":[["🇸🇳"],"","",["flag-sn"],4,33,63,0,"Flags",218],"1f1f8-1f1f4":[["🇸🇴"],"","",["flag-so"],4,34,63,0,"Flags",219],"1f1f8-1f1f7":[["🇸🇷"],"","",["flag-sr"],4,35,63,0,"Flags",220],"1f1f8-1f1f8":[["🇸🇸"],"","",["flag-ss"],4,36,63,0,"Flags",221],"1f1f8-1f1f9":[["🇸🇹"],"","",["flag-st"],4,37,63,0,"Flags",222],"1f1f8-1f1fb":[["🇸🇻"],"","",["flag-sv"],4,38,63,0,"Flags",223],"1f1f8-1f1fd":[["🇸🇽"],"","",["flag-sx"],4,39,63,0,"Flags",224],"1f1f8-1f1fe":[["🇸🇾"],"","",["flag-sy"],4,40,63,0,"Flags",225],"1f1f8-1f1ff":[["🇸🇿"],"","",["flag-sz"],4,41,63,0,"Flags",226],"1f1f9-1f1e6":[["🇹🇦"],"","",["flag-ta"],4,42,63,0,"Flags",227],"1f1f9-1f1e8":[["🇹🇨"],"","",["flag-tc"],4,43,63,0,"Flags",228],"1f1f9-1f1e9":[["🇹🇩"],"","",["flag-td"],4,44,63,0,"Flags",229],"1f1f9-1f1eb":[["🇹🇫"],"","",["flag-tf"],4,45,61,0,"Flags",230],"1f1f9-1f1ec":[["🇹🇬"],"","",["flag-tg"],4,46,63,0,"Flags",231],"1f1f9-1f1ed":[["🇹🇭"],"","",["flag-th"],4,47,63,0,"Flags",232],"1f1f9-1f1ef":[["🇹🇯"],"","",["flag-tj"],4,48,63,0,"Flags",233],"1f1f9-1f1f0":[["🇹🇰"],"","",["flag-tk"],4,49,63,0,"Flags",234],"1f1f9-1f1f1":[["🇹🇱"],"","",["flag-tl"],4,50,63,0,"Flags",235],"1f1f9-1f1f2":[["🇹🇲"],"","",["flag-tm"],4,51,63,0,"Flags",236],"1f1f9-1f1f3":[["🇹🇳"],"","",["flag-tn"],5,0,63,0,"Flags",237],"1f1f9-1f1f4":[["🇹🇴"],"","",["flag-to"],5,1,63,0,"Flags",238],"1f1f9-1f1f7":[["🇹🇷"],"","",["flag-tr"],5,2,63,0,"Flags",239],"1f1f9-1f1f9":[["🇹🇹"],"","",["flag-tt"],5,3,63,0,"Flags",240],"1f1f9-1f1fb":[["🇹🇻"],"","",["flag-tv"],5,4,63,0,"Flags",241],"1f1f9-1f1fc":[["🇹🇼"],"","",["flag-tw"],5,5,63,0,"Flags",242],"1f1f9-1f1ff":[["🇹🇿"],"","",["flag-tz"],5,6,63,0,"Flags",243],"1f1fa-1f1e6":[["🇺🇦"],"","",["flag-ua"],5,7,63,0,"Flags",244],"1f1fa-1f1ec":[["🇺🇬"],"","",["flag-ug"],5,8,63,0,"Flags",245],"1f1fa-1f1f2":[["🇺🇲"],"","",["flag-um"],5,9,63,0,"Flags",246],"1f1fa-1f1f3":[["🇺🇳"],"","",["flag-un"],5,10,30,0,"Flags",247],"1f1fa-1f1f8":[["🇺🇸"],"","󾓦",["us","flag-us"],5,11,63,0,"Flags",248],"1f1fa-1f1fe":[["🇺🇾"],"","",["flag-uy"],5,12,63,0,"Flags",249],"1f1fa-1f1ff":[["🇺🇿"],"","",["flag-uz"],5,13,63,0,"Flags",250],"1f1fb-1f1e6":[["🇻🇦"],"","",["flag-va"],5,14,63,0,"Flags",251],"1f1fb-1f1e8":[["🇻🇨"],"","",["flag-vc"],5,15,63,0,"Flags",252],"1f1fb-1f1ea":[["🇻🇪"],"","",["flag-ve"],5,16,63,0,"Flags",253],"1f1fb-1f1ec":[["🇻🇬"],"","",["flag-vg"],5,17,63,0,"Flags",254],"1f1fb-1f1ee":[["🇻🇮"],"","",["flag-vi"],5,18,63,0,"Flags",255],"1f1fb-1f1f3":[["🇻🇳"],"","",["flag-vn"],5,19,63,0,"Flags",256],"1f1fb-1f1fa":[["🇻🇺"],"","",["flag-vu"],5,20,63,0,"Flags",257],"1f1fc-1f1eb":[["🇼🇫"],"","",["flag-wf"],5,21,61,0,"Flags",258],"1f1fc-1f1f8":[["🇼🇸"],"","",["flag-ws"],5,22,63,0,"Flags",259],"1f1fd-1f1f0":[["🇽🇰"],"","",["flag-xk"],5,23,61,0,"Flags",260],"1f1fe-1f1ea":[["🇾🇪"],"","",["flag-ye"],5,24,63,0,"Flags",261],"1f1fe-1f1f9":[["🇾🇹"],"","",["flag-yt"],5,25,61,0,"Flags",262],"1f1ff-1f1e6":[["🇿🇦"],"","",["flag-za"],5,26,63,0,"Flags",263],"1f1ff-1f1f2":[["🇿🇲"],"","",["flag-zm"],5,27,63,0,"Flags",264],"1f1ff-1f1fc":[["🇿🇼"],"","",["flag-zw"],5,28,63,0,"Flags",265],"1f201":[["🈁"],"","󾬤",["koko"],5,29,63,0,"Symbols",168],"1f202-fe0f":[["🈂️","🈂"],"","󾬿",["sa"],5,30,63,0,"Symbols",169],"1f21a":[["🈚"],"","󾬺",["u7121"],5,31,63,0,"Symbols",175],"1f22f":[["🈯"],"","󾭀",["u6307"],5,32,63,0,"Symbols",172],"1f232":[["🈲"],"","󾬮",["u7981"],5,33,63,0,"Symbols",176],"1f233":[["🈳"],"","󾬯",["u7a7a"],5,34,63,0,"Symbols",180],"1f234":[["🈴"],"","󾬰",["u5408"],5,35,63,0,"Symbols",179],"1f235":[["🈵"],"","󾬱",["u6e80"],5,36,63,0,"Symbols",184],"1f236":[["🈶"],"","󾬹",["u6709"],5,37,63,0,"Symbols",171],"1f237-fe0f":[["🈷️","🈷"],"","󾬻",["u6708"],5,38,63,0,"Symbols",170],"1f238":[["🈸"],"","󾬼",["u7533"],5,39,63,0,"Symbols",178],"1f239":[["🈹"],"","󾬾",["u5272"],5,40,63,0,"Symbols",174],"1f23a":[["🈺"],"","󾭁",["u55b6"],5,41,63,0,"Symbols",183],"1f250":[["🉐"],"","󾬽",["ideograph_advantage"],5,42,63,0,"Symbols",173],"1f251":[["🉑"],"","󾭐",["accept"],5,43,63,0,"Symbols",177],"1f300":[["🌀"],"","󾀅",["cyclone"],5,44,63,0,"Travel & Places",189],"1f301":[["🌁"],"","󾀆",["foggy"],5,45,63,0,"Travel & Places",48],"1f302":[["🌂"],"","󾀇",["closed_umbrella"],5,46,63,0,"Travel & Places",191],"1f303":[["🌃"],"","󾀈",["night_with_stars"],5,47,63,0,"Travel & Places",49],"1f304":[["🌄"],"","󾀉",["sunrise_over_mountains"],5,48,63,0,"Travel & Places",51],"1f305":[["🌅"],"","󾀊",["sunrise"],5,49,63,0,"Travel & Places",52],"1f306":[["🌆"],"","󾀋",["city_sunset"],5,50,63,0,"Travel & Places",53],"1f307":[["🌇"],"","󾀌",["city_sunrise"],5,51,63,0,"Travel & Places",54],"1f308":[["🌈"],"","󾀍",["rainbow"],6,0,63,0,"Travel & Places",190],"1f309":[["🌉"],"","󾀐",["bridge_at_night"],6,1,63,0,"Travel & Places",55],"1f30a":[["🌊"],"","󾀸",["ocean"],6,2,63,0,"Travel & Places",202],"1f30b":[["🌋"],"","󾀺",["volcano"],6,3,63,0,"Travel & Places",10],"1f30c":[["🌌"],"","󾀻",["milky_way"],6,4,63,0,"Travel & Places",57],"1f30d":[["🌍"],"","",["earth_africa"],6,5,63,0,"Travel & Places",1],"1f30e":[["🌎"],"","",["earth_americas"],6,6,63,0,"Travel & Places",2],"1f30f":[["🌏"],"","󾀹",["earth_asia"],6,7,63,0,"Travel & Places",3],"1f310":[["🌐"],"","",["globe_with_meridians"],6,8,63,0,"Travel & Places",4],"1f311":[["🌑"],"","󾀑",["new_moon"],6,9,63,0,"Travel & Places",158],"1f312":[["🌒"],"","",["waxing_crescent_moon"],6,10,63,0,"Travel & Places",159],"1f313":[["🌓"],"","󾀓",["first_quarter_moon"],6,11,63,0,"Travel & Places",160],"1f314":[["🌔"],"","󾀒",["moon","waxing_gibbous_moon"],6,12,63,0,"Travel & Places",161],"1f315":[["🌕"],"","󾀕",["full_moon"],6,13,63,0,"Travel & Places",162],"1f316":[["🌖"],"","",["waning_gibbous_moon"],6,14,63,0,"Travel & Places",163],"1f317":[["🌗"],"","",["last_quarter_moon"],6,15,63,0,"Travel & Places",164],"1f318":[["🌘"],"","",["waning_crescent_moon"],6,16,63,0,"Travel & Places",165],"1f319":[["🌙"],"","󾀔",["crescent_moon"],6,17,63,0,"Travel & Places",166],"1f31a":[["🌚"],"","",["new_moon_with_face"],6,18,63,0,"Travel & Places",167],"1f31b":[["🌛"],"","󾀖",["first_quarter_moon_with_face"],6,19,63,0,"Travel & Places",168],"1f31c":[["🌜"],"","",["last_quarter_moon_with_face"],6,20,63,0,"Travel & Places",169],"1f31d":[["🌝"],"","",["full_moon_with_face"],6,21,63,0,"Travel & Places",172],"1f31e":[["🌞"],"","",["sun_with_face"],6,22,63,0,"Travel & Places",173],"1f31f":[["🌟"],"","󾭩",["star2"],6,23,63,0,"Travel & Places",175],"1f320":[["🌠"],"","󾭪",["stars"],6,24,63,0,"Travel & Places",176],"1f321-fe0f":[["🌡️","🌡"],"","",["thermometer"],6,25,31,0,"Travel & Places",170],"1f324-fe0f":[["🌤️","🌤"],"","",["mostly_sunny","sun_small_cloud"],6,26,31,0,"Travel & Places",180],"1f325-fe0f":[["🌥️","🌥"],"","",["barely_sunny","sun_behind_cloud"],6,27,31,0,"Travel & Places",181],"1f326-fe0f":[["🌦️","🌦"],"","",["partly_sunny_rain","sun_behind_rain_cloud"],6,28,31,0,"Travel & Places",182],"1f327-fe0f":[["🌧️","🌧"],"","",["rain_cloud"],6,29,31,0,"Travel & Places",183],"1f328-fe0f":[["🌨️","🌨"],"","",["snow_cloud"],6,30,31,0,"Travel & Places",184],"1f329-fe0f":[["🌩️","🌩"],"","",["lightning","lightning_cloud"],6,31,31,0,"Travel & Places",185],"1f32a-fe0f":[["🌪️","🌪"],"","",["tornado","tornado_cloud"],6,32,31,0,"Travel & Places",186],"1f32b-fe0f":[["🌫️","🌫"],"","",["fog"],6,33,31,0,"Travel & Places",187],"1f32c-fe0f":[["🌬️","🌬"],"","",["wind_blowing_face"],6,34,31,0,"Travel & Places",188],"1f32d":[["🌭"],"","",["hotdog"],6,35,31,0,"Food & Drink",44],"1f32e":[["🌮"],"","",["taco"],6,36,31,0,"Food & Drink",46],"1f32f":[["🌯"],"","",["burrito"],6,37,31,0,"Food & Drink",47],"1f330":[["🌰"],"","󾁌",["chestnut"],6,38,63,0,"Food & Drink",29],"1f331":[["🌱"],"","󾀾",["seedling"],6,39,63,0,"Animals & Nature",113],"1f332":[["🌲"],"","",["evergreen_tree"],6,40,63,0,"Animals & Nature",114],"1f333":[["🌳"],"","",["deciduous_tree"],6,41,63,0,"Animals & Nature",115],"1f334":[["🌴"],"","󾁇",["palm_tree"],6,42,63,0,"Animals & Nature",116],"1f335":[["🌵"],"","󾁈",["cactus"],6,43,63,0,"Animals & Nature",117],"1f336-fe0f":[["🌶️","🌶"],"","",["hot_pepper"],6,44,31,0,"Food & Drink",23],"1f337":[["🌷"],"","󾀽",["tulip"],6,45,63,0,"Animals & Nature",112],"1f338":[["🌸"],"","󾁀",["cherry_blossom"],6,46,63,0,"Animals & Nature",104],"1f339":[["🌹"],"","󾁁",["rose"],6,47,63,0,"Animals & Nature",107],"1f33a":[["🌺"],"","󾁅",["hibiscus"],6,48,63,0,"Animals & Nature",109],"1f33b":[["🌻"],"","󾁆",["sunflower"],6,49,63,0,"Animals & Nature",110],"1f33c":[["🌼"],"","󾁍",["blossom"],6,50,63,0,"Animals & Nature",111],"1f33d":[["🌽"],"","󾁊",["corn"],6,51,63,0,"Food & Drink",22],"1f33e":[["🌾"],"","󾁉",["ear_of_rice"],7,0,63,0,"Animals & Nature",118],"1f33f":[["🌿"],"","󾁎",["herb"],7,1,63,0,"Animals & Nature",119],"1f340":[["🍀"],"","󾀼",["four_leaf_clover"],7,2,63,0,"Animals & Nature",121],"1f341":[["🍁"],"","󾀿",["maple_leaf"],7,3,63,0,"Animals & Nature",122],"1f342":[["🍂"],"","󾁂",["fallen_leaf"],7,4,63,0,"Animals & Nature",123],"1f343":[["🍃"],"","󾁃",["leaves"],7,5,63,0,"Animals & Nature",124],"1f344":[["🍄"],"","󾁋",["mushroom"],7,6,63,0,"Food & Drink",27],"1f345":[["🍅"],"","󾁕",["tomato"],7,7,63,0,"Food & Drink",16],"1f346":[["🍆"],"","󾁖",["eggplant"],7,8,63,0,"Food & Drink",19],"1f347":[["🍇"],"","󾁙",["grapes"],7,9,63,0,"Food & Drink",1],"1f348":[["🍈"],"","󾁗",["melon"],7,10,63,0,"Food & Drink",2],"1f349":[["🍉"],"","󾁔",["watermelon"],7,11,63,0,"Food & Drink",3],"1f34a":[["🍊"],"","󾁒",["tangerine"],7,12,63,0,"Food & Drink",4],"1f34b":[["🍋"],"","",["lemon"],7,13,63,0,"Food & Drink",5],"1f34c":[["🍌"],"","󾁐",["banana"],7,14,63,0,"Food & Drink",6],"1f34d":[["🍍"],"","󾁘",["pineapple"],7,15,63,0,"Food & Drink",7],"1f34e":[["🍎"],"","󾁑",["apple"],7,16,63,0,"Food & Drink",9],"1f34f":[["🍏"],"","󾁛",["green_apple"],7,17,63,0,"Food & Drink",10],"1f350":[["🍐"],"","",["pear"],7,18,63,0,"Food & Drink",11],"1f351":[["🍑"],"","󾁚",["peach"],7,19,63,0,"Food & Drink",12],"1f352":[["🍒"],"","󾁏",["cherries"],7,20,63,0,"Food & Drink",13],"1f353":[["🍓"],"","󾁓",["strawberry"],7,21,63,0,"Food & Drink",14],"1f354":[["🍔"],"","󾥠",["hamburger"],7,22,63,0,"Food & Drink",41],"1f355":[["🍕"],"","󾥵",["pizza"],7,23,63,0,"Food & Drink",43],"1f356":[["🍖"],"","󾥲",["meat_on_bone"],7,24,63,0,"Food & Drink",37],"1f357":[["🍗"],"","󾥶",["poultry_leg"],7,25,63,0,"Food & Drink",38],"1f358":[["🍘"],"","󾥩",["rice_cracker"],7,26,63,0,"Food & Drink",59],"1f359":[["🍙"],"","󾥡",["rice_ball"],7,27,63,0,"Food & Drink",60],"1f35a":[["🍚"],"","󾥪",["rice"],7,28,63,0,"Food & Drink",61],"1f35b":[["🍛"],"","󾥬",["curry"],7,29,63,0,"Food & Drink",62],"1f35c":[["🍜"],"","󾥣",["ramen"],7,30,63,0,"Food & Drink",63],"1f35d":[["🍝"],"","󾥫",["spaghetti"],7,31,63,0,"Food & Drink",64],"1f35e":[["🍞"],"","󾥤",["bread"],7,32,63,0,"Food & Drink",30],"1f35f":[["🍟"],"","󾥧",["fries"],7,33,63,0,"Food & Drink",42],"1f360":[["🍠"],"","󾥴",["sweet_potato"],7,34,63,0,"Food & Drink",65],"1f361":[["🍡"],"","󾥨",["dango"],7,35,63,0,"Food & Drink",71],"1f362":[["🍢"],"","󾥭",["oden"],7,36,63,0,"Food & Drink",66],"1f363":[["🍣"],"","󾥮",["sushi"],7,37,63,0,"Food & Drink",67],"1f364":[["🍤"],"","󾥿",["fried_shrimp"],7,38,63,0,"Food & Drink",68],"1f365":[["🍥"],"","󾥳",["fish_cake"],7,39,63,0,"Food & Drink",69],"1f366":[["🍦"],"","󾥦",["icecream"],7,40,63,0,"Food & Drink",75],"1f367":[["🍧"],"","󾥱",["shaved_ice"],7,41,63,0,"Food & Drink",76],"1f368":[["🍨"],"","󾥷",["ice_cream"],7,42,63,0,"Food & Drink",77],"1f369":[["🍩"],"","󾥸",["doughnut"],7,43,63,0,"Food & Drink",78],"1f36a":[["🍪"],"","󾥹",["cookie"],7,44,63,0,"Food & Drink",79],"1f36b":[["🍫"],"","󾥺",["chocolate_bar"],7,45,63,0,"Food & Drink",84],"1f36c":[["🍬"],"","󾥻",["candy"],7,46,63,0,"Food & Drink",85],"1f36d":[["🍭"],"","󾥼",["lollipop"],7,47,63,0,"Food & Drink",86],"1f36e":[["🍮"],"","󾥽",["custard"],7,48,63,0,"Food & Drink",87],"1f36f":[["🍯"],"","󾥾",["honey_pot"],7,49,63,0,"Food & Drink",88],"1f370":[["🍰"],"","󾥢",["cake"],7,50,63,0,"Food & Drink",81],"1f371":[["🍱"],"","󾥯",["bento"],7,51,63,0,"Food & Drink",58],"1f372":[["🍲"],"","󾥰",["stew"],8,0,63,0,"Food & Drink",52],"1f373":[["🍳"],"","󾥥",["fried_egg","cooking"],8,1,63,0,"Food & Drink",50],"1f374":[["🍴"],"","󾦀",["fork_and_knife"],8,2,63,0,"Food & Drink",105],"1f375":[["🍵"],"","󾦄",["tea"],8,3,63,0,"Food & Drink",92],"1f376":[["🍶"],"","󾦅",["sake"],8,4,63,0,"Food & Drink",93],"1f377":[["🍷"],"","󾦆",["wine_glass"],8,5,63,0,"Food & Drink",95],"1f378":[["🍸"],"","󾦂",["cocktail"],8,6,63,0,"Food & Drink",96],"1f379":[["🍹"],"","󾦈",["tropical_drink"],8,7,63,0,"Food & Drink",97],"1f37a":[["🍺"],"","󾦃",["beer"],8,8,63,0,"Food & Drink",98],"1f37b":[["🍻"],"","󾦇",["beers"],8,9,63,0,"Food & Drink",99],"1f37c":[["🍼"],"","",["baby_bottle"],8,10,63,0,"Food & Drink",89],"1f37d-fe0f":[["🍽️","🍽"],"","",["knife_fork_plate"],8,11,31,0,"Food & Drink",104],"1f37e":[["🍾"],"","",["champagne"],8,12,31,0,"Food & Drink",94],"1f37f":[["🍿"],"","",["popcorn"],8,13,31,0,"Food & Drink",55],"1f380":[["🎀"],"","󾔏",["ribbon"],8,14,63,0,"Activities",17],"1f381":[["🎁"],"","󾔐",["gift"],8,15,63,0,"Activities",18],"1f382":[["🎂"],"","󾔑",["birthday"],8,16,63,0,"Food & Drink",80],"1f383":[["🎃"],"","󾔟",["jack_o_lantern"],8,17,63,0,"Activities",1],"1f384":[["🎄"],"","󾔒",["christmas_tree"],8,18,63,0,"Activities",2],"1f385":[["🎅"],"","󾔓",["santa"],8,19,63,0,"Smileys & People",192],"1f386":[["🎆"],"","󾔕",["fireworks"],8,25,63,0,"Activities",3],"1f387":[["🎇"],"","󾔝",["sparkler"],8,26,63,0,"Activities",4],"1f388":[["🎈"],"","󾔖",["balloon"],8,27,63,0,"Activities",7],"1f389":[["🎉"],"","󾔗",["tada"],8,28,63,0,"Activities",8],"1f38a":[["🎊"],"","󾔠",["confetti_ball"],8,29,63,0,"Activities",9],"1f38b":[["🎋"],"","󾔡",["tanabata_tree"],8,30,63,0,"Activities",10],"1f38c":[["🎌"],"","󾔔",["crossed_flags"],8,31,63,0,"Flags",3],"1f38d":[["🎍"],"","󾔘",["bamboo"],8,32,63,0,"Activities",11],"1f38e":[["🎎"],"","󾔙",["dolls"],8,33,63,0,"Activities",12],"1f38f":[["🎏"],"","󾔜",["flags"],8,34,63,0,"Activities",13],"1f390":[["🎐"],"","󾔞",["wind_chime"],8,35,63,0,"Activities",14],"1f391":[["🎑"],"","󾀗",["rice_scene"],8,36,63,0,"Activities",15],"1f392":[["🎒"],"","󾔛",["school_satchel"],8,37,63,0,"Smileys & People",456],"1f393":[["🎓"],"","󾔚",["mortar_board"],8,38,63,0,"Smileys & People",467],"1f396-fe0f":[["🎖️","🎖"],"","",["medal"],8,39,31,0,"Activities",22],"1f397-fe0f":[["🎗️","🎗"],"","",["reminder_ribbon"],8,40,31,0,"Activities",19],"1f399-fe0f":[["🎙️","🎙"],"","",["studio_microphone"],8,41,31,0,"Objects",13],"1f39a-fe0f":[["🎚️","🎚"],"","",["level_slider"],8,42,31,0,"Objects",14],"1f39b-fe0f":[["🎛️","🎛"],"","",["control_knobs"],8,43,31,0,"Objects",15],"1f39e-fe0f":[["🎞️","🎞"],"","",["film_frames"],8,44,31,0,"Objects",45],"1f39f-fe0f":[["🎟️","🎟"],"","",["admission_tickets"],8,45,31,0,"Activities",20],"1f3a0":[["🎠"],"","󾟼",["carousel_horse"],8,46,63,0,"Travel & Places",58],"1f3a1":[["🎡"],"","󾟽",["ferris_wheel"],8,47,63,0,"Travel & Places",59],"1f3a2":[["🎢"],"","󾟾",["roller_coaster"],8,48,63,0,"Travel & Places",60],"1f3a3":[["🎣"],"","󾟿",["fishing_pole_and_fish"],8,49,63,0,"Activities",49],"1f3a4":[["🎤"],"","󾠀",["microphone"],8,50,63,0,"Objects",16],"1f3a5":[["🎥"],"","󾠁",["movie_camera"],8,51,63,0,"Objects",44],"1f3a6":[["🎦"],"","󾠂",["cinema"],9,0,63,0,"Symbols",91],"1f3a7":[["🎧"],"","󾠃",["headphones"],9,1,63,0,"Objects",17],"1f3a8":[["🎨"],"","󾠄",["art"],9,2,63,0,"Activities",74],"1f3a9":[["🎩"],"","󾠅",["tophat"],9,3,63,0,"Smileys & People",466],"1f3aa":[["🎪"],"","󾠆",["circus_tent"],9,4,63,0,"Travel & Places",62],"1f3ab":[["🎫"],"","󾠇",["ticket"],9,5,63,0,"Activities",21],"1f3ac":[["🎬"],"","󾠈",["clapper"],9,6,63,0,"Objects",47],"1f3ad":[["🎭"],"","󾠉",["performing_arts"],9,7,63,0,"Activities",72],"1f3ae":[["🎮"],"","󾠊",["video_game"],9,8,63,0,"Activities",58],"1f3af":[["🎯"],"","󾠌",["dart"],9,9,63,0,"Activities",54],"1f3b0":[["🎰"],"","󾠍",["slot_machine"],9,10,63,0,"Activities",60],"1f3b1":[["🎱"],"","󾠎",["8ball"],9,11,63,0,"Activities",55],"1f3b2":[["🎲"],"","󾠏",["game_die"],9,12,63,0,"Activities",61],"1f3b3":[["🎳"],"","󾠐",["bowling"],9,13,63,0,"Activities",37],"1f3b4":[["🎴"],"","󾠑",["flower_playing_cards"],9,14,63,0,"Activities",71],"1f3b5":[["🎵"],"","󾠓",["musical_note"],9,15,63,0,"Objects",11],"1f3b6":[["🎶"],"","󾠔",["notes"],9,16,63,0,"Objects",12],"1f3b7":[["🎷"],"","󾠕",["saxophone"],9,17,63,0,"Objects",19],"1f3b8":[["🎸"],"","󾠖",["guitar"],9,18,63,0,"Objects",20],"1f3b9":[["🎹"],"","󾠗",["musical_keyboard"],9,19,63,0,"Objects",21],"1f3ba":[["🎺"],"","󾠘",["trumpet"],9,20,63,0,"Objects",22],"1f3bb":[["🎻"],"","󾠙",["violin"],9,21,63,0,"Objects",23],"1f3bc":[["🎼"],"","󾠚",["musical_score"],9,22,63,0,"Objects",10],"1f3bd":[["🎽"],"","󾟐",["running_shirt_with_sash"],9,23,63,0,"Activities",50],"1f3be":[["🎾"],"","󾟓",["tennis"],9,24,63,0,"Activities",35],"1f3bf":[["🎿"],"","󾟕",["ski"],9,25,63,0,"Activities",51],"1f3c0":[["🏀"],"","󾟖",["basketball"],9,26,63,0,"Activities",31],"1f3c1":[["🏁"],"","󾟗",["checkered_flag"],9,27,63,0,"Flags",1],"1f3c2":[["🏂"],"","󾟘",["snowboarder"],9,28,63,0,"Smileys & People",281],"1f3c3-200d-2640-fe0f":[["🏃‍♀️","🏃‍♀"],"","",["woman-running"],9,34,31,0,"Smileys & People",257],"1f3c3-200d-2642-fe0f":[["🏃‍♂️","🏃‍♂","🏃"],"","",["man-running","runner","running"],9,40,31,0,"Smileys & People",256],"1f3c4-200d-2640-fe0f":[["🏄‍♀️","🏄‍♀"],"","",["woman-surfing"],10,0,31,0,"Smileys & People",287],"1f3c4-200d-2642-fe0f":[["🏄‍♂️","🏄‍♂","🏄"],"","",["man-surfing","surfer"],10,6,31,0,"Smileys & People",286],"1f3c5":[["🏅"],"","",["sports_medal"],10,18,31,0,"Activities",24],"1f3c6":[["🏆"],"","󾟛",["trophy"],10,19,63,0,"Activities",23],"1f3c7":[["🏇"],"","",["horse_racing"],10,20,63,0,"Smileys & People",279],"1f3c8":[["🏈"],"","󾟝",["football"],10,26,63,0,"Activities",33],"1f3c9":[["🏉"],"","",["rugby_football"],10,27,63,0,"Activities",34],"1f3ca-200d-2640-fe0f":[["🏊‍♀️","🏊‍♀"],"","",["woman-swimming"],10,28,31,0,"Smileys & People",293],"1f3ca-200d-2642-fe0f":[["🏊‍♂️","🏊‍♂","🏊"],"","",["man-swimming","swimmer"],10,34,31,0,"Smileys & People",292],"1f3cb-fe0f-200d-2640-fe0f":[["🏋️‍♀️"],"","",["woman-lifting-weights"],10,46,15,0,"Smileys & People",299],"1f3cb-fe0f-200d-2642-fe0f":[["🏋️‍♂️","🏋️","🏋"],"","",["man-lifting-weights","weight_lifter"],11,0,15,0,"Smileys & People",298],"1f3cc-fe0f-200d-2640-fe0f":[["🏌️‍♀️"],"","",["woman-golfing"],11,12,15,0,"Smileys & People",284],"1f3cc-fe0f-200d-2642-fe0f":[["🏌️‍♂️","🏌️","🏌"],"","",["man-golfing","golfer"],11,18,15,0,"Smileys & People",283],"1f3cd-fe0f":[["🏍️","🏍"],"","",["racing_motorcycle"],11,30,31,0,"Smileys & People",307],"1f3ce-fe0f":[["🏎️","🏎"],"","",["racing_car"],11,31,31,0,"Smileys & People",306],"1f3cf":[["🏏"],"","",["cricket_bat_and_ball"],11,32,31,0,"Activities",38],"1f3d0":[["🏐"],"","",["volleyball"],11,33,31,0,"Activities",32],"1f3d1":[["🏑"],"","",["field_hockey_stick_and_ball"],11,34,31,0,"Activities",39],"1f3d2":[["🏒"],"","",["ice_hockey_stick_and_puck"],11,35,31,0,"Activities",40],"1f3d3":[["🏓"],"","",["table_tennis_paddle_and_ball"],11,36,31,0,"Activities",42],"1f3d4-fe0f":[["🏔️","🏔"],"","",["snow_capped_mountain"],11,37,31,0,"Travel & Places",8],"1f3d5-fe0f":[["🏕️","🏕"],"","",["camping"],11,38,31,0,"Travel & Places",12],"1f3d6-fe0f":[["🏖️","🏖"],"","",["beach_with_umbrella"],11,39,31,0,"Travel & Places",13],"1f3d7-fe0f":[["🏗️","🏗"],"","",["building_construction"],11,40,31,0,"Travel & Places",19],"1f3d8-fe0f":[["🏘️","🏘"],"","",["house_buildings"],11,41,31,0,"Travel & Places",21],"1f3d9-fe0f":[["🏙️","🏙"],"","",["cityscape"],11,42,31,0,"Travel & Places",50],"1f3da-fe0f":[["🏚️","🏚"],"","",["derelict_house_building"],11,43,31,0,"Travel & Places",22],"1f3db-fe0f":[["🏛️","🏛"],"","",["classical_building"],11,44,31,0,"Travel & Places",18],"1f3dc-fe0f":[["🏜️","🏜"],"","",["desert"],11,45,31,0,"Travel & Places",14],"1f3dd-fe0f":[["🏝️","🏝"],"","",["desert_island"],11,46,31,0,"Travel & Places",15],"1f3de-fe0f":[["🏞️","🏞"],"","",["national_park"],11,47,31,0,"Travel & Places",16],"1f3df-fe0f":[["🏟️","🏟"],"","",["stadium"],11,48,31,0,"Travel & Places",17],"1f3e0":[["🏠"],"","󾒰",["house"],11,49,63,0,"Travel & Places",23],"1f3e1":[["🏡"],"","󾒱",["house_with_garden"],11,50,63,0,"Travel & Places",24],"1f3e2":[["🏢"],"","󾒲",["office"],11,51,63,0,"Travel & Places",25],"1f3e3":[["🏣"],"","󾒳",["post_office"],12,0,63,0,"Travel & Places",26],"1f3e4":[["🏤"],"","",["european_post_office"],12,1,63,0,"Travel & Places",27],"1f3e5":[["🏥"],"","󾒴",["hospital"],12,2,63,0,"Travel & Places",28],"1f3e6":[["🏦"],"","󾒵",["bank"],12,3,63,0,"Travel & Places",29],"1f3e7":[["🏧"],"","󾒶",["atm"],12,4,63,0,"Symbols",1],"1f3e8":[["🏨"],"","󾒷",["hotel"],12,5,63,0,"Travel & Places",30],"1f3e9":[["🏩"],"","󾒸",["love_hotel"],12,6,63,0,"Travel & Places",31],"1f3ea":[["🏪"],"","󾒹",["convenience_store"],12,7,63,0,"Travel & Places",32],"1f3eb":[["🏫"],"","󾒺",["school"],12,8,63,0,"Travel & Places",33],"1f3ec":[["🏬"],"","󾒽",["department_store"],12,9,63,0,"Travel & Places",34],"1f3ed":[["🏭"],"","󾓀",["factory"],12,10,63,0,"Travel & Places",35],"1f3ee":[["🏮"],"","󾓂",["izakaya_lantern","lantern"],12,11,63,0,"Objects",58],"1f3ef":[["🏯"],"","󾒾",["japanese_castle"],12,12,63,0,"Travel & Places",36],"1f3f0":[["🏰"],"","󾒿",["european_castle"],12,13,63,0,"Travel & Places",37],"1f3f3-fe0f-200d-1f308":[["🏳️‍🌈","🏳‍🌈"],"","",["rainbow-flag"],12,14,63,0,"Flags",6],"1f3f3-fe0f":[["🏳️","🏳"],"","",["waving_white_flag"],12,15,31,0,"Flags",5],"1f3f4-e0067-e0062-e0065-e006e-e0067-e007f":[["🏴󠁧󠁢󠁥󠁮󠁧󠁿"],"","",["flag-england"],12,16,31,0,"Flags",266],"1f3f4-e0067-e0062-e0073-e0063-e0074-e007f":[["🏴󠁧󠁢󠁳󠁣󠁴󠁿"],"","",["flag-scotland"],12,17,31,0,"Flags",267],"1f3f4-e0067-e0062-e0077-e006c-e0073-e007f":[["🏴󠁧󠁢󠁷󠁬󠁳󠁿"],"","",["flag-wales"],12,18,31,0,"Flags",268],"1f3f4":[["🏴"],"","",["waving_black_flag"],12,19,31,0,"Flags",4],"1f3f5-fe0f":[["🏵️","🏵"],"","",["rosette"],12,20,31,0,"Animals & Nature",106],"1f3f7-fe0f":[["🏷️","🏷"],"","",["label"],12,21,31,0,"Objects",75],"1f3f8":[["🏸"],"","",["badminton_racquet_and_shuttlecock"],12,22,31,0,"Activities",43],"1f3f9":[["🏹"],"","",["bow_and_arrow"],12,23,31,0,"Objects",143],"1f3fa":[["🏺"],"","",["amphora"],12,24,31,0,"Food & Drink",108],"1f3fb":[["🏻"],"","",["skin-tone-2"],12,25,31,0,"Skin Tones",1],"1f3fc":[["🏼"],"","",["skin-tone-3"],12,26,31,0,"Skin Tones",2],"1f3fd":[["🏽"],"","",["skin-tone-4"],12,27,31,0,"Skin Tones",3],"1f3fe":[["🏾"],"","",["skin-tone-5"],12,28,31,0,"Skin Tones",4],"1f3ff":[["🏿"],"","",["skin-tone-6"],12,29,31,0,"Skin Tones",5],"1f400":[["🐀"],"","",["rat"],12,30,63,0,"Animals & Nature",41],"1f401":[["🐁"],"","",["mouse2"],12,31,63,0,"Animals & Nature",40],"1f402":[["🐂"],"","",["ox"],12,32,63,0,"Animals & Nature",22],"1f403":[["🐃"],"","",["water_buffalo"],12,33,63,0,"Animals & Nature",23],"1f404":[["🐄"],"","",["cow2"],12,34,63,0,"Animals & Nature",24],"1f405":[["🐅"],"","",["tiger2"],12,35,63,0,"Animals & Nature",14],"1f406":[["🐆"],"","",["leopard"],12,36,63,0,"Animals & Nature",15],"1f407":[["🐇"],"","",["rabbit2"],12,37,63,0,"Animals & Nature",44],"1f408":[["🐈"],"","",["cat2"],12,38,63,0,"Animals & Nature",11],"1f409":[["🐉"],"","",["dragon"],12,39,63,0,"Animals & Nature",75],"1f40a":[["🐊"],"","",["crocodile"],12,40,63,0,"Animals & Nature",70],"1f40b":[["🐋"],"","",["whale2"],12,41,63,0,"Animals & Nature",79],"1f40c":[["🐌"],"","󾆹",["snail"],12,42,63,0,"Animals & Nature",91],"1f40d":[["🐍"],"","󾇓",["snake"],12,43,63,0,"Animals & Nature",73],"1f40e":[["🐎"],"","󾟜",["racehorse"],12,44,63,0,"Animals & Nature",17],"1f40f":[["🐏"],"","",["ram"],12,45,63,0,"Animals & Nature",29],"1f410":[["🐐"],"","",["goat"],12,46,63,0,"Animals & Nature",31],"1f411":[["🐑"],"","󾇏",["sheep"],12,47,63,0,"Animals & Nature",30],"1f412":[["🐒"],"","󾇎",["monkey"],12,48,63,0,"Animals & Nature",2],"1f413":[["🐓"],"","",["rooster"],12,49,63,0,"Animals & Nature",56],"1f414":[["🐔"],"","󾇔",["chicken"],12,50,63,0,"Animals & Nature",55],"1f415":[["🐕"],"","",["dog2"],12,51,63,0,"Animals & Nature",5],"1f416":[["🐖"],"","",["pig2"],13,0,63,0,"Animals & Nature",26],"1f417":[["🐗"],"","󾇕",["boar"],13,1,63,0,"Animals & Nature",27],"1f418":[["🐘"],"","󾇌",["elephant"],13,2,63,0,"Animals & Nature",36],"1f419":[["🐙"],"","󾇅",["octopus"],13,3,63,0,"Animals & Nature",85],"1f41a":[["🐚"],"","󾇆",["shell"],13,4,63,0,"Animals & Nature",86],"1f41b":[["🐛"],"","󾇋",["bug"],13,5,63,0,"Animals & Nature",93],"1f41c":[["🐜"],"","󾇚",["ant"],13,6,63,0,"Animals & Nature",94],"1f41d":[["🐝"],"","󾇡",["bee","honeybee"],13,7,63,0,"Animals & Nature",95],"1f41e":[["🐞"],"","󾇢",["beetle"],13,8,63,0,"Animals & Nature",96],"1f41f":[["🐟"],"","󾆽",["fish"],13,9,63,0,"Animals & Nature",81],"1f420":[["🐠"],"","󾇉",["tropical_fish"],13,10,63,0,"Animals & Nature",82],"1f421":[["🐡"],"","󾇙",["blowfish"],13,11,63,0,"Animals & Nature",83],"1f422":[["🐢"],"","󾇜",["turtle"],13,12,63,0,"Animals & Nature",71],"1f423":[["🐣"],"","󾇝",["hatching_chick"],13,13,63,0,"Animals & Nature",57],"1f424":[["🐤"],"","󾆺",["baby_chick"],13,14,63,0,"Animals & Nature",58],"1f425":[["🐥"],"","󾆻",["hatched_chick"],13,15,63,0,"Animals & Nature",59],"1f426":[["🐦"],"","󾇈",["bird"],13,16,63,0,"Animals & Nature",60],"1f427":[["🐧"],"","󾆼",["penguin"],13,17,63,0,"Animals & Nature",61],"1f428":[["🐨"],"","󾇍",["koala"],13,18,63,0,"Animals & Nature",49],"1f429":[["🐩"],"","󾇘",["poodle"],13,19,63,0,"Animals & Nature",6],"1f42a":[["🐪"],"","",["dromedary_camel"],13,20,63,0,"Animals & Nature",32],"1f42b":[["🐫"],"","󾇖",["camel"],13,21,63,0,"Animals & Nature",33],"1f42c":[["🐬"],"","󾇇",["dolphin","flipper"],13,22,63,0,"Animals & Nature",80],"1f42d":[["🐭"],"","󾇂",["mouse"],13,23,63,0,"Animals & Nature",39],"1f42e":[["🐮"],"","󾇑",["cow"],13,24,63,0,"Animals & Nature",21],"1f42f":[["🐯"],"","󾇀",["tiger"],13,25,63,0,"Animals & Nature",13],"1f430":[["🐰"],"","󾇒",["rabbit"],13,26,63,0,"Animals & Nature",43],"1f431":[["🐱"],"","󾆸",["cat"],13,27,63,0,"Animals & Nature",10],"1f432":[["🐲"],"","󾇞",["dragon_face"],13,28,63,0,"Animals & Nature",74],"1f433":[["🐳"],"","󾇃",["whale"],13,29,63,0,"Animals & Nature",78],"1f434":[["🐴"],"","󾆾",["horse"],13,30,63,0,"Animals & Nature",16],"1f435":[["🐵"],"","󾇄",["monkey_face"],13,31,63,0,"Animals & Nature",1],"1f436":[["🐶"],"","󾆷",["dog"],13,32,63,0,"Animals & Nature",4],"1f437":[["🐷"],"","󾆿",["pig"],13,33,63,0,"Animals & Nature",25],"1f438":[["🐸"],"","󾇗",["frog"],13,34,63,0,"Animals & Nature",69],"1f439":[["🐹"],"","󾇊",["hamster"],13,35,63,0,"Animals & Nature",42],"1f43a":[["🐺"],"","󾇐",["wolf"],13,36,63,0,"Animals & Nature",7],"1f43b":[["🐻"],"","󾇁",["bear"],13,37,63,0,"Animals & Nature",48],"1f43c":[["🐼"],"","󾇟",["panda_face"],13,38,63,0,"Animals & Nature",50],"1f43d":[["🐽"],"","󾇠",["pig_nose"],13,39,63,0,"Animals & Nature",28],"1f43e":[["🐾"],"","󾇛",["feet","paw_prints"],13,40,63,0,"Animals & Nature",53],"1f43f-fe0f":[["🐿️","🐿"],"","",["chipmunk"],13,41,31,0,"Animals & Nature",45],"1f440":[["👀"],"","󾆐",["eyes"],13,42,63,0,"Smileys & People",398],"1f441-fe0f-200d-1f5e8-fe0f":[["👁️‍🗨️"],"","",["eye-in-speech-bubble"],13,43,11,0,"Smileys & People",400],"1f441-fe0f":[["👁️","👁"],"","",["eye"],13,44,31,0,"Smileys & People",399],"1f442":[["👂"],"","󾆑",["ear"],13,45,63,0,"Smileys & People",395],"1f443":[["👃"],"","󾆒",["nose"],13,51,63,0,"Smileys & People",396],"1f444":[["👄"],"","󾆓",["lips"],14,5,63,0,"Smileys & People",405],"1f445":[["👅"],"","󾆔",["tongue"],14,6,63,0,"Smileys & People",404],"1f446":[["👆"],"","󾮙",["point_up_2"],14,7,63,0,"Smileys & People",367],"1f447":[["👇"],"","󾮚",["point_down"],14,13,63,0,"Smileys & People",369],"1f448":[["👈"],"","󾮛",["point_left"],14,19,63,0,"Smileys & People",364],"1f449":[["👉"],"","󾮜",["point_right"],14,25,63,0,"Smileys & People",365],"1f44a":[["👊"],"","󾮖",["facepunch","punch"],14,31,63,0,"Smileys & People",381],"1f44b":[["👋"],"","󾮝",["wave"],14,37,63,0,"Smileys & People",385],"1f44c":[["👌"],"","󾮟",["ok_hand"],14,43,63,0,"Smileys & People",377],"1f44d":[["👍"],"","󾮗",["+1","thumbsup"],14,49,63,0,"Smileys & People",378],"1f44e":[["👎"],"","󾮠",["-1","thumbsdown"],15,3,63,0,"Smileys & People",379],"1f44f":[["👏"],"","󾮞",["clap"],15,9,63,0,"Smileys & People",388],"1f450":[["👐"],"","󾮡",["open_hands"],15,15,63,0,"Smileys & People",389],"1f451":[["👑"],"","󾓑",["crown"],15,21,63,0,"Smileys & People",464],"1f452":[["👒"],"","󾓔",["womans_hat"],15,22,63,0,"Smileys & People",465],"1f453":[["👓"],"","󾓎",["eyeglasses"],15,23,63,0,"Smileys & People",437],"1f454":[["👔"],"","󾓓",["necktie"],15,24,63,0,"Smileys & People",441],"1f455":[["👕"],"","󾓏",["shirt","tshirt"],15,25,63,0,"Smileys & People",442],"1f456":[["👖"],"","󾓐",["jeans"],15,26,63,0,"Smileys & People",443],"1f457":[["👗"],"","󾓕",["dress"],15,27,63,0,"Smileys & People",448],"1f458":[["👘"],"","󾓙",["kimono"],15,28,63,0,"Smileys & People",449],"1f459":[["👙"],"","󾓚",["bikini"],15,29,63,0,"Smileys & People",450],"1f45a":[["👚"],"","󾓛",["womans_clothes"],15,30,63,0,"Smileys & People",451],"1f45b":[["👛"],"","󾓜",["purse"],15,31,63,0,"Smileys & People",452],"1f45c":[["👜"],"","󾓰",["handbag"],15,32,63,0,"Smileys & People",453],"1f45d":[["👝"],"","󾓱",["pouch"],15,33,63,0,"Smileys & People",454],"1f45e":[["👞"],"","󾓌",["mans_shoe","shoe"],15,34,63,0,"Smileys & People",457],"1f45f":[["👟"],"","󾓍",["athletic_shoe"],15,35,63,0,"Smileys & People",458],"1f460":[["👠"],"","󾓖",["high_heel"],15,36,63,0,"Smileys & People",461],"1f461":[["👡"],"","󾓗",["sandal"],15,37,63,0,"Smileys & People",462],"1f462":[["👢"],"","󾓘",["boot"],15,38,63,0,"Smileys & People",463],"1f463":[["👣"],"","󾕓",["footprints"],15,39,63,0,"Smileys & People",397],"1f464":[["👤"],"","󾆚",["bust_in_silhouette"],15,40,63,0,"Smileys & People",276],"1f465":[["👥"],"","",["busts_in_silhouette"],15,41,63,0,"Smileys & People",277],"1f466":[["👦"],"","󾆛",["boy"],15,42,63,0,"Smileys & People",116],"1f467":[["👧"],"","󾆜",["girl"],15,48,63,0,"Smileys & People",117],"1f468-200d-1f33e":[["👨‍🌾"],"","",["male-farmer"],16,2,31,0,"Smileys & People",132],"1f468-200d-1f373":[["👨‍🍳"],"","",["male-cook"],16,8,31,0,"Smileys & People",134],"1f468-200d-1f393":[["👨‍🎓"],"","",["male-student"],16,14,31,0,"Smileys & People",126],"1f468-200d-1f3a4":[["👨‍🎤"],"","",["male-singer"],16,20,31,0,"Smileys & People",146],"1f468-200d-1f3a8":[["👨‍🎨"],"","",["male-artist"],16,26,31,0,"Smileys & People",148],"1f468-200d-1f3eb":[["👨‍🏫"],"","",["male-teacher"],16,32,31,0,"Smileys & People",128],"1f468-200d-1f3ed":[["👨‍🏭"],"","",["male-factory-worker"],16,38,31,0,"Smileys & People",138],"1f468-200d-1f466-200d-1f466":[["👨‍👦‍👦"],"","",["man-boy-boy"],16,44,31,0,"Smileys & People",351],"1f468-200d-1f466":[["👨‍👦"],"","",["man-boy"],16,45,31,0,"Smileys & People",350],"1f468-200d-1f467-200d-1f466":[["👨‍👧‍👦"],"","",["man-girl-boy"],16,46,31,0,"Smileys & People",353],"1f468-200d-1f467-200d-1f467":[["👨‍👧‍👧"],"","",["man-girl-girl"],16,47,31,0,"Smileys & People",354],"1f468-200d-1f467":[["👨‍👧"],"","",["man-girl"],16,48,31,0,"Smileys & People",352],"1f468-200d-1f468-200d-1f466":[["👨‍👨‍👦"],"","",["man-man-boy"],16,49,63,0,"Smileys & People",340],"1f468-200d-1f468-200d-1f466-200d-1f466":[["👨‍👨‍👦‍👦"],"","",["man-man-boy-boy"],16,50,63,0,"Smileys & People",343],"1f468-200d-1f468-200d-1f467":[["👨‍👨‍👧"],"","",["man-man-girl"],16,51,63,0,"Smileys & People",341],"1f468-200d-1f468-200d-1f467-200d-1f466":[["👨‍👨‍👧‍👦"],"","",["man-man-girl-boy"],17,0,63,0,"Smileys & People",342],"1f468-200d-1f468-200d-1f467-200d-1f467":[["👨‍👨‍👧‍👧"],"","",["man-man-girl-girl"],17,1,63,0,"Smileys & People",344],"1f468-200d-1f469-200d-1f466":[["👨‍👩‍👦","👪"],"","",["man-woman-boy","family"],17,2,63,0,"Smileys & People",335],"1f468-200d-1f469-200d-1f466-200d-1f466":[["👨‍👩‍👦‍👦"],"","",["man-woman-boy-boy"],17,3,63,0,"Smileys & People",338],"1f468-200d-1f469-200d-1f467":[["👨‍👩‍👧"],"","",["man-woman-girl"],17,4,63,0,"Smileys & People",336],"1f468-200d-1f469-200d-1f467-200d-1f466":[["👨‍👩‍👧‍👦"],"","",["man-woman-girl-boy"],17,5,63,0,"Smileys & People",337],"1f468-200d-1f469-200d-1f467-200d-1f467":[["👨‍👩‍👧‍👧"],"","",["man-woman-girl-girl"],17,6,63,0,"Smileys & People",339],"1f468-200d-1f4bb":[["👨‍💻"],"","",["male-technologist"],17,7,31,0,"Smileys & People",144],"1f468-200d-1f4bc":[["👨‍💼"],"","",["male-office-worker"],17,13,31,0,"Smileys & People",140],"1f468-200d-1f527":[["👨‍🔧"],"","",["male-mechanic"],17,19,31,0,"Smileys & People",136],"1f468-200d-1f52c":[["👨‍🔬"],"","",["male-scientist"],17,25,31,0,"Smileys & People",142],"1f468-200d-1f680":[["👨‍🚀"],"","",["male-astronaut"],17,31,31,0,"Smileys & People",152],"1f468-200d-1f692":[["👨‍🚒"],"","",["male-firefighter"],17,37,31,0,"Smileys & People",154],"1f468-200d-2695-fe0f":[["👨‍⚕️","👨‍⚕"],"","",["male-doctor"],17,43,31,0,"Smileys & People",124],"1f468-200d-2696-fe0f":[["👨‍⚖️","👨‍⚖"],"","",["male-judge"],17,49,31,0,"Smileys & People",130],"1f468-200d-2708-fe0f":[["👨‍✈️","👨‍✈"],"","",["male-pilot"],18,3,31,0,"Smileys & People",150],"1f468-200d-2764-fe0f-200d-1f468":[["👨‍❤️‍👨","👨‍❤‍👨"],"","",["man-heart-man"],18,9,63,0,"Smileys & People",332],"1f468-200d-2764-fe0f-200d-1f48b-200d-1f468":[["👨‍❤️‍💋‍👨","👨‍❤‍💋‍👨"],"","",["man-kiss-man"],18,10,63,0,"Smileys & People",328],"1f468":[["👨"],"","󾆝",["man"],18,11,63,0,"Smileys & People",119],"1f469-200d-1f33e":[["👩‍🌾"],"","",["female-farmer"],18,17,31,0,"Smileys & People",133],"1f469-200d-1f373":[["👩‍🍳"],"","",["female-cook"],18,23,31,0,"Smileys & People",135],"1f469-200d-1f393":[["👩‍🎓"],"","",["female-student"],18,29,31,0,"Smileys & People",127],"1f469-200d-1f3a4":[["👩‍🎤"],"","",["female-singer"],18,35,31,0,"Smileys & People",147],"1f469-200d-1f3a8":[["👩‍🎨"],"","",["female-artist"],18,41,31,0,"Smileys & People",149],"1f469-200d-1f3eb":[["👩‍🏫"],"","",["female-teacher"],18,47,31,0,"Smileys & People",129],"1f469-200d-1f3ed":[["👩‍🏭"],"","",["female-factory-worker"],19,1,31,0,"Smileys & People",139],"1f469-200d-1f466-200d-1f466":[["👩‍👦‍👦"],"","",["woman-boy-boy"],19,7,31,0,"Smileys & People",356],"1f469-200d-1f466":[["👩‍👦"],"","",["woman-boy"],19,8,31,0,"Smileys & People",355],"1f469-200d-1f467-200d-1f466":[["👩‍👧‍👦"],"","",["woman-girl-boy"],19,9,31,0,"Smileys & People",358],"1f469-200d-1f467-200d-1f467":[["👩‍👧‍👧"],"","",["woman-girl-girl"],19,10,31,0,"Smileys & People",359],"1f469-200d-1f467":[["👩‍👧"],"","",["woman-girl"],19,11,31,0,"Smileys & People",357],"1f469-200d-1f469-200d-1f466":[["👩‍👩‍👦"],"","",["woman-woman-boy"],19,12,63,0,"Smileys & People",345],"1f469-200d-1f469-200d-1f466-200d-1f466":[["👩‍👩‍👦‍👦"],"","",["woman-woman-boy-boy"],19,13,63,0,"Smileys & People",348],"1f469-200d-1f469-200d-1f467":[["👩‍👩‍👧"],"","",["woman-woman-girl"],19,14,63,0,"Smileys & People",346],"1f469-200d-1f469-200d-1f467-200d-1f466":[["👩‍👩‍👧‍👦"],"","",["woman-woman-girl-boy"],19,15,63,0,"Smileys & People",347],"1f469-200d-1f469-200d-1f467-200d-1f467":[["👩‍👩‍👧‍👧"],"","",["woman-woman-girl-girl"],19,16,63,0,"Smileys & People",349],"1f469-200d-1f4bb":[["👩‍💻"],"","",["female-technologist"],19,17,31,0,"Smileys & People",145],"1f469-200d-1f4bc":[["👩‍💼"],"","",["female-office-worker"],19,23,31,0,"Smileys & People",141],"1f469-200d-1f527":[["👩‍🔧"],"","",["female-mechanic"],19,29,31,0,"Smileys & People",137],"1f469-200d-1f52c":[["👩‍🔬"],"","",["female-scientist"],19,35,31,0,"Smileys & People",143],"1f469-200d-1f680":[["👩‍🚀"],"","",["female-astronaut"],19,41,31,0,"Smileys & People",153],"1f469-200d-1f692":[["👩‍🚒"],"","",["female-firefighter"],19,47,31,0,"Smileys & People",155],"1f469-200d-2695-fe0f":[["👩‍⚕️","👩‍⚕"],"","",["female-doctor"],20,1,31,0,"Smileys & People",125],"1f469-200d-2696-fe0f":[["👩‍⚖️","👩‍⚖"],"","",["female-judge"],20,7,31,0,"Smileys & People",131],"1f469-200d-2708-fe0f":[["👩‍✈️","👩‍✈"],"","",["female-pilot"],20,13,31,0,"Smileys & People",151],"1f469-200d-2764-fe0f-200d-1f468":[["👩‍❤️‍👨","👩‍❤‍👨","💑"],"","",["woman-heart-man","couple_with_heart"],20,19,31,0,"Smileys & People",331],"1f469-200d-2764-fe0f-200d-1f469":[["👩‍❤️‍👩","👩‍❤‍👩"],"","",["woman-heart-woman"],20,20,63,0,"Smileys & People",333],"1f469-200d-2764-fe0f-200d-1f48b-200d-1f468":[["👩‍❤️‍💋‍👨","👩‍❤‍💋‍👨","💏"],"","",["woman-kiss-man","couplekiss"],20,21,31,0,"Smileys & People",327],"1f469-200d-2764-fe0f-200d-1f48b-200d-1f469":[["👩‍❤️‍💋‍👩","👩‍❤‍💋‍👩"],"","",["woman-kiss-woman"],20,22,63,0,"Smileys & People",329],"1f469":[["👩"],"","󾆞",["woman"],20,23,63,0,"Smileys & People",120],"1f46b":[["👫"],"","󾆠",["couple","man_and_woman_holding_hands"],20,30,63,0,"Smileys & People",323],"1f46c":[["👬"],"","",["two_men_holding_hands"],20,31,63,0,"Smileys & People",324],"1f46d":[["👭"],"","",["two_women_holding_hands"],20,32,63,0,"Smileys & People",325],"1f46e-200d-2640-fe0f":[["👮‍♀️","👮‍♀"],"","",["female-police-officer"],20,33,31,0,"Smileys & People",158],"1f46e-200d-2642-fe0f":[["👮‍♂️","👮‍♂","👮"],"","",["male-police-officer","cop"],20,39,31,0,"Smileys & People",157],"1f46f-200d-2640-fe0f":[["👯‍♀️","👯‍♀","👯"],"","",["woman-with-bunny-ears-partying","dancers"],20,51,31,0,"Smileys & People",262],"1f46f-200d-2642-fe0f":[["👯‍♂️","👯‍♂"],"","",["man-with-bunny-ears-partying"],21,0,31,0,"Smileys & People",261],"1f470":[["👰"],"","󾆣",["bride_with_veil"],21,2,63,0,"Smileys & People",188],"1f471-200d-2640-fe0f":[["👱‍♀️","👱‍♀"],"","",["blond-haired-woman"],21,8,31,0,"Smileys & People",178],"1f471-200d-2642-fe0f":[["👱‍♂️","👱‍♂","👱"],"","",["blond-haired-man","person_with_blond_hair"],21,14,31,0,"Smileys & People",177],"1f472":[["👲"],"","󾆥",["man_with_gua_pi_mao"],21,26,63,0,"Smileys & People",173],"1f473-200d-2640-fe0f":[["👳‍♀️","👳‍♀"],"","",["woman-wearing-turban"],21,32,31,0,"Smileys & People",172],"1f473-200d-2642-fe0f":[["👳‍♂️","👳‍♂","👳"],"","",["man-wearing-turban","man_with_turban"],21,38,31,0,"Smileys & People",171],"1f474":[["👴"],"","󾆧",["older_man"],21,50,63,0,"Smileys & People",122],"1f475":[["👵"],"","󾆨",["older_woman"],22,4,63,0,"Smileys & People",123],"1f476":[["👶"],"","󾆩",["baby"],22,10,63,0,"Smileys & People",114],"1f477-200d-2640-fe0f":[["👷‍♀️","👷‍♀"],"","",["female-construction-worker"],22,16,31,0,"Smileys & People",167],"1f477-200d-2642-fe0f":[["👷‍♂️","👷‍♂","👷"],"","",["male-construction-worker","construction_worker"],22,22,31,0,"Smileys & People",166],"1f478":[["👸"],"","󾆫",["princess"],22,34,63,0,"Smileys & People",169],"1f479":[["👹"],"","󾆬",["japanese_ogre"],22,40,63,0,"Smileys & People",93],"1f47a":[["👺"],"","󾆭",["japanese_goblin"],22,41,63,0,"Smileys & People",94],"1f47b":[["👻"],"","󾆮",["ghost"],22,42,63,0,"Smileys & People",97],"1f47c":[["👼"],"","󾆯",["angel"],22,43,63,0,"Smileys & People",191],"1f47d":[["👽"],"","󾆰",["alien"],22,49,63,0,"Smileys & People",98],"1f47e":[["👾"],"","󾆱",["space_invader"],22,50,63,0,"Smileys & People",99],"1f47f":[["👿"],"","󾆲",["imp"],22,51,63,0,"Smileys & People",91],"1f480":[["💀"],"","󾆳",["skull"],23,0,63,0,"Smileys & People",95],"1f481-200d-2640-fe0f":[["💁‍♀️","💁‍♀","💁"],"","",["woman-tipping-hand","information_desk_person"],23,1,31,0,"Smileys & People",233],"1f481-200d-2642-fe0f":[["💁‍♂️","💁‍♂"],"","",["man-tipping-hand"],23,7,31,0,"Smileys & People",232],"1f482-200d-2640-fe0f":[["💂‍♀️","💂‍♀"],"","",["female-guard"],23,19,31,0,"Smileys & People",164],"1f482-200d-2642-fe0f":[["💂‍♂️","💂‍♂","💂"],"","",["male-guard","guardsman"],23,25,31,0,"Smileys & People",163],"1f483":[["💃"],"","󾆶",["dancer"],23,37,63,0,"Smileys & People",258],"1f484":[["💄"],"","󾆕",["lipstick"],23,43,63,0,"Smileys & People",471],"1f485":[["💅"],"","󾆖",["nail_care"],23,44,63,0,"Smileys & People",394],"1f486-200d-2640-fe0f":[["💆‍♀️","💆‍♀","💆"],"","",["woman-getting-massage","massage"],23,50,31,0,"Smileys & People",248],"1f486-200d-2642-fe0f":[["💆‍♂️","💆‍♂"],"","",["man-getting-massage"],24,4,31,0,"Smileys & People",247],"1f487-200d-2640-fe0f":[["💇‍♀️","💇‍♀","💇"],"","",["woman-getting-haircut","haircut"],24,16,31,0,"Smileys & People",251],"1f487-200d-2642-fe0f":[["💇‍♂️","💇‍♂"],"","",["man-getting-haircut"],24,22,31,0,"Smileys & People",250],"1f488":[["💈"],"","󾆙",["barber"],24,34,63,0,"Travel & Places",61],"1f489":[["💉"],"","󾔉",["syringe"],24,35,63,0,"Objects",161],"1f48a":[["💊"],"","󾔊",["pill"],24,36,63,0,"Objects",162],"1f48b":[["💋"],"","󾠣",["kiss"],24,37,63,0,"Smileys & People",406],"1f48c":[["💌"],"","󾠤",["love_letter"],24,38,63,0,"Smileys & People",424],"1f48d":[["💍"],"","󾠥",["ring"],24,39,63,0,"Smileys & People",472],"1f48e":[["💎"],"","󾠦",["gem"],24,40,63,0,"Smileys & People",473],"1f490":[["💐"],"","󾠨",["bouquet"],24,42,63,0,"Animals & Nature",103],"1f492":[["💒"],"","󾠪",["wedding"],24,44,63,0,"Travel & Places",38],"1f493":[["💓"],"","󾬍",["heartbeat"],24,45,63,0,"Smileys & People",409],"1f494":[["💔"],"","󾬎",["broken_heart"],24,46,63,0,"</3","Smileys & People",410],"1f495":[["💕"],"","󾬏",["two_hearts"],24,47,63,0,"Smileys & People",411],"1f496":[["💖"],"","󾬐",["sparkling_heart"],24,48,63,0,"Smileys & People",412],"1f497":[["💗"],"","󾬑",["heartpulse"],24,49,63,0,"Smileys & People",413],"1f498":[["💘"],"","󾬒",["cupid"],24,50,63,0,"Smileys & People",407],"1f499":[["💙"],"","󾬓",["blue_heart"],24,51,63,0,"<3","Smileys & People",414],"1f49a":[["💚"],"","󾬔",["green_heart"],25,0,63,0,"<3","Smileys & People",415],"1f49b":[["💛"],"","󾬕",["yellow_heart"],25,1,63,0,"<3","Smileys & People",416],"1f49c":[["💜"],"","󾬖",["purple_heart"],25,2,63,0,"<3","Smileys & People",418],"1f49d":[["💝"],"","󾬗",["gift_heart"],25,3,63,0,"Smileys & People",420],"1f49e":[["💞"],"","󾬘",["revolving_hearts"],25,4,63,0,"Smileys & People",421],"1f49f":[["💟"],"","󾬙",["heart_decoration"],25,5,63,0,"Smileys & People",422],"1f4a0":[["💠"],"","󾭕",["diamond_shape_with_a_dot_inside"],25,6,63,0,"Symbols",199],"1f4a1":[["💡"],"","󾭖",["bulb"],25,7,63,0,"Objects",56],"1f4a2":[["💢"],"","󾭗",["anger"],25,8,63,0,"Smileys & People",426],"1f4a3":[["💣"],"","󾭘",["bomb"],25,9,63,0,"Smileys & People",427],"1f4a4":[["💤"],"","󾭙",["zzz"],25,10,63,0,"Smileys & People",425],"1f4a5":[["💥"],"","󾭚",["boom","collision"],25,11,63,0,"Smileys & People",428],"1f4a6":[["💦"],"","󾭛",["sweat_drops"],25,12,63,0,"Smileys & People",429],"1f4a7":[["💧"],"","󾭜",["droplet"],25,13,63,0,"Travel & Places",201],"1f4a8":[["💨"],"","󾭝",["dash"],25,14,63,0,"Smileys & People",430],"1f4a9":[["💩"],"","󾓴",["hankey","poop","shit"],25,15,63,0,"Smileys & People",101],"1f4aa":[["💪"],"","󾭞",["muscle"],25,16,63,0,"Smileys & People",361],"1f4ab":[["💫"],"","󾭟",["dizzy"],25,22,63,0,"Smileys & People",431],"1f4ac":[["💬"],"","󾔲",["speech_balloon"],25,23,63,0,"Smileys & People",432],"1f4ad":[["💭"],"","",["thought_balloon"],25,24,63,0,"Smileys & People",435],"1f4ae":[["💮"],"","󾭺",["white_flower"],25,25,63,0,"Animals & Nature",105],"1f4af":[["💯"],"","󾭻",["100"],25,26,63,0,"Symbols",145],"1f4b0":[["💰"],"","󾓝",["moneybag"],25,27,63,0,"Objects",76],"1f4b1":[["💱"],"","󾓞",["currency_exchange"],25,28,63,0,"Objects",85],"1f4b2":[["💲"],"","󾓠",["heavy_dollar_sign"],25,29,63,0,"Objects",86],"1f4b3":[["💳"],"","󾓡",["credit_card"],25,30,63,0,"Objects",82],"1f4b4":[["💴"],"","󾓢",["yen"],25,31,63,0,"Objects",77],"1f4b5":[["💵"],"","󾓣",["dollar"],25,32,63,0,"Objects",78],"1f4b6":[["💶"],"","",["euro"],25,33,63,0,"Objects",79],"1f4b7":[["💷"],"","",["pound"],25,34,63,0,"Objects",80],"1f4b8":[["💸"],"","󾓤",["money_with_wings"],25,35,63,0,"Objects",81],"1f4b9":[["💹"],"","󾓟",["chart"],25,36,63,0,"Objects",84],"1f4ba":[["💺"],"","󾔷",["seat"],25,37,63,0,"Travel & Places",117],"1f4bb":[["💻"],"","󾔸",["computer"],25,38,63,0,"Objects",33],"1f4bc":[["💼"],"","󾔻",["briefcase"],25,39,63,0,"Objects",107],"1f4bd":[["💽"],"","󾔼",["minidisc"],25,40,63,0,"Objects",39],"1f4be":[["💾"],"","󾔽",["floppy_disk"],25,41,63,0,"Objects",40],"1f4bf":[["💿"],"","󾠝",["cd"],25,42,63,0,"Objects",41],"1f4c0":[["📀"],"","󾠞",["dvd"],25,43,63,0,"Objects",42],"1f4c1":[["📁"],"","󾕃",["file_folder"],25,44,63,0,"Objects",108],"1f4c2":[["📂"],"","󾕄",["open_file_folder"],25,45,63,0,"Objects",109],"1f4c3":[["📃"],"","󾕀",["page_with_curl"],25,46,63,0,"Objects",68],"1f4c4":[["📄"],"","󾕁",["page_facing_up"],25,47,63,0,"Objects",70],"1f4c5":[["📅"],"","󾕂",["date"],25,48,63,0,"Objects",111],"1f4c6":[["📆"],"","󾕉",["calendar"],25,49,63,0,"Objects",112],"1f4c7":[["📇"],"","󾕍",["card_index"],25,50,63,0,"Objects",115],"1f4c8":[["📈"],"","󾕋",["chart_with_upwards_trend"],25,51,63,0,"Objects",116],"1f4c9":[["📉"],"","󾕌",["chart_with_downwards_trend"],26,0,63,0,"Objects",117],"1f4ca":[["📊"],"","󾕊",["bar_chart"],26,1,63,0,"Objects",118],"1f4cb":[["📋"],"","󾕈",["clipboard"],26,2,63,0,"Objects",119],"1f4cc":[["📌"],"","󾕎",["pushpin"],26,3,63,0,"Objects",120],"1f4cd":[["📍"],"","󾔿",["round_pushpin"],26,4,63,0,"Objects",121],"1f4ce":[["📎"],"","󾔺",["paperclip"],26,5,63,0,"Objects",122],"1f4cf":[["📏"],"","󾕐",["straight_ruler"],26,6,63,0,"Objects",124],"1f4d0":[["📐"],"","󾕑",["triangular_ruler"],26,7,63,0,"Objects",125],"1f4d1":[["📑"],"","󾕒",["bookmark_tabs"],26,8,63,0,"Objects",73],"1f4d2":[["📒"],"","󾕏",["ledger"],26,9,63,0,"Objects",67],"1f4d3":[["📓"],"","󾕅",["notebook"],26,10,63,0,"Objects",66],"1f4d4":[["📔"],"","󾕇",["notebook_with_decorative_cover"],26,11,63,0,"Objects",59],"1f4d5":[["📕"],"","󾔂",["closed_book"],26,12,63,0,"Objects",60],"1f4d6":[["📖"],"","󾕆",["book","open_book"],26,13,63,0,"Objects",61],"1f4d7":[["📗"],"","󾓿",["green_book"],26,14,63,0,"Objects",62],"1f4d8":[["📘"],"","󾔀",["blue_book"],26,15,63,0,"Objects",63],"1f4d9":[["📙"],"","󾔁",["orange_book"],26,16,63,0,"Objects",64],"1f4da":[["📚"],"","󾔃",["books"],26,17,63,0,"Objects",65],"1f4db":[["📛"],"","󾔄",["name_badge"],26,18,63,0,"Symbols",104],"1f4dc":[["📜"],"","󾓽",["scroll"],26,19,63,0,"Objects",69],"1f4dd":[["📝"],"","󾔧",["memo","pencil"],26,20,63,0,"Objects",106],"1f4de":[["📞"],"","󾔤",["telephone_receiver"],26,21,63,0,"Objects",28],"1f4df":[["📟"],"","󾔢",["pager"],26,22,63,0,"Objects",29],"1f4e0":[["📠"],"","󾔨",["fax"],26,23,63,0,"Objects",30],"1f4e1":[["📡"],"","󾔱",["satellite_antenna"],26,24,63,0,"Objects",160],"1f4e2":[["📢"],"","󾔯",["loudspeaker"],26,25,63,0,"Objects",5],"1f4e3":[["📣"],"","󾔰",["mega"],26,26,63,0,"Objects",6],"1f4e4":[["📤"],"","󾔳",["outbox_tray"],26,27,63,0,"Objects",91],"1f4e5":[["📥"],"","󾔴",["inbox_tray"],26,28,63,0,"Objects",92],"1f4e6":[["📦"],"","󾔵",["package"],26,29,63,0,"Objects",93],"1f4e7":[["📧"],"","󾮒",["e-mail"],26,30,63,0,"Objects",88],"1f4e8":[["📨"],"","󾔪",["incoming_envelope"],26,31,63,0,"Objects",89],"1f4e9":[["📩"],"","󾔫",["envelope_with_arrow"],26,32,63,0,"Objects",90],"1f4ea":[["📪"],"","󾔬",["mailbox_closed"],26,33,63,0,"Objects",95],"1f4eb":[["📫"],"","󾔭",["mailbox"],26,34,63,0,"Objects",94],"1f4ec":[["📬"],"","",["mailbox_with_mail"],26,35,63,0,"Objects",96],"1f4ed":[["📭"],"","",["mailbox_with_no_mail"],26,36,63,0,"Objects",97],"1f4ee":[["📮"],"","󾔮",["postbox"],26,37,63,0,"Objects",98],"1f4ef":[["📯"],"","",["postal_horn"],26,38,63,0,"Objects",7],"1f4f0":[["📰"],"","󾠢",["newspaper"],26,39,63,0,"Objects",71],"1f4f1":[["📱"],"","󾔥",["iphone"],26,40,63,0,"Objects",25],"1f4f2":[["📲"],"","󾔦",["calling"],26,41,63,0,"Objects",26],"1f4f3":[["📳"],"","󾠹",["vibration_mode"],26,42,63,0,"Symbols",95],"1f4f4":[["📴"],"","󾠺",["mobile_phone_off"],26,43,63,0,"Symbols",96],"1f4f5":[["📵"],"","",["no_mobile_phones"],26,44,63,0,"Symbols",23],"1f4f6":[["📶"],"","󾠸",["signal_strength"],26,45,63,0,"Symbols",94],"1f4f7":[["📷"],"","󾓯",["camera"],26,46,63,0,"Objects",49],"1f4f8":[["📸"],"","",["camera_with_flash"],26,47,31,0,"Objects",50],"1f4f9":[["📹"],"","󾓹",["video_camera"],26,48,63,0,"Objects",51],"1f4fa":[["📺"],"","󾠜",["tv"],26,49,63,0,"Objects",48],"1f4fb":[["📻"],"","󾠟",["radio"],26,50,63,0,"Objects",18],"1f4fc":[["📼"],"","󾠠",["vhs"],26,51,63,0,"Objects",52],"1f4fd-fe0f":[["📽️","📽"],"","",["film_projector"],27,0,31,0,"Objects",46],"1f4ff":[["📿"],"","",["prayer_beads"],27,1,31,0,"Smileys & People",470],"1f500":[["🔀"],"","",["twisted_rightwards_arrows"],27,2,63,0,"Symbols",73],"1f501":[["🔁"],"","",["repeat"],27,3,63,0,"Symbols",74],"1f502":[["🔂"],"","",["repeat_one"],27,4,63,0,"Symbols",75],"1f503":[["🔃"],"","󾮑",["arrows_clockwise"],27,5,63,0,"Symbols",41],"1f504":[["🔄"],"","",["arrows_counterclockwise"],27,6,63,0,"Symbols",42],"1f505":[["🔅"],"","",["low_brightness"],27,7,63,0,"Symbols",92],"1f506":[["🔆"],"","",["high_brightness"],27,8,63,0,"Symbols",93],"1f507":[["🔇"],"","",["mute"],27,9,63,0,"Objects",1],"1f508":[["🔈"],"","",["speaker"],27,10,63,0,"Objects",2],"1f509":[["🔉"],"","",["sound"],27,11,63,0,"Objects",3],"1f50a":[["🔊"],"","󾠡",["loud_sound"],27,12,63,0,"Objects",4],"1f50b":[["🔋"],"","󾓼",["battery"],27,13,63,0,"Objects",31],"1f50c":[["🔌"],"","󾓾",["electric_plug"],27,14,63,0,"Objects",32],"1f50d":[["🔍"],"","󾮅",["mag"],27,15,63,0,"Objects",53],"1f50e":[["🔎"],"","󾮍",["mag_right"],27,16,63,0,"Objects",54],"1f50f":[["🔏"],"","󾮐",["lock_with_ink_pen"],27,17,63,0,"Objects",132],"1f510":[["🔐"],"","󾮊",["closed_lock_with_key"],27,18,63,0,"Objects",133],"1f511":[["🔑"],"","󾮂",["key"],27,19,63,0,"Objects",134],"1f512":[["🔒"],"","󾮆",["lock"],27,20,63,0,"Objects",130],"1f513":[["🔓"],"","󾮇",["unlock"],27,21,63,0,"Objects",131],"1f514":[["🔔"],"","󾓲",["bell"],27,22,63,0,"Objects",8],"1f515":[["🔕"],"","",["no_bell"],27,23,63,0,"Objects",9],"1f516":[["🔖"],"","󾮏",["bookmark"],27,24,63,0,"Objects",74],"1f517":[["🔗"],"","󾭋",["link"],27,25,63,0,"Objects",150],"1f518":[["🔘"],"","󾮌",["radio_button"],27,26,63,0,"Symbols",200],"1f519":[["🔙"],"","󾮎",["back"],27,27,63,0,"Symbols",43],"1f51a":[["🔚"],"","󾀚",["end"],27,28,63,0,"Symbols",44],"1f51b":[["🔛"],"","󾀙",["on"],27,29,63,0,"Symbols",45],"1f51c":[["🔜"],"","󾀘",["soon"],27,30,63,0,"Symbols",46],"1f51d":[["🔝"],"","󾭂",["top"],27,31,63,0,"Symbols",47],"1f51e":[["🔞"],"","󾬥",["underage"],27,32,63,0,"Symbols",24],"1f51f":[["🔟"],"","󾠻",["keycap_ten"],27,33,63,0,"Symbols",144],"1f520":[["🔠"],"","󾭼",["capital_abcd"],27,34,63,0,"Symbols",146],"1f521":[["🔡"],"","󾭽",["abcd"],27,35,63,0,"Symbols",147],"1f522":[["🔢"],"","󾭾",["1234"],27,36,63,0,"Symbols",148],"1f523":[["🔣"],"","󾭿",["symbols"],27,37,63,0,"Symbols",149],"1f524":[["🔤"],"","󾮀",["abc"],27,38,63,0,"Symbols",150],"1f525":[["🔥"],"","󾓶",["fire"],27,39,63,0,"Travel & Places",200],"1f526":[["🔦"],"","󾓻",["flashlight"],27,40,63,0,"Objects",57],"1f527":[["🔧"],"","󾓉",["wrench"],27,41,63,0,"Objects",145],"1f528":[["🔨"],"","󾓊",["hammer"],27,42,63,0,"Objects",136],"1f529":[["🔩"],"","󾓋",["nut_and_bolt"],27,43,63,0,"Objects",146],"1f52a":[["🔪"],"","󾓺",["hocho","knife"],27,44,63,0,"Food & Drink",107],"1f52b":[["🔫"],"","󾓵",["gun"],27,45,63,0,"Objects",142],"1f52c":[["🔬"],"","",["microscope"],27,46,63,0,"Objects",158],"1f52d":[["🔭"],"","",["telescope"],27,47,63,0,"Objects",159],"1f52e":[["🔮"],"","󾓷",["crystal_ball"],27,48,63,0,"Activities",56],"1f52f":[["🔯"],"","󾓸",["six_pointed_star"],27,49,63,0,"Symbols",59],"1f530":[["🔰"],"","󾁄",["beginner"],27,50,63,0,"Symbols",105],"1f531":[["🔱"],"","󾓒",["trident"],27,51,63,0,"Symbols",103],"1f532":[["🔲"],"","󾭤",["black_square_button"],28,0,63,0,"Symbols",201],"1f533":[["🔳"],"","󾭧",["white_square_button"],28,1,63,0,"Symbols",202],"1f534":[["🔴"],"","󾭣",["red_circle"],28,2,63,0,"Symbols",205],"1f535":[["🔵"],"","󾭤",["large_blue_circle"],28,3,63,0,"Symbols",206],"1f536":[["🔶"],"","󾭳",["large_orange_diamond"],28,4,63,0,"Symbols",193],"1f537":[["🔷"],"","󾭴",["large_blue_diamond"],28,5,63,0,"Symbols",194],"1f538":[["🔸"],"","󾭵",["small_orange_diamond"],28,6,63,0,"Symbols",195],"1f539":[["🔹"],"","󾭶",["small_blue_diamond"],28,7,63,0,"Symbols",196],"1f53a":[["🔺"],"","󾭸",["small_red_triangle"],28,8,63,0,"Symbols",197],"1f53b":[["🔻"],"","󾭹",["small_red_triangle_down"],28,9,63,0,"Symbols",198],"1f53c":[["🔼"],"","󾬁",["arrow_up_small"],28,10,63,0,"Symbols",83],"1f53d":[["🔽"],"","󾬀",["arrow_down_small"],28,11,63,0,"Symbols",85],"1f549-fe0f":[["🕉️","🕉"],"","",["om_symbol"],28,12,31,0,"Symbols",50],"1f54a-fe0f":[["🕊️","🕊"],"","",["dove_of_peace"],28,13,31,0,"Animals & Nature",62],"1f54b":[["🕋"],"","",["kaaba"],28,14,31,0,"Travel & Places",45],"1f54c":[["🕌"],"","",["mosque"],28,15,31,0,"Travel & Places",42],"1f54d":[["🕍"],"","",["synagogue"],28,16,31,0,"Travel & Places",43],"1f54e":[["🕎"],"","",["menorah_with_nine_branches"],28,17,31,0,"Symbols",58],"1f550":[["🕐"],"","󾀞",["clock1"],28,18,63,0,"Travel & Places",136],"1f551":[["🕑"],"","󾀟",["clock2"],28,19,63,0,"Travel & Places",138],"1f552":[["🕒"],"","󾀠",["clock3"],28,20,63,0,"Travel & Places",140],"1f553":[["🕓"],"","󾀡",["clock4"],28,21,63,0,"Travel & Places",142],"1f554":[["🕔"],"","󾀢",["clock5"],28,22,63,0,"Travel & Places",144],"1f555":[["🕕"],"","󾀣",["clock6"],28,23,63,0,"Travel & Places",146],"1f556":[["🕖"],"","󾀤",["clock7"],28,24,63,0,"Travel & Places",148],"1f557":[["🕗"],"","󾀥",["clock8"],28,25,63,0,"Travel & Places",150],"1f558":[["🕘"],"","󾀦",["clock9"],28,26,63,0,"Travel & Places",152],"1f559":[["🕙"],"","󾀧",["clock10"],28,27,63,0,"Travel & Places",154],"1f55a":[["🕚"],"","󾀨",["clock11"],28,28,63,0,"Travel & Places",156],"1f55b":[["🕛"],"","󾀩",["clock12"],28,29,63,0,"Travel & Places",134],"1f55c":[["🕜"],"","",["clock130"],28,30,63,0,"Travel & Places",137],"1f55d":[["🕝"],"","",["clock230"],28,31,63,0,"Travel & Places",139],"1f55e":[["🕞"],"","",["clock330"],28,32,63,0,"Travel & Places",141],"1f55f":[["🕟"],"","",["clock430"],28,33,63,0,"Travel & Places",143],"1f560":[["🕠"],"","",["clock530"],28,34,63,0,"Travel & Places",145],"1f561":[["🕡"],"","",["clock630"],28,35,63,0,"Travel & Places",147],"1f562":[["🕢"],"","",["clock730"],28,36,63,0,"Travel & Places",149],"1f563":[["🕣"],"","",["clock830"],28,37,63,0,"Travel & Places",151],"1f564":[["🕤"],"","",["clock930"],28,38,63,0,"Travel & Places",153],"1f565":[["🕥"],"","",["clock1030"],28,39,63,0,"Travel & Places",155],"1f566":[["🕦"],"","",["clock1130"],28,40,63,0,"Travel & Places",157],"1f567":[["🕧"],"","",["clock1230"],28,41,63,0,"Travel & Places",135],"1f56f-fe0f":[["🕯️","🕯"],"","",["candle"],28,42,31,0,"Objects",55],"1f570-fe0f":[["🕰️","🕰"],"","",["mantelpiece_clock"],28,43,31,0,"Travel & Places",133],"1f573-fe0f":[["🕳️","🕳"],"","",["hole"],28,44,31,0,"Smileys & People",436],"1f574-fe0f":[["🕴️","🕴"],"","",["man_in_business_suit_levitating"],28,45,31,0,"Smileys & People",274],"1f575-fe0f-200d-2640-fe0f":[["🕵️‍♀️"],"","",["female-detective"],28,51,15,0,"Smileys & People",161],"1f575-fe0f-200d-2642-fe0f":[["🕵️‍♂️","🕵️","🕵"],"","",["male-detective","sleuth_or_spy"],29,5,15,0,"Smileys & People",160],"1f576-fe0f":[["🕶️","🕶"],"","",["dark_sunglasses"],29,17,31,0,"Smileys & People",438],"1f577-fe0f":[["🕷️","🕷"],"","",["spider"],29,18,31,0,"Animals & Nature",98],"1f578-fe0f":[["🕸️","🕸"],"","",["spider_web"],29,19,31,0,"Animals & Nature",99],"1f579-fe0f":[["🕹️","🕹"],"","",["joystick"],29,20,31,0,"Activities",59],"1f57a":[["🕺"],"","",["man_dancing"],29,21,31,0,"Smileys & People",259],"1f587-fe0f":[["🖇️","🖇"],"","",["linked_paperclips"],29,27,31,0,"Objects",123],"1f58a-fe0f":[["🖊️","🖊"],"","",["lower_left_ballpoint_pen"],29,28,31,0,"Objects",103],"1f58b-fe0f":[["🖋️","🖋"],"","",["lower_left_fountain_pen"],29,29,31,0,"Objects",102],"1f58c-fe0f":[["🖌️","🖌"],"","",["lower_left_paintbrush"],29,30,31,0,"Objects",104],"1f58d-fe0f":[["🖍️","🖍"],"","",["lower_left_crayon"],29,31,31,0,"Objects",105],"1f590-fe0f":[["🖐️","🖐"],"","",["raised_hand_with_fingers_splayed"],29,32,31,0,"Smileys & People",375],"1f595":[["🖕"],"","",["middle_finger","reversed_hand_with_middle_finger_extended"],29,38,31,0,"Smileys & People",368],"1f596":[["🖖"],"","",["spock-hand"],29,44,31,0,"Smileys & People",372],"1f5a4":[["🖤"],"","",["black_heart"],29,50,31,0,"Smileys & People",419],"1f5a5-fe0f":[["🖥️","🖥"],"","",["desktop_computer"],29,51,31,0,"Objects",34],"1f5a8-fe0f":[["🖨️","🖨"],"","",["printer"],30,0,31,0,"Objects",35],"1f5b1-fe0f":[["🖱️","🖱"],"","",["three_button_mouse"],30,1,31,0,"Objects",37],"1f5b2-fe0f":[["🖲️","🖲"],"","",["trackball"],30,2,31,0,"Objects",38],"1f5bc-fe0f":[["🖼️","🖼"],"","",["frame_with_picture"],30,3,31,0,"Activities",73],"1f5c2-fe0f":[["🗂️","🗂"],"","",["card_index_dividers"],30,4,31,0,"Objects",110],"1f5c3-fe0f":[["🗃️","🗃"],"","",["card_file_box"],30,5,31,0,"Objects",127],"1f5c4-fe0f":[["🗄️","🗄"],"","",["file_cabinet"],30,6,31,0,"Objects",128],"1f5d1-fe0f":[["🗑️","🗑"],"","",["wastebasket"],30,7,31,0,"Objects",129],"1f5d2-fe0f":[["🗒️","🗒"],"","",["spiral_note_pad"],30,8,31,0,"Objects",113],"1f5d3-fe0f":[["🗓️","🗓"],"","",["spiral_calendar_pad"],30,9,31,0,"Objects",114],"1f5dc-fe0f":[["🗜️","🗜"],"","",["compression"],30,10,31,0,"Objects",148],"1f5dd-fe0f":[["🗝️","🗝"],"","",["old_key"],30,11,31,0,"Objects",135],"1f5de-fe0f":[["🗞️","🗞"],"","",["rolled_up_newspaper"],30,12,31,0,"Objects",72],"1f5e1-fe0f":[["🗡️","🗡"],"","",["dagger_knife"],30,13,31,0,"Objects",140],"1f5e3-fe0f":[["🗣️","🗣"],"","",["speaking_head_in_silhouette"],30,14,31,0,"Smileys & People",275],"1f5e8-fe0f":[["🗨️","🗨"],"","",["left_speech_bubble"],30,15,31,0,"Smileys & People",433],"1f5ef-fe0f":[["🗯️","🗯"],"","",["right_anger_bubble"],30,16,31,0,"Smileys & People",434],"1f5f3-fe0f":[["🗳️","🗳"],"","",["ballot_box_with_ballot"],30,17,31,0,"Objects",99],"1f5fa-fe0f":[["🗺️","🗺"],"","",["world_map"],30,18,31,0,"Travel & Places",5],"1f5fb":[["🗻"],"","󾓃",["mount_fuji"],30,19,63,0,"Travel & Places",11],"1f5fc":[["🗼"],"","󾓄",["tokyo_tower"],30,20,63,0,"Travel & Places",39],"1f5fd":[["🗽"],"","󾓆",["statue_of_liberty"],30,21,63,0,"Travel & Places",40],"1f5fe":[["🗾"],"","󾓇",["japan"],30,22,63,0,"Travel & Places",6],"1f5ff":[["🗿"],"","󾓈",["moyai"],30,23,63,0,"Objects",181],"1f600":[["😀"],"","",["grinning"],30,24,63,0,":D","Smileys & People",1],"1f601":[["😁"],"","󾌳",["grin"],30,25,63,0,"Smileys & People",2],"1f602":[["😂"],"","󾌴",["joy"],30,26,63,0,"Smileys & People",3],"1f603":[["😃"],"","󾌰",["smiley"],30,27,63,0,":)","Smileys & People",5],"1f604":[["😄"],"","󾌸",["smile"],30,28,63,0,":)","Smileys & People",6],"1f605":[["😅"],"","󾌱",["sweat_smile"],30,29,63,0,"Smileys & People",7],"1f606":[["😆"],"","󾌲",["laughing","satisfied"],30,30,63,0,"Smileys & People",8],"1f607":[["😇"],"","",["innocent"],30,31,63,0,"Smileys & People",80],"1f608":[["😈"],"","",["smiling_imp"],30,32,63,0,"Smileys & People",90],"1f609":[["😉"],"","󾍇",["wink"],30,33,63,0,";)","Smileys & People",9],"1f60a":[["😊"],"","󾌵",["blush"],30,34,63,0,":)","Smileys & People",10],"1f60b":[["😋"],"","󾌫",["yum"],30,35,63,0,"Smileys & People",11],"1f60c":[["😌"],"","󾌾",["relieved"],30,36,63,0,"Smileys & People",38],"1f60d":[["😍"],"","󾌧",["heart_eyes"],30,37,63,0,"Smileys & People",13],"1f60e":[["😎"],"","",["sunglasses"],30,38,63,0,"Smileys & People",12],"1f60f":[["😏"],"","󾍃",["smirk"],30,39,63,0,"Smileys & People",29],"1f610":[["😐"],"","",["neutral_face"],30,40,63,0,"Smileys & People",25],"1f611":[["😑"],"","",["expressionless"],30,41,63,0,"Smileys & People",26],"1f612":[["😒"],"","󾌦",["unamused"],30,42,63,0,":(","Smileys & People",43],"1f613":[["😓"],"","󾍄",["sweat"],30,43,63,0,"Smileys & People",44],"1f614":[["😔"],"","󾍀",["pensive"],30,44,63,0,"Smileys & People",45],"1f615":[["😕"],"","",["confused"],30,45,63,0,"Smileys & People",46],"1f616":[["😖"],"","󾌿",["confounded"],30,46,63,0,"Smileys & People",52],"1f617":[["😗"],"","",["kissing"],30,47,63,0,"Smileys & People",16],"1f618":[["😘"],"","󾌬",["kissing_heart"],30,48,63,0,"Smileys & People",14],"1f619":[["😙"],"","",["kissing_smiling_eyes"],30,49,63,0,"Smileys & People",17],"1f61a":[["😚"],"","󾌭",["kissing_closed_eyes"],30,50,63,0,"Smileys & People",18],"1f61b":[["😛"],"","",["stuck_out_tongue"],30,51,63,0,":p","Smileys & People",39],"1f61c":[["😜"],"","󾌩",["stuck_out_tongue_winking_eye"],31,0,63,0,";p","Smileys & People",40],"1f61d":[["😝"],"","󾌪",["stuck_out_tongue_closed_eyes"],31,1,63,0,"Smileys & People",41],"1f61e":[["😞"],"","󾌣",["disappointed"],31,2,63,0,":(","Smileys & People",53],"1f61f":[["😟"],"","",["worried"],31,3,63,0,"Smileys & People",54],"1f620":[["😠"],"","󾌠",["angry"],31,4,63,0,"Smileys & People",72],"1f621":[["😡"],"","󾌽",["rage"],31,5,63,0,"Smileys & People",71],"1f622":[["😢"],"","󾌹",["cry"],31,6,63,0,":'(","Smileys & People",56],"1f623":[["😣"],"","󾌼",["persevere"],31,7,63,0,"Smileys & People",30],"1f624":[["😤"],"","󾌨",["triumph"],31,8,63,0,"Smileys & People",55],"1f625":[["😥"],"","󾍅",["disappointed_relieved"],31,9,63,0,"Smileys & People",31],"1f626":[["😦"],"","",["frowning"],31,10,63,0,"Smileys & People",58],"1f627":[["😧"],"","",["anguished"],31,11,63,0,"Smileys & People",59],"1f628":[["😨"],"","󾌻",["fearful"],31,12,63,0,"Smileys & People",60],"1f629":[["😩"],"","󾌡",["weary"],31,13,63,0,"Smileys & People",61],"1f62a":[["😪"],"","󾍂",["sleepy"],31,14,63,0,"Smileys & People",35],"1f62b":[["😫"],"","󾍆",["tired_face"],31,15,63,0,"Smileys & People",36],"1f62c":[["😬"],"","",["grimacing"],31,16,63,0,"Smileys & People",63],"1f62d":[["😭"],"","󾌺",["sob"],31,17,63,0,":'(","Smileys & People",57],"1f62e":[["😮"],"","",["open_mouth"],31,18,63,0,"Smileys & People",32],"1f62f":[["😯"],"","",["hushed"],31,19,63,0,"Smileys & People",34],"1f630":[["😰"],"","󾌥",["cold_sweat"],31,20,63,0,"Smileys & People",64],"1f631":[["😱"],"","󾍁",["scream"],31,21,63,0,"Smileys & People",65],"1f632":[["😲"],"","󾌢",["astonished"],31,22,63,0,"Smileys & People",49],"1f633":[["😳"],"","󾌯",["flushed"],31,23,63,0,"Smileys & People",68],"1f634":[["😴"],"","",["sleeping"],31,24,63,0,"Smileys & People",37],"1f635":[["😵"],"","󾌤",["dizzy_face"],31,25,63,0,"Smileys & People",70],"1f636":[["😶"],"","",["no_mouth"],31,26,63,0,"Smileys & People",27],"1f637":[["😷"],"","󾌮",["mask"],31,27,63,0,"Smileys & People",74],"1f638":[["😸"],"","󾍉",["smile_cat"],31,28,63,0,"Smileys & People",103],"1f639":[["😹"],"","󾍊",["joy_cat"],31,29,63,0,"Smileys & People",104],"1f63a":[["😺"],"","󾍈",["smiley_cat"],31,30,63,0,"Smileys & People",102],"1f63b":[["😻"],"","󾍌",["heart_eyes_cat"],31,31,63,0,"Smileys & People",105],"1f63c":[["😼"],"","󾍏",["smirk_cat"],31,32,63,0,"Smileys & People",106],"1f63d":[["😽"],"","󾍋",["kissing_cat"],31,33,63,0,"Smileys & People",107],"1f63e":[["😾"],"","󾍎",["pouting_cat"],31,34,63,0,"Smileys & People",110],"1f63f":[["😿"],"","󾍍",["crying_cat_face"],31,35,63,0,"Smileys & People",109],"1f640":[["🙀"],"","󾍐",["scream_cat"],31,36,63,0,"Smileys & People",108],"1f641":[["🙁"],"","",["slightly_frowning_face"],31,37,31,0,"Smileys & People",51],"1f642":[["🙂"],"","",["slightly_smiling_face"],31,38,63,0,"Smileys & People",20],"1f643":[["🙃"],"","",["upside_down_face"],31,39,31,0,"Smileys & People",47],"1f644":[["🙄"],"","",["face_with_rolling_eyes"],31,40,31,0,"Smileys & People",28],"1f645-200d-2640-fe0f":[["🙅‍♀️","🙅‍♀","🙅"],"","",["woman-gesturing-no","no_good"],31,41,31,0,"Smileys & People",227],"1f645-200d-2642-fe0f":[["🙅‍♂️","🙅‍♂"],"","",["man-gesturing-no"],31,47,31,0,"Smileys & People",226],"1f646-200d-2640-fe0f":[["🙆‍♀️","🙆‍♀","🙆"],"","",["woman-gesturing-ok","ok_woman"],32,7,31,0,"Smileys & People",230],"1f646-200d-2642-fe0f":[["🙆‍♂️","🙆‍♂"],"","",["man-gesturing-ok"],32,13,31,0,"Smileys & People",229],"1f647-200d-2640-fe0f":[["🙇‍♀️","🙇‍♀"],"","",["woman-bowing"],32,25,31,0,"Smileys & People",239],"1f647-200d-2642-fe0f":[["🙇‍♂️","🙇‍♂","🙇"],"","",["man-bowing","bow"],32,31,31,0,"Smileys & People",238],"1f648":[["🙈"],"","󾍔",["see_no_evil"],32,43,63,0,"Smileys & People",111],"1f649":[["🙉"],"","󾍖",["hear_no_evil"],32,44,63,0,"Smileys & People",112],"1f64a":[["🙊"],"","󾍕",["speak_no_evil"],32,45,63,0,"Smileys & People",113],"1f64b-200d-2640-fe0f":[["🙋‍♀️","🙋‍♀","🙋"],"","",["woman-raising-hand","raising_hand"],32,46,31,0,"Smileys & People",236],"1f64b-200d-2642-fe0f":[["🙋‍♂️","🙋‍♂"],"","",["man-raising-hand"],33,0,31,0,"Smileys & People",235],"1f64c":[["🙌"],"","󾍘",["raised_hands"],33,12,63,0,"Smileys & People",390],"1f64d-200d-2640-fe0f":[["🙍‍♀️","🙍‍♀","🙍"],"","",["woman-frowning","person_frowning"],33,18,31,0,"Smileys & People",221],"1f64d-200d-2642-fe0f":[["🙍‍♂️","🙍‍♂"],"","",["man-frowning"],33,24,31,0,"Smileys & People",220],"1f64e-200d-2640-fe0f":[["🙎‍♀️","🙎‍♀","🙎"],"","",["woman-pouting","person_with_pouting_face"],33,36,31,0,"Smileys & People",224],"1f64e-200d-2642-fe0f":[["🙎‍♂️","🙎‍♂"],"","",["man-pouting"],33,42,31,0,"Smileys & People",223],"1f64f":[["🙏"],"","󾍛",["pray"],34,2,63,0,"Smileys & People",392],"1f680":[["🚀"],"","󾟭",["rocket"],34,8,63,0,"Travel & Places",123],"1f681":[["🚁"],"","",["helicopter"],34,9,63,0,"Travel & Places",118],"1f682":[["🚂"],"","",["steam_locomotive"],34,10,63,0,"Travel & Places",63],"1f683":[["🚃"],"","󾟟",["railway_car"],34,11,63,0,"Travel & Places",64],"1f684":[["🚄"],"","󾟢",["bullettrain_side"],34,12,63,0,"Travel & Places",65],"1f685":[["🚅"],"","󾟣",["bullettrain_front"],34,13,63,0,"Travel & Places",66],"1f686":[["🚆"],"","",["train2"],34,14,63,0,"Travel & Places",67],"1f687":[["🚇"],"","󾟠",["metro"],34,15,63,0,"Travel & Places",68],"1f688":[["🚈"],"","",["light_rail"],34,16,63,0,"Travel & Places",69],"1f689":[["🚉"],"","󾟬",["station"],34,17,63,0,"Travel & Places",70],"1f68a":[["🚊"],"","",["tram"],34,18,63,0,"Travel & Places",71],"1f68b":[["🚋"],"","",["train"],34,19,63,0,"Travel & Places",74],"1f68c":[["🚌"],"","󾟦",["bus"],34,20,63,0,"Travel & Places",75],"1f68d":[["🚍"],"","",["oncoming_bus"],34,21,63,0,"Travel & Places",76],"1f68e":[["🚎"],"","",["trolleybus"],34,22,63,0,"Travel & Places",77],"1f68f":[["🚏"],"","󾟧",["busstop"],34,23,63,0,"Travel & Places",95],"1f690":[["🚐"],"","",["minibus"],34,24,63,0,"Travel & Places",78],"1f691":[["🚑"],"","󾟳",["ambulance"],34,25,63,0,"Travel & Places",79],"1f692":[["🚒"],"","󾟲",["fire_engine"],34,26,63,0,"Travel & Places",80],"1f693":[["🚓"],"","󾟴",["police_car"],34,27,63,0,"Travel & Places",81],"1f694":[["🚔"],"","",["oncoming_police_car"],34,28,63,0,"Travel & Places",82],"1f695":[["🚕"],"","󾟯",["taxi"],34,29,63,0,"Travel & Places",83],"1f696":[["🚖"],"","",["oncoming_taxi"],34,30,63,0,"Travel & Places",84],"1f697":[["🚗"],"","󾟤",["car","red_car"],34,31,63,0,"Travel & Places",85],"1f698":[["🚘"],"","",["oncoming_automobile"],34,32,63,0,"Travel & Places",86],"1f699":[["🚙"],"","󾟥",["blue_car"],34,33,63,0,"Travel & Places",87],"1f69a":[["🚚"],"","󾟱",["truck"],34,34,63,0,"Travel & Places",88],"1f69b":[["🚛"],"","",["articulated_lorry"],34,35,63,0,"Travel & Places",89],"1f69c":[["🚜"],"","",["tractor"],34,36,63,0,"Travel & Places",90],"1f69d":[["🚝"],"","",["monorail"],34,37,63,0,"Travel & Places",72],"1f69e":[["🚞"],"","",["mountain_railway"],34,38,63,0,"Travel & Places",73],"1f69f":[["🚟"],"","",["suspension_railway"],34,39,63,0,"Travel & Places",119],"1f6a0":[["🚠"],"","",["mountain_cableway"],34,40,63,0,"Travel & Places",120],"1f6a1":[["🚡"],"","",["aerial_tramway"],34,41,63,0,"Travel & Places",121],"1f6a2":[["🚢"],"","󾟨",["ship"],34,42,63,0,"Travel & Places",112],"1f6a3-200d-2640-fe0f":[["🚣‍♀️","🚣‍♀"],"","",["woman-rowing-boat"],34,43,31,0,"Smileys & People",290],"1f6a3-200d-2642-fe0f":[["🚣‍♂️","🚣‍♂","🚣"],"","",["man-rowing-boat","rowboat"],34,49,31,0,"Smileys & People",289],"1f6a4":[["🚤"],"","󾟮",["speedboat"],35,9,63,0,"Travel & Places",108],"1f6a5":[["🚥"],"","󾟷",["traffic_light"],35,10,63,0,"Travel & Places",101],"1f6a6":[["🚦"],"","",["vertical_traffic_light"],35,11,63,0,"Travel & Places",102],"1f6a7":[["🚧"],"","󾟸",["construction"],35,12,63,0,"Travel & Places",104],"1f6a8":[["🚨"],"","󾟹",["rotating_light"],35,13,63,0,"Travel & Places",100],"1f6a9":[["🚩"],"","󾬢",["triangular_flag_on_post"],35,14,63,0,"Flags",2],"1f6aa":[["🚪"],"","󾓳",["door"],35,15,63,0,"Objects",163],"1f6ab":[["🚫"],"","󾭈",["no_entry_sign"],35,16,63,0,"Symbols",17],"1f6ac":[["🚬"],"","󾬞",["smoking"],35,17,63,0,"Objects",178],"1f6ad":[["🚭"],"","󾬟",["no_smoking"],35,18,63,0,"Symbols",19],"1f6ae":[["🚮"],"","",["put_litter_in_its_place"],35,19,63,0,"Symbols",2],"1f6af":[["🚯"],"","",["do_not_litter"],35,20,63,0,"Symbols",20],"1f6b0":[["🚰"],"","",["potable_water"],35,21,63,0,"Symbols",3],"1f6b1":[["🚱"],"","",["non-potable_water"],35,22,63,0,"Symbols",21],"1f6b2":[["🚲"],"","󾟫",["bike"],35,23,63,0,"Travel & Places",91],"1f6b3":[["🚳"],"","",["no_bicycles"],35,24,63,0,"Symbols",18],"1f6b4-200d-2640-fe0f":[["🚴‍♀️","🚴‍♀"],"","",["woman-biking"],35,25,31,0,"Smileys & People",302],"1f6b4-200d-2642-fe0f":[["🚴‍♂️","🚴‍♂","🚴"],"","",["man-biking","bicyclist"],35,31,31,0,"Smileys & People",301],"1f6b5-200d-2640-fe0f":[["🚵‍♀️","🚵‍♀"],"","",["woman-mountain-biking"],35,43,31,0,"Smileys & People",305],"1f6b5-200d-2642-fe0f":[["🚵‍♂️","🚵‍♂","🚵"],"","",["man-mountain-biking","mountain_bicyclist"],35,49,31,0,"Smileys & People",304],"1f6b6-200d-2640-fe0f":[["🚶‍♀️","🚶‍♀"],"","",["woman-walking"],36,9,31,0,"Smileys & People",254],"1f6b6-200d-2642-fe0f":[["🚶‍♂️","🚶‍♂","🚶"],"","",["man-walking","walking"],36,15,31,0,"Smileys & People",253],"1f6b7":[["🚷"],"","",["no_pedestrians"],36,27,63,0,"Symbols",22],"1f6b8":[["🚸"],"","",["children_crossing"],36,28,63,0,"Symbols",15],"1f6b9":[["🚹"],"","󾬳",["mens"],36,29,63,0,"Symbols",5],"1f6ba":[["🚺"],"","󾬴",["womens"],36,30,63,0,"Symbols",6],"1f6bb":[["🚻"],"","󾔆",["restroom"],36,31,63,0,"Symbols",7],"1f6bc":[["🚼"],"","󾬵",["baby_symbol"],36,32,63,0,"Symbols",8],"1f6bd":[["🚽"],"","󾔇",["toilet"],36,33,63,0,"Objects",166],"1f6be":[["🚾"],"","󾔈",["wc"],36,34,63,0,"Symbols",9],"1f6bf":[["🚿"],"","",["shower"],36,35,63,0,"Objects",167],"1f6c0":[["🛀"],"","󾔅",["bath"],36,36,63,0,"Smileys & People",272],"1f6c1":[["🛁"],"","",["bathtub"],36,42,63,0,"Objects",168],"1f6c2":[["🛂"],"","",["passport_control"],36,43,63,0,"Symbols",10],"1f6c3":[["🛃"],"","",["customs"],36,44,63,0,"Symbols",11],"1f6c4":[["🛄"],"","",["baggage_claim"],36,45,63,0,"Symbols",12],"1f6c5":[["🛅"],"","",["left_luggage"],36,46,63,0,"Symbols",13],"1f6cb-fe0f":[["🛋️","🛋"],"","",["couch_and_lamp"],36,47,31,0,"Objects",165],"1f6cc":[["🛌"],"","",["sleeping_accommodation"],36,48,31,0,"Smileys & People",273],"1f6cd-fe0f":[["🛍️","🛍"],"","",["shopping_bags"],37,2,31,0,"Smileys & People",455],"1f6ce-fe0f":[["🛎️","🛎"],"","",["bellhop_bell"],37,3,31,0,"Travel & Places",125],"1f6cf-fe0f":[["🛏️","🛏"],"","",["bed"],37,4,31,0,"Objects",164],"1f6d0":[["🛐"],"","",["place_of_worship"],37,5,31,0,"Symbols",48],"1f6d1":[["🛑"],"","",["octagonal_sign"],37,6,31,0,"Travel & Places",103],"1f6d2":[["🛒"],"","",["shopping_trolley"],37,7,31,0,"Objects",177],"1f6e0-fe0f":[["🛠️","🛠"],"","",["hammer_and_wrench"],37,8,31,0,"Objects",139],"1f6e1-fe0f":[["🛡️","🛡"],"","",["shield"],37,9,31,0,"Objects",144],"1f6e2-fe0f":[["🛢️","🛢"],"","",["oil_drum"],37,10,31,0,"Travel & Places",98],"1f6e3-fe0f":[["🛣️","🛣"],"","",["motorway"],37,11,31,0,"Travel & Places",96],"1f6e4-fe0f":[["🛤️","🛤"],"","",["railway_track"],37,12,31,0,"Travel & Places",97],"1f6e5-fe0f":[["🛥️","🛥"],"","",["motor_boat"],37,13,31,0,"Travel & Places",111],"1f6e9-fe0f":[["🛩️","🛩"],"","",["small_airplane"],37,14,31,0,"Travel & Places",114],"1f6eb":[["🛫"],"","",["airplane_departure"],37,15,31,0,"Travel & Places",115],"1f6ec":[["🛬"],"","",["airplane_arriving"],37,16,31,0,"Travel & Places",116],"1f6f0-fe0f":[["🛰️","🛰"],"","",["satellite"],37,17,31,0,"Travel & Places",122],"1f6f3-fe0f":[["🛳️","🛳"],"","",["passenger_ship"],37,18,31,0,"Travel & Places",109],"1f6f4":[["🛴"],"","",["scooter"],37,19,31,0,"Travel & Places",92],"1f6f5":[["🛵"],"","",["motor_scooter"],37,20,31,0,"Travel & Places",94],"1f6f6":[["🛶"],"","",["canoe"],37,21,31,0,"Travel & Places",107],"1f6f7":[["🛷"],"","",["sled"],37,22,31,0,"Activities",52],"1f6f8":[["🛸"],"","",["flying_saucer"],37,23,31,0,"Travel & Places",124],"1f910":[["🤐"],"","",["zipper_mouth_face"],37,24,31,0,"Smileys & People",33],"1f911":[["🤑"],"","",["money_mouth_face"],37,25,31,0,"Smileys & People",48],"1f912":[["🤒"],"","",["face_with_thermometer"],37,26,31,0,"Smileys & People",75],"1f913":[["🤓"],"","",["nerd_face"],37,27,31,0,"Smileys & People",89],"1f914":[["🤔"],"","",["thinking_face"],37,28,31,0,"Smileys & People",23],"1f915":[["🤕"],"","",["face_with_head_bandage"],37,29,31,0,"Smileys & People",76],"1f916":[["🤖"],"","",["robot_face"],37,30,31,0,"Smileys & People",100],"1f917":[["🤗"],"","",["hugging_face"],37,31,31,0,"Smileys & People",21],"1f918":[["🤘"],"","",["the_horns","sign_of_the_horns"],37,32,31,0,"Smileys & People",373],"1f919":[["🤙"],"","",["call_me_hand"],37,38,31,0,"Smileys & People",374],"1f91a":[["🤚"],"","",["raised_back_of_hand"],37,44,31,0,"Smileys & People",384],"1f91b":[["🤛"],"","",["left-facing_fist"],37,50,31,0,"Smileys & People",382],"1f91c":[["🤜"],"","",["right-facing_fist"],38,4,31,0,"Smileys & People",383],"1f91d":[["🤝"],"","",["handshake"],38,10,31,0,"Smileys & People",393],"1f91e":[["🤞"],"","",["crossed_fingers","hand_with_index_and_middle_fingers_crossed"],38,11,31,0,"Smileys & People",371],"1f91f":[["🤟"],"","",["i_love_you_hand_sign"],38,17,31,0,"Smileys & People",386],"1f920":[["🤠"],"","",["face_with_cowboy_hat"],38,23,31,0,"Smileys & People",81],"1f921":[["🤡"],"","",["clown_face"],38,24,31,0,"Smileys & People",92],"1f922":[["🤢"],"","",["nauseated_face"],38,25,31,0,"Smileys & People",77],"1f923":[["🤣"],"","",["rolling_on_the_floor_laughing"],38,26,31,0,"Smileys & People",4],"1f924":[["🤤"],"","",["drooling_face"],38,27,31,0,"Smileys & People",42],"1f925":[["🤥"],"","",["lying_face"],38,28,31,0,"Smileys & People",85],"1f926-200d-2640-fe0f":[["🤦‍♀️","🤦‍♀"],"","",["woman-facepalming"],38,29,31,0,"Smileys & People",242],"1f926-200d-2642-fe0f":[["🤦‍♂️","🤦‍♂"],"","",["man-facepalming"],38,35,31,0,"Smileys & People",241],"1f926":[["🤦"],"","",["face_palm"],38,41,15,0,"Smileys & People",240],"1f927":[["🤧"],"","",["sneezing_face"],38,47,31,0,"Smileys & People",79],"1f928":[["🤨"],"","",["face_with_raised_eyebrow","face_with_one_eyebrow_raised"],38,48,31,0,"Smileys & People",24],"1f929":[["🤩"],"","",["star-struck","grinning_face_with_star_eyes"],38,49,31,0,"Smileys & People",22],"1f92a":[["🤪"],"","",["zany_face","grinning_face_with_one_large_and_one_small_eye"],38,50,31,0,"Smileys & People",69],"1f92b":[["🤫"],"","",["shushing_face","face_with_finger_covering_closed_lips"],38,51,31,0,"Smileys & People",86],"1f92c":[["🤬"],"","",["face_with_symbols_on_mouth","serious_face_with_symbols_covering_mouth"],39,0,31,0,"Smileys & People",73],"1f92d":[["🤭"],"","",["face_with_hand_over_mouth","smiling_face_with_smiling_eyes_and_hand_covering_mouth"],39,1,31,0,"Smileys & People",87],"1f92e":[["🤮"],"","",["face_vomiting","face_with_open_mouth_vomiting"],39,2,31,0,"Smileys & People",78],"1f92f":[["🤯"],"","",["exploding_head","shocked_face_with_exploding_head"],39,3,31,0,"Smileys & People",62],"1f930":[["🤰"],"","",["pregnant_woman"],39,4,31,0,"Smileys & People",189],"1f931":[["🤱"],"","",["breast-feeding"],39,10,31,0,"Smileys & People",190],"1f932":[["🤲"],"","",["palms_up_together"],39,16,31,0,"Smileys & People",391],"1f933":[["🤳"],"","",["selfie"],39,22,31,0,"Smileys & People",360],"1f934":[["🤴"],"","",["prince"],39,28,31,0,"Smileys & People",168],"1f935":[["🤵"],"","",["man_in_tuxedo"],39,34,31,0,"Smileys & People",187],"1f936":[["🤶"],"","",["mrs_claus","mother_christmas"],39,40,31,0,"Smileys & People",193],"1f937-200d-2640-fe0f":[["🤷‍♀️","🤷‍♀"],"","",["woman-shrugging"],39,46,31,0,"Smileys & People",245],"1f937-200d-2642-fe0f":[["🤷‍♂️","🤷‍♂"],"","",["man-shrugging"],40,0,31,0,"Smileys & People",244],"1f937":[["🤷"],"","",["shrug"],40,6,15,0,"Smileys & People",243],"1f938-200d-2640-fe0f":[["🤸‍♀️","🤸‍♀"],"","",["woman-cartwheeling"],40,12,31,0,"Smileys & People",310],"1f938-200d-2642-fe0f":[["🤸‍♂️","🤸‍♂"],"","",["man-cartwheeling"],40,18,31,0,"Smileys & People",309],"1f938":[["🤸"],"","",["person_doing_cartwheel"],40,24,15,0,"Smileys & People",308],"1f939-200d-2640-fe0f":[["🤹‍♀️","🤹‍♀"],"","",["woman-juggling"],40,30,15,0,"Smileys & People",322],"1f939-200d-2642-fe0f":[["🤹‍♂️","🤹‍♂"],"","",["man-juggling"],40,36,15,0,"Smileys & People",321],"1f939":[["🤹"],"","",["juggling"],40,42,31,0,"Smileys & People",320],"1f93a":[["🤺"],"","",["fencer"],40,48,31,0,"Smileys & People",278],"1f93c-200d-2640-fe0f":[["🤼‍♀️","🤼‍♀"],"","",["woman-wrestling"],40,49,31,0,"Smileys & People",313],"1f93c-200d-2642-fe0f":[["🤼‍♂️","🤼‍♂"],"","",["man-wrestling"],40,50,31,0,"Smileys & People",312],"1f93c":[["🤼"],"","",["wrestlers"],40,51,15,0,"Smileys & People",311],"1f93d-200d-2640-fe0f":[["🤽‍♀️","🤽‍♀"],"","",["woman-playing-water-polo"],41,0,31,0,"Smileys & People",316],"1f93d-200d-2642-fe0f":[["🤽‍♂️","🤽‍♂"],"","",["man-playing-water-polo"],41,6,31,0,"Smileys & People",315],"1f93d":[["🤽"],"","",["water_polo"],41,12,15,0,"Smileys & People",314],"1f93e-200d-2640-fe0f":[["🤾‍♀️","🤾‍♀"],"","",["woman-playing-handball"],41,18,31,0,"Smileys & People",319],"1f93e-200d-2642-fe0f":[["🤾‍♂️","🤾‍♂"],"","",["man-playing-handball"],41,24,31,0,"Smileys & People",318],"1f93e":[["🤾"],"","",["handball"],41,30,15,0,"Smileys & People",317],"1f940":[["🥀"],"","",["wilted_flower"],41,36,31,0,"Animals & Nature",108],"1f941":[["🥁"],"","",["drum_with_drumsticks"],41,37,31,0,"Objects",24],"1f942":[["🥂"],"","",["clinking_glasses"],41,38,31,0,"Food & Drink",100],"1f943":[["🥃"],"","",["tumbler_glass"],41,39,31,0,"Food & Drink",101],"1f944":[["🥄"],"","",["spoon"],41,40,31,0,"Food & Drink",106],"1f945":[["🥅"],"","",["goal_net"],41,41,31,0,"Activities",46],"1f947":[["🥇"],"","",["first_place_medal"],41,42,31,0,"Activities",25],"1f948":[["🥈"],"","",["second_place_medal"],41,43,31,0,"Activities",26],"1f949":[["🥉"],"","",["third_place_medal"],41,44,31,0,"Activities",27],"1f94a":[["🥊"],"","",["boxing_glove"],41,45,31,0,"Activities",44],"1f94b":[["🥋"],"","",["martial_arts_uniform"],41,46,31,0,"Activities",45],"1f94c":[["🥌"],"","",["curling_stone"],41,47,31,0,"Activities",53],"1f950":[["🥐"],"","",["croissant"],41,48,31,0,"Food & Drink",31],"1f951":[["🥑"],"","",["avocado"],41,49,31,0,"Food & Drink",18],"1f952":[["🥒"],"","",["cucumber"],41,50,31,0,"Food & Drink",24],"1f953":[["🥓"],"","",["bacon"],41,51,31,0,"Food & Drink",40],"1f954":[["🥔"],"","",["potato"],42,0,31,0,"Food & Drink",20],"1f955":[["🥕"],"","",["carrot"],42,1,31,0,"Food & Drink",21],"1f956":[["🥖"],"","",["baguette_bread"],42,2,31,0,"Food & Drink",32],"1f957":[["🥗"],"","",["green_salad"],42,3,31,0,"Food & Drink",54],"1f958":[["🥘"],"","",["shallow_pan_of_food"],42,4,31,0,"Food & Drink",51],"1f959":[["🥙"],"","",["stuffed_flatbread"],42,5,31,0,"Food & Drink",48],"1f95a":[["🥚"],"","",["egg"],42,6,31,0,"Food & Drink",49],"1f95b":[["🥛"],"","",["glass_of_milk"],42,7,31,0,"Food & Drink",90],"1f95c":[["🥜"],"","",["peanuts"],42,8,31,0,"Food & Drink",28],"1f95d":[["🥝"],"","",["kiwifruit"],42,9,31,0,"Food & Drink",15],"1f95e":[["🥞"],"","",["pancakes"],42,10,31,0,"Food & Drink",35],"1f95f":[["🥟"],"","",["dumpling"],42,11,31,0,"Food & Drink",72],"1f960":[["🥠"],"","",["fortune_cookie"],42,12,31,0,"Food & Drink",73],"1f961":[["🥡"],"","",["takeout_box"],42,13,31,0,"Food & Drink",74],"1f962":[["🥢"],"","",["chopsticks"],42,14,31,0,"Food & Drink",103],"1f963":[["🥣"],"","",["bowl_with_spoon"],42,15,31,0,"Food & Drink",53],"1f964":[["🥤"],"","",["cup_with_straw"],42,16,31,0,"Food & Drink",102],"1f965":[["🥥"],"","",["coconut"],42,17,31,0,"Food & Drink",17],"1f966":[["🥦"],"","",["broccoli"],42,18,31,0,"Food & Drink",26],"1f967":[["🥧"],"","",["pie"],42,19,31,0,"Food & Drink",83],"1f968":[["🥨"],"","",["pretzel"],42,20,31,0,"Food & Drink",33],"1f969":[["🥩"],"","",["cut_of_meat"],42,21,31,0,"Food & Drink",39],"1f96a":[["🥪"],"","",["sandwich"],42,22,31,0,"Food & Drink",45],"1f96b":[["🥫"],"","",["canned_food"],42,23,31,0,"Food & Drink",57],"1f980":[["🦀"],"","",["crab"],42,24,31,0,"Animals & Nature",87],"1f981":[["🦁"],"","",["lion_face"],42,25,31,0,"Animals & Nature",12],"1f982":[["🦂"],"","",["scorpion"],42,26,31,0,"Animals & Nature",100],"1f983":[["🦃"],"","",["turkey"],42,27,31,0,"Animals & Nature",54],"1f984":[["🦄"],"","",["unicorn_face"],42,28,31,0,"Animals & Nature",18],"1f985":[["🦅"],"","",["eagle"],42,29,31,0,"Animals & Nature",63],"1f986":[["🦆"],"","",["duck"],42,30,31,0,"Animals & Nature",64],"1f987":[["🦇"],"","",["bat"],42,31,31,0,"Animals & Nature",47],"1f988":[["🦈"],"","",["shark"],42,32,31,0,"Animals & Nature",84],"1f989":[["🦉"],"","",["owl"],42,33,31,0,"Animals & Nature",66],"1f98a":[["🦊"],"","",["fox_face"],42,34,31,0,"Animals & Nature",8],"1f98b":[["🦋"],"","",["butterfly"],42,35,31,0,"Animals & Nature",92],"1f98c":[["🦌"],"","",["deer"],42,36,31,0,"Animals & Nature",20],"1f98d":[["🦍"],"","",["gorilla"],42,37,31,0,"Animals & Nature",3],"1f98e":[["🦎"],"","",["lizard"],42,38,31,0,"Animals & Nature",72],"1f98f":[["🦏"],"","",["rhinoceros"],42,39,31,0,"Animals & Nature",37],"1f990":[["🦐"],"","",["shrimp"],42,40,31,0,"Animals & Nature",89],"1f991":[["🦑"],"","",["squid"],42,41,31,0,"Animals & Nature",90],"1f992":[["🦒"],"","",["giraffe_face"],42,42,31,0,"Animals & Nature",35],"1f993":[["🦓"],"","",["zebra_face"],42,43,31,0,"Animals & Nature",19],"1f994":[["🦔"],"","",["hedgehog"],42,44,31,0,"Animals & Nature",46],"1f995":[["🦕"],"","",["sauropod"],42,45,31,0,"Animals & Nature",76],"1f996":[["🦖"],"","",["t-rex"],42,46,31,0,"Animals & Nature",77],"1f997":[["🦗"],"","",["cricket"],42,47,31,0,"Animals & Nature",97],"1f9c0":[["🧀"],"","",["cheese_wedge"],42,48,31,0,"Food & Drink",36],"1f9d0":[["🧐"],"","",["face_with_monocle"],42,49,31,0,"Smileys & People",88],"1f9d1":[["🧑"],"","",["adult"],42,50,31,0,"Smileys & People",118],"1f9d2":[["🧒"],"","",["child"],43,4,31,0,"Smileys & People",115],"1f9d3":[["🧓"],"","",["older_adult"],43,10,31,0,"Smileys & People",121],"1f9d4":[["🧔"],"","",["bearded_person"],43,16,31,0,"Smileys & People",175],"1f9d5":[["🧕"],"","",["person_with_headscarf"],43,22,31,0,"Smileys & People",174],"1f9d6-200d-2640-fe0f":[["🧖‍♀️","🧖‍♀"],"","",["woman_in_steamy_room"],43,28,31,0,"Smileys & People",264],"1f9d6-200d-2642-fe0f":[["🧖‍♂️","🧖‍♂","🧖"],"","",["man_in_steamy_room","person_in_steamy_room"],43,34,31,0,"Smileys & People",265],"1f9d7-200d-2640-fe0f":[["🧗‍♀️","🧗‍♀","🧗"],"","",["woman_climbing","person_climbing"],43,46,31,0,"Smileys & People",267],"1f9d7-200d-2642-fe0f":[["🧗‍♂️","🧗‍♂"],"","",["man_climbing"],44,0,31,0,"Smileys & People",268],"1f9d8-200d-2640-fe0f":[["🧘‍♀️","🧘‍♀","🧘"],"","",["woman_in_lotus_position","person_in_lotus_position"],44,12,31,0,"Smileys & People",270],"1f9d8-200d-2642-fe0f":[["🧘‍♂️","🧘‍♂"],"","",["man_in_lotus_position"],44,18,31,0,"Smileys & People",271],"1f9d9-200d-2640-fe0f":[["🧙‍♀️","🧙‍♀","🧙"],"","",["female_mage","mage"],44,30,31,0,"Smileys & People",199],"1f9d9-200d-2642-fe0f":[["🧙‍♂️","🧙‍♂"],"","",["male_mage"],44,36,31,0,"Smileys & People",200],"1f9da-200d-2640-fe0f":[["🧚‍♀️","🧚‍♀","🧚"],"","",["female_fairy","fairy"],44,48,31,0,"Smileys & People",202],"1f9da-200d-2642-fe0f":[["🧚‍♂️","🧚‍♂"],"","",["male_fairy"],45,2,31,0,"Smileys & People",203],"1f9db-200d-2640-fe0f":[["🧛‍♀️","🧛‍♀","🧛"],"","",["female_vampire","vampire"],45,14,31,0,"Smileys & People",205],"1f9db-200d-2642-fe0f":[["🧛‍♂️","🧛‍♂"],"","",["male_vampire"],45,20,31,0,"Smileys & People",206],"1f9dc-200d-2640-fe0f":[["🧜‍♀️","🧜‍♀"],"","",["mermaid"],45,32,31,0,"Smileys & People",208],"1f9dc-200d-2642-fe0f":[["🧜‍♂️","🧜‍♂","🧜"],"","",["merman","merperson"],45,38,31,0,"Smileys & People",209],"1f9dd-200d-2640-fe0f":[["🧝‍♀️","🧝‍♀"],"","",["female_elf"],45,50,31,0,"Smileys & People",211],"1f9dd-200d-2642-fe0f":[["🧝‍♂️","🧝‍♂","🧝"],"","",["male_elf","elf"],46,4,31,0,"Smileys & People",212],"1f9de-200d-2640-fe0f":[["🧞‍♀️","🧞‍♀"],"","",["female_genie"],46,16,31,0,"Smileys & People",214],"1f9de-200d-2642-fe0f":[["🧞‍♂️","🧞‍♂","🧞"],"","",["male_genie","genie"],46,17,31,0,"Smileys & People",215],"1f9df-200d-2640-fe0f":[["🧟‍♀️","🧟‍♀"],"","",["female_zombie"],46,19,31,0,"Smileys & People",217],"1f9df-200d-2642-fe0f":[["🧟‍♂️","🧟‍♂","🧟"],"","",["male_zombie","zombie"],46,20,31,0,"Smileys & People",218],"1f9e0":[["🧠"],"","",["brain"],46,22,31,0,"Smileys & People",401],"1f9e1":[["🧡"],"","",["orange_heart"],46,23,31,0,"Smileys & People",417],"1f9e2":[["🧢"],"","",["billed_cap"],46,24,31,0,"Smileys & People",468],"1f9e3":[["🧣"],"","",["scarf"],46,25,31,0,"Smileys & People",444],"1f9e4":[["🧤"],"","",["gloves"],46,26,31,0,"Smileys & People",445],"1f9e5":[["🧥"],"","",["coat"],46,27,31,0,"Smileys & People",446],"1f9e6":[["🧦"],"","",["socks"],46,28,31,0,"Smileys & People",447],"203c-fe0f":[["‼️","‼"],"","󾬆",["bangbang"],46,29,63,0,"Symbols",122],"2049-fe0f":[["⁉️","⁉"],"","󾬅",["interrobang"],46,30,63,0,"Symbols",123],"2122-fe0f":[["™️","™"],"","󾬪",["tm"],46,31,63,0,"Symbols",131],"2139-fe0f":[["ℹ️","ℹ"],"","󾭇",["information_source"],46,32,63,0,"Symbols",157],"2194-fe0f":[["↔️","↔"],"","󾫶",["left_right_arrow"],46,33,63,0,"Symbols",36],"2195-fe0f":[["↕️","↕"],"","󾫷",["arrow_up_down"],46,34,63,0,"Symbols",35],"2196-fe0f":[["↖️","↖"],"","󾫲",["arrow_upper_left"],46,35,63,0,"Symbols",34],"2197-fe0f":[["↗️","↗"],"","󾫰",["arrow_upper_right"],46,36,63,0,"Symbols",28],"2198-fe0f":[["↘️","↘"],"","󾫱",["arrow_lower_right"],46,37,63,0,"Symbols",30],"2199-fe0f":[["↙️","↙"],"","󾫳",["arrow_lower_left"],46,38,63,0,"Symbols",32],"21a9-fe0f":[["↩️","↩"],"","󾮃",["leftwards_arrow_with_hook"],46,39,63,0,"Symbols",37],"21aa-fe0f":[["↪️","↪"],"","󾮈",["arrow_right_hook"],46,40,63,0,"Symbols",38],"231a":[["⌚"],"","󾀝",["watch"],46,41,63,0,"Travel & Places",129],"231b":[["⌛"],"","󾀜",["hourglass"],46,42,63,0,"Travel & Places",127],"2328-fe0f":[["⌨️","⌨"],"","",["keyboard"],46,43,31,0,"Objects",36],"23cf-fe0f":[["⏏️","⏏"],"","",["eject"],46,44,31,0,"Symbols",90],"23e9":[["⏩"],"","󾫾",["fast_forward"],46,45,63,0,"Symbols",77],"23ea":[["⏪"],"","󾫿",["rewind"],46,46,63,0,"Symbols",81],"23eb":[["⏫"],"","󾬃",["arrow_double_up"],46,47,63,0,"Symbols",84],"23ec":[["⏬"],"","󾬂",["arrow_double_down"],46,48,63,0,"Symbols",86],"23ed-fe0f":[["⏭️","⏭"],"","",["black_right_pointing_double_triangle_with_vertical_bar"],46,49,31,0,"Symbols",78],"23ee-fe0f":[["⏮️","⏮"],"","",["black_left_pointing_double_triangle_with_vertical_bar"],46,50,31,0,"Symbols",82],"23ef-fe0f":[["⏯️","⏯"],"","",["black_right_pointing_triangle_with_double_vertical_bar"],46,51,31,0,"Symbols",79],"23f0":[["⏰"],"","󾀪",["alarm_clock"],47,0,63,0,"Travel & Places",130],"23f1-fe0f":[["⏱️","⏱"],"","",["stopwatch"],47,1,31,0,"Travel & Places",131],"23f2-fe0f":[["⏲️","⏲"],"","",["timer_clock"],47,2,31,0,"Travel & Places",132],"23f3":[["⏳"],"","󾀛",["hourglass_flowing_sand"],47,3,63,0,"Travel & Places",128],"23f8-fe0f":[["⏸️","⏸"],"","",["double_vertical_bar"],47,4,31,0,"Symbols",87],"23f9-fe0f":[["⏹️","⏹"],"","",["black_square_for_stop"],47,5,31,0,"Symbols",88],"23fa-fe0f":[["⏺️","⏺"],"","",["black_circle_for_record"],47,6,31,0,"Symbols",89],"24c2-fe0f":[["Ⓜ️","Ⓜ"],"","󾟡",["m"],47,7,63,0,"Symbols",159],"25aa-fe0f":[["▪️","▪"],"","󾭮",["black_small_square"],47,8,63,0,"Symbols",185],"25ab-fe0f":[["▫️","▫"],"","󾭭",["white_small_square"],47,9,63,0,"Symbols",186],"25b6-fe0f":[["▶️","▶"],"","󾫼",["arrow_forward"],47,10,63,0,"Symbols",76],"25c0-fe0f":[["◀️","◀"],"","󾫽",["arrow_backward"],47,11,63,0,"Symbols",80],"25fb-fe0f":[["◻️","◻"],"","󾭱",["white_medium_square"],47,12,63,0,"Symbols",187],"25fc-fe0f":[["◼️","◼"],"","󾭲",["black_medium_square"],47,13,63,0,"Symbols",188],"25fd":[["◽"],"","󾭯",["white_medium_small_square"],47,14,63,0,"Symbols",189],"25fe":[["◾"],"","󾭰",["black_medium_small_square"],47,15,63,0,"Symbols",190],"2600-fe0f":[["☀️","☀"],"","󾀀",["sunny"],47,16,63,0,"Travel & Places",171],"2601-fe0f":[["☁️","☁"],"","󾀁",["cloud"],47,17,63,0,"Travel & Places",177],"2602-fe0f":[["☂️","☂"],"","",["umbrella"],47,18,31,0,"Travel & Places",192],"2603-fe0f":[["☃️","☃"],"","",["snowman"],47,19,31,0,"Travel & Places",197],"2604-fe0f":[["☄️","☄"],"","",["comet"],47,20,31,0,"Travel & Places",199],"260e-fe0f":[["☎️","☎"],"","󾔣",["phone","telephone"],47,21,63,0,"Objects",27],"2611-fe0f":[["☑️","☑"],"","󾮋",["ballot_box_with_check"],47,22,63,0,"Symbols",108],"2618-fe0f":[["☘️","☘"],"","",["shamrock"],47,25,31,0,"Animals & Nature",120],"261d-fe0f":[["☝️","☝"],"","󾮘",["point_up"],47,26,63,0,"Smileys & People",366],"2620-fe0f":[["☠️","☠"],"","",["skull_and_crossbones"],47,32,31,0,"Smileys & People",96],"2622-fe0f":[["☢️","☢"],"","",["radioactive_sign"],47,33,31,0,"Symbols",25],"2623-fe0f":[["☣️","☣"],"","",["biohazard_sign"],47,34,31,0,"Symbols",26],"2626-fe0f":[["☦️","☦"],"","",["orthodox_cross"],47,35,31,0,"Symbols",55],"262a-fe0f":[["☪️","☪"],"","",["star_and_crescent"],47,36,31,0,"Symbols",56],"262e-fe0f":[["☮️","☮"],"","",["peace_symbol"],47,37,31,0,"Symbols",57],"262f-fe0f":[["☯️","☯"],"","",["yin_yang"],47,38,31,0,"Symbols",53],"2638-fe0f":[["☸️","☸"],"","",["wheel_of_dharma"],47,39,31,0,"Symbols",52],"2639-fe0f":[["☹️","☹"],"","",["white_frowning_face"],47,40,31,0,"Smileys & People",50],"263a-fe0f":[["☺️","☺"],"","󾌶",["relaxed"],47,41,63,0,"Smileys & People",19],"2640-fe0f":[["♀️","♀"],"","",["female_sign"],47,42,30,0,"Symbols",97],"2642-fe0f":[["♂️","♂"],"","",["male_sign"],47,43,30,0,"Symbols",98],"264a":[["♊"],"","󾀭",["gemini"],47,46,63,0,"Symbols",62],"264b":[["♋"],"","󾀮",["cancer"],47,47,63,0,"Symbols",63],"264c":[["♌"],"","󾀯",["leo"],47,48,63,0,"Symbols",64],"264d":[["♍"],"","󾀰",["virgo"],47,49,63,0,"Symbols",65],"264e":[["♎"],"","󾀱",["libra"],47,50,63,0,"Symbols",66],"264f":[["♏"],"","󾀲",["scorpius"],47,51,63,0,"Symbols",67],"2660-fe0f":[["♠️","♠"],"","󾬛",["spades"],48,4,63,0,"Activities",64],"2663-fe0f":[["♣️","♣"],"","󾬝",["clubs"],48,5,63,0,"Activities",67],"2665-fe0f":[["♥️","♥"],"","󾬚",["hearts"],48,6,63,0,"Activities",65],"2666-fe0f":[["♦️","♦"],"","󾬜",["diamonds"],48,7,63,0,"Activities",66],"2668-fe0f":[["♨️","♨"],"","󾟺",["hotsprings"],48,8,63,0,"Travel & Places",56],"267b-fe0f":[["♻️","♻"],"","󾬬",["recycle"],48,9,63,0,"Symbols",101],"267f":[["♿"],"","󾬠",["wheelchair"],48,10,63,0,"Symbols",4],"2692-fe0f":[["⚒️","⚒"],"","",["hammer_and_pick"],48,11,31,0,"Objects",138],"2694-fe0f":[["⚔️","⚔"],"","",["crossed_swords"],48,13,31,0,"Objects",141],"2695-fe0f":[["⚕️","⚕"],"","",["medical_symbol","staff_of_aesculapius"],48,14,30,0,"Symbols",99],"2696-fe0f":[["⚖️","⚖"],"","",["scales"],48,15,31,0,"Objects",149],"2697-fe0f":[["⚗️","⚗"],"","",["alembic"],48,16,31,0,"Objects",154],"2699-fe0f":[["⚙️","⚙"],"","",["gear"],48,17,31,0,"Objects",147],"269b-fe0f":[["⚛️","⚛"],"","",["atom_symbol"],48,18,31,0,"Symbols",49],"269c-fe0f":[["⚜️","⚜"],"","",["fleur_de_lis"],48,19,31,0,"Symbols",102],"26a0-fe0f":[["⚠️","⚠"],"","󾬣",["warning"],48,20,63,0,"Symbols",14],"26a1":[["⚡"],"","󾀄",["zap"],48,21,63,0,"Travel & Places",195],"26aa":[["⚪"],"","󾭥",["white_circle"],48,22,63,0,"Symbols",203],"26ab":[["⚫"],"","󾭦",["black_circle"],48,23,63,0,"Symbols",204],"26b0-fe0f":[["⚰️","⚰"],"","",["coffin"],48,24,31,0,"Objects",179],"26b1-fe0f":[["⚱️","⚱"],"","",["funeral_urn"],48,25,31,0,"Objects",180],"26bd":[["⚽"],"","󾟔",["soccer"],48,26,63,0,"Activities",28],"26be":[["⚾"],"","󾟑",["baseball"],48,27,63,0,"Activities",29],"26c4":[["⛄"],"","󾀃",["snowman_without_snow"],48,28,63,0,"Travel & Places",198],"26c5":[["⛅"],"","󾀏",["partly_sunny"],48,29,63,0,"Travel & Places",178],"26c8-fe0f":[["⛈️","⛈"],"","",["thunder_cloud_and_rain"],48,30,31,0,"Travel & Places",179],"26ce":[["⛎"],"","󾀷",["ophiuchus"],48,31,63,0,"Symbols",72],"26cf-fe0f":[["⛏️","⛏"],"","",["pick"],48,32,31,0,"Objects",137],"26d1-fe0f":[["⛑️","⛑"],"","",["helmet_with_white_cross"],48,33,31,0,"Smileys & People",469],"26d3-fe0f":[["⛓️","⛓"],"","",["chains"],48,34,31,0,"Objects",151],"26d4":[["⛔"],"","󾬦",["no_entry"],48,35,63,0,"Symbols",16],"26e9-fe0f":[["⛩️","⛩"],"","",["shinto_shrine"],48,36,31,0,"Travel & Places",44],"26ea":[["⛪"],"","󾒻",["church"],48,37,63,0,"Travel & Places",41],"26f0-fe0f":[["⛰️","⛰"],"","",["mountain"],48,38,31,0,"Travel & Places",9],"26f1-fe0f":[["⛱️","⛱"],"","",["umbrella_on_ground"],48,39,31,0,"Travel & Places",194],"26f2":[["⛲"],"","󾒼",["fountain"],48,40,63,0,"Travel & Places",46],"26f3":[["⛳"],"","󾟒",["golf"],48,41,63,0,"Activities",47],"26f4-fe0f":[["⛴️","⛴"],"","",["ferry"],48,42,31,0,"Travel & Places",110],"26f5":[["⛵"],"","󾟪",["boat","sailboat"],48,43,63,0,"Travel & Places",106],"26f7-fe0f":[["⛷️","⛷"],"","",["skier"],48,44,31,0,"Smileys & People",280],"26f8-fe0f":[["⛸️","⛸"],"","",["ice_skate"],48,45,31,0,"Activities",48],"26f9-fe0f-200d-2640-fe0f":[["⛹️‍♀️"],"","",["woman-bouncing-ball"],48,46,15,0,"Smileys & People",296],"26f9-fe0f-200d-2642-fe0f":[["⛹️‍♂️","⛹️","⛹"],"","",["man-bouncing-ball","person_with_ball"],49,0,15,0,"Smileys & People",295],"26fa":[["⛺"],"","󾟻",["tent"],49,12,63,0,"Travel & Places",47],"26fd":[["⛽"],"","󾟵",["fuelpump"],49,13,63,0,"Travel & Places",99],"2702-fe0f":[["✂️","✂"],"","󾔾",["scissors"],49,14,63,0,"Objects",126],"2708-fe0f":[["✈️","✈"],"","󾟩",["airplane"],49,16,63,0,"Travel & Places",113],"2709-fe0f":[["✉️","✉"],"","󾔩",["email","envelope"],49,17,63,0,"Objects",87],"270a":[["✊"],"","󾮓",["fist"],49,18,63,0,"Smileys & People",380],"270b":[["✋"],"","󾮕",["hand","raised_hand"],49,24,63,0,"Smileys & People",376],"270c-fe0f":[["✌️","✌"],"","󾮔",["v"],49,30,63,0,"Smileys & People",370],"270d-fe0f":[["✍️","✍"],"","",["writing_hand"],49,36,31,0,"Smileys & People",387],"270f-fe0f":[["✏️","✏"],"","󾔹",["pencil2"],49,42,63,0,"Objects",100],"2712-fe0f":[["✒️","✒"],"","󾔶",["black_nib"],49,43,63,0,"Objects",101],"2714-fe0f":[["✔️","✔"],"","󾭉",["heavy_check_mark"],49,44,63,0,"Symbols",109],"2716-fe0f":[["✖️","✖"],"","󾭓",["heavy_multiplication_x"],49,45,63,0,"Symbols",110],"271d-fe0f":[["✝️","✝"],"","",["latin_cross"],49,46,31,0,"Symbols",54],"2721-fe0f":[["✡️","✡"],"","",["star_of_david"],49,47,31,0,"Symbols",51],"2733-fe0f":[["✳️","✳"],"","󾭢",["eight_spoked_asterisk"],49,49,63,0,"Symbols",119],"2734-fe0f":[["✴️","✴"],"","󾭡",["eight_pointed_black_star"],49,50,63,0,"Symbols",120],"2744-fe0f":[["❄️","❄"],"","󾀎",["snowflake"],49,51,63,0,"Travel & Places",196],"2747-fe0f":[["❇️","❇"],"","󾭷",["sparkle"],50,0,63,0,"Symbols",121],"274c":[["❌"],"","󾭅",["x"],50,1,63,0,"Symbols",111],"274e":[["❎"],"","󾭆",["negative_squared_cross_mark"],50,2,63,0,"Symbols",112],"2763-fe0f":[["❣️","❣"],"","",["heavy_heart_exclamation_mark_ornament"],50,7,31,0,"Smileys & People",423],"2764-fe0f":[["❤️","❤"],"","󾬌",["heart"],50,8,63,0,"<3","Smileys & People",408],"27a1-fe0f":[["➡️","➡"],"","󾫺",["arrow_right"],50,12,63,0,"Symbols",29],"27b0":[["➰"],"","󾬈",["curly_loop"],50,13,63,0,"Symbols",116],"27bf":[["➿"],"","󾠫",["loop"],50,14,63,0,"Symbols",117],"2934-fe0f":[["⤴️","⤴"],"","󾫴",["arrow_heading_up"],50,15,63,0,"Symbols",39],"2935-fe0f":[["⤵️","⤵"],"","󾫵",["arrow_heading_down"],50,16,63,0,"Symbols",40],"2b05-fe0f":[["⬅️","⬅"],"","󾫻",["arrow_left"],50,17,63,0,"Symbols",33],"2b06-fe0f":[["⬆️","⬆"],"","󾫸",["arrow_up"],50,18,63,0,"Symbols",27],"2b07-fe0f":[["⬇️","⬇"],"","󾫹",["arrow_down"],50,19,63,0,"Symbols",31],"2b1b":[["⬛"],"","󾭬",["black_large_square"],50,20,63,0,"Symbols",191],"2b1c":[["⬜"],"","󾭫",["white_large_square"],50,21,63,0,"Symbols",192],"2b50":[["⭐"],"","󾭨",["star"],50,22,63,0,"Travel & Places",174],"2b55":[["⭕"],"","󾭄",["o"],50,23,63,0,"Symbols",106],"3030-fe0f":[["〰️","〰"],"","󾬇",["wavy_dash"],50,24,63,0,"Symbols",128],"303d-fe0f":[["〽️","〽"],"","󾠛",["part_alternation_mark"],50,25,63,0,"Symbols",118],"3297-fe0f":[["㊗️","㊗"],"","󾭃",["congratulations"],50,26,63,0,"Symbols",181],"3299-fe0f":[["㊙️","㊙"],"","󾬫",["secret"],50,27,63,0,"Symbols",182]};

    /** @private */
    emoji.prototype.obsoletes_data = {
        "1f3c3-200d-2642-fe0f":["1f3c3",9,46,47],
        "1f3c3-1f3fb-200d-2642-fe0f":["1f3c3-1f3fb",9,47,47],
        "1f3c3-1f3fc-200d-2642-fe0f":["1f3c3-1f3fc",9,48,47],
        "1f3c3-1f3fd-200d-2642-fe0f":["1f3c3-1f3fd",9,49,47],
        "1f3c3-1f3fe-200d-2642-fe0f":["1f3c3-1f3fe",9,50,47],
        "1f3c3-1f3ff-200d-2642-fe0f":["1f3c3-1f3ff",9,51,47],
        "1f3c4-200d-2642-fe0f":["1f3c4",10,12,47],
        "1f3c4-1f3fb-200d-2642-fe0f":["1f3c4-1f3fb",10,13,47],
        "1f3c4-1f3fc-200d-2642-fe0f":["1f3c4-1f3fc",10,14,47],
        "1f3c4-1f3fd-200d-2642-fe0f":["1f3c4-1f3fd",10,15,47],
        "1f3c4-1f3fe-200d-2642-fe0f":["1f3c4-1f3fe",10,16,47],
        "1f3c4-1f3ff-200d-2642-fe0f":["1f3c4-1f3ff",10,17,47],
        "1f3ca-200d-2642-fe0f":["1f3ca",10,40,47],
        "1f3ca-1f3fb-200d-2642-fe0f":["1f3ca-1f3fb",10,41,47],
        "1f3ca-1f3fc-200d-2642-fe0f":["1f3ca-1f3fc",10,42,47],
        "1f3ca-1f3fd-200d-2642-fe0f":["1f3ca-1f3fd",10,43,47],
        "1f3ca-1f3fe-200d-2642-fe0f":["1f3ca-1f3fe",10,44,47],
        "1f3ca-1f3ff-200d-2642-fe0f":["1f3ca-1f3ff",10,45,47],
        "1f3cb-fe0f-200d-2642-fe0f":["1f3cb-fe0f",11,6,15],
        "1f3cb-1f3fb-200d-2642-fe0f":["1f3cb-1f3fb",11,7,15],
        "1f3cb-1f3fc-200d-2642-fe0f":["1f3cb-1f3fc",11,8,15],
        "1f3cb-1f3fd-200d-2642-fe0f":["1f3cb-1f3fd",11,9,15],
        "1f3cb-1f3fe-200d-2642-fe0f":["1f3cb-1f3fe",11,10,15],
        "1f3cb-1f3ff-200d-2642-fe0f":["1f3cb-1f3ff",11,11,15],
        "1f3cc-fe0f-200d-2642-fe0f":["1f3cc-fe0f",11,24,15],
        "1f3cc-1f3fb-200d-2642-fe0f":["1f3cc-1f3fb",11,25,15],
        "1f3cc-1f3fc-200d-2642-fe0f":["1f3cc-1f3fc",11,26,15],
        "1f3cc-1f3fd-200d-2642-fe0f":["1f3cc-1f3fd",11,27,15],
        "1f3cc-1f3fe-200d-2642-fe0f":["1f3cc-1f3fe",11,28,15],
        "1f3cc-1f3ff-200d-2642-fe0f":["1f3cc-1f3ff",11,29,15],
        "1f468-200d-1f469-200d-1f466":["1f46a",20,29,47],
        "1f46e-200d-2642-fe0f":["1f46e",20,45,47],
        "1f46e-1f3fb-200d-2642-fe0f":["1f46e-1f3fb",20,46,47],
        "1f46e-1f3fc-200d-2642-fe0f":["1f46e-1f3fc",20,47,47],
        "1f46e-1f3fd-200d-2642-fe0f":["1f46e-1f3fd",20,48,47],
        "1f46e-1f3fe-200d-2642-fe0f":["1f46e-1f3fe",20,49,47],
        "1f46e-1f3ff-200d-2642-fe0f":["1f46e-1f3ff",20,50,47],
        "1f46f-200d-2640-fe0f":["1f46f",21,1,47],
        "1f471-200d-2642-fe0f":["1f471",21,20,47],
        "1f471-1f3fb-200d-2642-fe0f":["1f471-1f3fb",21,21,47],
        "1f471-1f3fc-200d-2642-fe0f":["1f471-1f3fc",21,22,47],
        "1f471-1f3fd-200d-2642-fe0f":["1f471-1f3fd",21,23,47],
        "1f471-1f3fe-200d-2642-fe0f":["1f471-1f3fe",21,24,47],
        "1f471-1f3ff-200d-2642-fe0f":["1f471-1f3ff",21,25,47],
        "1f473-200d-2642-fe0f":["1f473",21,44,47],
        "1f473-1f3fb-200d-2642-fe0f":["1f473-1f3fb",21,45,47],
        "1f473-1f3fc-200d-2642-fe0f":["1f473-1f3fc",21,46,47],
        "1f473-1f3fd-200d-2642-fe0f":["1f473-1f3fd",21,47,47],
        "1f473-1f3fe-200d-2642-fe0f":["1f473-1f3fe",21,48,47],
        "1f473-1f3ff-200d-2642-fe0f":["1f473-1f3ff",21,49,47],
        "1f477-200d-2642-fe0f":["1f477",22,28,47],
        "1f477-1f3fb-200d-2642-fe0f":["1f477-1f3fb",22,29,47],
        "1f477-1f3fc-200d-2642-fe0f":["1f477-1f3fc",22,30,47],
        "1f477-1f3fd-200d-2642-fe0f":["1f477-1f3fd",22,31,47],
        "1f477-1f3fe-200d-2642-fe0f":["1f477-1f3fe",22,32,47],
        "1f477-1f3ff-200d-2642-fe0f":["1f477-1f3ff",22,33,47],
        "1f481-200d-2640-fe0f":["1f481",23,13,47],
        "1f481-1f3fb-200d-2640-fe0f":["1f481-1f3fb",23,14,47],
        "1f481-1f3fc-200d-2640-fe0f":["1f481-1f3fc",23,15,47],
        "1f481-1f3fd-200d-2640-fe0f":["1f481-1f3fd",23,16,47],
        "1f481-1f3fe-200d-2640-fe0f":["1f481-1f3fe",23,17,47],
        "1f481-1f3ff-200d-2640-fe0f":["1f481-1f3ff",23,18,47],
        "1f482-200d-2642-fe0f":["1f482",23,31,47],
        "1f482-1f3fb-200d-2642-fe0f":["1f482-1f3fb",23,32,47],
        "1f482-1f3fc-200d-2642-fe0f":["1f482-1f3fc",23,33,47],
        "1f482-1f3fd-200d-2642-fe0f":["1f482-1f3fd",23,34,47],
        "1f482-1f3fe-200d-2642-fe0f":["1f482-1f3fe",23,35,47],
        "1f482-1f3ff-200d-2642-fe0f":["1f482-1f3ff",23,36,47],
        "1f486-200d-2640-fe0f":["1f486",24,10,47],
        "1f486-1f3fb-200d-2640-fe0f":["1f486-1f3fb",24,11,47],
        "1f486-1f3fc-200d-2640-fe0f":["1f486-1f3fc",24,12,47],
        "1f486-1f3fd-200d-2640-fe0f":["1f486-1f3fd",24,13,47],
        "1f486-1f3fe-200d-2640-fe0f":["1f486-1f3fe",24,14,47],
        "1f486-1f3ff-200d-2640-fe0f":["1f486-1f3ff",24,15,47],
        "1f487-200d-2640-fe0f":["1f487",24,28,47],
        "1f487-1f3fb-200d-2640-fe0f":["1f487-1f3fb",24,29,47],
        "1f487-1f3fc-200d-2640-fe0f":["1f487-1f3fc",24,30,47],
        "1f487-1f3fd-200d-2640-fe0f":["1f487-1f3fd",24,31,47],
        "1f487-1f3fe-200d-2640-fe0f":["1f487-1f3fe",24,32,47],
        "1f487-1f3ff-200d-2640-fe0f":["1f487-1f3ff",24,33,47],
        "1f469-200d-2764-fe0f-200d-1f48b-200d-1f468":["1f48f",24,41,47],
        "1f469-200d-2764-fe0f-200d-1f468":["1f491",24,43,47],
        "1f575-fe0f-200d-2642-fe0f":["1f575-fe0f",29,11,15],
        "1f575-1f3fb-200d-2642-fe0f":["1f575-1f3fb",29,12,15],
        "1f575-1f3fc-200d-2642-fe0f":["1f575-1f3fc",29,13,15],
        "1f575-1f3fd-200d-2642-fe0f":["1f575-1f3fd",29,14,15],
        "1f575-1f3fe-200d-2642-fe0f":["1f575-1f3fe",29,15,15],
        "1f575-1f3ff-200d-2642-fe0f":["1f575-1f3ff",29,16,15],
        "1f645-200d-2640-fe0f":["1f645",32,1,47],
        "1f645-1f3fb-200d-2640-fe0f":["1f645-1f3fb",32,2,47],
        "1f645-1f3fc-200d-2640-fe0f":["1f645-1f3fc",32,3,47],
        "1f645-1f3fd-200d-2640-fe0f":["1f645-1f3fd",32,4,47],
        "1f645-1f3fe-200d-2640-fe0f":["1f645-1f3fe",32,5,47],
        "1f645-1f3ff-200d-2640-fe0f":["1f645-1f3ff",32,6,47],
        "1f646-200d-2640-fe0f":["1f646",32,19,47],
        "1f646-1f3fb-200d-2640-fe0f":["1f646-1f3fb",32,20,47],
        "1f646-1f3fc-200d-2640-fe0f":["1f646-1f3fc",32,21,47],
        "1f646-1f3fd-200d-2640-fe0f":["1f646-1f3fd",32,22,47],
        "1f646-1f3fe-200d-2640-fe0f":["1f646-1f3fe",32,23,47],
        "1f646-1f3ff-200d-2640-fe0f":["1f646-1f3ff",32,24,47],
        "1f647-200d-2642-fe0f":["1f647",32,37,47],
        "1f647-1f3fb-200d-2642-fe0f":["1f647-1f3fb",32,38,47],
        "1f647-1f3fc-200d-2642-fe0f":["1f647-1f3fc",32,39,47],
        "1f647-1f3fd-200d-2642-fe0f":["1f647-1f3fd",32,40,47],
        "1f647-1f3fe-200d-2642-fe0f":["1f647-1f3fe",32,41,47],
        "1f647-1f3ff-200d-2642-fe0f":["1f647-1f3ff",32,42,47],
        "1f64b-200d-2640-fe0f":["1f64b",33,6,47],
        "1f64b-1f3fb-200d-2640-fe0f":["1f64b-1f3fb",33,7,47],
        "1f64b-1f3fc-200d-2640-fe0f":["1f64b-1f3fc",33,8,47],
        "1f64b-1f3fd-200d-2640-fe0f":["1f64b-1f3fd",33,9,47],
        "1f64b-1f3fe-200d-2640-fe0f":["1f64b-1f3fe",33,10,47],
        "1f64b-1f3ff-200d-2640-fe0f":["1f64b-1f3ff",33,11,47],
        "1f64d-200d-2640-fe0f":["1f64d",33,30,47],
        "1f64d-1f3fb-200d-2640-fe0f":["1f64d-1f3fb",33,31,47],
        "1f64d-1f3fc-200d-2640-fe0f":["1f64d-1f3fc",33,32,47],
        "1f64d-1f3fd-200d-2640-fe0f":["1f64d-1f3fd",33,33,47],
        "1f64d-1f3fe-200d-2640-fe0f":["1f64d-1f3fe",33,34,47],
        "1f64d-1f3ff-200d-2640-fe0f":["1f64d-1f3ff",33,35,47],
        "1f64e-200d-2640-fe0f":["1f64e",33,48,47],
        "1f64e-1f3fb-200d-2640-fe0f":["1f64e-1f3fb",33,49,47],
        "1f64e-1f3fc-200d-2640-fe0f":["1f64e-1f3fc",33,50,47],
        "1f64e-1f3fd-200d-2640-fe0f":["1f64e-1f3fd",33,51,47],
        "1f64e-1f3fe-200d-2640-fe0f":["1f64e-1f3fe",34,0,47],
        "1f64e-1f3ff-200d-2640-fe0f":["1f64e-1f3ff",34,1,47],
        "1f6a3-200d-2642-fe0f":["1f6a3",35,3,47],
        "1f6a3-1f3fb-200d-2642-fe0f":["1f6a3-1f3fb",35,4,15],
        "1f6a3-1f3fc-200d-2642-fe0f":["1f6a3-1f3fc",35,5,15],
        "1f6a3-1f3fd-200d-2642-fe0f":["1f6a3-1f3fd",35,6,15],
        "1f6a3-1f3fe-200d-2642-fe0f":["1f6a3-1f3fe",35,7,15],
        "1f6a3-1f3ff-200d-2642-fe0f":["1f6a3-1f3ff",35,8,15],
        "1f6b4-200d-2642-fe0f":["1f6b4",35,37,47],
        "1f6b4-1f3fb-200d-2642-fe0f":["1f6b4-1f3fb",35,38,47],
        "1f6b4-1f3fc-200d-2642-fe0f":["1f6b4-1f3fc",35,39,47],
        "1f6b4-1f3fd-200d-2642-fe0f":["1f6b4-1f3fd",35,40,47],
        "1f6b4-1f3fe-200d-2642-fe0f":["1f6b4-1f3fe",35,41,47],
        "1f6b4-1f3ff-200d-2642-fe0f":["1f6b4-1f3ff",35,42,47],
        "1f6b5-200d-2642-fe0f":["1f6b5",36,3,47],
        "1f6b5-1f3fb-200d-2642-fe0f":["1f6b5-1f3fb",36,4,47],
        "1f6b5-1f3fc-200d-2642-fe0f":["1f6b5-1f3fc",36,5,47],
        "1f6b5-1f3fd-200d-2642-fe0f":["1f6b5-1f3fd",36,6,47],
        "1f6b5-1f3fe-200d-2642-fe0f":["1f6b5-1f3fe",36,7,47],
        "1f6b5-1f3ff-200d-2642-fe0f":["1f6b5-1f3ff",36,8,47],
        "1f6b6-200d-2642-fe0f":["1f6b6",36,21,47],
        "1f6b6-1f3fb-200d-2642-fe0f":["1f6b6-1f3fb",36,22,47],
        "1f6b6-1f3fc-200d-2642-fe0f":["1f6b6-1f3fc",36,23,47],
        "1f6b6-1f3fd-200d-2642-fe0f":["1f6b6-1f3fd",36,24,47],
        "1f6b6-1f3fe-200d-2642-fe0f":["1f6b6-1f3fe",36,25,47],
        "1f6b6-1f3ff-200d-2642-fe0f":["1f6b6-1f3ff",36,26,47],
        "1f9d6-200d-2642-fe0f":["1f9d6",43,40,31],
        "1f9d6-1f3fb-200d-2642-fe0f":["1f9d6-1f3fb",43,41,31],
        "1f9d6-1f3fc-200d-2642-fe0f":["1f9d6-1f3fc",43,42,31],
        "1f9d6-1f3fd-200d-2642-fe0f":["1f9d6-1f3fd",43,43,31],
        "1f9d6-1f3fe-200d-2642-fe0f":["1f9d6-1f3fe",43,44,31],
        "1f9d6-1f3ff-200d-2642-fe0f":["1f9d6-1f3ff",43,45,31],
        "1f9d7-200d-2640-fe0f":["1f9d7",44,6,31],
        "1f9d7-1f3fb-200d-2640-fe0f":["1f9d7-1f3fb",44,7,31],
        "1f9d7-1f3fc-200d-2640-fe0f":["1f9d7-1f3fc",44,8,31],
        "1f9d7-1f3fd-200d-2640-fe0f":["1f9d7-1f3fd",44,9,31],
        "1f9d7-1f3fe-200d-2640-fe0f":["1f9d7-1f3fe",44,10,31],
        "1f9d7-1f3ff-200d-2640-fe0f":["1f9d7-1f3ff",44,11,31],
        "1f9d8-200d-2640-fe0f":["1f9d8",44,24,31],
        "1f9d8-1f3fb-200d-2640-fe0f":["1f9d8-1f3fb",44,25,31],
        "1f9d8-1f3fc-200d-2640-fe0f":["1f9d8-1f3fc",44,26,31],
        "1f9d8-1f3fd-200d-2640-fe0f":["1f9d8-1f3fd",44,27,31],
        "1f9d8-1f3fe-200d-2640-fe0f":["1f9d8-1f3fe",44,28,31],
        "1f9d8-1f3ff-200d-2640-fe0f":["1f9d8-1f3ff",44,29,31],
        "1f9d9-200d-2640-fe0f":["1f9d9",44,42,31],
        "1f9d9-1f3fb-200d-2640-fe0f":["1f9d9-1f3fb",44,43,31],
        "1f9d9-1f3fc-200d-2640-fe0f":["1f9d9-1f3fc",44,44,31],
        "1f9d9-1f3fd-200d-2640-fe0f":["1f9d9-1f3fd",44,45,31],
        "1f9d9-1f3fe-200d-2640-fe0f":["1f9d9-1f3fe",44,46,31],
        "1f9d9-1f3ff-200d-2640-fe0f":["1f9d9-1f3ff",44,47,31],
        "1f9da-200d-2640-fe0f":["1f9da",45,8,31],
        "1f9da-1f3fb-200d-2640-fe0f":["1f9da-1f3fb",45,9,15],
        "1f9da-1f3fc-200d-2640-fe0f":["1f9da-1f3fc",45,10,15],
        "1f9da-1f3fd-200d-2640-fe0f":["1f9da-1f3fd",45,11,15],
        "1f9da-1f3fe-200d-2640-fe0f":["1f9da-1f3fe",45,12,15],
        "1f9da-1f3ff-200d-2640-fe0f":["1f9da-1f3ff",45,13,15],
        "1f9db-200d-2640-fe0f":["1f9db",45,26,31],
        "1f9db-1f3fb-200d-2640-fe0f":["1f9db-1f3fb",45,27,15],
        "1f9db-1f3fc-200d-2640-fe0f":["1f9db-1f3fc",45,28,15],
        "1f9db-1f3fd-200d-2640-fe0f":["1f9db-1f3fd",45,29,15],
        "1f9db-1f3fe-200d-2640-fe0f":["1f9db-1f3fe",45,30,15],
        "1f9db-1f3ff-200d-2640-fe0f":["1f9db-1f3ff",45,31,15],
        "1f9dc-200d-2642-fe0f":["1f9dc",45,44,31],
        "1f9dc-1f3fb-200d-2642-fe0f":["1f9dc-1f3fb",45,45,31],
        "1f9dc-1f3fc-200d-2642-fe0f":["1f9dc-1f3fc",45,46,31],
        "1f9dc-1f3fd-200d-2642-fe0f":["1f9dc-1f3fd",45,47,31],
        "1f9dc-1f3fe-200d-2642-fe0f":["1f9dc-1f3fe",45,48,31],
        "1f9dc-1f3ff-200d-2642-fe0f":["1f9dc-1f3ff",45,49,31],
        "1f9dd-200d-2642-fe0f":["1f9dd",46,10,31],
        "1f9dd-1f3fb-200d-2642-fe0f":["1f9dd-1f3fb",46,11,31],
        "1f9dd-1f3fc-200d-2642-fe0f":["1f9dd-1f3fc",46,12,31],
        "1f9dd-1f3fd-200d-2642-fe0f":["1f9dd-1f3fd",46,13,31],
        "1f9dd-1f3fe-200d-2642-fe0f":["1f9dd-1f3fe",46,14,31],
        "1f9dd-1f3ff-200d-2642-fe0f":["1f9dd-1f3ff",46,15,31],
        "1f9de-200d-2642-fe0f":["1f9de",46,18,31],
        "1f9df-200d-2642-fe0f":["1f9df",46,21,31],
        "26f9-fe0f-200d-2642-fe0f":["26f9-fe0f",49,6,15],
        "26f9-1f3fb-200d-2642-fe0f":["26f9-1f3fb",49,7,15],
        "26f9-1f3fc-200d-2642-fe0f":["26f9-1f3fc",49,8,15],
        "26f9-1f3fd-200d-2642-fe0f":["26f9-1f3fd",49,9,15],
        "26f9-1f3fe-200d-2642-fe0f":["26f9-1f3fe",49,10,15],
        "26f9-1f3ff-200d-2642-fe0f":["26f9-1f3ff",49,11,15]
    };
    
	// export
	if (typeof exports !== 'undefined'){
		if (typeof module !== 'undefined' && module.exports){
			exports = module.exports = emoji;
		}
		exports.EmojiConvertor = emoji;
	}else if (typeof define === 'function' && define.amd){
		define(function() { return emoji; })
	}else{
		root.EmojiConvertor = emoji;
	}

}).call(function(){
	return this || (typeof window !== 'undefined' ? window : global);
}());