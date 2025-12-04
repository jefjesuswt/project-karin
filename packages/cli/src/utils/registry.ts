export interface NpmRegistryResponse {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  dist?: {
    integrity: string;
    shasum: string;
    tarball: string;
    fileCount?: number;
    unpackedSize?: number;
  };
  [key: string]: unknown;
}

export async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch version for ${packageName}`);
    }

    const data = (await response.json()) as NpmRegistryResponse;

    return data.version;
  } catch (error) {
    return "latest";
  }
}
