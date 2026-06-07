import type { GetServerSideProps } from 'next'

// oxlint-disable-next-line eslint/require-await
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/characters',
    permanent: false
  }
})

export default function Home() {
  return null
}
