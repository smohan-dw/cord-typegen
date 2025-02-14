// Copyright 2019-2021 cord.network authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { rpc, types04, types05, typesBundleForPolkadot } from '@cord.network/type-definitions';
import fs from 'fs';

fs.writeFileSync('packages/type-definitions/src/json/typesV4.json', JSON.stringify(types04, null, 4));
fs.writeFileSync('packages/type-definitions/src/json/typesV5.json', JSON.stringify(types05, null, 4));
fs.writeFileSync(
  'packages/type-definitions/src/json/typesBundle.json',
  JSON.stringify(typesBundleForPolkadot, null, 4)
);
fs.writeFileSync('packages/type-definitions/src/json/rpc.json', JSON.stringify(rpc, null, 4));
