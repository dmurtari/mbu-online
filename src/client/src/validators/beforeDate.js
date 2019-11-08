import moment from 'moment';

export default (beforeDate, format = 'MM/DD/YYYY') => {
  return (value, parentVm) => {
    const compareTo = typeof beforeDate === 'function'
      ? beforeDate.call(this, parentVm)
      : parentVm[beforeDate]

    const compareDate = moment(compareTo, format);
    const testDate = moment(value, format);

    if (!compareDate.isValid()) 
      return true;

    if (!testDate.isValid())
      return false;

    return testDate.isBefore(moment(compareTo, format));
  }
}