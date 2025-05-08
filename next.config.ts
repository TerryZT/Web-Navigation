
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Or your preferred limit
    },
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Provide fallbacks for Node.js core modules that are not available in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ignore optional MongoDB dependencies that are not needed and cause build issues
    // or are Node.js specific.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^mongodb-client-encryption$/,
      })
    );
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@aws-sdk\/credential-providers$/,
      })
    );
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^kerberos$/,
      })
    );
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@mongodb-js\/zstd$/,
      })
    );
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^snappy$/,
      })
    );
    // Add ignore for mongocryptd_manager.js specifically
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /mongodb[\\/]lib[\\/]client-side-encryption[\\/]mongocryptd_manager\.js$/,
      })
    );
    
    // Added guard against undefined config.externals
    config.externals = config.externals || [];
    if (isServer) {
      // For server-side, ensure these are treated as externals if they still cause issues,
      // though typically they should resolve correctly in Node environment.
      // This is more of a safeguard.
    } else {
      // For client-side, explicitly mark them as external if fallbacks aren't enough.
      // config.externals.push('mongodb-client-encryption'); // Example
    }


    return config;
  },
};

export default nextConfig;


