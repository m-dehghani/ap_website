import type { GetServerSideProps } from 'next';

function SuccessRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/testimonials',
    permanent: true,
  },
});

export default SuccessRedirectPage;
