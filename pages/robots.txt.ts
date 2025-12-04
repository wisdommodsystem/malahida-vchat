import { GetServerSideProps } from 'next';

function generateRobotsTxt() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.malahida.com';
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}

function RobotsTxt() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = generateRobotsTxt();
  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();
  return { props: {} };
};

export default RobotsTxt;

