// add all jest-extended matchers
import "jest-extended"
import * as matchers from 'jest-extended';
expect.extend(matchers);

// or just add specific matchers
// import { toBeArray, toBeSealed, toIncludeSameMembers } from 'jest-extended';
// expect.extend({ toBeArray, toBeSealed, toIncludeSameMembers });