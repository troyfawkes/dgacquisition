/** Delta Growth (https://dg.agency/) providing hooks for SBJS into GTM, GA and CRM **/
class DGAcquisition {
	constructor(life_time,db_data) {
		this.life_time = life_time || 90; // Days
		this.db_data = db_data.length>0 ? db_data : false;

		sbjs.init({
			lifetime: life_time,
		});

		var gclid = this.getGclid();

		this.firsttouch = {
			'source': sbjs.get.first.src,
			'medium': sbjs.get.first.mdm,
			'campaign': sbjs.get.first.cmp,
			'content': sbjs.get.first.cnt,
			'term': sbjs.get.first.trm,
			'referrer': sbjs.get.first_add.rf,
			'landing_page': sbjs.get.first_add.ep.split('?')[0], // Stripping query string
			'gclid': gclid.first
		}

		this.current = {
			'source': sbjs.get.current.src,
			'medium': sbjs.get.current.mdm,
			'campaign': sbjs.get.current.cmp,
			'content': sbjs.get.current.cnt,
			'term': sbjs.get.current.trm,
			'referrer': sbjs.get.current_add.rf,
			'landing_page': sbjs.get.current_add.ep.split('?')[0], // Stripping query string
			'gclid': gclid.current
		}
	}

	getCurrentData() {
		return this.current;
	}

	getFirstTouchData() {
		return this.firsttouch;
	}

	getCookie(name) {
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}

	getUrlParameter(name) {
	  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	  var results = regex.exec(location.search);
	  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	setCookie(name,value) {
		var	d = new Date(); d.setTime(d.getTime() + this.life_time*24*60*60*1000);
		document.cookie = name + "=" + value +";expires=" + d.toUTCString() + ";domain=." + window.location.hostname + ";path=/";
	}

	getGclid() {
	/*
		We want the current and first touch GCLID stored in a cookie and returned here.
		Note: GCLID is only available on the first URL out of the campaign so we can't
		overwrite it if the query parameter is empty.
	*/
		var	d = new Date();
		// d.setTime(d.getTime() + 1*60*60*1000);
		d.setTime(d.getTime() + 1*60*1000); // 1 minute TESTING
		var hour_away = d.getTime();
		d = new Date();
		var	now = d.getTime();

		var output = new Object;
		var current = "(none)";
		var first = "(none)";
		var expiry = hour_away;

		if (this.getUrlParameter("gclid") != "") { 
			var current = this.getUrlParameter("gclid");
		}

		var gclid_cookie = this.getCookie("dga_gclid");
		if (typeof gclid_cookie != "undefined") {
			var [cookie_current, first, expiry] = gclid_cookie.split("|||");
			if (expiry < now) {
				first = cookie_current;
				expiry = hour_away;
			}
		}

		this.setCookie("dga_gclid", current+"|||"+first+"|||"+expiry);

		output.current = current;
		output.first = first;

		return output;
	}

	pushToDataLayer(custom_event_name){
		var event_name = custom_event_name || "acquisition_data";
		var data_array = {
			'dgacquisition': {
				'firsttouch': this.firsttouch,
				'current': this.current,
				'db_data': this.db_data,
			},
			'event': event_name,
		};
		var dataLayer = window.dataLayer = window.dataLayer || [];
		dataLayer.push(data_array);
	}
}