export const validationRules = {
  required: [(v) => !!v || 'This is a required field'],
  email: [
    (v) => !!v || 'This is a required field',
    (v) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(v) || 'E-mail must be valid'
    },
  ],
  phone: [
    (v) =>
      (!isNaN(parseInt(v)) && v.length == 10) ||
      'Phone number must be 10 digits no spaces or other charaters',
  ],
  password: [
    (v) => !v || v.length >= 6 || 'Password should be at least 6 characters',
  ],
  requiredPassword: [
    (v) => !!v || 'This is a required field',
    (v) => !v || v.length >= 6 || 'Password should be at least 6 characters',
  ],
  confirmPassword: (confirmValue) => [
    (v) => !!v || 'This is a required field',
    (v) => v === confirmValue || 'Password does not match',
  ],
}
