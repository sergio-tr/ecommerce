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

const required = ['commercecore-api', 'commercecore-catalog-domain'];
for (const name of required) {
  if (!nodes[name]) {
    throw new Error(`Project graph is missing ${name}`);
  }
}

const app = nodes['commercecore-api'];
const domain = nodes['commercecore-catalog-domain'];
const appType = app.type ?? app.data?.projectType;
const domainType = domain.type ?? domain.data?.projectType;
if (appType !== 'app' && appType !== 'application') {
  throw new Error(`commercecore-api type is ${appType}, expected app`);
}
if (domainType !== 'lib' && domainType !== 'library') {
  throw new Error(`commercecore-catalog-domain type is ${domainType}, expected lib`);
}

const domainDeps = dependencies['commercecore-catalog-domain'] ?? [];
if (domainDeps.length !== 0) {
  throw new Error(`Domain has dependencies: ${JSON.stringify(domainDeps)}`);
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
process.stdout.write('project-graph: commercecore-api and commercecore-catalog-domain present\n');
process.stdout.write('project-graph: catalog domain has no project dependencies\n');
