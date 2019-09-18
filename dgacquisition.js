/** Delta Growth (https://dg.agency/) providing hooks for SBJS into GTM, GA and CRM **/
class DGAcquisition {
	constructor(life_time,db_data) {
		this.life_time = life_time || 90; // Days
		this.db_data = db_data.length>0 ? db_data : false;

		sbjs.init({
			lifetime: life_time,
		});

		this.gclid = this.getGclid();

		this.firsttouch = {
			'source': sbjs.get.first.src,
			'medium': sbjs.get.first.mdm,
			'campaign': sbjs.get.first.cmp,
			'content': sbjs.get.first.cnt,
			'term': sbjs.get.first.term,
			'referrer': sbjs.get.first_add.rf,
			'landing_page': sbjs.get.first_add.ep,
			'gclid': gclid.first
		}

		this.current = {
			'source': sbjs.get.current.src,
			'medium': sbjs.get.current.mdm,
			'campaign': sbjs.get.current.cmp,
			'content': sbjs.get.current.cnt,
			'term': sbjs.get.current.term,
			'referrer': sbjs.get.current_add.rf,
			'landing_page': sbjs.get.current_add.ep,
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
		d.setTime(d.getTime() + 1*60*60*1000);
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

		if (this.getCookie("dga_gclid") != "undefined") {
			var gclid_cookie = this.getCookie("dga_gclid");
			var [cookie_current, first, expiry] = gclid_cookie.split("|||");
			if (expiry > now) {
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
			'event': event_name,
			'firsttouch_source': this.firsttouch['source'],
			'firsttouch_medium': this.firsttouch['medium'],
			'firsttouch_campaign': this.firsttouch['campaign'],
			'firsttouch_content': this.firsttouch['content'],
			'firsttouch_term': this.firsttouch['term'],
			'firsttouch_referrer': this.firsttouch['referrer'],
			'firsttouch_landing_page': this.firsttouch['landing_page'],
			'firsttouch_gclid': this.firsttouch['gclid'],
			'current_source': this.current['source'],
			'current_medium': this.current['medium'],
			'current_campaign': this.current['campaign'],
			'current_content': this.current['content'],
			'current_term': this.current['term'],
			'current_referrer': this.current['referrer'],
			'current_landing_page': this.current['landing_page'],
			'current_gclid': this.current['gclid']
		}
		if (this.db_data) {
			let db_data_array = {
				'db_data_source': this.db_data['source'],
				'db_data_medium': this.db_data['medium'],
				'db_data_campaign': this.db_data['campaign'],
				'db_data_content': this.db_data['content'],
				'db_data_term': this.db_data['term'],
				'db_data_referrer': this.db_data['referrer'],
				'db_data_landing_page': this.db_data['landing_page'],
				'db_data_gclid': this.db_data['gclid']
			}
			var data_array = data_array.concat(db_data_array);
		}
		dataLayer.push(data_array);
	}
}
// let dga = DGAcquisition(6,[]); dga.pushToDataLayer("acquisition_data");