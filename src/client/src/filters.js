import moment from 'moment';
import numeral from 'numeral';
import _ from 'lodash';

import numAlphaSort from './filters/numAlphaSort';

export default function(Vue) {
  Vue.filter('longDate', (value) => {
    return moment(value).format('dddd, MMMM Do, YYYY');
  });
  Vue.filter('shortDate', (value) => {
    return moment(value).format('MM/DD/YYYY');
  });
  Vue.filter('capitalize', (value) => {
    return _.capitalize(value);
  });
  Vue.filter('titleCase', (value) => {
    return _.startCase(_.toLower(value));
  });
  Vue.filter('upperCase', (value) => {
    return _.upperCase(value);
  })
  Vue.filter('ordinalSuffix', (number) => {
    return numeral(number).format('Oo');
  });
  Vue.filter('currency', (number) => {
    return numeral(number).format('$0,0.00');
  });
  Vue.filter('commaSeparated', (value) => {
    return _.join(value, ', ');
  });
  Vue.filter('ordered', (value) => {
    return _.orderBy(value);
  });
  Vue.filter('numAlphaSort', (array) => {
    return numAlphaSort(array);
  });
}
