import { beforeEach, describe, expect, it } from 'vitest';

import { FakeAuthRepository } from '../../../../testing/fake-auth.repository';

import type { SignUpData } from './credentials';
import { SignUpUseCase } from './sign-up.usecase';

// HU-01 — Player sign-up. Test names follow unit_condition_result.
describe('SignUpUseCase', () => {
  let repository: FakeAuthRepository;
  let useCase: SignUpUseCase;
  const valid: SignUpData = {
    fullName: ' Carlos Ramírez ',
    email: ' Carlos@Example.com ',
    phone: '3101234567',
    password: 'secret123',
  };

  beforeEach(() => {
    repository = new FakeAuthRepository();
    useCase = new SignUpUseCase(repository);
  });

  it('signUp_validData_callsRepositoryWithNormalizedEmailAndName', async () => {
    await useCase.execute(valid);

    expect(repository.registerCalls).toHaveLength(1);
    expect(repository.registerCalls[0].email).toBe('carlos@example.com');
    expect(repository.registerCalls[0].fullName).toBe('Carlos Ramírez');
  });

  it('signUp_phoneNotStartingWith3_rejectsWithoutCallingRepository', async () => {
    await expect(useCase.execute({ ...valid, phone: '6081234567' })).rejects.toEqual({
      kind: 'validation',
      fields: ['phone'],
    });
    expect(repository.registerCalls).toHaveLength(0);
  });

  it('signUp_shortPassword_rejectsWithPasswordField', async () => {
    await expect(useCase.execute({ ...valid, password: '1234567' })).rejects.toEqual({
      kind: 'validation',
      fields: ['password'],
    });
  });

  it('signUp_invalidEmailAndName_reportsBothFields', async () => {
    await expect(useCase.execute({ ...valid, fullName: 'Al', email: 'not-an-email' })).rejects.toEqual({
      kind: 'validation',
      fields: ['fullName', 'email'],
    });
  });
});
