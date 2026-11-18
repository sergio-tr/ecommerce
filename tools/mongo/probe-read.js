const found = db.getSiblingDB('infra_probe').probe.findOne({ probe: 'mongo-infra' });
if (!found || found.probe !== 'mongo-infra') {
  quit(1);
}
