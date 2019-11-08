import _ from 'lodash';

export default value => {
  if (typeof value === 'undefined' || value === null || _.trim(value) === '') {
    return true;
  }

  let entries = _.split(value, ',');
  let regex = /^[0-9A-Za-z]*$/;

  return _.reduce(entries, (result, entry) => {
    return result && regex.test(_.trim(entry))
  }, true);
}