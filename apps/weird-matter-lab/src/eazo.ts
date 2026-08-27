export const eazoRuntime = {
  async platform() { const { device } = await import('@eazo/sdk'); return device.platform; },
  async locale() { const { device } = await import('@eazo/sdk'); return device.locale; },
  async shareResult(imageUrl: string, text: string) {
    const { share } = await import('@eazo/sdk');
    return share.compose({ text, attachments: [{ type: 'image', url: imageUrl, caption: 'Weird Matter Lab experiment result' }], sourceAppId: 'weird-matter-lab', targetPath: '/' });
  },
};
