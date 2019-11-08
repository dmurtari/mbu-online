import moment from 'moment'

export default (first, second, format = 'MM/DD/YYYY') => {
  return (value, parentVm) => {
    const compareFirst = typeof first === 'function'
      ? first.call(this, parentVm)
      : parentVm[first]
    
    const compareSecond = typeof second === 'function'
      ? second.call(this, parentVm)
      : parentVm[second]
    
    const firstDate = moment(compareFirst, format);
    const secondDate = moment(compareSecond, format);
    const testDate = moment(value, format);

    if (!firstDate.isValid() || !secondDate.isValid())
      return true;

    if (!testDate.isValid())
      return false;

    return testDate.isBetween(firstDate, secondDate) || testDate.isBetween(secondDate, firstDate);
  }
}