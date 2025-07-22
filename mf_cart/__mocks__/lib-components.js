const React = require('react');

const Button = React.forwardRef(({children, ...props}, ref) => {
  return React.createElement('button', {ref, ...props}, children);
});

module.exports = {Button};
