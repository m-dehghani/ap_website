import { GetStaticProps } from 'next';
import CoachForm from './[id]';

const CoachNewPage: React.FC = () => {
  return <CoachForm />;
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

export default CoachNewPage;