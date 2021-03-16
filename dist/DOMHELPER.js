var DOMHELPER = (function() {

	var nsSvg = 'http://www.w3.org/2000/svg';
	var nsXLink = 'http://www.w3.org/1999/xlink';

	var svgTypes = [
		'animate', 
		'animateColor', 
		'animateMotion', 
		'animateTransform', 
		'discard', 
		'mpath', 
		'set', 
		'circle', 
		'ellipse', 
		'line', 
		'polygon', 
		'polyline', 
		'rect', 
		'defs', 
		'g', 
		'marker', 
		'mask', 
		'pattern', 
		'svg', 
		'switch', 
		'symbol', 
		'desc', 
		'metadata', 
		'title', 
		'feBlend', 
		'feColorMatrix', 
		'feComponentTransfer', 
		'feComposite', 
		'feConvolveMatrix', 
		'feDiffuseLighting', 
		'feDisplacementMap', 
		'feDropShadow', 
		'feFloo', 
		'feFuncA', 
		'feFuncB', 
		'feFuncG', 
		'feFunc', 
		'feGaussianBlur', 
		'feImage', 
		'feMerge', 
		'feMergeNode', 
		'feMorphology', 
		'feOffset', 
		'feSpecularLighting', 
		'feTile', 
		'feTurbulence', 
		'font', 
		'font-face', 
		'font-face-format', 
		'font-face-name', 
		'font-face-src', 
		'font-face-uri', 
		'hkern', 
		'vkern', 
		'linearGradient', 
		'radialGradient', 
		'stop', 
		'image', 
		'path', 
		'text', 
		'use', 
		'feDistantLight', 
		'fePointLight', 
		'feSpotLight', 
		'clipPath', 
		'hatch', 
		'script', 
		'style', 
		'solidcolor', 
		'a', 
		'foreignObject', 
		'textPath', 
		'tspan', 
		'altGlyph', 
		'altGlyphDef', 
		'altGlyphItem', 
		'glyph', 
		'glyphRef', 
		'tref', 
		'color-profile', 
		'cursor', 
		'filter', 
		'hatchpath', 
		'view'
	];


	var svgTextMeasurements = {};
	var svgTextMeasurementsSpace;
	var isIe;


	/*
	 * options
	 * 	styles
	 * 	attributes
	 *  svg (boolean)
	 */
	function create(type, options) {
		var elem;
		var isSvg = false;
		var forceSvg = false;
		var attributes = {};

		// See if we're forcing this to be an SVG tag (for types like 'a')
		if(typeof options == 'object') {
			forceSvg = options.svg === true;
		}

		isSvg = svgTypes.indexOf(type) != -1 || forceSvg;

		// Create element
		if(isSvg) {
			elem = document.createElementNS(nsSvg, type);
		}
		else {
			elem = document.createElement(type);
		}

		// Process options, if available
		if(typeof options == 'object') {
			// Parent
			if(typeof options.parent == 'object') {
				if(typeof options.parent.appendChild == 'function') {
					options.parent.appendChild(elem);
				}
			}

			// Attributes
			if(typeof options.attributes == 'object') {
				for(var prop in options.attributes) {
					// Special case for use tags with hrefs
					if((type == 'use' || type == 'image') && (prop == 'href' || prop == 'xlink:href')) {
						setAttributes(elem, {
							'xlink:href':options.attributes[prop], 
							'href':options.attributes[prop]
						});
						elem.setAttributeNS(nsXLink, 'href', options.attributes[prop]);
					}
					// Otherwise gather all other attributes
					else {
						attributes[prop] = options.attributes[prop];
					}
				}

				// Set all attributes
				setAttributes(elem, attributes);
			}

			// Styles
			if(typeof options.styles == 'object') {
				gsap.set(elem, options.styles);
			}

			// Classes
			if(typeof options.classes == 'object') {
				if(options.classes.length > 0) {
					addClass(elem, options.classes.join(' '));
				}
			}
		}

		return elem;
	}

	function hasClass(elem, name) {
		var classAttr = elem.getAttribute('class');
		if(classAttr) return classAttr.split(' ').lastIndexOf(name) != -1;
		return false;
	}

	function addClass(elem, name) {
		if(!hasClass(elem, name)) {
			var existingClassAttr = elem.getAttribute('class') ? elem.getAttribute('class') : '';
			var classAttr = (existingClassAttr + ' ' + name).trim();
			elem.setAttribute('class', classAttr);
		}
	}

	function removeClass(elem, name) {
		var classAttr = elem.getAttribute('class');
		if(classAttr) {
			var classIndex = classAttr.lastIndexOf(name);
			if(classIndex != -1) {
				elem.setAttribute('class', (classAttr.slice(0, classIndex) + classAttr.slice(classIndex + name.length)).trim());
			}
		}
	}

	function clickable(elem) {
		removeClass(elem, 'no-select');
		addClass(elem, 'hitarea');
	}

	function clickables(elems) {
		for(var i in elems) {
			removeClass(elems[i], 'no-select');
			addClass(elems[i], 'hitarea');
		}
	}

	function unclickable(elem) {
		removeClass(elem, 'hitarea');
		addClass(elem, 'no-select');
	}

	function unclickables(elems) {
		for(var i in elems) {
			removeClass(elems[i], 'hitarea');
			addClass(elems[i], 'no-select');
		}
	}

	function setAttributes(target, attr) {
		if(typeof target != 'object') return;
		if(typeof target.setAttribute != 'function') return;

		for(var prop in attr) {
			target.setAttribute(prop, attr[prop]);
		}
	}

	function measureSvgText(text, attributes) {
		var svgTextEntries = svgTextMeasurements[text];

		//console.log(typeof svgTextEntries);

		// See if we've already stored this text
		if(typeof svgTextEntries != 'undefined') {
			//console.log('found');

			// Loop through variations of this text
			for(var i = 0; i < svgTextEntries.length; i++) {
				var svgTextEntry = svgTextEntries[i];

				// Check for attributes matching up
				if(typeof svgTextEntry.attributes != 'undefined') {
					var match = true;
					if(svgTextEntry.attributes['font-family'] != attributes['font-family']) match = false;
					if(svgTextEntry.attributes['font-size'] != attributes['font-size']) match = false;
					if(svgTextEntry.attributes['font-style'] != attributes['font-style']) match = false;
					if(svgTextEntry.attributes['font-weight'] != attributes['font-weight']) match = false;
					if(svgTextEntry.attributes['stroke-width'] != attributes['stroke-width']) match = false;
					
					// match found!
					if(match) {
						if(typeof svgTextEntry.bbox != 'undefined') {
							//console.log('reuse bbox (' + text + ')');
							return svgTextEntry.bbox
						}
					}
				}
			}

			// No matches found, add a new entry for this text
			var newSvgTextEntry = {
				attributes:attributes, 
				bbox:measureText(text, attributes)
			};

			svgTextEntries.push(newSvgTextEntry);
			svgTextMeasurements[text] = svgTextEntries;

			//console.log('new bbox (' + text + ')');
			return newSvgTextEntry.bbox;
		}
		// Else add a new entry
		else {
			svgTextMeasurements[text] = new Array();

			var newSvgTextEntry = {
				attributes:attributes, 
				bbox:measureText(text, attributes)
			};

			svgTextMeasurements[text].push(newSvgTextEntry);

			//console.log('new bbox (' + text + ')');
			//console.log(svgTextMeasurements);
			return newSvgTextEntry.bbox;
		}
	}

	/*
	 * Borrowed from VexFlow, then modified
	 */
	function measureText(text, attributes) {
		var txt = create('text', {
			attributes:attributes
		});
		if(typeof txt.getBBox !== 'function') {
			return {
				x:0, 
				y:0, 
				width:0,
				height:0
			};
		}
		txt.textContent = text;

		// Create measurement space if not currently available
		if(typeof svgTextMeasurementsSpace == 'undefined') {
			svgTextMeasurementsSpace = create('svg', {
				attributes:{
					'viewBox':'0 0 300 300', 
					'preserveAspectRatio':'xMidYMid meet', 
					'overflow':'hidden'
				}, 
				styles:{
					'visibility':'hidden'
				}, 
				parent:document.body
			});
		}

		// Temporarily add it to the document for measurement.
		svgTextMeasurementsSpace.appendChild(txt);

		var bbox = txt.getBBox();

		// Determine if IE (and store)
		if(typeof isIe == 'undefined') {
			if(typeof navigator !== 'undefined') {
				isIe = (
					/MSIE 9/i.test(navigator.userAgent) ||
					/MSIE 10/i.test(navigator.userAgent) ||
					/rv:11\.0/i.test(navigator.userAgent) ||
					/Trident/i.test(navigator.userAgent)
				);
			}
		}
		

		if(isIe && text !== '' && attributes['font-style'] === 'italic') {
			bbox = ieMeasureTextFix(bbox, attributes);
		}

		svgTextMeasurementsSpace.removeChild(txt);

		// Round up bbox height
		bbox.height = Math.ceil(bbox.height);

		return bbox;
	}

	/*
	 * Borrowed from VexFlow, then modified
	 */
	function ieMeasureTextFix(bbox, attributes) {
		// Internet Explorer over-pads text in italics,
		// resulting in giant width estimates for measureText.
		// To fix this, we use this formula, tested against
		// ie 11:
		// overestimate (in pixels) = FontSize(in pt) * 1.196 + 1.96
		// And then subtract the overestimate from calculated width.

		var fontSize = Number(attributes['font-size']);
		var m = 1.196;
		var b = 1.9598;
		var widthCorrection = m * fontSize + b;
		var width = bbox.width - widthCorrection;
		var height = bbox.height - 1.5;

		// Get non-protected copy:
		var box = {
			x: bbox.x,
			y: bbox.y,
			width: width,
			height: height
		};

		return box;
	}

	/*
	 * Borrowed from http://stackoverflow.com/questions/6148859/is-it-possible-to-work-with-jquery-and-svg-directly-no-plugins
	 */
	function svgNs(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag);
	}


	return {
		get nsXLink() {
			return nsXLink;
		}, 
		svgNs: svgNs, 
		nsSvg: nsSvg, 
		nsXLink: nsXLink, 
		setAttributes: setAttributes, 
		hasClass: hasClass, 
		addClass: addClass, 
		removeClass: removeClass, 
		clickable: clickable, 
		clickables: clickables, 
		unclickable: unclickable, 
		unclickables: unclickables, 
		create: create, 
		measureSvgText: measureSvgText
	}

})();