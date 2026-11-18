// Idempotent rs0 initiate for the single Compose member. Exit 2 means retry.
// Exit 10 means the replica set shape is wrong. No database is created here.
let status = null;
try {
  status = rs.status();
} catch (error) {
  const notReady = error.codeName === 'NotYetInitialized' || error.code === 94;
  if (!notReady) {
    throw error;
  }
}

if (!status || status.ok !== 1) {
  try {
    const initiated = rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'mongo:27017' }],
    });
    if (!initiated.ok) {
      quit(10);
    }
  } catch (error) {
    const already = error.codeName === 'AlreadyInitialized' || error.code === 23;
    if (!already) {
      throw error;
    }
  }
  quit(2);
}

if (status.set !== 'rs0' || status.myState !== 1) {
  quit(2);
}
if (!Array.isArray(status.members) || status.members.length !== 1) {
  quit(10);
}
if (status.members[0].name !== 'mongo:27017') {
  quit(10);
}

const config = rs.conf();
if (
  !config ||
  config._id !== 'rs0' ||
  !Array.isArray(config.members) ||
  config.members.length !== 1
) {
  quit(10);
}
if (config.members[0].host !== 'mongo:27017') {
  quit(10);
}
