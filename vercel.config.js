export default {
  version: 2,
  builds: [
    {
      src: "client/package.json",
      use: "@vercel/static-build",
      config: {
        outputDirectory: "dist" // Key fix: 'outputDirectory' instead of 'distDir'
      }
    },
    {
      src: "api/**/*.js",
      use: "@vercel/node"
    }
  ],
  routes: [
    { 
      src: "/api/(.*)", 
      dest: "/api/$1.js" 
    },
    { 
      src: "/(.*)", 
      dest: "/$1" // Fixed: Serve static files from root, not /client
    }
  ]
};
