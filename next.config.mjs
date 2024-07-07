/** @type {import('next').NextConfig} */
const nextConfig = {
    // 외부에서 로드할 수 있는 허용된 도메인 목록
    images: {
        domains: [
            "res.cloudinary.com",
            "avatars.githubusercontent.com",
            "lh3.googleusercontent.com",
        ]
    },
    // webpack 설정
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.module.rules.push({
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            });
        }
        return config;
    },
};

export default nextConfig;
