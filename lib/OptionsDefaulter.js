/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const getProperty = (obj, name) => {
	name = name.split(".");
	// 有一些设置的字段，比如loader.extensions
	for (let i = 0; i < name.length - 1; i++) {
		obj = obj[name[i]];
		if (typeof obj !== "object" || !obj || Array.isArray(obj)) return;
	}
	// 如果不是用.分割的key,直接返回options里对应的属性
	return obj[name.pop()];
};

const setProperty = (obj, name, value) => {
	name = name.split(".");
	for (let i = 0; i < name.length - 1; i++) {
		if (typeof obj[name[i]] !== "object" && obj[name[i]] !== undefined) return;
		if (Array.isArray(obj[name[i]])) return;
		if (!obj[name[i]]) obj[name[i]] = {};
		obj = obj[name[i]];
	}
	obj[name.pop()] = value;
};

class OptionsDefaulter {
	constructor() {
		this.defaults = {};
		this.config = {};
	}

	process(options) {
		options = Object.assign({}, options);
		// 遍历 defaults 数组，然后检查config数组里面是否有相应的key值
		for (let name in this.defaults) {
			switch (this.config[name]) {
				case undefined:
					if (getProperty(options, name) === undefined) {
						setProperty(options, name, this.defaults[name]);
					}
					break;
				case "call":
					setProperty(
						options,
						name,
						this.defaults[name].call(this, getProperty(options, name), options)
					);
					break;
				case "make":
					if (getProperty(options, name) === undefined) {
						setProperty(options, name, this.defaults[name].call(this, options));
					}
					break;
				case "append": {
					let oldValue = getProperty(options, name);
					if (!Array.isArray(oldValue)) {
						oldValue = [];
					}
					oldValue.push(...this.defaults[name]);
					setProperty(options, name, oldValue);
					break;
				}
				default:
					throw new Error(
						"OptionsDefaulter cannot process " + this.config[name]
					);
			}
		}
		return options;
	}

	set(name, config, def) {
		if (def !== undefined) {
			this.defaults[name] = def;
			this.config[name] = config;
		} else {
			this.defaults[name] = config;
			delete this.config[name];
		}
	}
}

module.exports = OptionsDefaulter;
