module.exports = {
  apps: [{
    name: "cms.hsabook.vn",
    script: "npm",
    args: "run start",
    env: {
      NODE_ENV: "development",
      PORT: 4173,
      VITE_API_ENDPOINT: "https://hsa-education-backend-dev.up.railway.app/"
    }
  }]
}