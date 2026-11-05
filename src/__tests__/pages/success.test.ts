import type { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from '@/pages/success';

describe('legacy success route', () => {
  it('permanently redirects to the combined testimonials page', async () => {
    await expect(
      getServerSideProps({} as GetServerSidePropsContext),
    ).resolves.toEqual({
      redirect: {
        destination: '/testimonials',
        permanent: true,
      },
    });
  });
});
