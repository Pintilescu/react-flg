module.exports = {
  ...require('@crivline/config-eslint'),
  extends: [
    ...require('@crivline/config-eslint').extends,
    'next/core-web-vitals',
  ],
};
