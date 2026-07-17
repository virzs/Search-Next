import { SetMetadata } from '@nestjs/common';

export const SKIP_LEGAL_CONFIRMATION_KEY = 'skip-legal-confirmation';

export const SkipLegalConfirmation = () =>
  SetMetadata(SKIP_LEGAL_CONFIRMATION_KEY, true);
