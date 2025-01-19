const config = {
    github: {
      url:process.env.VITE_GITHUB_URL || import.meta.env.VITE_GITHUB_URL || 'https://github.com'
    },
    coffee: {
      url: process.env.VITE_COFFEE_URL || import.meta.env.VITE_COFFEE_URL || 'https://buymeacoffee.com'
    },
    app: {
      title: process.env.VITE_APP_TITLE || import.meta.env.VITE_APP_TITLE || 'Download My Memories'
    }
  };
  
  export default config;