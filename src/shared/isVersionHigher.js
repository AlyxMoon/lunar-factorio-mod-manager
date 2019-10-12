export const isVersionHigher = (currentVersion, checkedVersion) => {
  // Expecting version to be the following format: major.minor.patch
  const version1 = currentVersion.split('.')
  const version2 = checkedVersion.split('.')

  for (let i = 0; i < 3; i++) {
    const temp1 = parseInt(version1[i])
    const temp2 = parseInt(version2[i])

    if (temp1 < temp2) return true
    if (temp1 > temp2) return false
  }

  return false
}
