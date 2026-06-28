export default {
  ratingScale: { type: 'ratingScale' },
  fileUpload: { type: 'fileUpload' },
  html: { type: 'html' },
  expression: { type: 'expression' },
  image: { type: 'image' },
  signature: { type: 'signature' },
  singleLineInput: {
    type: 'text',
    inputTypes: {
      color: 'color',
      date: 'date',
      dateAndTime: 'dateAndTime',
      month: 'month',
      phoneNumber: 'phoneNumber',
      url: 'url',
      week: 'week'
    }
  },
  checkboxes: { type: 'checkbox' },
  radioButtonGroup: { type: 'radiogroup' },
  dropdown: { type: 'dropdown' }
};
