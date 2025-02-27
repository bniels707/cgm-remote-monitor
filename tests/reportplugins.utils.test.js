'use strict';

require('should');

var benv = require('benv');
var moment = require('moment-timezone');

describe('report utils plugin', function ( ) {
  var self = this;
  var headless = require('./fixtures/headless')(benv, this);

  beforeEach(function (done) {
    var opts = {
    benvRequires: [
       __dirname + '/../static/js/reportinit.js'
      ]
    };
    headless.setup({}, done);
  });

  afterEach(function (done) {
    // Unset the process TZ
    delete process.env.TZ;

    headless.teardown( );
    done( );
  });

  describe('localeDate', function ( ) {
    it ('should localize a day in the UTC timezone', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDate(new Date(0)).should.equal('Thursday 1/1/1970');

      // Some examples from MDN
      pluginUtils().localeDate(new Date(1995, 11, 17)).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(new Date(Date.UTC(1995, 11, 17))).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(new Date(628021800000)).should.equal('Saturday 11/25/1989');

      // Test with naive moment objects
      pluginUtils().localeDate(moment('1995-12-17')).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment('1970-01-01')).should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate(moment('2024-01-29')).should.equal('Monday 1/29/2024');
      pluginUtils().localeDate(moment('2023-10-28')).should.equal('Saturday 10/28/2023');
      pluginUtils().localeDate(moment('2015-09-01')).should.equal('Tuesday 9/1/2015');

      // Test with tz aware moment objects
      pluginUtils().localeDate(moment.tz('1995-12-17', process.env.TZ)).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment.tz('1970-01-01', process.env.TZ)).should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate(moment.tz('2024-01-29', process.env.TZ)).should.equal('Monday 1/29/2024');
      pluginUtils().localeDate(moment.tz('2023-10-28', process.env.TZ)).should.equal('Saturday 10/28/2023');
      pluginUtils().localeDate(moment.tz('2015-09-01', process.env.TZ)).should.equal('Tuesday 9/1/2015');

      // Test again with the dates as strings
      pluginUtils().localeDate('1970-01-01').should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate('1995-12-17').should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate('1989-11-25').should.equal('Saturday 11/25/1989');
      pluginUtils().localeDate('2015-09-01').should.equal('Tuesday 9/1/2015');

      // https://github.com/nightscout/cgm-remote-monitor/issues/8219
      pluginUtils().localeDate('2024-01-29').should.equal('Monday 1/29/2024');
      pluginUtils().localeDate('2024-01-30').should.equal('Tuesday 1/30/2024');

      // https://github.com/nightscout/cgm-remote-monitor/issues/8176
      pluginUtils().localeDate('2023-10-28').should.equal('Saturday 10/28/2023');
      pluginUtils().localeDate('2023-10-29').should.equal('Sunday 10/29/2023');
    });

    it ('should apply a positive timezone offset from the profile to non-string days', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      var testTimezone = 'Etc/GMT-6';

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDate(new Date(0)).should.equal('Thursday 1/1/1970');

      // Test with naive moment objects
      pluginUtils().localeDate(moment('1995-12-17T00:00:00')).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment('1970-01-01T00:00:00')).should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate(moment('2024-01-29T00:00:00')).should.equal('Monday 1/29/2024');
      pluginUtils().localeDate(moment('2023-10-28T00:00:00')).should.equal('Saturday 10/28/2023');
      pluginUtils().localeDate(moment('2015-09-01T00:00:00')).should.equal('Tuesday 9/1/2015');

      // Test with tz aware moment where the date should change
      pluginUtils().localeDate(moment.tz('1995-12-17T00:00:00', testTimezone)).should.equal('Saturday 12/16/1995');
      pluginUtils().localeDate(moment.tz('1970-01-01T00:00:00', testTimezone)).should.equal('Wednesday 12/31/1969');
      pluginUtils().localeDate(moment.tz('2024-01-29T00:00:00', testTimezone)).should.equal('Sunday 1/28/2024');
      pluginUtils().localeDate(moment.tz('2023-10-28T00:00:00', testTimezone)).should.equal('Friday 10/27/2023');
      pluginUtils().localeDate(moment.tz('2015-09-01T00:00:00', testTimezone)).should.equal('Monday 8/31/2015');

      // Test again with the dates as strings
      pluginUtils().localeDate('1970-01-01T00:00:00').should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate('1995-12-17T00:00:00').should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate('1989-11-25T00:00:00').should.equal('Saturday 11/25/1989');
      pluginUtils().localeDate('2015-09-01T00:00:00').should.equal('Tuesday 9/1/2015');
    });

    it ('should apply a negative timezone offset from the profile to non-string days', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      var testTimezone = 'Etc/GMT+6';

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDate(new Date(0)).should.equal('Thursday 1/1/1970');

      // Test with naive moment objects
      pluginUtils().localeDate(moment('1995-12-17T23:00:00')).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment('1970-01-01T23:00:00')).should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate(moment('2024-01-29T23:00:00')).should.equal('Monday 1/29/2024');
      pluginUtils().localeDate(moment('2023-10-28T23:00:00')).should.equal('Saturday 10/28/2023');
      pluginUtils().localeDate(moment('2015-09-01T23:00:00')).should.equal('Tuesday 9/1/2015');

      // Test with tz aware moment where the date should change
      pluginUtils().localeDate(moment.tz('1995-12-17T23:00:00', testTimezone)).should.equal('Monday 12/18/1995');
      pluginUtils().localeDate(moment.tz('1970-01-01T23:00:00', testTimezone)).should.equal('Friday 1/2/1970');
      pluginUtils().localeDate(moment.tz('2024-01-29T23:00:00', testTimezone)).should.equal('Tuesday 1/30/2024');
      pluginUtils().localeDate(moment.tz('2023-10-28T23:00:00', testTimezone)).should.equal('Sunday 10/29/2023');
      pluginUtils().localeDate(moment.tz('2015-09-01T23:00:00', testTimezone)).should.equal('Wednesday 9/2/2015');

      // Test again with the dates as strings
      pluginUtils().localeDate('1970-01-01T23:00:00').should.equal('Thursday 1/1/1970');
      pluginUtils().localeDate('1995-12-17T23:00:00').should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate('1989-11-25T23:00:00').should.equal('Saturday 11/25/1989');
      pluginUtils().localeDate('2015-09-01T23:00:00').should.equal('Tuesday 9/1/2015');
    });

    it ('should localize a day in any timezone', function () {
      // Test a handful of discovered "problem" cases
      var pluginUtils = require('../lib/report_plugins/utils');

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return process.env.TZ;
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      // https://github.com/nightscout/cgm-remote-monitor/issues/6853
      process.env.TZ = 'Europe/Amsterdam';

      pluginUtils().localeDate(new Date('2021-02-06')).should.equal('Saturday 2/6/2021');
      pluginUtils().localeDate(moment('2021-02-06')).should.equal('Saturday 2/6/2021');
      pluginUtils().localeDate(moment.tz('2021-02-06', process.env.TZ)).should.equal('Saturday 2/6/2021');
      pluginUtils().localeDate('2021-02-06').should.equal('Saturday 2/6/2021');
      pluginUtils().localeDate('2015-09-01').should.equal('Tuesday 9/1/2015');

      process.env.TZ = 'Asia/Bishkek';

      pluginUtils().localeDate(new Date('1995-09-24')).should.equal('Sunday 9/24/1995');
      pluginUtils().localeDate(moment('1995-09-24')).should.equal('Sunday 9/24/1995');
      pluginUtils().localeDate(moment.tz('1995-09-24', process.env.TZ)).should.equal('Sunday 9/24/1995');
      pluginUtils().localeDate('1995-09-24').should.equal('Sunday 9/24/1995');

      pluginUtils().localeDate(new Date('1995-12-17')).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment('1995-12-17')).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate(moment.tz('1995-12-17', process.env.TZ)).should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate('1995-12-17').should.equal('Sunday 12/17/1995');
      pluginUtils().localeDate('2015-09-01').should.equal('Tuesday 9/1/2015');
    });
  });

  describe('localeDateTime', function ( ) {
    it ('should localize a datetime in the UTC timezone', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDateTime(new Date(0)).should.equal('1/1/1970 12:00:00 AM');

      // Some examples from MDN
      pluginUtils().localeDateTime(new Date(1995, 11, 17)).should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime(new Date(Date.UTC(1995, 11, 17))).should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime(new Date(628021800000)).should.equal('11/25/1989 6:30:00 PM');

      // Test with naive moment objects
      pluginUtils().localeDateTime(moment('1995-12-17')).should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime(moment(628021800000)).should.equal('11/25/1989 6:30:00 PM');
      pluginUtils().localeDateTime(moment('2024-01-29')).should.equal('1/29/2024 12:00:00 AM');

      // Test with tz aware moment objects
      pluginUtils().localeDateTime(moment.tz('1995-12-17', process.env.TZ)).should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime(moment.tz(628021800000, process.env.TZ)).should.equal('11/25/1989 6:30:00 PM');
      pluginUtils().localeDateTime(moment.tz('2024-01-29', process.env.TZ)).should.equal('1/29/2024 12:00:00 AM');

      // Test again with the dates as strings
      pluginUtils().localeDateTime('1970-01-01').should.equal('1/1/1970 12:00:00 AM');
      pluginUtils().localeDateTime('1995-12-17').should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime('1989-11-25').should.equal('11/25/1989 12:00:00 AM');

      // https://github.com/nightscout/cgm-remote-monitor/issues/8219
      pluginUtils().localeDateTime('2024-01-29').should.equal('1/29/2024 12:00:00 AM');
      pluginUtils().localeDateTime('2024-01-30').should.equal('1/30/2024 12:00:00 AM');

      // https://github.com/nightscout/cgm-remote-monitor/issues/8176
      pluginUtils().localeDateTime('2023-10-28').should.equal('10/28/2023 12:00:00 AM');
      pluginUtils().localeDateTime('2023-10-29').should.equal('10/29/2023 12:00:00 AM');
    });

    it ('should apply a positive offset timezone offset from the profile to non-string datetimes', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      var testTimezone = 'Etc/GMT-6';

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDateTime(new Date(0)).should.equal('1/1/1970 12:00:00 AM');

      // Test with naive moment objects
      pluginUtils().localeDateTime(moment('1995-12-17T00:00:00')).should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime(moment(628021800000)).should.equal('11/25/1989 6:30:00 PM');
      pluginUtils().localeDateTime(moment('2024-01-29T00:00:00')).should.equal('1/29/2024 12:00:00 AM');

      // Test with tz aware moment where the date should change
      pluginUtils().localeDateTime(moment.tz('1995-12-17T00:00:00', testTimezone)).should.equal('12/16/1995 6:00:00 PM');
      pluginUtils().localeDateTime(moment.tz('2024-01-29T00:00:00', testTimezone)).should.equal('1/28/2024 6:00:00 PM');

      // Test again with the dates as strings
      pluginUtils().localeDateTime('1970-01-01T00:00:00').should.equal('1/1/1970 12:00:00 AM');
      pluginUtils().localeDateTime('1995-12-17T00:00:00').should.equal('12/17/1995 12:00:00 AM');
      pluginUtils().localeDateTime('1989-11-25T00:00:00').should.equal('11/25/1989 12:00:00 AM');
    });

    it ('should apply a negative offset timezone offset from the profile to non-string datetimes', function () {
      var pluginUtils = require('../lib/report_plugins/utils');

      var testTimezone = 'Etc/GMT+6';

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return 'Etc/UTC';
      }

      // Set the process / system TZ for tests
      process.env.TZ = mockGetTimezone();

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      pluginUtils().localeDateTime(new Date(0)).should.equal('1/1/1970 12:00:00 AM');

      // Test with naive moment objects
      pluginUtils().localeDateTime(moment('1995-12-17T23:00:00')).should.equal('12/17/1995 11:00:00 PM');
      pluginUtils().localeDateTime(moment(628021800000)).should.equal('11/25/1989 6:30:00 PM');
      pluginUtils().localeDateTime(moment('2024-01-29T23:00:00')).should.equal('1/29/2024 11:00:00 PM');

      // Test with tz aware moment where the date should change
      pluginUtils().localeDateTime(moment.tz('1995-12-17T23:00:00', testTimezone)).should.equal('12/18/1995 5:00:00 AM');
      pluginUtils().localeDateTime(moment.tz('2024-01-29T23:00:00', testTimezone)).should.equal('1/30/2024 5:00:00 AM');

      // Test again with the dates as strings
      pluginUtils().localeDateTime('1970-01-01T23:00:00').should.equal('1/1/1970 11:00:00 PM');
      pluginUtils().localeDateTime('1995-12-17T23:00:00').should.equal('12/17/1995 11:00:00 PM');
      pluginUtils().localeDateTime('1989-11-25T23:00:00').should.equal('11/25/1989 11:00:00 PM');
    });

    it ('should localize a datetime in any timezone', function () {
      // Test a handful of discovered "problem" cases
      var pluginUtils = require('../lib/report_plugins/utils');

      function mockTranslate (toTranslate) {
        return toTranslate;
      }

      function mockGetTimezone () {
        return process.env.TZ;
      }

      // Set moment locale for tests
      window.moment.tz.setDefault(mockGetTimezone());

      window.Nightscout = {'client': {'translate': mockTranslate}};

      process.env.TZ = 'Asia/Bishkek';

      pluginUtils().localeDateTime(new Date(Date.UTC(1995, 11, 17))).should.equal('12/17/1995 5:00:00 AM');
      pluginUtils().localeDateTime('1995-12-17').should.equal('12/17/1995 12:00:00 AM');
    });
  });
});
