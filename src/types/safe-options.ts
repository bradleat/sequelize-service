import { TContextOption } from './context-option';
import { TTransactionOption } from './transaction-option';
import { TSkipHooksOption } from './skip-hooks-option';
import { TUseMasterOption } from './use-master-option';

export type TSafeOptions<CT extends {} = any> = Partial<TContextOption<CT> & TTransactionOption & TSkipHooksOption & TUseMasterOption>;