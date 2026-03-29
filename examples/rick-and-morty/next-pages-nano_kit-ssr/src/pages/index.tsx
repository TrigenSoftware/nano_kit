import type { GetServerSideProps } from 'next'

// eslint-disable-next-line require-await
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/characters',
    permanent: false
  }
})

export default function Home() {
  return null
}
