import {
  navigation,
  paths
} from '#src/stores/router'

export default function Home() {
  navigation.replace(paths.characters)

  return <></>
}
