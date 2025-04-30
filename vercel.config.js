export default {
  version: 2,
  builds: [
    {
      src: "client/package.json",
      use: "@vercel/static-build",
      config: {
        distDir: "dist",  // This correctly specifies the build output folder
        build: {
          chunkSizeWarningLimit: 1000  // Raise the chunk size warning limit to 1000 KB (1 MB)
        }
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
      dest: "/$1"  // This routes the rest of the traffic to the client-side app
    }
  ]
};
