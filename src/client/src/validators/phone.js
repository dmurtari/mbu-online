export default value => {
  let regex =  /\(\d{3}\) ?\d{3}-\d{4}/
  return regex.test(value);
}