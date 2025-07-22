// Mock for shared remote 'lib/components' from module federation
module.exports = {
  // Example: mock a shared Button component
  Button: (props) => {
    return {
      type: 'button',
      props,
      render: () => 'Mocked Button',
    };
  },
  // Add more mocked components as needed
};
