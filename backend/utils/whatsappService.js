const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const clients = new Map();

const initWhatsApp = async (userId, onQR, onReady, onDisconnected) => {
  try {
    if (clients.has(userId)) {
      const existingClient = clients.get(userId);
      if (existingClient.info) {
        return { success: true, message: 'Already connected' };
      }
    }

    const sessionPath = path.join(
      process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',
      userId.toString()
    );

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: userId.toString(),
        dataPath: sessionPath
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      if (onQR) onQR(qr);
    });

    client.on('ready', () => {
      console.log(`WhatsApp client ready for user: ${userId}`);
      if (onReady) onReady();
    });

    client.on('disconnected', (reason) => {
      console.log(`WhatsApp disconnected for user: ${userId}`, reason);
      clients.delete(userId);
      if (onDisconnected) onDisconnected(reason);
    });

    client.on('auth_failure', (msg) => {
      console.error(`WhatsApp auth failure for user: ${userId}`, msg);
      clients.delete(userId);
    });

    await client.initialize();
    clients.set(userId, client);

    return { success: true, message: 'Initializing...' };
  } catch (error) {
    console.error('WhatsApp init error:', error);
    return { success: false, error: error.message };
  }
};

const sendMessage = async (userId, phoneNumber, message) => {
  try {
    const client = clients.get(userId);
    if (!client || !client.info) {
      return { success: false, error: 'WhatsApp not connected' };
    }

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!formattedNumber.includes('@c.us')) {
      formattedNumber = `${formattedNumber}@c.us`;
    }

    const isRegistered = await client.isRegisteredUser(formattedNumber);
    if (!isRegistered) {
      return { success: false, error: 'Number not registered on WhatsApp' };
    }

    await client.sendMessage(formattedNumber, message);
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

const getStatus = (userId) => {
  const client = clients.get(userId);
  if (!client) {
    return { connected: false, status: 'not_initialized' };
  }
  if (client.info) {
    return { connected: true, status: 'connected', info: client.info };
  }
  return { connected: false, status: 'connecting' };
};

const disconnect = async (userId) => {
  try {
    const client = clients.get(userId);
    if (client) {
      await client.destroy();
      clients.delete(userId);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  initWhatsApp,
  sendMessage,
  getStatus,
  disconnect
};
