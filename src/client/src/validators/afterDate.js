import moment from 'moment';

export default (afterDate, format = 'MM/DD/YYYY') => {
  return (value, parentVm) => {
    const compareTo = typeof afterDate === 'function'
      ? afterDate.call(this, parentVm)
      : parentVm[afterDate]

    const compareDate = moment(compareTo, format);
    const testDate = moment(value, format);

    if (!testDate.isValid())
      return false;

    if (!compareDate.isValid())
      return true;

    return testDate.isAfter(moment(compareTo, format));
  }
}