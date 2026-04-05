import { navigation } from '#src/stores/router.ts'

export function Home() {
  navigation.replace('characters')

  return <></>
}
