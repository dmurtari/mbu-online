export default (compare) => {
  return (value, parentVm) => {
    if (typeof value === 'undefined' || value === null || value === '') {
      return true;
    }

    const compareTo = typeof compare === 'function'
      ? compare.call(this, parentVm)
      : parentVm[compare]

    if (!compareTo) {
      return true
    }

    return value <= compareTo;
  }
}