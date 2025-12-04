import { GetServerSideProps } from 'next';
import { getSitemapXmlCached } from '@/lib/seo';

function SiteMap() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const xml = await getSitemapXmlCached();
  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();
  return { props: {} };
};

export default SiteMap;

