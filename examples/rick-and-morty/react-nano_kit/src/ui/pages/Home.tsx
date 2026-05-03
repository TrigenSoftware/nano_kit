import { navigation } from '#src/stores/router.ts'

export default function Home() {
  navigation.replace('characters')

  return <></>
}
