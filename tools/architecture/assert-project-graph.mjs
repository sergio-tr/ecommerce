import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const APPROVED_APPS = ['commercecore-api', 'egame-web'];
const ISOLATED_DOMAINS = ['commercecore-catalog-domain', 'commercecore-identity-domain'];

export function assertProjectGraph(raw) {
  const graph = raw.graph ?? raw;
  const nodes = graph.nodes ?? {};
  const dependencies = graph.dependencies ?? {};

  const required = ['commercecore-api', ...ISOLATED_DOMAINS, 'egame-web'];
  for (const name of required) {
    if (!nodes[name]) {
      throw new Error(`Project graph is missing ${name}`);
    }
  }

  const appType = projectType(nodes['commercecore-api']);
  if (appType !== 'app' && appType !== 'application') {
    throw new Error(`commercecore-api type is ${appType}, expected app`);
  }
  const egameType = projectType(nodes['egame-web']);
  if (egameType !== 'app' && egameType !== 'application') {
    throw new Error(`egame-web type is ${egameType}, expected app`);
  }

  for (const name of ISOLATED_DOMAINS) {
    const domainType = projectType(nodes[name]);
    if (domainType !== 'lib' && domainType !== 'library') {
      throw new Error(`${name} type is ${domainType}, expected lib`);
    }
    const domainDeps = dependencies[name] ?? [];
    if (domainDeps.length !== 0) {
      throw new Error(`${name} has dependencies: ${JSON.stringify(domainDeps)}`);
    }
  }

  for (const name of Object.keys(nodes)) {
    if (name.toLowerCase().includes('commercecloud')) {
      throw new Error(`Unapproved CommerceCloud project ${name}`);
    }
  }

  const egameDeps = (dependencies['egame-web'] ?? []).map(edgeTarget).filter(Boolean);
  if (egameDeps.length !== 0) {
    throw new Error(`egame-web must not depend on other projects: ${egameDeps.join(',')}`);
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(project) {
    if (visiting.has(project)) {
      throw new Error(`Dependency cycle includes ${project}`);
    }
    if (visited.has(project)) {
      return;
    }
    visiting.add(project);
    for (const edge of dependencies[project] ?? []) {
      const target = edgeTarget(edge);
      if (typeof target === 'string' && nodes[target]) {
        visit(target);
      }
    }
    visiting.delete(project);
    visited.add(project);
  }

  for (const project of Object.keys(nodes)) {
    visit(project);
  }

  const appProjects = Object.entries(nodes)
    .filter(([, node]) => {
      const type = projectType(node);
      return type === 'app' || type === 'application';
    })
    .map(([name]) => name)
    .sort();
  const approved = [...APPROVED_APPS].sort();
  if (appProjects.join(',') !== approved.join(',')) {
    throw new Error(`Expected apps ${approved.join(',')}, found ${appProjects.join(',')}`);
  }

  const names = Object.keys(nodes).sort();
  return [
    `project-graph: acyclic projects=${names.join(',')}`,
    'project-graph: commercecore-api, commercecore-catalog-domain, and commercecore-identity-domain present',
    'project-graph: catalog and identity domains have no project dependencies',
    'project-graph: apps are commercecore-api and egame-web',
    'project-graph: egame-web has no project dependencies',
  ];
}

function projectType(node) {
  return node.type ?? node.data?.projectType;
}

function edgeTarget(edge) {
  return typeof edge === 'string' ? edge : edge?.target;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    process.stderr.write('Usage: node tools/architecture/assert-project-graph.mjs <graph.json>\n');
    process.exit(1);
  }
  const lines = assertProjectGraph(JSON.parse(readFileSync(file, 'utf8')));
  for (const line of lines) {
    process.stdout.write(`${line}\n`);
  }
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  main();
}
