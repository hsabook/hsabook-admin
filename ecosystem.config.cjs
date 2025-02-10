module.exports = {
  apps: [{
    name: "cms.hsabook.vn",
    script: "npm",
    args: "run start",
    env: {
      NODE_ENV: "development",
      PORT: 4173,
      VITE_API_ENDPOINT: "https://hsabook-backend-dev.up.railway.app/"
    }
  }]
}