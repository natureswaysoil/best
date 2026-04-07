import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/government',
    permanent: true,
  },
});

export default function GovernmentLegacyRedirect() {
  return null;
}