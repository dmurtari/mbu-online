import moment from 'moment'

export default (format = 'MM/DD/YYYY') =>
  value => moment(value, format, true).isValid();