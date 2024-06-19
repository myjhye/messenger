/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // 외부에서 로드할 수 있는 허용된 도메인 목록
        domains: [
            "res.cloudinary.com",
            "avatars.githubusercontent.com",
            "lh3.googleusercontent.com",
        ]
    }
};

export default nextConfig;
