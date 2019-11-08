import _ from 'lodash';

export default (array) => {
  let sortable = _.cloneDeep(_.without(array, null, undefined));

  return sortable.sort(function (first, second) {
    const firstSplit = first.split(/(?=\D)/);
    const secondSplit = second.split(/(?=\D)/);

    return firstSplit[0] - secondSplit[0] || (firstSplit[1] || '').localeCompare(secondSplit[1] || '');
  });
}
