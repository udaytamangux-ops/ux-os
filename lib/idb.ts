import { del, get, keys, set } from "idb-keyval";

export async function saveFile(
  prefix: "wf" | "ui",
  projectId: string,
  fileId: string,
  blob: Blob
): Promise<void> {
  await set(`${prefix}-${projectId}-${fileId}`, blob);
}

export async function loadFile(
  prefix: "wf" | "ui",
  projectId: string,
  fileId: string
): Promise<Blob | undefined> {
  return get(`${prefix}-${projectId}-${fileId}`);
}

export async function deleteFile(prefix: "wf" | "ui", projectId: string, fileId: string): Promise<void> {
  await del(`${prefix}-${projectId}-${fileId}`);
}

export async function deleteAllProjectFiles(projectId: string): Promise<void> {
  const allKeys = await keys();
  const projectKeys = allKeys.filter(
    (key) =>
      typeof key === "string" &&
      (key.startsWith(`wf-${projectId}`) || key.startsWith(`ui-${projectId}`))
  );
  await Promise.all(projectKeys.map((key) => del(key)));
}
