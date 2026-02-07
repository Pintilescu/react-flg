module.exports = {
  ...require('@flagline/config-eslint'),
  extends: [
    ...require('@flagline/config-eslint').extends,
    'next/core-web-vitals',
  ],
};
