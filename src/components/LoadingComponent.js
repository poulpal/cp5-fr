import BlockUi from '@availity/block-ui';

const LoadingComponent = ({ loading }) => {
  return <BlockUi blocking={loading} message={<></>} />;
};

export default LoadingComponent;
