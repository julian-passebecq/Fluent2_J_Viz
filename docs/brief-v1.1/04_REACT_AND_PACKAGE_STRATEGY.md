# React and package strategy

Current V1 installs React/ReactDOM 18.3.1 as runtime dependencies. Datapass declares peer support `>=18 <20` and tests with React 19.2.8.

Preferred strategy:
- move React and ReactDOM to `peerDependencies` with a compatible range such as `>=18.3 <20`;
- keep the exact React version used by VizForge Studio/tests in `devDependencies`;
- use React 19.2.8 for the integrated Studio unless a proven incompatibility requires otherwise;
- align React type packages with the test host;
- prove the production integration does not ship a second embedded React runtime.

Document any justified deviation. Preserve React 18 host compatibility if the public adapter genuinely supports it.
