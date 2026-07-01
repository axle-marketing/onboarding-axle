// Concatena classes condicionais: cx('a', cond && 'b', 'c')
export const cx = (...a) => a.filter(Boolean).join(' ')
