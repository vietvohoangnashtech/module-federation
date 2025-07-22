// Mock for shared remote 'lib/components' from module federation
module.exports = {
  Button: (props) => {
    return {
      type: 'button',
      props,
      render: () => 'Mocked Button',
    };
  },
};
