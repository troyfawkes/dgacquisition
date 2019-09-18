# DG Acquisition
We wanted to leverage and expand on the excellent functionality in Sourcebuster.js to also capture GCLID and pass all of this data into Google Tag Manager via the dataLayer.

Sourcebuster tracks referral data against their database and associates, say, "google.com" with the organic search channel. This creates Source = Google, Medium = Organic. This works for all sorts of channels. Further, Sourcebuster captures first touch and current touch channel information. These are all stored in cookies, and I'm not doing justice to all of the functionality created by these folks.

All we're doing with DG Acquisition is capturing GCLID in the same format SBJS is capturing it, and then making all of this available to the dataLayer.

We've also added advanced functionality to store a third layer of attribution loaded in from a database. For example:
- Brendan visits a website (first time) through Facebook Ads.
- He comes back a couple of hours later through Google Ads and submits a form (B2B lead form, eCommerce purchase, whatever). The client leverages the SBJS and DGA data to store his first and current touch information in their database.
- Brendan returns a week later and makes a second purchase / business activity via Organic Search.

DGA allows us to upload values from the database to reflect that middle touch, instead of saying that that second purchase had a first touch of Facebook Ads and a last touch of Google Ads, we could also add value to the point which caused him to first become a customer.

## Usage
Upload sourcebuster.min.js (from here: http://sbjs.rocks/#/) and dgacquisition.min.js to a resources folder and load them in the <head> of the site.
```
<script src="/scripts/sourcebuster.min.js"></script>
<script src="/scripts/dgacquisition.min.js"></script>
```

Before the closing <body> tag, add the following code:
```
<script>var dga = new DGAcquisition(90,[]); dga.pushToDataLayer("acquisition_data");</script>
```

90 here is the duration of the cookies created and stored. You can limit this further to de-value early touches.

## Advanced Usage
Instead of passing in an empty array, pass in the "Conversion Touch" information from your database. This should take the form of:
```
var db_data = {
  source: ..,
  medium: ..,
  campaign: ..,
  content: ..,
  term: ..,
  referrer: ..,
  landing_page: ..,
  gclid: ..
}
```

Your usage will now be:
```
<script>var dga = new DGAcquisition(90,db_data); dga.pushToDataLayer("acquisition_data");</script>
```
