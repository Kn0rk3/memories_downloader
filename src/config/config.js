const config = {
  github: {
    url: import.meta.env.VITE_GITHUB_URL || 'https://github.com'
  },
  coffee: {
    url: import.meta.env.VITE_COFFEE_URL || 'https://buymeacoffee.com'
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Download My Memories'
  }
};
  
  export default config;