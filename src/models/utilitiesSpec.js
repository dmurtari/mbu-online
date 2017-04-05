/* eslint-env mocha */
/* eslint no-unused-vars: "off" */

var chai = require('chai');
var expect = chai.expect;

var utilities = require('./utilities');

describe('combining completions with requirements', function () {
  it('should add to completions if new requirements are added', function (done) {
    var completions = {
      '1': true,
      '2': true
    };

    var requirements = ['1', '2', '3'];

    expect(utilities.combineCompletionsAndReqs(requirements, completions))
      .to.deep.equal({
        '1': true,
        '2': true,
        '3': false
      });

    return done();
  });

  it('should remove uncompleted completions if no longer required', function (done) {
    var completions = {
      '1': false,
      '3': true
    };

    var requirements = ['1', '2'];

    expect(utilities.combineCompletionsAndReqs(requirements, completions))
      .to.deep.equal({
        '1': false,
        '2': false,
        '3': true,
      });

    var completions = {
      '1': false,
      '2': false,
      '3': true
    };

    var requirements = ['1', '3'];

    expect(utilities.combineCompletionsAndReqs(requirements, completions))
      .to.deep.equal({
        '1': false,
        '3': true,
      });

    return done();
  });

  it('should not change values of completions', function (done) {
    var completions = {
      '1': true,
      '2': true
    };

    var requirements = ['1', '2'];

    expect(utilities.combineCompletionsAndReqs(requirements, completions))
      .to.deep.equal({
        '1': true,
        '2': true
      });

    return done();
  });

  it('should not care about order', function (done) {
    var completions = {
      '2': true,
      '1': true,
      '4': true,
      '5': true
    };

    var requirements = ['3', '1', '2'];

    expect(utilities.combineCompletionsAndReqs(requirements, completions))
      .to.deep.equal({
        '1': true,
        '2': true,
        '3': false,
        '4': true,
        '5': true
      });

    return done();
  });
});