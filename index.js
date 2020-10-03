const Amplify = require('aws-amplify').default;
global.fetch = require('node-fetch');
global.navigator = {};
// global.window = { LOG_LEVEL: 'DEBUG' };
// global.LOG_LEVEL = 'DEBUG';

Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'Joto',
        endpoint: 'https://api.joto.io/',
        region: 'eu-west-1',
      },
    ],
  },
  Auth: {
    identityPoolId: 'eu-west-1:13ddb7c0-b47f-4874-a225-f156a26e88ea',
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_0jIKJjMtv',
    userPoolWebClientId: '760tg2td5unc7hi3bm4v8gfdtn',
  },
  Storage: {
    AWSS3: {
      bucket: 'platform-jots',
      region: 'eu-west-1',
    },
  },
});

const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForGCode = async (jotId) => {
  const jot = await Amplify.API.get('Joto', `jots/${jotId}`);
  if (jot.parts && jot.parts.length > 0 && jot.parts[0].gcodeFile) {
    return true;
  }
  await waitFor(1000);
  return waitForGCode(jotId);
};

let selectedJotoId = null;

module.exports = {
  async login(email, password) {
    await Amplify.Auth.signIn(email, password);
  },
  async selectJoto(jotoId) {
    const { Items: devices } = await Amplify.API.get('Joto', 'users/devices');
    if (devices.length === 0) {
      throw new Error('No Joto device found!');
    } else if (devices.length === 1) {
      selectedJotoId = devices[0].deviceId;
    } else {
      const matchingDevice = devices.find((device) => {
        return device.deviceId.startsWith(jotoId) || device.device.alias.startsWith(jotoId);
      });
      if (!matchingDevice) {
        throw new Error(
          `No device matches ${jotoId}. Devices IDs: ${devices
            .map((device) => `${device.deviceId} (${device.device.alias})`)
            .join(', ')}`,
        );
      }
      selectedJotoId = matchingDevice.deviceId;
    }

    return { jotoId: selectedJotoId };
  },
  async drawSVG(svg, jotoId = selectedJotoId) {
    const svgId = Math.floor(new Date() / 1000).toString();
    const svgName = `${svgId}.svg`;
    await Amplify.Storage.put(`jots/${svgName}`, svg, {
      level: 'protected',
      contentType: 'image/svg+xml',
    });

    const params = {
      body: {
        title: svgId,
        description: 'Private Jot',
        categories: [],
        tags: [],
        svgFilename: svgName,
      },
    };

    const { jotId } = await Amplify.API.post('Joto', 'jots', params);
    await waitForGCode(jotId);
    await waitFor(1000);
    await Amplify.API.post('Joto', `devices/${jotoId}/jot/${jotId}`);
    return { jotId };
  },
};
