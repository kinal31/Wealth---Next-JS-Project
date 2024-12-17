/** @type {import('next').NextConfig} */
const nextConfig = {
    // images:{
    //     remotePatterns:[
    //         {
    //             protocol:"https",
    //             hostname:"remoteuser.me",
    //         }
    //     ]
    // },
    images: {
        domains: ['randomuser.me'], 
    },
};

export default nextConfig;
