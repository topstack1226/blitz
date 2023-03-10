import chalk from "chalk"
import {Fallbackable} from "./fallbackable"
import {fetchAllVersions, fetchLatestDistVersion} from "./npm-fetch"

export const logFailedVersionFetch = (dependency: string, fallback?: string) => {
  console.warn(
    `Failed to fetch latest version of '${chalk.bold(dependency)}'`,
    fallback ? `Falling back to '${chalk.bold(fallback)}'` : "",
  )
}

export const getLatestVersion = async (
  dependency: string,
  templateVersion: string = "",
): Promise<Fallbackable<string>> => {
  const major = templateVersion.replace(".x", "")

  try {
    const [allVersions, latestDistVersion] = await Promise.all([
      fetchAllVersions(dependency),
      fetchLatestDistVersion(dependency),
    ])

    const latestVersion =
      allVersions
        .filter((version) => version.startsWith(major))
        .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))
        .reverse()[0] || ""

    // If the latest tagged version matches our pinned major, use that, otherwise use the
    // latest untagged which does
    if (latestDistVersion.startsWith(major)) {
      return {value: latestDistVersion, isFallback: false}
    } else {
      return {value: latestVersion, isFallback: false}
    }
  } catch (error) {
    const fallback = templateVersion
    logFailedVersionFetch(dependency, fallback)
    return {value: fallback, isFallback: false}
  }
}
