// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { AccountId, Hash } from '@cord.network/types/interfaces/runtime';
import type { Bytes, bool } from '@polkadot/types';

/** @name AccountIdentifierOf */
export interface AccountIdentifierOf extends AccountId {}

/** @name CordAccountOf */
export interface CordAccountOf extends AccountId {}

/** @name DidIdentifierOf */
export interface DidIdentifierOf extends AccountId {}

/** @name HashOf */
export interface HashOf extends Hash {}

/** @name IdentifierOf */
export interface IdentifierOf extends Bytes {}

/** @name IdOf */
export interface IdOf extends Hash {}

/** @name StatusOf */
export interface StatusOf extends bool {}

export type PHANTOM_BASE = 'base';
