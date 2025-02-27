'use strict';

var consts = require('../constants');

var moment = window.moment;
var utils = { };

function init( ) {
  return utils;
}

module.exports = init;

utils.localeDate = function localeDate(day) {
  // Takes a day in a format supported by Momentjs and returns a string
  // representing the date in the browser timezone. The return format
  // is hardcoded to "DayOfWeek BrowserLocaleDate".
  //
  // Input without offset information is assumed to be in the browser timezone.
  //
  // E.g. Passing Date(1995, 11, 17) returns "Sunday 12/17/1995"
  var translate = window.Nightscout.client.translate;
  var date = moment(day).toDate();

  var ret =
    [translate('Sunday'),translate('Monday'),translate('Tuesday'),translate('Wednesday'),translate('Thursday'),translate('Friday'),translate('Saturday')][date.getDay()];
  ret += ' ';
  ret += date.toLocaleDateString();
  return ret;
};

utils.localeDateTime = function localeDateTime(day) {
  // Takes a day in a format supported by Momentjs and returns a string
  // representing the date and time in the browser timezone. The return format
  // is hardcoded to "BrowserLocaleDate BrowserLocaleTime".
  //
  // Input without offset information is assumed to be in the browser timezone.
  //
  // E.g. Passing moment('1995-12-17T23:00:00') returns "12/17/1995 11:00:00 PM"
  var date = moment(day).toDate();

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

utils.scaledTreatmentBG = function scaledTreatmentBG(treatment,data) {
  var client = window.Nightscout.client;

  var SIX_MINS_IN_MS =  360000;
 
  function calcBGByTime(time) {
    var closeBGs = data.filter(function(d) {
      if (!d.y) {
        return false;
      } else {
        return Math.abs((new Date(d.date)).getTime() - time) <= SIX_MINS_IN_MS;
      }
    });

    var totalBG = 0;
    closeBGs.forEach(function(d) {
      totalBG += Number(d.y);
    });

    return totalBG > 0 ? (totalBG / closeBGs.length) : 450;
  }

  var treatmentGlucose = null;

  if (treatment.glucose && isNaN(treatment.glucose)) {
    console.warn('found an invalid glucose value', treatment);
  } else {
    if (treatment.glucose && treatment.units && client.settings.units) {
      if (treatment.units !== client.settings.units) {
        console.info('found mismatched glucose units, converting ' + treatment.units + ' into ' + client.settings.units, treatment);
        if (treatment.units === 'mmol') {
          //BG is in mmol and display in mg/dl
          treatmentGlucose = Math.round(treatment.glucose * consts.MMOL_TO_MGDL);
        } else {
          //BG is in mg/dl and display in mmol
          treatmentGlucose = client.utils.scaleMgdl(treatment.glucose);
        }
      } else {
        treatmentGlucose = treatment.glucose;
      }
    } else if (treatment.glucose) {
      //no units, assume everything is the same
      console.warn('found an glucose value with any units, maybe from an old version?', treatment);
      treatmentGlucose = treatment.glucose;
    }
  }

  return treatmentGlucose || client.utils.scaleMgdl(calcBGByTime(treatment.mills));
};
