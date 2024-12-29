const YOUR_SESSION_ID = process.env.YOUR_SESSION_ID;

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/dashboard'],
      startServerCommand: 'npm start',
      settings: {
        extraHeaders: JSON.stringify({
          Cookie: `sessionId=${YOUR_SESSION_ID}`,
        }),
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
