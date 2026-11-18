const probe = db.getSiblingDB('infra_probe').probe;
const result = probe.updateOne(
  { probe: 'mongo-infra' },
  { $set: { probe: 'mongo-infra' } },
  { upsert: true },
);
if (!result.acknowledged) {
  quit(1);
}
const found = probe.findOne({ probe: 'mongo-infra' });
if (!found || found.probe !== 'mongo-infra') {
  quit(1);
}
