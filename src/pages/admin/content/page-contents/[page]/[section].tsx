import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/admin/content',
    permanent: false,
  },
});

export default function PageContentSectionRedirect() {
  return null;
}
