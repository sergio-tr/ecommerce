import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  process.stderr.write('Usage: node tools/architecture/assert-project-graph.mjs <graph.json>\n');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(file, 'utf8'));
const graph = raw.graph ?? raw;
const nodes = graph.nodes ?? {};
const dependencies = graph.dependencies ?? {};

const required = [
  'commercecore-api',
  'commercecore-catalog-domain',
  'commercecore-identity-domain',
];
for (const name of required) {
  if (!nodes[name]) {
    throw new Error(`Project graph is missing ${name}`);
  }
}

const app = nodes['commercecore-api'];
const appType = app.type ?? app.data?.projectType;
if (appType !== 'app' && appType !== 'application') {
  throw new Error(`commercecore-api type is ${appType}, expected app`);
}

const isolatedDomains = ['commercecore-catalog-domain', 'commercecore-identity-domain'];
for (const name of isolatedDomains) {
  const domain = nodes[name];
  const domainType = domain.type ?? domain.data?.projectType;
  if (domainType !== 'lib' && domainType !== 'library') {
    throw new Error(`${name} type is ${domainType}, expected lib`);
  }
  const domainDeps = dependencies[name] ?? [];
  if (domainDeps.length !== 0) {
    throw new Error(`${name} has dependencies: ${JSON.stringify(domainDeps)}`);
  }
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
    const target = typeof edge === 'string' ? edge : edge.target;
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
    const projectType = node.type ?? node.data?.projectType;
    return projectType === 'app' || projectType === 'application';
  })
  .map(([name]) => name);
if (appProjects.length !== 1 || appProjects[0] !== 'commercecore-api') {
  throw new Error(`Expected only commercecore-api as an app, found ${appProjects.join(',')}`);
}

const names = Object.keys(nodes).sort();
process.stdout.write(`project-graph: acyclic projects=${names.join(',')}\n`);
process.stdout.write(
  'project-graph: commercecore-api, commercecore-catalog-domain, and commercecore-identity-domain present\n',
);
process.stdout.write('project-graph: catalog and identity domains have no project dependencies\n');
