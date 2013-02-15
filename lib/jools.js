/**
 * Module dependencies.
 */
var utils = require('./utils')
  , _ = require('underscore');

/**
 * version
 */
exports.version = '0.0.1';

/**
 * Jools constructor.
 *
 * A rule consists of:
 *   - Descriptive name
 *   - One or more conditions
 *   - One or more consequences, which are fired when all conditions evaluate to true.
 *
 * @param {Object} rules
 */
function Jools(rules) {
  this.rules = rules;
}

/**
 * execute rules with fact
 *
 * @param {Object} fact
 */
Jools.prototype.execute = function (session) {
  
  var last_session = _.clone(session)
    , goal = false;

  while (!goal) {
    var changes = false;
    for (var x=0; x < this.rules.length; x++) {
      var rule = this.rules[x]
        , outcome;

      _.flatten([rule.condition]).forEach(function (cnd) {
        cnd.__args = cnd.__args || utils.paramNames(cnd); 

        if (outcome) {
          outcome = outcome && cnd.apply({}, utils.paramsToArguments(session, cnd.__args)); 
        } else {
          outcome = cnd.apply({}, utils.paramsToArguments(session, cnd.__args));
        }
      });
      if (outcome) {
        _.flatten([rule.consequence]).forEach(function (csq) {
          csq.__args = csq.__args || utils.paramNames(csq); 
          csq.apply(session, utils.paramsToArguments(session, csq.__args));
          if (!_.isEqual(last_session,session)) {
            // Fire all rules again!
            changes = true;
            last_session = _.clone(session);
          } 
        });
      }
      if(changes) break;
    }
    if (!changes) goal = true;
  }
  return session;
};

module.exports = Jools;

