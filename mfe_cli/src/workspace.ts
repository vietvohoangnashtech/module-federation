import fs from 'fs-extra';
import path from 'node:path';
import yaml from 'yaml';

export async function mutateWorkspace(root: string, newPackage: string) {
  const file = path.join(root, 'pnpm-workspace.yaml');
  if (!(await fs.pathExists(file))) return;
  const content = await fs.readFile(file, 'utf8');
  const doc = yaml.parse(content);
  if (!Array.isArray(doc.packages)) doc.packages = [];
  if (!doc.packages.includes(newPackage)) {
    doc.packages.push(newPackage);
    const updated = yaml.stringify(doc);
    await fs.writeFile(file, updated, 'utf8');
  }
}
