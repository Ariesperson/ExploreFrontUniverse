module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // scope 必填
    "scope-empty": [2, "never", 72],
    'scope-empty': [0],
    'scope-case': [0],
  }
};