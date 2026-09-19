/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/courses/communication-systems/lesson-01",
        destination: "/courses/communication-systems/lesson-01/index.html",
      },
      {
        source: "/courses/communication-systems/lesson-02",
        destination: "/courses/communication-systems/lesson-02/index.html",
      },
      {
        source: "/courses/communication-systems/lesson-03",
        destination: "/courses/communication-systems/lesson-03/index.html",
      },
    ];
  },
};

module.exports = nextConfig;
