import Constants from 'expo-constants';

const getEnvVars = () => {
  return {
    SERVER_URL: Constants.manifest.extra.SERVER_URL,
    SOCKET_URL: Constants.manifest.extra.SOCKET_URL,
  };
};

export default getEnvVars;
