function requireEnvVar(name) {
  if (!process.env[name]) {
    throw new Error(`Environment variable "${name}" is required.`);
  }
  return process.env[name];
}

module.exports = { requireEnvVar };
